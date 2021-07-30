
import { _decorator, Component, Node, Label, find, sys } from 'cc';
import { StakeConfirm } from './StakeConfirm';
import { BaseComponent } from '../BaseComponent';
import Web3 from "web3/dist/web3.min.js";
import { WithdrawConfirm } from './WithdrawConfirm';


const { ccclass, type } = _decorator;
const { toBN, fromWei } = Web3.utils;

@ccclass('StakingItem')
export class StakingItem extends BaseComponent {

    @type(Label)
    labAPY: Label;

    @type(Label)
    labTVL: Label

    @type(Label)
    labTotalOre: Label;

    @type(Label)
    labEndTime: Label;

    @type(Label)
    labTitle: Label;

    data: any = {};
    config: any;
    endTime: number = 0;

    constructor() {
        super();
        this.labAPY = new Label();
        this.labTVL = new Label();
        this.labTotalOre = new Label();
        this.labEndTime = new Label();
        this.labTitle = new Label();
    }

    onLoad() {
        super.onLoad();
        this.labTitle.string = this.config.title;
        this._showPool();
    }
    private _showPool() {
        this.labAPY.string = this._calcApy(this.data) + " %";
        this.labTVL.string = fromWei(this.data.totalAmount, "ether");
        this.labTotalOre.string = fromWei(this.data.totalReward, "ether") + " LGC";
        this.endTime = parseInt(this.data.startTime) + parseInt(this.data.duration);
        this.scheduleOnce((dt: any) => this._showTime(), 0);
    }

    setConfig(config: any, data: any) {
        this.config = config;
        this.data = data;
    }

    getData(): any {
        return this.data;
    }

    openStake() {
        if (this._checkStart())
            StakeConfirm.show(this.config, this.data, this.onStakeCallback.bind(this));
    }

    _checkStart() {
        let _now = Date.now() / 1000;
        if (_now < parseInt(this.data.startTime)) {
            this.showAlert("尚未开始");
            return false;
        }
        return true;
    }

    onStakeCallback() {
        this._updatePool();
    }

    openWithdraw() {
        if (this._checkStart())
            WithdrawConfirm.show(this.config, this.data, this.onStakeCallback.bind(this));
    }

    private _updatePool() {
        this.callContract(this.config.abi, "getMineInfo", this.config.address, this.api?.curAccount)
            .then(data => {
                this.data = data;
                this._showPool();
            })
            .catch(reason => { console.log(reason); this.showErr(reason); });
    }

    private _showTime() {
        let _now = Date.now() / 1000;
        let timespan = Math.floor(Math.abs(_now - this.endTime));
        let hour = Math.floor(timespan / 3600);
        let minute = Math.floor(timespan % 3600 / 60);
        let second = timespan % 3600 - (minute * 60);
        this.labEndTime.string = hour + " 时 " + minute + " 分 " + second + " 秒";
        if (_now < parseInt(this.data.startTime)) {
            this.labEndTime.string = "尚未开始";
        } else if (_now < this.endTime) {
            this.scheduleOnce((dt: any) => this._showTime(), 1);
        } else {
            this.labEndTime.string = "已经结束";
        }
    }

    private _calcApy(pool: any) {
        // console.log(pool)
        let totalAmount = Number.parseFloat(fromWei(pool.totalAmount, "ether"));
        let totalReward = Number.parseFloat(fromWei(pool.totalReward, "ether"));
        let duration = pool.duration;
        let per = totalReward / (duration / 3600 / 24);
        let year = per * 365;
        // console.log(totalAmount, totalReward, per, year);
        if (totalAmount != 0) {
            let output = year / totalAmount * 2 * 100;
            // let output = year / totalAmount/2 * 100;
            return output.toString();
        }
        return "0";

    }

    openURL() {
        sys.openURL(this.config.url);
    }
}

