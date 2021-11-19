
import { _decorator, Component, Node, Prefab, instantiate, find } from 'cc';
import { AlertWin } from '../AlertWin';
import { BaseComponent } from '../BaseComponent';
import { Constant } from '../Constant';
import { PVPEvent, PVPItemEvent } from '../events/PVPItemEvent';
import { PVPItem } from './PVPItem';
import Web3 from "web3/dist/web3.min.js";

const { ccclass, type } = _decorator;

const { padLeft, toHex, toWei } = Web3.utils;
@ccclass('PVPPage')
export class PVPPage extends BaseComponent {

    @type(Node)
    pvpList: Node;

    @type(Prefab)
    pvpItemPF: Prefab;

    heroInfo: any;

    constructor() {
        super();
        this.pvpList = new Node();
        this.pvpItemPF = new Prefab();
    }

    onLoad() {
        super.onLoad();
        this.node.on("onInPVP", this._onPvpItemClick.bind(this));
        Constant.pvpList.forEach((data) => {
            let item = instantiate(this.pvpItemPF);
            let pvpItem = item.getComponent(PVPItem)
            pvpItem?.setData(data);
            this.pvpList.addChild(item);
        });
        this._loadInfo();
    }

    private _loadInfo() {
        this.callContract("Hero", "getHeroInfo", this.api?.curAccount)
            .then(info => {
                // console.log("info: ", info.attrs);
                this.heroInfo = info.attrs;
            })
            .catch(reason => {
                this.showErr(reason);
            });

    }

    onDestroy() {
        this.node.off("onInPVP", this._onPvpItemClick.bind(this));
    }

    private _onPvpItemClick(event: PVPItemEvent) {
        // console.log(event);
        event.propagationStopped = true;
        //检查角色等级
        if (parseInt(this.heroInfo.level) < event.data.level || parseInt(this.heroInfo.power) < event.data.minPower) {
            this.showAlert("角色属性太低,去加强升级吧!");
            return;
        }
        if (event.data.maxPower > 0 && parseInt(this.heroInfo.power) > event.data.maxPower) {
            this.showAlert("角色属性太强,去更高级的竞技场吧!");
            return;
        }
        let msg = `<color=#ffffff>将进入${event.data.name},你需要质押</color> <color=#EFD0A2>${event.data.fee}</color> <color=#ffffff>LGC</color>`;
        AlertWin.showRichText(find("Canvas") ?? this.node, msg, "挑战", () => {
            //支付逻辑，并进入匹配状态或开始战斗
            let pars = this.api?.dataApi.eth.abi.encodeParameters(["uint8", "uint256"], [1, event.data.id]);
            this.sendContract("LGC", "transferAndCall", Constant.address.PVP, toWei(event.data.fee.toString(), "ether"), pars)
                .then((result: any) => {
                    // console.log(result);
                    let list: Promise<any>[] = [];
                    list.push(this.getPastEvents("PVP", "InQueue", { filter: { user: this.api?.curAccount }, toBlock: result.blockNumber }));
                    list.push(this.getPastEvents("PVP", "BattleResult", { filter: { p2: this.api?.curAccount }, toBlock: result.blockNumber }))
                    Promise.all(list).then(events => {
                        // console.log(events);
                        // console.log(events[0].length, events[1].length);
                        let item = (event.target as Node).getComponent(PVPItem);
                        // console.log(item);
                        if (events[0].length > 0) {
                            //进入队列
                            item?.showStatus();
                            this.node.dispatchEvent(new PVPEvent("InQueue", events[0][0].returnValues, true));
                        } else if (events[1].length > 0) {
                            //开始战斗
                            item?.hideStatus();
                            this.node.dispatchEvent(new PVPEvent("Battle", events[1][0].returnValues, true));
                        }
                    });
                });
        });
    }
}

