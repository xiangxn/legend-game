
import { _decorator, Component, Node, Prefab, instantiate, find } from 'cc';
import { AlertWin } from '../AlertWin';
import { BaseComponent } from '../BaseComponent';
import { Constant } from '../Constant';
import { PVPItemEvent } from '../events/PVPItemEvent';
import { PVPItem } from './PVPItem';
const { ccclass, type } = _decorator;


@ccclass('PVPPage')
export class PVPPage extends BaseComponent {

    @type(Node)
    pvpList: Node;

    @type(Prefab)
    pvpItemPF: Prefab;

    constructor() {
        super();
        this.pvpList = new Node();
        this.pvpItemPF = new Prefab();
    }



    onLoad() {
        this.node.on("onInPVP", this._onPvpItemClick.bind(this));
        Constant.pvpList.forEach((data) => {
            let item = instantiate(this.pvpItemPF);
            let pvpItem = item.getComponent(PVPItem)
            pvpItem?.setData(data);
            this.pvpList.addChild(item);
        });
    }

    onDestroy() {
        this.node.off("onInPVP", this._onPvpItemClick.bind(this));
    }

    private _onPvpItemClick(event: PVPItemEvent) {
        event.propagationStopped = true;
        //TODO:检查角色等级
        let msg = `<color=#ffffff>将进入${event.data.name},你需要质押</color> <color=#EFD0A2>${event.data.fee}</color> <color=#ffffff>LGC</color>`;
        AlertWin.showRichText(find("Canvas") ?? this.node, msg, "挑战", () => {
            //TODO:支付逻辑，并进入匹配状态
        });
    }
}

