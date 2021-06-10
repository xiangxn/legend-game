
import { _decorator, Node, director, Prefab, resources, instantiate, Label } from 'cc';
import { BaseComponent } from './BaseComponent';
import { Constant, CONSUMABLES_CACHE_KEY } from './Constant';
import { StakingItem } from './StakingItem';
import Web3 from "web3/dist/web3.min.js";
import { AmountConfirm } from './AmountConfirm';
import { Loading } from './Loading';

const { ccclass, type } = _decorator;
const { toBN, fromWei, padLeft, toHex, toWei } = Web3.utils;

@ccclass('Mine')
export class Mine extends BaseComponent {

    @type(Node)
    mineInfo: Node;

    @type(Node)
    stakingList: Node;

    @type(Node)
    poolList: Node;

    @type(Label)
    labStakeTotalReward: Label;

    @type(Label)
    labTotalValueLocked: Label;

    preStakingItem: Prefab;
    stakeTotalReward: any = toBN(0);
    totalValueLocked: any = toBN(0);

    fragmentBalance: number = 0;
    coinId = (Constant.consumables as any)[1][1];
    fragmentName: string = (Constant.consumables as any)[1][0];
    roleInfo: any;
    roleMineInfo: any;
    roleStatus: number = 0;


    constructor() {
        super();
        this.mineInfo = new Node();
        this.stakingList = new Node();
        this.poolList = new Node();
        this.preStakingItem = new Prefab();
        this.labStakeTotalReward = new Label();
        this.labTotalValueLocked = new Label();
    }

    onLoad() {
        super.onLoad();
        resources.load("component/StakingItem", Prefab, (err, prefab) => {
            this.preStakingItem = prefab;
            this._loadPools();
        });
        this._loadRoleMineInfo();
    }

    private _loadRoleMineInfo() {
        //获取矿搞余额
        this.callContract("Fragment", "balanceOf", this.api?.curAccount, this.coinId)
            .then(value => {
                this.fragmentBalance = parseInt(value.toString());
            })
            .catch(reason => { this.showErr(reason); });
        //获取角色数据
        this.callContract("Hero", "getHeroInfo", this.api?.curAccount)
            .then(info => {
                this.roleInfo = info;
                //获取矿洞信息
                this.callContract("RoleMine", "getMineInfo", "0x0000000000000000000000000000000000000000", this.api?.curAccount)
                    .then(result => {
                        this.roleMineInfo = result;
                        //显示信息
                        this._showRoleMineInfo();
                    })
                    .catch(reason => { this.showErr(reason); });
            })
            .catch(reason => { this.showErr(reason); });
    }

    private _showRoleMineInfo() {
        // console.log("_showRoleMineInfo: ", this.roleInfo, this.roleMineInfo);
        let labStake = this.node.getChildByPath("SelectMine/content/Mine/stakingValue")?.getComponent(Label) ?? new Label();
        let labReward = this.node.getChildByPath("SelectMine/content/Mine/outputValue")?.getComponent(Label) ?? new Label();
        let inBtn = this.node.getChildByPath("SelectMine/content/Mine/BtnIn/Label")?.getComponent(Label) ?? new Label();
        let LabStatus = this.node.getChildByPath("SelectMine/content/Mine/LabStatus")?.getComponent(Label) ?? new Label();
        labStake.string = this.roleMineInfo.totalAmount;
        labReward.string = fromWei(this.roleMineInfo.totalReward, "ether") + " LGC";
        if (this.roleInfo.hero.status == "1") {
            //查看或者结束
            let endTime = parseInt(this.roleInfo.hero.startTime) + parseInt(this.roleInfo.hero.time) * 3600;
            if (Math.floor(Date.now() / 1000) >= endTime) {
                this.roleStatus = 2;
                inBtn.string = "结束";
                LabStatus.string = "挖矿结束";
            } else {
                this.roleStatus = 1;
                inBtn.string = "查看";
                LabStatus.string = "正在挖矿";
            }
        } else {
            //可进入矿洞
            inBtn.string = "进入";
            LabStatus.string = "";
            this.roleStatus = 0;
        }
    }

    private _loadPools() {
        this.poolList.removeAllChildren();
        let list: Promise<any>[] = [];
        Constant.stakePool.forEach((config: any) => {
            list.push(this.callContract(config.abi, "getMineInfo", config.address, this.api?.curAccount).catch(reason => { this.showErr(reason); }));
        });
        Promise.all(list).then(infos => {
            for (let i = 0; i < infos.length; i++) {
                let prefab = instantiate(this.preStakingItem);
                let config = Constant.stakePool[i];
                let data = infos[i];
                if (!!prefab) {
                    let logic = prefab.getComponent(StakingItem);
                    logic?.setConfig(config, data);
                    this.poolList.addChild(prefab);
                }
            }
            this._calcTotal();
        });
    }

    start() {
        this.mineInfo.active = false;
        this.stakingList.active = false;
        this.schedule((dt: any) => { this._calcTotal(); }, 10);
    }

    private _calcTotal() {
        this.stakeTotalReward = toBN(0);
        this.totalValueLocked = toBN(0);
        this.poolList.children.forEach((node: Node, index: number) => {
            let item = node.getComponent(StakingItem);
            // console.log(item);
            if (!!item && !!item.data) {
                this.stakeTotalReward = this.stakeTotalReward.add(toBN(item.data.totalReward));
                if (item.config.isCalc) {
                    //TODO: 计算价值
                } else {
                    this.totalValueLocked = this.totalValueLocked.add(toBN(item.data.totalAmount));
                }
            }
        });
        this.labStakeTotalReward.string = fromWei(this.stakeTotalReward, "ether") + " LGC";
        this.labTotalValueLocked.string = "$ " + fromWei(this.totalValueLocked, "ether");
    }

    onCloseClick() {
        director.loadScene("Main");
    }

    onMineClose() {
        this.mineInfo.active = false;
    }

    //进入普通矿洞
    openGeneralMine() {
        if (!this.roleInfo) {
            this.showAlert("数据尚未加载,稍候再试!");
            return;
        }
        switch (this.roleStatus) {
            case 0://可进入
                this._inRoleMine();
                break;
            case 1://可查看
                this._showGeneralMineInfo();
                break;
            case 2://可结束
                this._logoutRoleMine();
                break;
        }

    }
    private _logoutRoleMine() {
        this.sendContractEvent("RoleMine", "withdraw", (loading: Loading, data: any) => {
            this._loadRoleMineInfo();
            this.getPastEvents("RoleMine", "StopMine", { filter: { user: this.api?.curAccount, roleId: this.roleInfo.hero.tokenId }, toBlock: data.blockNumber })
                .then((events: any) => {
                    loading.close();
                    // console.log("events: ", events);
                    if (events.length > 0) {
                        let reward = fromWei(events[0].returnValues.reward, "ether");
                        this.showAlert("本次挖矿成功获得:\r\n" + reward + " LGC", () => { this.onMineClose(); });
                    }
                });
        }, { from: this.api?.curAccount })
            .then(result => {
                this._loadRoleMineInfo();
            });
    }

    private _inRoleMine() {
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
            let data = padLeft(toHex(4), 2);
            this.sendContract("Fragment", "safeTransferFrom", this.api?.curAccount, Constant.address.RoleMine, this.coinId, amount, data, { from: this.api?.curAccount })
                .then(val => {
                    // console.log("val: ", val);
                    this._loadPools();
                    this._loadRoleMineInfo();
                    localStorage.removeItem(CONSUMABLES_CACHE_KEY);
                })
        }, true, "消耗" + this.fragmentName + ": 1/H");
    }

    _showGeneralMineInfo() {
        this.mineInfo.active = true;
        let rolePower = this.node.getChildByPath("GeneralMine/infos/item/value")?.getComponent(Label) ?? new Label();
        let minePower = this.node.getChildByPath("GeneralMine/infos/item-001/value")?.getComponent(Label) ?? new Label();
        let apy = this.node.getChildByPath("GeneralMine/infos/item-002/value")?.getComponent(Label) ?? new Label();
        let reward = this.node.getChildByPath("GeneralMine/infos/item-003/value")?.getComponent(Label) ?? new Label();

        rolePower.string = this.roleInfo.attrs.power;
        minePower.string = this.roleMineInfo.totalAmount;
        apy.string = this._calcApy(this.roleMineInfo) + " %";
        reward.string = this._calcReward(this.roleMineInfo, this.roleInfo.hero) + " LGC";
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
        let amount = toBN(pool.stakingAmounts);
        let adjust = toBN(pool.stakingAdjusts);
        if (endTime.lt(startTime.add(duration))) {
            reward = totalReward.mul(endTime.sub(startTime)).div(duration).add(totalAdjust);
        } else {
            reward = totalReward.add(totalAdjust);
        }
        reward = reward.mul(amount).div(totalAmount).sub(adjust);
        let rd = fromWei(reward, "ether");
        return rd.substr(0, rd.indexOf(".") + 5);
    }

    private _calcApy(pool: any) {
        // console.log(pool)
        let totalAmount = toBN(pool.totalAmount);
        let totalReward = toBN(pool.totalReward);
        let duration = toBN(pool.duration);
        let per = totalReward.div(duration);
        let year = per.mul(toBN(31536000));
        if (totalAmount.isZero() == false) {
            let output = year.div(totalAmount).mul(toBN(2)).mul(toBN(100));
            let od = fromWei(output, "ether");
            return od.substr(0, od.indexOf(".") + 5);
        }
        return "0";
    }

    inStakingList() {
        this.stakingList.active = true;
    }

    closeStakingList() {
        this.stakingList.active = false;
    }

    stopRoleMine() {
        this.showConfirm("提前结束挖矿,多余的[" + this.fragmentName + "]将退还。不满1小时以1小时计算。", () => {
            this._logoutRoleMine();
            localStorage.removeItem(CONSUMABLES_CACHE_KEY);
        }, () => { });

    }
}

