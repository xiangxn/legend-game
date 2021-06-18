
import { _decorator, Component, Node, Toggle, Label, EditBox, resources, instantiate, Prefab, find, Button } from 'cc';
import Web3 from "web3/dist/web3.min.js";
import { BaseComponent } from '../BaseComponent';
import { Constant } from '../Constant';
import { DCButton } from '../DCButton';

const { ccclass, type } = _decorator;
const { toWei, fromWei, toBN } = Web3.utils;

@ccclass('StakeConfirm')
export class StakeConfirm extends BaseComponent {

    @type(Label)
    labBalanceTxt: Label;
    @type(Label)
    labBalance: Label;
    @type(EditBox)
    editAmount: EditBox;
    @type(Label)
    labTitle: Label;

    @type(Button)
    btnApprove: Button;

    @type(Button)
    btnStake: Button;

    balanceTxt: string = "余额:";
    balance: any = 0;
    stakingAmounts: any = 0;

    config: any | null = null;
    data: any | null = null;
    inputValue: any = 0;
    currentToggle: string = "Toggle1";

    onStakeCallback: Function | null = null;
    approveValue: number = -1;


    constructor() {
        super();
        this.labTitle = new Label();
        this.labBalanceTxt = new Label();
        this.labBalance = new Label();
        this.editAmount = new EditBox();

        this.btnApprove = new Button();
        this.btnStake = new Button();
    }

    onLoad() {
        super.onLoad();
        this._loadApprove();
        this.labBalanceTxt.string = this.balanceTxt;
        this.labTitle.string = this.config.title;
        this.stakingAmounts = this.data.stakingAmounts;
        this.loadInfo();
    }

    setConfig(config: any, data: any) {
        this.config = config;
        this.data = data;
    }

    loadInfo() {
        if (!this.config) return;
        this.callContractByAddr(this.config.token, "USDT", "balanceOf", this.api?.curAccount)
            .then(value => {
                this.balance = value;
                if (this.currentToggle == "Toggle1")
                    this.stake();
                else
                    this.redeem();
            })
            .catch(reason => {
                this.showErr(reason);
            });
    }

    onAmountChange(value: string) {
        if (Constant.intRegExp.test(value) && value.length > 0) {
            this.inputValue = toWei(value, "ether");
            this.editAmount.string = value;
            if (this.currentToggle == "Toggle1")
                this._checkApprove();
        }
    }

    onToggle(toggle: Toggle) {
        this.currentToggle = toggle.node.name;
        switch (this.currentToggle) {
            case "Toggle1"://质押
                this.stake();
                break;
            case "Toggle2"://赎回
                this.redeem();
                break;
        }
    }
    //赎回页
    redeem() {
        this.labBalanceTxt.string = "质押:";
        this.labBalance.string = fromWei(this.stakingAmounts.toString(), "ether");
        this._setBtnStake("赎回");
        this._setBtnApprove(false);
        this.btnStake.getComponent(DCButton)?.setTheme(false);
    }

    //质押页
    stake() {
        this.labBalanceTxt.string = "余额:";
        this.labBalance.string = fromWei(this.balance.toString(), "ether");
        this._setBtnStake("质押");
        this._setBtnApprove(true);
        //检查授权
        this._checkApprove();
    }

    private _setBtnApprove(isShow: boolean) {
        this.btnApprove.node.active = isShow;
    }

    _checkApprove() {
        if (this.approveValue <= 0 || parseFloat(fromWei(this.inputValue.toString())) > this.approveValue) {
            this.btnStake.getComponent(DCButton)?.setTheme();
            this.btnApprove.getComponent(DCButton)?.setTheme(false);
            return false;
        } else {
            this.btnStake.getComponent(DCButton)?.setTheme(false);
            this.btnApprove.getComponent(DCButton)?.setTheme();
        }
        return true;
    }

    private _setBtnStake(name: string) {
        let lab = this.btnStake.getComponentInChildren(Label);
        if (!!lab) {
            lab.string = name;
        }
    }

    _loadApprove() {
        if (this.approveValue == -1) {
            this.callContractByAddr(this.config.token, "USDT", "allowance", this.api?.curAccount, Constant.address.StakeMine)
                .then(value => {
                    this.approveValue = parseFloat(fromWei(value.toString(), "ether"));
                    // console.log("value", value.toString())
                    //检查授权
                    this._checkApprove();
                })
                .catch(reason => {
                    this.showErr(reason);
                });
        }
    }

    approve() {
        if (toBN(this.inputValue).lten(0)) {
            this.showAlert("请输入数量!");
            return;
        }
        this.sendContractByAddr(this.config.token, "USDT", "approve", Constant.address.StakeMine, this.inputValue, { from: this.api?.curAccount })
            .then(value => {
                this.approveValue = parseFloat(fromWei(this.inputValue.toString(), "ether"));
                this._checkApprove();
            });
    }

    stakeing() {
        if (toBN(this.inputValue).lten(0)) {
            this.showAlert("请输入数量!");
            return;
        }
        let value: any;
        switch (this.currentToggle) {
            case "Toggle1"://质押
                value = this.inputValue;
                if (this._checkApprove() == false) {
                    this.showAlert("授权金额不足，请先授权！");
                    return;
                }
                break;
            case "Toggle2"://赎回
                value = "-" + this.inputValue.toString();
                break;
        }
        if (this.config.address == "0xc4cc2edb6039b11280b1D09cf49775Da7fA10F71") {
            this.sendContract(this.config.abi, "staking", this.config.address, value, { from: this.api?.curAccount })
                .then(result => {
                    this.stakingAmounts = toBN(this.stakingAmounts).add(toBN(value));
                    this.loadInfo();
                    this.currentToggle == "Toggle1" ? this.showAlert("质押成功!", () => { this.onClose() }) : this.showAlert("赎回成功!", () => { this.onClose() });
                    if (!!this.onStakeCallback) this.onStakeCallback();
                });
        } else {
            this.sendContract(this.config.abi, "staking", this.config.address, this.config.token, value, { from: this.api?.curAccount })
                .then(result => {
                    this.stakingAmounts = toBN(this.stakingAmounts).add(toBN(value));
                    this.loadInfo();
                    this.currentToggle == "Toggle1" ? this.showAlert("质押成功!", () => { this.onClose() }) : this.showAlert("赎回成功!", () => { this.onClose() });
                    if (!!this.onStakeCallback) this.onStakeCallback();
                });
        }

    }

    onMax() {
        switch (this.currentToggle) {
            case "Toggle1"://质押
                this.inputValue = this.balance;
                //检查授权
                this._checkApprove();
                break;
            case "Toggle2"://赎回
                this.inputValue = this.stakingAmounts;
                break;
        }
        this.editAmount.string = fromWei(this.inputValue.toString(), "ether");
    }

    onClose() {
        this.node.active = false;
        this.node.parent?.removeChild(this.node);
    }

    static show(config: any, data: any, onStakeCallback: Function | null = null): void {
        let node = find("Canvas");
        if (!!node) {
            resources.load("component/StakeConfirm", Prefab, (err, prefab) => {
                let win = instantiate(prefab);
                let logic = win.getComponent(StakeConfirm);
                if (logic) {
                    logic.setConfig(config, data);
                    logic.onStakeCallback = onStakeCallback;
                    node?.addChild(win);
                }
            });
        }
    }

}



