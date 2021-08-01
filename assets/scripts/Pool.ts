
import { _decorator, Node, director, resources, Prefab, instantiate, Label } from 'cc';
import { BaseComponent } from './BaseComponent';
const { ccclass, type } = _decorator;
import { ChooseWin } from "./ChooseWin";
import { Constant } from './Constant';
import { Props } from './entitys/Props';
import Web3 from "web3/dist/web3.min.js";

const { toHex, toBN, padLeft, fromWei } = Web3.utils;

@ccclass('Pool')
export class Pool extends BaseComponent {

    @type(Label)
    labNumber: Label;

    @type(Label)
    labTotal: Label;

    @type(Label)
    labCurrent: Label;

    @type(Label)
    labTime: Label;

    allTotem: Props[] = [];
    data: any;
    private startTimes: boolean = false;

    constructor() {
        super();
        this.labNumber = new Label();
        this.labTotal = new Label();
        this.labCurrent = new Label();
        this.labTime = new Label();
    }

    onLoad() {
        super.onLoad();
        this._loadTotem();
        this._loadPooInfo();
    }
    private _loadPooInfo() {
        this.callContract("BonusPool", "getInfo")
            .then(result => {
                // console.log("result: ", result);
                if (!!result) {
                    this.data = result;
                    this.labNumber.string = "第" + result[2] + "期奖金";
                    this.labTotal.string = fromWei(result[0], "ether") + " LGC";
                    this.labCurrent.string = fromWei(result[1], "ether") + " LGC";
                    this._showTime();
                }
            })
            .catch(reason => { console.log(reason); this.showErr(reason); });
    }

    private _showTime() {
        let endtime = parseInt(this.data[6].endTime);
        let timespan = Math.floor(Date.now() / 1000 - endtime);
        let hour = Math.floor(-timespan / 3600);
        let minute = Math.floor(-timespan % 3600 / 60);
        let second = -timespan % 3600 - (minute * 60);
        this.labTime.string = hour + " 时 " + minute + " 分 " + second + " 秒";
        if (timespan < 0) {
            this.scheduleOnce((dt: any) => this._showTime(), 1);
        } else {
            this.labTime.string = "已经结束";
        }
    }

    private async _loadTotem() {
        let es = await this.callContract("Totem", "tokensOf", this.api?.curAccount, 0, 0).catch((reason) => {
            this.showErr(reason);
        });
        if (!!es) {
            this.allTotem = [];
            for (let i = 0; i < es.length; i++) {
                let eResult = await this.callContract("Totem", "lockTokens", es[i]).catch((reason) => { this.showErr(reason); })
                let tokenId = toBN(es[i]);
                let bigType = tokenId.shrn(248).toNumber();
                if (bigType == 1) {
                    let smallType = toBN("0x" + padLeft(toHex(tokenId), 64).substr(4, 16)).toNumber();
                    let e = new Props();
                    e.id = tokenId.toString();
                    e.name = (Constant.totems as any)[smallType][0];
                    e.img = "T" + bigType + "-" + smallType;
                    e.amount = 1;
                    e.info = { tokens: eResult, bigType: bigType, smallType: smallType, quality: 2 };
                    this.allTotem.push(e);
                }
            }
        }
    }

    onChoose(data: Props | null = null) {
        this.sendContract("Totem", "safeTransferFrom", this.api?.curAccount, Constant.address.BonusPool, data?.id, padLeft(toHex(3), 2), { from: this.api?.curAccount })
            .then(value => {
                this.showAlert("兑换成功!");
            });
        return true;
    }

    onClose() {
        director.loadScene("Main");
    }

    onRedeemClick() {
        ChooseWin.show(true, "没有可兑换的图腾").then((cw: ChooseWin) => {
            cw.onChooseEvent = this.onChoose.bind(this);
            cw.setData(this.allTotem);
        });
    }
}

