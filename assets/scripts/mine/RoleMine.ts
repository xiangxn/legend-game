
import { _decorator, Component, Node, ScrollView, instantiate, Prefab } from 'cc';
import { BaseComponent } from '../BaseComponent';
import { Constant } from '../Constant';
import { RoleMineItem } from './RoleMineItem';
const { ccclass, type } = _decorator;

@ccclass('RoleMine')
export class RoleMine extends BaseComponent {

    @type(Node)
    mineList: Node;

    @type(Prefab)
    itemPrefab: Prefab;

    coinId = (Constant.consumables as any)[1][1];

    private roleInfo: any;
    private fragmentBalance: number = 0;

    constructor() {
        super();
        this.mineList = new Node();
        this.itemPrefab = new Prefab();
    }

    onLoad() {
        super.onLoad();
        this._loadPools();
    }

    private _loadPools() {
        this.mineList.removeAllChildren();
        let list: Promise<any>[] = [];
        list.push(this.callContract("Hero", "getHeroInfo", this.api?.curAccount));
        list.push(this.callContract("Fragment", "balanceOf", this.api?.curAccount, this.coinId));
        Constant.rolePool.forEach((config: any) => {
            list.push(this.callContract(config.abi, "getMineInfo", config.address, this.api?.curAccount).catch(reason => { this.showErr(reason); }));
        });
        Promise.all(list).then(infos => {
            this.roleInfo = infos[0];
            this.fragmentBalance = parseInt(infos[1].toString());
            for (let i = 2; i < infos.length; i++) {
                let prefab = instantiate(this.itemPrefab);
                let config = Constant.rolePool[i - 2];
                let data = infos[i];
                if (!!prefab) {
                    let logic = prefab.getComponent(RoleMineItem);
                    if (!!logic) {
                        logic.setData(config, data, this.roleInfo, this.fragmentBalance);
                        logic.onUpdateRole = this.onUpdateRole.bind(this);
                        logic.getRoleInfo = this.getRoleInfo.bind(this);
                    }
                    this.mineList.addChild(prefab);
                }
            }
        });
    }

    onUpdateRole(roleInfo: any, balance: number) {
        this.roleInfo = roleInfo;
        this.fragmentBalance = balance;
    }

    getRoleInfo() {
        return [this.roleInfo, this.fragmentBalance];
    }
}

