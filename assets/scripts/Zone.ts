
import { _decorator, Component, Node, director, Prefab, resources, instantiate, Label, Sprite } from 'cc';
import { BaseComponent } from './BaseComponent';
import { Constant, CONSUMABLES_CACHE_KEY, EQUIPMENT_CACHE_KEY, TOTEM_CACHE_KEY } from './Constant';
import { ZoneItem } from './ZoneItem';
import Web3 from "web3/dist/web3.min.js";

const { ccclass, property, type } = _decorator;
const { toBN, padLeft, toHex } = Web3.utils;

@ccclass('Zone')
export class Zone extends BaseComponent {
    @type(Node)
    confirmWin: Node;

    @type(Node)
    zoneInfo: Node;

    @type(Prefab)
    zoneItem: Prefab;

    @type(Node)
    zoneList: Node;

    selectedZone: any;
    fragmentBalance: number = 0;
    coinId = (Constant.consumables as any)[2][1];
    fragmentName: string = (Constant.consumables as any)[2][0];


    constructor() {
        super();
        this.confirmWin = new Node();
        this.zoneInfo = new Node();
        this.zoneItem = new Prefab();
        this.zoneList = new Node();
    }

    onLoad() {
        super.onLoad();
        resources.load("component/ZoneItem", Prefab, (err, prefab) => {
            this.zoneItem = prefab;
            this._loadZones();
        });
    }

    private _loadBalance(zoneInfo: any) {
        this.callContract("Fragment", "balanceOf", this.api?.curAccount, this.coinId)
            .then(value => {
                this.fragmentBalance = parseInt(value.toString());
                this._showFragmentInfo(zoneInfo);
            })
            .catch(reason => { this.showErr(reason); });
    }

    private _showFragmentInfo(zoneInfo: any) {
        let labMsg = this.confirmWin.getChildByPath("window/msg")?.getComponent(Label);
        if (!!labMsg) {
            labMsg.string = "副本每小时消耗 " + zoneInfo.consumablesAmount + " 个" + this.fragmentName + "。";
        }
        let labBalance = this.confirmWin.getChildByPath("window/Layout/value")?.getComponent(Label);
        if (!!labBalance) {
            labBalance.string = this.fragmentBalance.toString();
        }
    }

    private _loadZones() {
        let list: Promise<any>[] = [];
        Constant.zones.forEach((item) => {
            list.push(this.callContract("ZoneMine", "getZoneInfo", item.id).catch(reason => { console.log(reason); }));
        });
        Promise.all(list).then(infos => {
            for (let i = 0; i < infos.length; i++) {
                let win = instantiate(this.zoneItem);
                if (!!win) {
                    let zi = win.getComponent(ZoneItem);
                    if (!!zi) {
                        zi.zoneConfig = Constant.zones[i];
                        zi.zoneInfo = infos[i];
                        zi.onItemClick = this.openZone.bind(this);
                        this.zoneList.addChild(win);
                    }
                }
            }
        });
    }

    start() {
        this.confirmWin.active = false;
        this.zoneInfo.active = false;
    }

    onClose() {
        director.loadScene("Main");
    }

    onCloseZoneInfo() {
        this.zoneInfo.active = false;
    }

    openZone(zoneInfo: any, roleInfo: any, status: number, config: any) {
        // console.log("zoneInfo: ", zoneInfo);
        this._loadBalance(zoneInfo);
        //检查角色状态
        this.showLoading().then(loading => {
            switch (status) {
                case 0:
                    this.callContract("Hero", "getHeroInfo", this.api?.curAccount)
                        .then(info => {
                            loading.close();
                            let status = parseInt(info.hero.status);
                            if (status == 0) {
                                //可以进入副本
                                this._inZone(zoneInfo, info);
                            } else {
                                status == 1 ? this.showAlert("角色正在矿洞挖矿!") : this.showAlert("角色正在其他副本冒险!");
                            }
                        })
                        .catch(reason => {
                            loading.close();
                            this.showErr(reason);
                        });
                    break;
                case 1://可查看
                    loading.close();
                    this._showZoneInfo(zoneInfo, roleInfo, config);
                    break;
                case 2://可结束
                    loading.close();
                    this._stopMine();
                    break;
            }

        });
    }

    private _showZoneInfo(zoneInfo: any, roleInfo: any, config: any) {
        this.zoneInfo.active = true;
        let title = this.node.getChildByPath("ZoneInfo/ZoneTitle")?.getComponent(Label);
        let rolePower = this.zoneInfo.getChildByPath("topInfo/Layout/Layout/RolePower")?.getComponent(Label);
        let zonePower = this.zoneInfo.getChildByPath("topInfo/Layout/Layout-001/ZonePower")?.getComponent(Label);
        let equipLevel = this.zoneInfo.getChildByPath("topInfo/Layout-001/Layout/EquipLevel")?.getComponent(Label);
        let zoneTime = this.zoneInfo.getChildByPath("topInfo/Layout-001/Layout-001/ZoneTime")?.getComponent(Label);
        let bg = this.node.getChildByPath("ZoneInfo/ZoneBG")?.getComponent(Sprite);
        this.loadSpriteUrl("img/" + config.bg, bg);
        if (!!title) title.string = zoneInfo.name;
        if (!!zonePower) zonePower.string = zoneInfo.dropRateBase;
        if (!!equipLevel) equipLevel.string = Constant.zones.find((item) => item.id == zoneInfo.id)?.equip ?? "1-10";
        if (!!zoneTime) {
            let h = Math.floor((parseInt(roleInfo.endTime) - parseInt(roleInfo.startTime)) / 3600);
            let h2 = Math.floor((Date.now() / 1000 - parseInt(roleInfo.startTime)) / 3600);
            zoneTime.string = h2 + "H/" + h + "H";
        }
        this.callContract("Hero", "getHeroInfo", this.api?.curAccount)
            .then(info => {
                if (!!rolePower) rolePower.string = info.attrs.power;
            })
            .catch(reason => {
                this.showErr(reason);
            });
    }

    private _inZone(zoneInfo: any, roleInfo: any) {
        this.selectedZone = zoneInfo;
        //检查副本战力要求
        if (parseInt(zoneInfo.minPower) > parseInt(roleInfo.attrs.power)) {
            this.showAlert("你的战力还不能进入该副本!");
            return;
        }
        //检查副本角色等级要求
        if (parseInt(zoneInfo.level) > parseInt(roleInfo.attrs.level)) {
            this.showAlert("你的等级还不能进入该副本!");
            return;
        }
        //检查角色战力是否为0
        if (parseInt(roleInfo.attrs.power) == 0) {
            this.showConfirm("你目前战力为0,进入副本只能获取经验,是否继续?", () => {
                this.confirmWin.active = true;
            }, () => { });
            return;
        }
        this.confirmWin.active = true;
    }

    inZone(event: Event, time: number) {
        this._closeConfirm();
        //检查余额
        let need = parseInt(this.selectedZone.consumablesAmount) * time;
        if (need > this.fragmentBalance) {
            this.showAlert("你的[" + this.fragmentName + "]不足,请前往商店购买!");
            return;
        }
        let data = padLeft(toHex(5), 2) + padLeft(toHex(parseInt(this.selectedZone.id)).substr(2), 64);
        this.sendContract("Fragment", "safeTransferFrom", this.api?.curAccount, Constant.address.ZoneMine, this.coinId, need, data, { from: this.api?.curAccount })
            .then(val => {
                this.zoneList.removeAllChildren();
                this._loadZones();
                localStorage.removeItem(CONSUMABLES_CACHE_KEY);
            })
    }

    onConfirmClose() {
        this._closeConfirm();
    }

    _closeConfirm() {
        this.confirmWin.active = false;
    }

    private _stopMine() {
        localStorage.removeItem(TOTEM_CACHE_KEY);
        localStorage.removeItem(EQUIPMENT_CACHE_KEY);
        this.sendContract("ZoneMine", "withdraw", { from: this.api?.curAccount })
            .then(val => {
                this.onCloseZoneInfo();
                this.zoneList.removeAllChildren();
                this._loadZones();
                this.showAlert("恭喜你完成本次探险!\r\n获取的宝物将直接进入储物箱。");
            })
    }

    stopMine() {
        this.showConfirm("提前结束冒险,多余的[" + this.fragmentName + "]将退还。不满1小时以1小时计算。", () => {
            this._stopMine();
        }, () => { });
    }
}

