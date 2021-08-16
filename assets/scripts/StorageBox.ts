
import { _decorator, Component, Node, director, Toggle, Label, Color, find, JsonAsset, ScrollView, Canvas, EditBox } from 'cc';
import { Props } from './entitys/Props';
import { PropsList } from './PropsList';
import { BaseComponent } from './BaseComponent';
import { Constant } from "./Constant";
import Web3 from "web3/dist/web3.min.js";
import { ChooseWin } from './ChooseWin';
import { Card } from './Card';
import { AmountConfirm } from './AmountConfirm';
import { EQUIPMENT_CACHE_KEY, TOTEM_CACHE_KEY, CONSUMABLES_CACHE_KEY, BOX_CACHE_KEY } from './Constant';
import { FragmentCard } from './FragmentCard';
import { TotemCard } from './TotemCard';
import { FriendChoose } from './FriendChoose';

const { ccclass, type } = _decorator;
const { toBN, padLeft, toHex, fromWei } = Web3.utils;

@ccclass('StorageBox')
export class StorageBox extends BaseComponent {

    @type(Node)
    btn0: Node;

    @type(Node)
    btn1: Node;

    @type(Node)
    btn2: Node;

    @type(Node)
    btn3: Node;

    @type(Label)
    labLock: Label;

    @type(PropsList)
    currentList: PropsList;

    bonusPoosNumber: number = 0;

    constructor() {
        super();
        this.currentList = new PropsList();
        this.btn0 = new Node();
        this.btn1 = new Node();
        this.btn2 = new Node();
        this.btn3 = new Node();
        this.labLock = new Label();
    }

    onLoad() {
        super.onLoad();
        this.currentList.setIsSingleChoice(false);
        this._loadEquipments();
    }

    start() {
        this.btn1.active = false;
        this.btn2.active = false;
        this.btn3.active = false;
    }
    onDestroy() {
        this.currentList.onDoubleEvent = null;
    }

    onWinClose() {
        director.loadScene("Main");
    }

    _hideAllBtn() {
        this.btn0.active = false;
        this.btn1.active = false;
        this.btn2.active = false;
        this.btn3.active = false;
    }

    async _loadConsumables() {
        let data: Props[] = [];
        this.currentList.onDoubleEvent = null;
        this.currentList.onChooseEvent = null;
        let cache = localStorage.getItem(CONSUMABLES_CACHE_KEY);

        if (!!cache) {
            data = JSON.parse(cache);
            this.currentList.setData(data);
            return;
        }
        for (let id in Constant.consumables) {
            // console.log(id, Constant.consumables[id]);
            let item = (Constant.consumables as any)[id];
            let balance = await this.callContract("Fragment", "balanceOf", this.api?.curAccount, item[1]).catch((reason) => { this.showErr(reason); });
            let count = parseInt(balance);
            if (count > 0) {
                let bigType = toBN(item[1]).shrn(248);
                let smallType = toBN("0x" + padLeft(toHex(item[1]), 64).substr(4, 16)).toNumber();
                let e = new Props();
                e.id = item[1];
                e.name = item[0];
                // e.img = "icon/" + bigType + "-" + smallType;
                e.img = bigType + "-" + smallType;
                e.amount = count;
                e.info = { quality: 0 };
                data.push(e);
            }
        }
        // console.log("data: ",data);
        this.currentList.setData(data);
        localStorage.setItem(CONSUMABLES_CACHE_KEY, JSON.stringify(data));
    }

    async _loadBox() {
        this.currentList.onDoubleEvent = null;
        this.currentList.onChooseEvent = null;
        let data: Props[] = [];
        let cache = localStorage.getItem(BOX_CACHE_KEY);
        if (!!cache) {
            data = JSON.parse(cache);
            this.currentList.setData(data);
            return;
        }
        let boxs = await this.callContract("Box", "tokensOf", this.api?.curAccount, 0, 0).catch((reason) => { this.showErr(reason); });
        if (!!boxs) {
            // console.log("boxs: ", boxs);
            for (let i = 0; i < boxs.length; i++) {
                let classId = toBN(boxs[i]).shrn(240).toString();
                let e = new Props();
                e.id = classId;
                e.name = (Constant.boxs as any)[classId];
                // e.img = "icon/box" + classId;
                e.img = "box" + classId;
                e.amount = 1;
                e.info = boxs[i];
                data.push(e);
            }
        }
        // console.log("boxs: ", data);
        this.currentList.setData(data);
        localStorage.setItem(BOX_CACHE_KEY, JSON.stringify(data));
    }

    async _loadEquipments() {
        let data: Props[] = await this.loadEquipments();
        // console.log(data);
        this.currentList.onDoubleEvent = this._onEquipDoubleClick.bind(this);
        this.currentList.onChooseEvent = this._onEquipClick.bind(this);
        data.sort((a, b) => {
            let x = a.info.isEquip ? 1 : 0;
            let y = b.info.isEquip ? 1 : 0;
            let c = y - x;
            if (c == 0) {
                x = parseInt(a.info.level);
                y = parseInt(b.info.level);
                c = y - x;
                if (c == 0) {
                    x = parseInt(a.info.quality);
                    y = parseInt(b.info.quality);
                }
            }
            return y - x;
        });
        this.currentList.setData(data);
        this._statisticsLGC(data);
    }

    private _statisticsLGC(data: Props[]) {
        // console.log(data);
        let lgc = toBN(0);
        data.forEach((item) => {
            lgc = lgc.add(toBN(item.info.tokens));
        });
        let lgcStr = parseFloat(fromWei(lgc.toString(), "ether"));
        this.labLock.string = `装备锁定共 ${lgcStr.toFixed(4)} LGC`;
    }

    async _loadTotem() {
        this.currentList.onChooseEvent = this._onTotemClick.bind(this);
        this.currentList.onDoubleEvent = this._onTotemDoubleClick.bind(this);
        if (this.bonusPoosNumber == 0)
            this.bonusPoosNumber = await this.callContract("BonusPool", "number");
        //加载收藏品(奖池矿片、艺术品矿片、图腾)
        let data: Props[] = [];
        let cache = localStorage.getItem(TOTEM_CACHE_KEY);
        if (!!cache) {
            data = JSON.parse(cache);
            this.currentList.setData(data);
            return;
        }
        let allP: Promise<any>[] = [];
        //获取碎片id
        // let fIds = await this.callContract("Fragment", "tokensOf", this.api?.curAccount, 0, 0); //TODO 新版本合约改用此方法
        let fIds: any[] = [];
        let minNumber = this.bonusPoosNumber >= 3 ? this.bonusPoosNumber - 3 : 0;
        for (let i = this.bonusPoosNumber; i > minNumber; i--) {
            fIds.push(toBN(padLeft(toHex(1), 2) + padLeft(toHex(1), 16).substr(2) + padLeft(toHex(i), 8).substr(2) + padLeft("0", 38)).toString());
            fIds.push(toBN(padLeft(toHex(1), 2) + padLeft(toHex(2), 16).substr(2) + padLeft(toHex(i), 8).substr(2) + padLeft("0", 38)).toString());
            fIds.push(toBN(padLeft(toHex(1), 2) + padLeft(toHex(3), 16).substr(2) + padLeft(toHex(i), 8).substr(2) + padLeft("0", 38)).toString());
            fIds.push(toBN(padLeft(toHex(1), 2) + padLeft(toHex(4), 16).substr(2) + padLeft(toHex(i), 8).substr(2) + padLeft("0", 38)).toString());
        }
        let fs: Promise<any>[] = [];
        fIds.forEach((fId: string) => {
            let p = this.callContract("Fragment", "getInfo", fId, this.api?.curAccount);
            // let p = this.callContract("Fragment", "balanceOf", this.api?.curAccount, fId);
            fs.push(p);
        });
        //获取碎片
        allP.push(
            Promise.all(fs).then((values) => {
                for (let i = 0; i < values.length; i++) {
                    let bigType = toBN(fIds[i]).shrn(248).toNumber();
                    if (bigType < 3) {
                        // console.log("values: ",values)
                        let count = parseInt(values[i].balance.toString());
                        // let count = parseInt(values[i].toString());
                        if (count > 0) {
                            let smallType = toBN("0x" + padLeft(toHex(fIds[i]), 64).substr(4, 16)).toNumber();
                            let num = toBN("0x" + padLeft(toHex(fIds[i]), 64).substr(20, 8)).toNumber();
                            let e = new Props();
                            e.id = fIds[i];
                            e.name = (Constant.totems as any)[smallType][0].replace("图腾", "碎片");
                            e.img = bigType + "-" + smallType;
                            e.amount = count;
                            e.info = { quality: 2, bigType: bigType, smallType: smallType, tokens: values[i].tokens, number: num };
                            // e.info = { quality: 2, bigType: bigType, smallType: smallType, tokens: 0, number: num };
                            data.push(e);
                        }
                    }
                }
            }));
        //获取图腾
        let ps2: Promise<any>[] = [];
        let ts = await this.callContract("Totem", "tokensOf", this.api?.curAccount, 0, 0);
        ts.forEach((t: string) => {
            ps2.push(this.callContract("Totem", "lockTokens", t).catch((reason) => { this.showErr(reason); }));
        });
        allP.push(
            Promise.all(ps2).then(values => {
                for (let i = 0; i < values.length; i++) {
                    let tokenId = toBN(ts[i]);
                    let tokens = values[i];
                    let bigType = tokenId.shrn(248).toNumber();
                    let smallType = toBN("0x" + padLeft(toHex(tokenId), 64).substr(4, 16)).toNumber();
                    let num = toBN("0x" + padLeft(toHex(fIds[i]), 64).substr(20, 8)).toNumber();
                    let e = new Props();
                    e.id = tokenId.toString();
                    e.name = (Constant.totems as any)[smallType][0];
                    e.img = "T" + bigType + "-" + smallType;
                    e.amount = 1;
                    e.info = { tokens: tokens, bigType: bigType, smallType: smallType, quality: 2, number: num };
                    data.push(e);
                }
            }));
        // console.log("allP: ",allP)
        Promise.all(allP).then(v => {
            // console.log("data: ", data);
            this.currentList.setData(data);
            localStorage.setItem(TOTEM_CACHE_KEY, JSON.stringify(data));
        });
    }

    _onTotemDoubleClick(item: Props) {
        if (item.img?.indexOf("T") == 0) {
            TotemCard.show(item);
        } else {
            FragmentCard.show(item);
        }

    }

    _onEquipClick(item: Props) {
        // console.log(item);
        // console.log(this.currentList.currentChoose.size)
        let node = this.node.getChildByPath("box/bottom0/BtnIntensify");
        let btnBurn = this.node.getChildByPath("box/bottom0/BtnBurn");
        //BtnBurn
        if (!node || !btnBurn) return;
        if (this.currentList.currentChoose.size > 1) {
            node.active = false;
            btnBurn.active = false;
        } else {
            btnBurn.active = true;
            if (item.info.increaseCount == item.info.increaseMax) {
                node.active = false;
            } else {
                node.active = true;
            }
        }
    }

    _onTotemClick(item: Props) {
        // console.log(item,this.bonusPoosNumber);
        let node = this.node.getChildByPath("box/bottom3/BtnMake");
        let nodeBrun = this.node.getChildByPath("box/bottom3/BtnBurn");
        let nodeHandsel = this.node.getChildByPath("box/bottom3/BtnHandsel");
        if (!node || !nodeBrun || !nodeHandsel) return;
        if ((item.img?.indexOf("T") ?? -1) > -1) {
            node.active = false;
            nodeBrun.active = true;
            nodeHandsel.active = false;
        } else {
            node.active = true;
            nodeHandsel.active = true;
            if (this.bonusPoosNumber == 0 || this.bonusPoosNumber == item.info.number) {
                nodeBrun.active = false;
            } else {
                nodeBrun.active = true;
            }
        }
    }

    //销毁图腾/碎片
    onBrunTotem() {
        let arr = Array.from(this.currentList.currentChoose);
        let props = arr[0];
        // console.log(props);
        let data = padLeft(toHex(2), 2);
        if ((props.img?.indexOf("T") ?? -1) > -1) {
            this.showConfirm("确认要销毁这个" + props.name + "吗?", () => {
                this.sendContract("Totem", "safeTransferFrom", this.api?.curAccount, Constant.address.BonusPool, props.id, data, { from: this.api?.curAccount })
                    .then((v) => {
                        let amount = fromWei(props.info.tokens, "ether");
                        this.showAlert("销毁图腾你获得了" + amount + "LGC");
                        localStorage.removeItem(TOTEM_CACHE_KEY);
                        this._loadTotem();
                    });
            }, () => { });
        } else {
            this.showConfirm("确认要销毁这个" + props.name + "吗?", () => {
                this.sendContract("Fragment", "safeTransferFrom", this.api?.curAccount, Constant.address.BonusPool, props.id, 1, data, { from: this.api?.curAccount })
                    .then((v) => {
                        // let amount = fromWei(props.info.tokens, "ether");
                        this.showAlert("销毁碎片你获得了" + props.info.tokens + "LGC");
                        localStorage.removeItem(TOTEM_CACHE_KEY);
                        this._loadTotem();
                    });
            }, () => { });
        }

    }

    _onEquipDoubleClick(item: Props) {
        let sv = this.currentList.getComponentInChildren(ScrollView);
        let offset = sv?.getScrollOffset();
        Card.show(item, () => {
            if (!!offset && !!sv) {
                sv.scrollToOffset(offset, 1);
            }
        });
    }

    _showBtn(index: Number) {
        this.currentList.clear();
        switch (index) {
            case 0:
                this.currentList.setIsSingleChoice(false);
                this.btn0.active = true;
                this._loadEquipments();
                break;
            case 1:
                this.currentList.setIsSingleChoice(true);
                this.btn1.active = true;
                this._loadConsumables();
                break;
            case 2:
                this.currentList.setIsSingleChoice(false);
                this.btn2.active = true;
                this._loadBox();
                break;
            case 3:
                this.currentList.setIsSingleChoice(true);
                this.btn3.active = true;
                this._loadTotem();
                break;
        }

    }

    _checkTab(target: Toggle): Number {
        let index = 0;
        target.node.parent?.children.forEach((item, i) => {
            let label = item.getComponentInChildren(Label);
            if (label) {
                if (item == target.node) {
                    label.color = Color.WHITE;
                    index = i;
                } else {
                    let c = new Color();
                    c.fromHEX("#a88655");
                    label.color = c;
                }
            }
        });
        this._hideAllBtn();
        this._showBtn(index);
        return index;
    }

    onTabcheck(target: Toggle) {
        let index = this._checkTab(target);
    }

    // 销毁装备
    onBurnClick() {
        let arr = Array.from(this.currentList.currentChoose);
        // console.log(arr);
        if (arr.length > 0) {
            let time = toBN("0x" + padLeft(toHex(arr[0].id), 64).substr(34, 16)).toNumber();
            let _now = Math.floor(Date.now() / 1000);
            if (time + Constant.lockDuration > _now) {
                let span = Math.floor(time + Constant.lockDuration - _now);
                let h = Math.floor(span / 3600);
                let m = Math.floor(span % 3600 / 60);
                let s = span % 3600 - (m * 60);
                this.showAlert(h + "时" + m + "分" + s + "秒后才能摧毁!");
                return;
            }
            this.showConfirm(`你确定要摧毁[${arr[0].name}]吗?`, () => {
                this.sendContract("Equipment", "burn", arr[0].id, { from: this.api?.curAccount })
                    .then(result => {
                        if (!!result) {
                            localStorage.removeItem(EQUIPMENT_CACHE_KEY);
                            this._loadEquipments();
                            this.showAlert("销毁成功,获得了个" + Web3.utils.fromWei(arr[0].info.tokens, "ether") + "LGC");
                        }
                    });
            }, () => { });
        } else {
            this.showAlert("未选择装备");
        }
    }

    // 销毁消耗品
    onConsumablesBurn() {
        let arr = Array.from(this.currentList.currentChoose);
        if (arr.length > 0) {
            AmountConfirm.show(arr[0].amount, "销毁" + arr[0].name, (value: number) => {
                this.sendContract("Fragment", "burn", this.api?.curAccount, arr[0].id, value, { from: this.api?.curAccount })
                    .then(result => {
                        localStorage.removeItem(CONSUMABLES_CACHE_KEY);
                        this._loadConsumables();
                        this.showAlert("成功销毁" + value + "个" + arr[0].name);
                    });
            }, true);
        }
    }

    onIntensifyClick() {
        let arr = Array.from(this.currentList.currentChoose);
        if (arr.length < 1) {
            this.showAlert("未选择装备");
            return;
        }
        ChooseWin.show(false).then((cw: ChooseWin) => {
            cw.onChooseEvent = this._onChooseEquip.bind(this);
            let data = this.currentList.fixedScrollView.dataSet.filter((item: Props) => {
                let max = parseInt(arr[0].info.level);
                let min = 0;
                if (item.info.category == "0") {
                    min = max - 6;
                } else {
                    min = max - 11;
                }
                min = min < 0 ? 0 : min;
                let level = parseInt(item.info.level);

                // return item.info.number == arr[0].info.number && item.id != arr[0].id && item.info.isEquip == false;
                return item.id != arr[0].id && item.info.isEquip == false
                    && (arr[0].info.profession == item.info.profession && arr[0].info.category == item.info.category)
                    && (level <= max && level >= min);
            });
            cw.setData(data);
        });
    }

    _onChooseEquip(data: any): boolean {
        if (!!data && data.length > 0) {
            let baseId = Array.from(this.currentList.currentChoose)[0].id;
            let ids: string[] = [];
            data.forEach((item: any) => {
                ids.push(item.id);
            });
            // console.log(baseId,ids);
            this.sendContract("Equipment", "increase", baseId, ids, { from: this.api?.curAccount })
                .then(result => {
                    if (!!result) {
                        localStorage.removeItem(EQUIPMENT_CACHE_KEY);
                        this._loadEquipments();
                    }
                });
        }
        return false;
    }

    onLockClick() {
        alert("锁定");
        console.log(Array.from(this.currentList.currentChoose));
    }

    onOpenClick() {
        let arr = Array.from(this.currentList.currentChoose);
        // console.log("arr: ", arr);
        let ids: string[] = [];
        arr.forEach((item: Props) => {
            ids.push(item.info);
        });
        if (ids.length > 0) {
            this.sendContract("Box", "open", ids, { from: this.api?.curAccount })
                .then(result => {
                    // console.log(result);
                    if (!!result) {
                        // this.showAlert("获得新装备!");
                        ChooseWin.show(true, "", "获得新装备!").then((cw: ChooseWin) => {
                            let data = this.getEventProps(result);
                            cw.setData(data);
                        });
                        localStorage.removeItem(BOX_CACHE_KEY);
                        localStorage.removeItem(EQUIPMENT_CACHE_KEY);
                        this._loadBox();
                    }
                });
        } else {
            this.showAlert("请选择至少一个箱子!");
        }
    }

    onMakeClick() {
        let arr = Array.from(this.currentList.currentChoose);
        // console.log("arr: ", arr);
        if (arr.length == 1) {
            let props = arr[0];
            this.callContract("BonusPool", "getInfo").then(result => {
                let info = result[6].awardsInfos.find((item: any) => item.types == props.info.smallType)
                let amount = Math.floor(parseInt(info.fragmentCount) / parseInt(info.count));
                if (props.amount < amount) {
                    this.showAlert("要合成[" + props.name?.replace("碎片", "图腾") + "]至少要" + amount + "个碎片!");
                    return;
                }
                let data = padLeft(toHex(1), 2);
                this.sendContract("Fragment", "safeTransferFrom", this.api?.curAccount, Constant.address.BonusPool, props.id, amount, data, { from: this.api?.curAccount })
                    .then(val => {
                        this.showAlert("成功组合一个[" + props.name?.replace("碎片", "图腾") + "]");
                        localStorage.removeItem(TOTEM_CACHE_KEY);
                        this._loadTotem();
                    });
            });
        }
    }

    onRoleCancelClick() {
        alert("取消");
    }

    onHandsel() {
        FriendChoose.show().then(win => {
            win.onChooseEvent = this.doHandsel.bind(this);
        });
    }

    doHandsel(data: any) {
        let arr = Array.from(this.currentList.currentChoose).map((val) => val.id);
        this.showConfirm("你的装备将发生转移!\r\n请确认转移地址安全!\r\n你确认要赠送吗?", () => {
            // console.log(arr, data);
            let dm = this.api?.dataApi.eth.abi.encodeParameters(["uint256", "address", "uint256[]"], [9, data.user, arr]);
            console.log("dm: ", dm);
            // this.sendContract("Equipment", "handsel", data.user, arr, { from: this.api?.curAccount }).then((val) => {
            this.sendContract("LGC", "transferAndCall", Constant.address.Equipment, 0, dm, { from: this.api?.curAccount }).then((val) => {
                if (!!val) {
                    localStorage.removeItem(EQUIPMENT_CACHE_KEY);
                    this._loadEquipments();
                }
            });
        }, () => { });
    }

    onFragmentHandsel() {
        let arr = Array.from(this.currentList.currentChoose)
        let item = arr[0];
        if (!(item.img?.indexOf("T") == 0)) {
            FriendChoose.show().then(win => {
                win.onChooseEvent = this.doFragmentHandsel.bind(this);
            });
        }
    }

    doFragmentHandsel(data: any) {
        let arr = Array.from(this.currentList.currentChoose)
        let item = arr[0];
        AmountConfirm.show(item.amount, "选择赠送数量", (value: number) => {
            this.showConfirm("你的碎片将发生转移!\r\n请确认转移地址安全!\r\n你确认要赠送吗?", () => {
                // console.log(item, data, value, this.api?.curAccount);
                this.callContract("Friend", "contains", this.api?.curAccount, data.user).then((isFriend) => {
                    if (true == isFriend) {
                        this._sendFragment(this.api?.curAccount, data.user, item.id, value.toString());
                    } else {
                        this.showAlert("赠送只限于好友之间!");
                    }
                });
            });
        }, true);
    }

    _sendFragment(from: any, to: any, tokenId: any, amount: any) {
        // console.log("params: ", from, to, tokenId, amount);
        this.sendContract("Fragment", "safeTransferFrom", from, to, tokenId, amount, "0x", { from: this.api?.curAccount })
            .then(result => {
                this.showAlert("赠送成功!");
                localStorage.removeItem(TOTEM_CACHE_KEY);
                this._loadTotem();
            });
    }
}

