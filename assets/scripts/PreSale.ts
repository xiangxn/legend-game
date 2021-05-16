
import { _decorator, Component, Node, Label, Button, EditBox } from 'cc';
import { BaseComponent } from './BaseComponent';
import { Constant } from './Constant';
import Web3 from "web3/dist/web3.min.js";

const { ccclass, type } = _decorator;
const { toBN, fromWei, toWei } = Web3.utils;

@ccclass('PreSale')
export class PreSale extends BaseComponent {
    @type(Label)
    labTime: Label;

    @type(Label)
    labMyCount: Label;

    @type(Label)
    labTotalCount: Label;

    @type(EditBox)
    editCount: EditBox;

    @type(Label)
    labUse: Label;

    @type(Label)
    labBalance: Label;

    approveAmount: any = 0;
    balanceAmount: any = 0;
    limit: number = 0;
    inputValue: number = 1;
    price: number = 0;
    endTime: number = 0;

    constructor() {
        super();
        this.labTime = new Label();
        this.labMyCount = new Label();
        this.labTotalCount = new Label();
        this.editCount = new EditBox();
        this.labUse = new Label();
        this.labBalance = new Label();
    }

    onLoad() {
        super.onLoad();
        this.editCount.string = this.inputValue.toString();
    }

    start() {
        this._getUsers();
    }

    private async _getPreSaleInfo() {
        this.callContract("PreSale", "getInfo").then(value => {
            // console.log("getInfo: ", value);
            this.labMyCount.string = value.count + "/" + value.limit;
            this.limit = parseInt(value.limit) - parseInt(value.count);
            this.inputValue = Math.min(1, this.limit);
            this.endTime = parseInt(value.time);
            this._showTime();
        });
    }

    private _showTime() {
        let now = Math.floor(Date.now() / 1000);

        let endtime = this.endTime;
        let timespan = now - endtime;
        let hour = Math.floor(-timespan / 3600);
        let minute = Math.floor(-timespan % 3600 / 60);
        let second = -timespan % 3600 - (minute * 60);
        this.labTime.string = "结束时间: " + hour + " 时 " + minute + " 分 " + second + " 秒";
        if (timespan < 0) {
            this.scheduleOnce((dt: any) => this._showTime(), 1);
        } else {
            this.labTime.string = "已经结束";
        }
    }

    private async _getUsers() {
        let accounts = await this.api?.getUsers() ?? [];
        if (accounts.length > 0) {
            this._getInfo();
            this._getPreSaleInfo();
            this._getGoods();
        }
    }

    private _getGoods() {
        this.callContract("PreSale", "goods", 10).then(value => {
            if (!!value) {
                this.labTotalCount.string = value.quantitySold + "/" + value.quantityCount;
                this.price = parseFloat(fromWei(value.unitPrice, "ether"));
                this._showUse();
            }
        });
    }

    private _showUse() {
        let val = this.inputValue * this.price;
        this.labUse.string = " " + val.toString() + " ";
    }

    accountsChanged(accounts: string[]) {
        super.accountsChanged(accounts);
        if (accounts.length > 0) {
            this._getInfo();
        }
    }

    private _getInfo() {
        // console.log("curAccount: ", this.api?.curAccount)
        let bP = this.callContract("USDT", "balanceOf", this.api?.curAccount)
            .catch(reason => {
                console.log(reason)
                this.showAlert("获取余额失败!");
            });
        let aP = this.callContract("USDT", "allowance", this.api?.curAccount, Constant.address.PreSale)
            .catch(reason => {
                console.log(reason)
                this.showAlert("获取授权失败!");
            });
        Promise.all([bP, aP]).then(values => {
            // console.log(values)
            this.balanceAmount = toBN(values[0]);
            this.approveAmount = toBN(values[1]);
            this.labBalance.string = " " + fromWei(this.balanceAmount, "ether") + " ";
        });
    }

    onSub() {
        if (this.inputValue > 0) {
            this.inputValue -= 1;
            this.editCount.string = this.inputValue.toString();
            this._showUse();
        }
    }

    onAdd() {
        if (this.limit > this.inputValue) {
            this.inputValue += 1;
            this.editCount.string = this.inputValue.toString();
            this._showUse();
        }
    }

    onMax() {
        this.inputValue = this.limit;
        this.editCount.string = this.inputValue.toString();
        this._showUse();
    }

    onApprove() {
        if (this.limit < 1) {
            this.showAlert("你购买的数量已经超限!");
            return;
        }
        if (this.inputValue < 1) {
            this.showAlert("请输入数量！");
            return;
        }
        let amount = toWei((this.inputValue * this.price).toString(), "ether");
        this.sendContract("USDT", "approve", Constant.address.PreSale, amount, { from: this.api?.curAccount })
            .then(value => {
                this.approveAmount = toBN(amount);
                this.showAlert("授权成功!");
            });
    }

    onBuy() {
        if (this.limit < 1) {
            this.showAlert("你购买的数量已经超限!");
            return;
        }
        if (this.inputValue < 1) {
            this.showAlert("请输入数量！");
            return;
        }
        let amount = toWei((this.inputValue * this.price).toString(), "ether");
        if (this.approveAmount.lt(toBN(amount))) {
            this.showAlert("请先授权足够的USDT!");
            return;
        }
        if(this.balanceAmount.lt(toBN(amount))){
            this.showAlert("USDT余额不足!");
            return;
        }
        this.sendContract("PreSale", "buy", 10, this.inputValue, { from: this.api?.curAccount })
            .then(value => {
                this.showAlert("购买成功!\r\n请预售结束时在储物箱中查看。");
                this._getUsers();
            });
    }

    onInputChange(value: string) {
        if (Constant.intRegExp.test(value)) {
            this.inputValue = Number.parseInt(value);
            this._showUse();
        }
    }
}

