
import { _decorator, Component, Node, Label, ValueType } from 'cc';
import { BaseComponent } from '../BaseComponent';
import Web3 from "web3/dist/web3.min.js";
import { AmountConfirm } from '../AmountConfirm';
import { Constant, CONSUMABLES_CACHE_KEY } from '../Constant';
import { Loading } from '../Loading';
const { ccclass, type } = _decorator;
const { toBN, fromWei, padLeft, toHex, toWei } = Web3.utils;

@ccclass('RoleMineItem')
export class RoleMineItem extends BaseComponent {

    @type(Label)
    labTitle: Label;

    @type(Label)
    labAPY: Label;

    @type(Label)
    labTotalPower: Label;

    @type(Label)
    labTotalReward: Label;

    @type(Label)
    labReward: Label;

    @type(Label)
    labEndTime: Label;

    @type(Label)
    labMyTimeLeft: Label;

    @type(Label)
    labBtn: Label;

    @type(Node)
    myTimeNode: Node;
    @type(Node)
    rewardNode: Node;

    roleMineInfo: any;
    config: any;
    roleInfo: any;
    coinId = (Constant.consumables as any)[1][1];
    fragmentName: string = (Constant.consumables as any)[1][0];
    fragmentBalance: number = 0;

    onUpdateRole: Function | null = null;
    getRoleInfo: Function | null = null;

    constructor() {
        super();
        this.labTitle = new Label();
        this.labAPY = new Label();
        this.labTotalPower = new Label();
        this.labTotalReward = new Label();
        this.labReward = new Label();
        this.labEndTime = new Label();
        this.labMyTimeLeft = new Label();
        this.labBtn = new Label();
        this.myTimeNode = new Node();
        this.rewardNode = new Node();
    }

    setData(config: any, roleMineInfo: any, roleInfo: any, balance: number) {
        this.config = config;
        this.roleMineInfo = roleMineInfo;
        this.roleInfo = roleInfo;
        this.fragmentBalance = balance;
    }

    onLoad() {
        super.onLoad();
        this._show();
    }

    private _show() {
        this.labTitle.string = this.config.title;
        this.labAPY.string = this._calcApy(this.roleMineInfo) + "%";
        this.labTotalPower.string = this.roleMineInfo.totalAmount;
        this.labTotalReward.string = fromWei(this.roleMineInfo.totalReward, "ether") + " LGC";
        if (this.roleMineInfo.stakingAmounts == "0") {
            this.labReward.string = "0 LGC"
            this.labBtn.string = "进入";
            this.myTimeNode.active = false;
            this.rewardNode.active = false;
        } else {
            this.myTimeNode.active = true;
            this.rewardNode.active = true;
            this.labBtn.string = "结束挖矿";
            this.labReward.string = this._calcReward(this.roleMineInfo, this.roleInfo.hero) + " LGC";
            this._showMyTimeLeft(this.roleMineInfo, this.roleInfo);
        }
        this._showEndTime(this.roleMineInfo);

    }

    private _updatePool() {
        let list: Promise<any>[] = [];
        list.push(this.callContract("Hero", "getHeroInfo", this.api?.curAccount));
        list.push(this.callContract("Fragment", "balanceOf", this.api?.curAccount, this.coinId));
        list.push(this.callContract(this.config.abi, "getMineInfo", this.config.address, this.api?.curAccount));
        Promise.all(list).then(infos => {
            this.roleInfo = infos[0];
            this.fragmentBalance = parseInt(infos[1].toString());
            this.roleMineInfo = infos[2];
            if (!!this.onUpdateRole) this.onUpdateRole(this.roleInfo, this.fragmentBalance);
            this._show();
        });
    }

    private _showMyTimeLeft(mineInfo: any, roleInfo: any) {
        let _now = Math.floor(Date.now() / 1000);
        let endTime = parseInt(roleInfo.hero.startTime) + parseInt(roleInfo.hero.time) * 3600;
        if (_now >= endTime) {
            this.labMyTimeLeft.string = "已经结束";
        } else {
            let timespan = Math.floor(Math.abs(_now - endTime));
            let hour = Math.floor(timespan / 3600);
            let minute = Math.floor(timespan % 3600 / 60);
            let second = timespan % 3600 - (minute * 60);
            this.labMyTimeLeft.string = hour + " 时 " + minute + " 分 " + second + " 秒";
            this.scheduleOnce((dt: any) => this._showMyTimeLeft(mineInfo, roleInfo), 1);
        }
    }

    private _showEndTime(mineInfo: any) {
        let _now = Date.now() / 1000;
        let endTime = parseInt(mineInfo.startTime) + parseInt(mineInfo.duration);
        let timespan = Math.floor(Math.abs(_now - endTime));
        let hour = Math.floor(timespan / 3600);
        let minute = Math.floor(timespan % 3600 / 60);
        let second = timespan % 3600 - (minute * 60);
        this.labEndTime.string = hour + " 时 " + minute + " 分 " + second + " 秒";
        if (_now < parseInt(mineInfo.startTime)) {
            this.labEndTime.string = "尚未开始";
        } else if (_now < endTime) {
            this.scheduleOnce((dt: any) => this._showEndTime(mineInfo), 1);
        } else {
            this.labEndTime.string = "已经结束";
        }
    }

    private _calcApy(pool: any) {
        // console.log(pool)
        let totalAmount = toBN(pool.totalAmount);
        let totalReward = toBN(pool.totalReward);
        let duration = toBN(pool.duration);
        if (duration.eqn(0)) return "0";
        let per = totalReward.div(duration);
        let year = per.mul(toBN(31536000));
        if (totalAmount.isZero() == false) {
            let output = year.div(totalAmount).mul(toBN(2)).mul(toBN(100));
            let od = fromWei(output, "ether");
            return od.substr(0, od.indexOf(".") + 5);
        }
        return "0";
    }

    private _calcReward(pool: any, role: any): string {
        // console.log("role: ", role);
        let reward = toBN(0);
        let endTime = toBN(parseInt(role.startTime) + parseInt(role.time) * 3600);
        let now = toBN(Math.floor((Date.now() / 1000)));
        if (now.lt(endTime)) endTime = now;
        let startTime = toBN(pool.startTime);
        let duration = toBN(pool.duration);
        let totalAdjust = toBN(pool.totalAdjust);
        let totalReward = toBN(pool.totalReward);
        let totalAmount = toBN(pool.totalAmount);
        if (totalAmount.eqn(0)) return "0";
        let amount = toBN(pool.stakingAmounts);
        let adjust = toBN(pool.stakingAdjusts);
        if (endTime.lt(startTime.add(duration))) {
            reward = totalReward.mul(endTime.sub(startTime)).div(duration).add(totalAdjust);
        } else {
            reward = totalReward.add(totalAdjust);
        }
        reward = reward.mul(amount).div(totalAmount).sub(adjust);
        let rd = fromWei(reward, "ether");
        let rdf = parseFloat(rd);
        if (rdf < 0) rdf = 0;
        // return rd.substr(0, rd.indexOf(".") + 5);
        return rdf.toFixed(8);
    }

    onInBtnClick() {
        if (!!this.getRoleInfo) {
            let ds = this.getRoleInfo();
            this.roleInfo = ds[0];
            this.fragmentBalance = ds[1];
        }
        if (this.roleMineInfo.stakingAmounts == "0") {
            this._inRolePool();
        } else {
            this._outRolePool();
        }
    }

    private _stopMine() {
        if (this.config.address == "0x0000000000000000000000000000000000000000") {
            this.sendContractEvent(this.config.abi, "withdraw", (loading: Loading, data: any) => {
                this.getPastEvents(this.config.abi, "StopMine", { filter: { user: this.api?.curAccount, roleId: this.roleInfo.hero.tokenId }, toBlock: data.blockNumber })
                    .then((events: any) => {
                        loading.close();
                        // console.log("events: ", events);
                        if (events.length > 0) {
                            let reward = fromWei(events[0].returnValues.reward, "ether");
                            this.showAlert("本次挖矿成功获得:\r\n" + reward + " LGC");
                        }
                    });
            }, { from: this.api?.curAccount })
                .then(result => {
                    this._updatePool();
                });
        } else {
            console.log(this.config.abi);
            this.sendContractEvent(this.config.abi, "withdraw", (loading: Loading, data: any) => {
                this.getPastEvents(this.config.abi, "StopMine", { filter: { user: this.api?.curAccount, roleId: this.roleInfo.hero.tokenId }, toBlock: data.blockNumber })
                    .then((events: any) => {
                        loading.close();
                        // console.log("events: ", events);
                        if (events.length > 0) {
                            let reward = fromWei(events[0].returnValues.reward, "ether");
                            this.showAlert("本次挖矿成功获得:\r\n" + reward + " LGC");
                        }
                    });
            }, this.config.address, { from: this.api?.curAccount })
                .then(result => {
                    this._updatePool();
                });
        }
    }

    private _outRolePool() {
        if (this.labMyTimeLeft.string == "已经结束") {
            this._stopMine();
        } else {
            this.showConfirm("提前结束挖矿,多余的[" + this.fragmentName + "]将退还。不满1小时以1小时计算。", () => {
                this._stopMine();
                localStorage.removeItem(CONSUMABLES_CACHE_KEY);
            }, () => { });
        }

    }
    private _inRolePool() {
        //检查角色战力是否为0
        if (this.roleInfo.attrs.power == 0) {
            this.showAlert("你目前战力为0,不能进入矿洞");
            return;
        }
        if (this.roleInfo.hero.status == "2") {
            this.showAlert("角色正在副本探险!");
            return;
        }
        if (this.roleInfo.hero.status == "1") {
            this.showAlert("角色正在矿洞探险!");
            return;
        }
        AmountConfirm.show(this.fragmentBalance, "选择挖矿时长", (amount: string) => {
            let a = parseInt(amount);
            if (a < 1) {
                this.showAlert("进矿洞至少一小时!");
                return;
            }
            let cAddr = Constant.address.RoleMine;
            let data = this.api?.dataApi.eth.abi.encodeParameters(["uint8", "address"], [4, this.config.address]);
            this.sendContract("Fragment", "safeTransferFrom", this.api?.curAccount, cAddr, this.coinId, amount, data, { from: this.api?.curAccount })
                .then(val => {
                    // console.log("val: ", val);
                    this._updatePool();
                    localStorage.removeItem(CONSUMABLES_CACHE_KEY);
                });
        }, true, "消耗" + this.fragmentName + ": 1/H");
    }

}

