
import { _decorator, Node, director, Prefab, resources, instantiate, Label, assetManager, JsonAsset } from 'cc';
import { BaseComponent } from '../BaseComponent';
import { Constant, CONSUMABLES_CACHE_KEY } from '../Constant';
import { StakingItem } from './StakingItem';
import Web3 from "web3/dist/web3.min.js";

const { ccclass, type } = _decorator;
const { toBN, fromWei, padLeft, toHex, toWei } = Web3.utils;

@ccclass('Mine')
export class Mine extends BaseComponent {

    @type(Node)
    roleMine: Node;

    @type(Node)
    stakingList: Node;

    @type(Node)
    poolList: Node;

    @type(Label)
    labStakeTotalReward: Label;

    @type(Label)
    labTotalValueLocked: Label;

    @type(Label)
    labRoleTotalReward: Label;
    @type(Label)
    labRoleTotalPower: Label;

    @type(Prefab)
    preStakingItem: Prefab;
    stakeTotalReward: any = toBN(0);
    totalValueLocked: any = toBN(0);

    fragmentBalance: number = 0;
    coinId = (Constant.consumables as any)[1][1];
    fragmentName: string = (Constant.consumables as any)[1][0];
    roleInfo: any;
    roleMineInfo: any;
    roleStatus: number = 0;
    poolConfig: any;


    constructor() {
        super();
        this.roleMine = new Node();
        this.stakingList = new Node();
        this.poolList = new Node();
        this.preStakingItem = new Prefab();
        this.labStakeTotalReward = new Label();
        this.labTotalValueLocked = new Label();
        this.labRoleTotalReward = new Label();
        this.labRoleTotalPower = new Label();
    }

    onLoad() {
        super.onLoad();
        this._loadPoolConfig();
    }

    private _loadPoolConfig() {
        let url = Constant.poolUrl + "?t=" + Date.now();
        assetManager.loadRemote(url, (err, jsonAsset: JsonAsset) => {
            if (!!err) {
                return;
            }
            if (!!jsonAsset.json) {
                this.poolConfig = jsonAsset.json;
                this._loadPools();
                // this._loadRolePools();
            }
        });
    }

    private _loadRolePools() {
        let list: Promise<any>[] = [];
        this.poolConfig.rolePool.forEach((config: any) => {
            list.push(this.callContract(config.abi, "getMineInfo", config.address, this.api?.curAccount).catch(reason => { this.showErr(reason); }));
        });
        Promise.all(list).then(infos => {
            let totalReward = toBN(0);
            let totalPower = toBN(0);
            for (let i = 0; i < infos.length; i++) {
                if (!!infos[i]) {
                    totalReward = totalReward.add(toBN(infos[i].totalReward));
                    totalPower = totalPower.add(toBN(infos[i].totalAmount));
                }
            }
            this.labRoleTotalReward.string = fromWei(totalReward, "ether");
            this.labRoleTotalPower.string = totalPower.toString();
        });
    }

    private _loadPools() {
        this.poolList.removeAllChildren();
        let list: Promise<any>[] = [];
        this.poolConfig.stakePool.forEach((config: any) => {
            list.push(this.callContract(config.abi, "getMineInfo", config.address, this.api?.curAccount).catch(reason => { this.showErr(reason); }));
        });
        Promise.all(list).then(infos => {
            for (let i = 0; i < infos.length; i++) {
                let prefab = instantiate(this.preStakingItem);
                let config = this.poolConfig.stakePool[i];
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
        this.roleMine.active = false;
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
        this.roleMine.active = false;
    }

    //进入普通矿洞
    openGeneralMine() {
        this.roleMine.active = true;
    }

    inStakingList() {
        this.stakingList.active = true;
    }

    closeStakingList() {
        this.stakingList.active = false;
    }
}

