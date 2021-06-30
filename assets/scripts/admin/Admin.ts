
import { _decorator, Component, Node, Label, EditBox, assetManager, JsonAsset } from 'cc';
import { BaseComponent } from '../BaseComponent';
import { Constant } from '../Constant';
import Web3 from "web3/dist/web3.min.js";

const { ccclass, type } = _decorator;
const { toBN, fromWei, padLeft, toHex, toWei } = Web3.utils;

@ccclass('Admin')
export class Admin extends BaseComponent {

    @type(EditBox)
    txtStakePool: EditBox;

    @type(EditBox)
    txtStakeAddr: EditBox;

    @type(EditBox)
    txtStakeBonus: EditBox;

    @type(EditBox)
    txtStakeStartTime: EditBox;

    @type(EditBox)
    txtStakeDuration: EditBox;

    //***************奖池****************
    @type(EditBox)
    txtBonusPoolNum: EditBox;
    @type(EditBox)
    txtBalance: EditBox;
    @type(EditBox)
    txtNumBalance: EditBox;
    @type(EditBox)
    txtBPStartTime: EditBox;
    @type(EditBox)
    txtBPEndTime: EditBox;


    poolConfig: any;

    constructor() {
        super();
        this.txtStakePool = new EditBox();
        this.txtStakeAddr = new EditBox();
        this.txtStakeBonus = new EditBox();
        this.txtStakeStartTime = new EditBox();
        this.txtStakeDuration = new EditBox();

        this.txtBonusPoolNum = new EditBox();
        this.txtBalance = new EditBox();
        this.txtNumBalance = new EditBox();
        this.txtBPStartTime = new EditBox();
        this.txtBPEndTime = new EditBox();
    }

    onLoad() {
        super.onLoad();
        this._loadConfig();
        this._loadBonusPool();
    }

    private _loadBonusPool() {
        this.callContract("BonusPool", "getInfo").catch(reason => { this.showErr(reason); })
            .then(value => {
                // console.log(value);
                this.txtBonusPoolNum.string = value[2];
                this.txtBalance.string = fromWei(value[0], "ether");
                this.txtNumBalance.string = fromWei(value[1], "ether");
                this.txtBPStartTime.string = value[6].startTime;
                this.txtBPEndTime.string = value[6].endTime;
            });
    }

    private _loadConfig() {
        let url = Constant.poolUrl + "?t=" + Date.now();
        assetManager.loadRemote(url, (err, jsonAsset: JsonAsset) => {
            if (!!err) {
                return;
            }
            if (!!jsonAsset.json) {
                this.poolConfig = jsonAsset.json;
                this._loadStakePools();
            }
        });
    }

    private _loadStakePools() {
        let config = this.poolConfig.stakePool[0];
        this.txtStakePool.string = config.address;
        this.txtStakeAddr.string = config.token;
        this.callContract(config.abi, "getMineInfo", config.address, this.api?.curAccount).catch(reason => { this.showErr(reason); })
            .then(value => {
                // console.log(value);
                this.txtStakeBonus.string = fromWei(value.totalReward, "ether");
                this.txtStakeStartTime.string = value.startTime;
                this.txtStakeDuration.string = value.duration;
            });
    }

    onCreateStatkePool() {
        let config = this.poolConfig.stakePool[0];
        let startTime = Math.floor(Date.now() / 1000).toString();
        if (this.txtStakeStartTime.string != "0") {
            startTime = this.txtStakeStartTime.string;
        }
        let duration = this.txtStakeDuration.string;
        let poolAddr = this.txtStakePool.string;
        let tokenAddr = this.txtStakeAddr.string;
        let reward = toWei(this.txtStakeBonus.string, "ether");
        this.sendContract(config.abi, "addPool", poolAddr, tokenAddr, startTime, duration, reward, { from: this.api?.curAccount })
            .then(value => {
                this.poolConfig.stakePool[0].address = poolAddr;
                this.poolConfig.stakePool[0].token = tokenAddr;
                this._loadStakePools();
                this.showAlert("操作成功!");
            });
    }

    onCreateBonusPool() {
        this.sendContract("BonusPool", "open", 0, { from: this.api?.curAccount })
            .then(value => {
                this._loadBonusPool();
                this.showAlert("操作成功!");
            });
    }
}
