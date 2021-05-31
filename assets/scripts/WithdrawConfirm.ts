
import { _decorator, Component, Node, Label, EditBox, find, resources, Prefab, instantiate } from 'cc';
import { BaseComponent } from './BaseComponent';
import { Constant } from './Constant';
import Web3 from "web3/dist/web3.min.js";

const { ccclass, type } = _decorator;
const { toWei, fromWei, toBN } = Web3.utils;

@ccclass('WithdrawConfirm')
export class WithdrawConfirm extends BaseComponent {

    @type(Label)
    labBalance: Label;

    data: any | null = null;
    config: any | null = null;
    reward: any = toBN(0);
    onOkCallback: Function | null = null;


    constructor() {
        super();
        this.labBalance = new Label();
    }

    onLoad() {
        super.onLoad();
        this.caclReward();
    }

    caclReward() {
        let reward = toBN(0);
        let now = toBN(Math.fround((Date.now() / 1000)));
        let startTime = toBN(this.data.startTime);
        let duration = toBN(this.data.duration);
        let totalAdjust = toBN(this.data.totalAdjust);
        let totalReward = toBN(this.data.totalReward);
        let totalAmount = toBN(this.data.totalAmount);
        let amount = toBN(this.data.stakingAmounts);
        let adjust = toBN(this.data.stakingAdjusts);
        if (now.lt(startTime.add(duration))) {
            reward = totalReward.mul(now.sub(startTime)).div(duration).add(totalAdjust);
        } else {
            reward = totalReward.add(totalAdjust);
        }
        this.reward = reward.mul(amount).div(totalAmount).sub(adjust);
        if (this.reward.ltn(0)) this.reward = toBN(0);
        this.labBalance.string = fromWei(this.reward.toString(), "ether");
    }

    setData(data: any, config: any) {
        this.data = data;
        this.config = config;
    }

    onWithdraw() {
        this.sendContract(this.config.abi, "withdraw", this.config.address, { from: this.api?.curAccount })
            .then(value => {
                this.onClose();
                if (!!this.onOkCallback) this.onOkCallback();
                this.showAlert("领取成功!")
            });
    }

    onClose() {
        this.node.active = false;
        this.node.parent?.removeChild(this.node);
    }

    static show(config: any, data: any, onOkCallback: Function | null = null): void {
        let node = find("Canvas");
        if (!!node) {
            resources.load("component/WithdrawConfirm", Prefab, (err, prefab) => {
                let win = instantiate(prefab);
                let logic = win.getComponent(WithdrawConfirm);
                if (logic) {
                    logic.setData(data, config);
                    logic.onOkCallback = onOkCallback;
                    node?.addChild(win);
                }
            });
        }
    }
}

