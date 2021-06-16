
import { _decorator, Component, Node, Sprite, Label, Button } from 'cc';
import { BaseComponent } from '../BaseComponent';
import { BOX_CACHE_KEY, Constant } from '../Constant';
import Web3 from "web3/dist/web3.min.js";
const { ccclass, type } = _decorator;
const { toWei, fromWei, toBN } = Web3.utils;

@ccclass('RefUserReward')
export class RefUserReward extends BaseComponent {

    @type(Sprite)
    spriteBox: Sprite;

    @type(Label)
    labReward: Label;

    @type(Label)
    labCondition: Label;

    @type(Label)
    labBtn: Label;

    data: any;
    config: any;

    constructor() {
        super();
        this.spriteBox = new Sprite();
        this.labReward = new Label();
        this.labCondition = new Label();
        this.labBtn = new Label();
    }

    onLoad() {
        super.onLoad();
        this._show();
    }

    setData(config: any, userData: any) {
        this.config = config;
        this.data = Object.assign({}, userData);
    }

    private _show() {
        // console.log(this.config, this.data);
        this.loadSprite(`box${this.config.boxType}`, this.spriteBox);
        this.labReward.string = `${(Constant.boxs as any)[this.config.boxType]}x${this.config.boxAmount}`;
        this.labCondition.string = `消费满${fromWei(this.config.consumeAmount, "ether")}USDT可领`;
        if (this.data.withdraw.indexOf(this.config.id) > -1) {
            this.labBtn.string = "已领取";
            let btn = this.labBtn.node.parent?.getComponent(Button);
            if (!!btn) {
                btn.interactable = false;
            }
        } else {
            this.labBtn.string = "领取";
        }
    }

    onClaim() {
        // console.log(this.data);
        if (this.data.parentCode == "0") {
            this.showAlert("您尚未绑定邀请人!");
            return;
        }
        if (toBN(fromWei(this.data.consumeAmount, "ether")).lt(toBN(fromWei(this.config.consumeAmount, "ether")))) {
            this.showAlert("您尚未达到领取条件!");
            return;
        }
        if (this.data.withdraw.indexOf(this.config.id) == -1) {
            this.sendContract("Referral", "userClaim", this.config.id, { from: this.api?.curAccount })
                .then(value => {
                    let arr = Array.from(this.data.withdraw);
                    arr.push(this.config.id);
                    this.data.withdraw = arr;
                    this._show();
                    localStorage.removeItem(BOX_CACHE_KEY);
                    this.showAlert("领取奖励成功!");
                });
        }
    }
}

