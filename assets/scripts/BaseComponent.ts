
import { _decorator, Component, Node, director, find, instantiate, resources, SpriteFrame, Sprite, UITransform } from 'cc';
import { Loading } from './Loading';
import { DataNode } from './DataNode';
import { AlertWin } from './AlertWin';
import Web3 from "web3/dist/web3.min.js";
import { Props } from './entitys/Props';
import { Constant, EQUIPMENT_CACHE_KEY, FRIEND_CACHE_KEY } from './Constant';
const { ccclass } = _decorator;
const { toBN, padLeft, toHex, fromWei } = Web3.utils;

@ccclass('BaseComponent')
export class BaseComponent extends Component {

    api: DataNode | null = null;

    onLoad() {
        if (!this.api) {
            let node = find("DataNode")?.getComponent(DataNode);
            if (node) {
                this.api = node;
                this.api.accountsChanged = this.accountsChanged.bind(this);
            }
        }
    }

    accountsChanged(accounts: string[]) {
        // this.node.emit("ChangeAccount", accounts[0]);
    }

    async loadScene(sceneName: string) {
        let loading = await Loading.show(this.node);
        director.loadScene(sceneName, (err, scene) => {
            loading.close();
        });
    }

    getErr(err: any) {
        if (err.code > 0) {
            return err.message;
        }
        let reg = /(\"reason\"\:\")(.+?)(\")/;
        let msg = "未处理异常";
        let info = reg.exec(err.message);
        if (!!info && info.length > 2) {
            msg = info[2];
            return msg;
        }
        let index = err.message.indexOf(":");
        if (index > 0) {
            msg = err.message.substr(0, index);
            return msg;
        }
        return msg;
    }

    showLoading(nodeName: string = "Canvas") {
        let node = find(nodeName) ?? this.node;
        return Loading.show(node);
    }

    showAlert(msg: string, callback: Function | null = null, title: string = "提示") {
        if (callback == null) {
            AlertWin.show(this.getTopNode(), msg, title);
        } else {
            AlertWin.show(this.getTopNode(), msg, title, () => {
                callback()
            });
        }
    }

    showConfirm(msg: string, okCallback: Function | null = null, cancelCallback: Function | null = null) {
        let node = find("Canvas");
        if (!!node) {
            AlertWin.showConfirm(node, msg, "提示", okCallback, cancelCallback);
        }
    }

    showErr(err: any) {
        AlertWin.show(this.getTopNode(), this.getErr(err));
    }

    async callContract(contract: string, method: string, ...params: any[]) {
        let fragment = await this.api?.getDataContract(contract);
        let data: Object = { from: this.api?.curAccount };
        let ps = params;
        let last = params[params.length - 1];
        if (params.length > 0 && this._checkOption(last)) {
            data = ps.pop();
        }
        return new Promise<any>((resolve, reject) => {
            fragment?.methods[method](...ps).call(data, (err: any, result: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }

    async callContractByAddr(addr: string, contract: string, method: string, ...params: any[]) {
        let fragment = await this.api?.getDataContract(contract, addr);
        let data: Object = { from: this.api?.curAccount };
        let ps = params;
        let last = params[params.length - 1];
        if (params.length > 0 && this._checkOption(last)) {
            data = ps.pop();
        }
        return new Promise<any>((resolve, reject) => {
            fragment?.methods[method](...ps).call(data, (err: any, result: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }

    _checkOption(para: any): boolean {
        if (!para) return false;
        if (Web3.utils.isBN(para)) {
            return false;
        }
        if (para.hasOwnProperty("from") || para.hasOwnProperty("gasPrice") || para.hasOwnProperty("gas"))
            return true;
        return false;
    }

    async _sendContract(contract: string, method: string, ...params: any[]) {
        let fragment = await this.api?.getContract(contract);
        let data: Object = { from: this.api?.curAccount };
        let ps = params;
        let last = params[params.length - 1];
        if (params.length > 0 && this._checkOption(last)) {
            data = ps.pop();
        }
        let isShow = false;
        return new Promise((resolve, reject) => {
            fragment?.methods[method](...ps).send(data, (err: any, hash: any) => {
                if (!!err && !isShow) {
                    isShow = true;
                    console.log("_sendContract callback: ", err);
                    reject(err);
                    this.showErr(err);
                }
            }).on("receipt", (receipt: any) => {
                resolve(receipt);
            }).on("error", (err: any) => {
                if (!isShow) {
                    isShow = true;
                    console.log("_sendContract: ", err);
                    reject(err);
                    this.showErr(err);
                }
            });
        });
    }
    async sendContract(contract: string, method: string, ...params: any[]) {
        let loading = await this.showLoading();
        return new Promise((resolve) => {
            this._sendContract(contract, method, ...params)
                .then(result => {
                    loading.close();
                    resolve(result);
                })
                .catch(reason => {
                    console.log("reason: ");
                    console.log(reason);
                    loading.close();
                });
        });
    }

    async sendContractEvent(contract: string, method: string, eventCallback: Function | null, ...params: any[]) {
        let loading = await this.showLoading();
        return new Promise((resolve) => {
            this._sendContract(contract, method, ...params)
                .then(result => {
                    if (!!eventCallback) {
                        eventCallback(loading, result);
                    } else {
                        loading.close();
                    }
                    resolve(result);
                })
                .catch(reason => {
                    console.log(reason);
                    loading.close();
                });
        });
    }

    async getTransactionReceipt(hash: string) {
        let receipt = await this.api?.getTransactionReceipt(hash);
        return receipt?.status ?? false;
    }

    async _sendContractByAddr(addr: string, contract: string, method: string, ...params: any[]) {
        let fragment = await this.api?.getContract(contract, addr);
        let data: Object = { from: this.api?.curAccount };
        let ps = params;
        let last = params[params.length - 1];
        if (params.length > 0 && this._checkOption(last)) {
            data = ps.pop();
        }
        // console.log(ps, data);
        return new Promise((resolve, reject) => {
            fragment?.methods[method](...ps).send(data, (err: any, result: any) => {
                if (err) {
                    reject(err);
                }
            }).on("receipt", (receipt: any) => {
                resolve(receipt);
            }).on("error", (err: any) => {
                console.log(err);
                reject(err);
                this.showErr(err);
            });
        });
    }
    async sendContractByAddr(addr: string, contract: string, method: string, ...params: any[]) {
        let loading = await this.showLoading();
        return new Promise((resolve) => {
            this._sendContractByAddr(addr, contract, method, ...params)
                .then(result => {
                    loading.close();
                    resolve(result);
                })
                .catch(reason => {
                    loading.close();
                });
        });
    }

    loadSprite(name: string | null | undefined, target: Sprite | null | undefined) {
        if (!!target) {
            if (!!name) {
                let url = "props/" + name + "/spriteFrame";
                resources.load(url, SpriteFrame, (err, data) => {
                    // let m: any = target.node.getComponent(UITransform)?.contentSize;
                    target.type = Sprite.Type.SIMPLE;
                    target.sizeMode = Sprite.SizeMode.CUSTOM;
                    target.spriteFrame = data;
                    // target.node.getComponent(UITransform)?.setContentSize(m);
                });
            } else {
                target.spriteFrame = null;
            }

        }
    }

    loadSpriteUrl(url: string | null, target: Sprite | null | undefined) {
        if (!!target) {
            if (!!url) {
                let path = url + "/spriteFrame";
                resources.load(path, SpriteFrame, (err, data) => {
                    target.type = Sprite.Type.SIMPLE;
                    target.sizeMode = Sprite.SizeMode.CUSTOM;
                    target.spriteFrame = data;
                });
            } else {
                target.spriteFrame = null;
            }

        }
    }

    async getPastEvents(contractName: string, eventName: string, filter: any, block: number | string = "latest") {
        let option = { toBlock: block };
        if (!!filter) option = filter;
        let contract = await this.api?.getContract(contractName);
        return new Promise((resolve, reject) => {
            contract?.getPastEvents(eventName, option, (err, eventData) => {
                if (!!err) {
                    reject(err);
                    return;
                }
                resolve(eventData);
            });
        });
    }

    arrayToObject(arr: Array<any>): any {
        return Object.keys(arr).slice(arr.length).reduce((p, c) => {
            (p as any)[c] = (arr as any)[c];
            return p;
        }, {});
    }

    async loadEquipments(): Promise<Props[]> {
        let data: Props[] = [];
        let cache = localStorage.getItem(EQUIPMENT_CACHE_KEY);
        if (!!cache) {
            data = JSON.parse(cache);
            if (data.length > 0)
                return data;
        }
        let es = await this.callContract("Equipment", "tokensOf", this.api?.curAccount, 0, 0).catch((reason) => {
            this.showErr(reason);
        });
        if (!!es) {
            let allP: Promise<any>[] = [];
            for (let i = 0; i < es.length; i++) {
                allP.push(this.callContract("Equipment", "getEquipment", es[i]).catch((reason) => { this.showErr(reason); }));
            }
            let results = await Promise.all(allP)
            results.forEach(eResult => {
                let e = new Props();
                e.id = eResult.id;
                e.name = (Constant.equipments as any)[eResult.attrs.number.toString()];
                // e.img = "icon/" + eResult.attrs.number.toString();
                e.img = eResult.attrs.number.toString();
                e.amount = 1;
                e.info = this.arrayToObject(eResult.attrs);
                e.info.mainAttrs = this.arrayToObject(eResult.attrs.mainAttrs);
                data.push(e);
            });
            if (data.length > 0)
                localStorage.setItem(EQUIPMENT_CACHE_KEY, JSON.stringify(data));
            return data;
        }
        return data;
    }

    getUIT(node: Node | null = null): UITransform {
        if (!!node) {
            return node.getComponent(UITransform) ?? new UITransform();
        }
        return this.node.getComponent(UITransform) ?? new UITransform();
    }

    getTopNode() {
        let node = find("Canvas");
        if (!node) {
            node = this.node.parent;
            if (!node)
                node = this.node;
        }
        return node;
    }

    loadFriends(): any[] {
        let list: any[] = [];
        let cache = localStorage.getItem(FRIEND_CACHE_KEY);
        if (!!cache) {
            list = JSON.parse(cache);
        }
        return list;
    }

    async getFragment(isPast: boolean = false) {
        let data: Props[] = [];
        let allP: Promise<any>[] = [];
        let curNumber = await this.callContract("BonusPool", "number");
        let fIds: any[] = [];
        if (isPast) {
            let minNumber = curNumber >= 3 ? curNumber - 3 : 0;
            for (let i = curNumber; i > minNumber; i--) {
                fIds.push(toBN(padLeft(toHex(1), 2) + padLeft(toHex(1), 16).substr(2) + padLeft(toHex(i), 8).substr(2) + padLeft("0", 38)).toString());
                fIds.push(toBN(padLeft(toHex(1), 2) + padLeft(toHex(2), 16).substr(2) + padLeft(toHex(i), 8).substr(2) + padLeft("0", 38)).toString());
                fIds.push(toBN(padLeft(toHex(1), 2) + padLeft(toHex(3), 16).substr(2) + padLeft(toHex(i), 8).substr(2) + padLeft("0", 38)).toString());
                fIds.push(toBN(padLeft(toHex(1), 2) + padLeft(toHex(4), 16).substr(2) + padLeft(toHex(i), 8).substr(2) + padLeft("0", 38)).toString());
            }
        } else {
            fIds.push(toBN(padLeft(toHex(1), 2) + padLeft(toHex(1), 16).substr(2) + padLeft(toHex(curNumber), 8).substr(2) + padLeft("0", 38)).toString());
            fIds.push(toBN(padLeft(toHex(1), 2) + padLeft(toHex(2), 16).substr(2) + padLeft(toHex(curNumber), 8).substr(2) + padLeft("0", 38)).toString());
            fIds.push(toBN(padLeft(toHex(1), 2) + padLeft(toHex(3), 16).substr(2) + padLeft(toHex(curNumber), 8).substr(2) + padLeft("0", 38)).toString());
            fIds.push(toBN(padLeft(toHex(1), 2) + padLeft(toHex(4), 16).substr(2) + padLeft(toHex(curNumber), 8).substr(2) + padLeft("0", 38)).toString());
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
        await Promise.all(allP);
        // return JSON.parse(JSON.stringify(data));
        return data;
    }

    getEventProps(val: any) {
        // console.log(val);
        let data: Props[] = [];
        if ("Gain" in val.events) {
            if (val.events.Gain instanceof Array) {
                for (let i in val.events.Gain) {
                    let gain = val.events.Gain[i].returnValues;
                    let props = new Props();
                    if (parseInt(gain.class) == 0) {//装备
                        props.name = (Constant.equipments as any)[gain.number];
                        props.img = gain.number.toString();
                        props.info = { quality: gain.quality.toString() };
                    } else {
                        props.name = (Constant.totems as any)[parseInt(gain.number)][0].replace("图腾", "碎片");
                        props.img = gain.quality + "-" + gain.number;
                        props.info = { quality: "2", bigType: gain.quality, smallType: gain.number }
                    }
                    data.push(props);
                }
            } else {
                let gain = val.events.Gain.returnValues;
                let props = new Props();
                if (parseInt(gain.class) == 0) {//装备
                    props.name = (Constant.equipments as any)[gain.number];
                    props.img = gain.number.toString();
                    props.info = { quality: gain.quality.toString() };
                } else {
                    props.name = (Constant.totems as any)[parseInt(gain.number)][0].replace("图腾", "碎片");
                    props.img = gain.quality + "-" + gain.number;
                    props.info = { quality: "2", bigType: gain.quality, smallType: gain.number }
                }
                data.push(props);
            }
        }
        return data;
    }

    getQueryString(name: string) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        }
        return null;
    }
}

