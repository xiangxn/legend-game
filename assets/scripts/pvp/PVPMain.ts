
import { _decorator, Component, Node, Prefab } from 'cc';
import { BaseComponent } from '../BaseComponent';
const { ccclass, type } = _decorator;

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

    constructor() {
        super();
        this.pvpPage = new Node();
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
}

