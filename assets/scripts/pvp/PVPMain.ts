
import { _decorator, Component, Node, Prefab, Label } from 'cc';
import { BaseComponent } from '../BaseComponent';
import { PVPEvent } from '../events/PVPItemEvent';
import { PlayPage } from './PlayPage';
import Web3 from "web3/dist/web3.min.js";

const { ccclass, type } = _decorator;
const { fromWei } = Web3.utils;

@ccclass('PVPMain')
export class PVPMain extends BaseComponent {

    @type(Node)
    pvpPage: Node;

    @type(Node)
    playPage: Node;

    @type(Prefab)
    warriorPrefab: Prefab;
    @type(Prefab)
    magePrefab: Prefab;
    @type(Prefab)
    taoistPrefab: Prefab;

    @type(Node)
    roleStage: Node;

    @type(Label)
    labPeriod: Label;

    @type(Label)
    labPool: Label;

    constructor() {
        super();
        this.pvpPage = new Node();
    }

    onLoad() {
        super.onLoad();
        this.node.on("InQueue", this._onInQueue.bind(this));
        this.node.on("Battle", this._onBattle.bind(this));
        this._loadPool();
    }

    private _loadPool() {
        this.callContract("PVP", "getStatus")
            .then(result => {
                // console.log(result);
                this.labPeriod.string = `第 ${result.period} 赛季`;
                this.labPool.string = `${fromWei(result.pool, "ether")} LGC`;
            });
    }

    onDestroy() {
        this.node.off("InQueue", this._onInQueue.bind(this));
        this.node.off("Battle", this._onBattle.bind(this));
    }

    onClose() {
        this.loadScene("Main");
    }

    onChallenge() {
        this.pvpPage.active = true;
    }

    onClosePvp() {
        this.pvpPage.active = false;
    }

    onClosePlayPage() {
        this.playPage.active = false;
    }

    private _onInQueue(event: PVPEvent) {
        event.propagationStopped = true;
        // console.log(event.data);
    }

    private _onBattle(event: PVPEvent) {
        event.propagationStopped = true;
        // console.log(event.data);
        this.onClosePvp();
        let pp = this.playPage.getComponent(PlayPage);
        pp?.openBattle(event.data);
    }
}

