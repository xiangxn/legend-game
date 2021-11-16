
import { _decorator, Component, Node, Prefab, instantiate, Label, Sprite } from 'cc';
import { BaseComponent } from '../BaseComponent';
import { Constant } from '../Constant';
import { PVPItemEvent } from '../events/PVPItemEvent';
const { ccclass, type } = _decorator;


@ccclass('PVPItem')
export class PVPItem extends BaseComponent {

    @type(Label)
    labName: Label;

    @type(Label)
    labMemo: Label;

    @type(Sprite)
    background: Sprite;

    @type(Label)
    labStatus: Label;

    data: any;

    constructor() {
        super();
        this.labName = new Label();
        this.labMemo = new Label();
        this.background = new Sprite();
        this.labStatus = new Label();
    }

    onLoad() {
        //TODO:加载角色状态 labStatus
        this.labStatus.string = "";
    }

    setData(data: any) {
        this.data = data;
        this.labMemo.string = this.data.memo;
        this.labName.string = this.data.name;
        this.fee = this.data.fee;
        this.loadSpriteUrl("img/" + this.data.background, this.background);
    }

    onClick() {
        // console.log(this.fee)
        this.node.dispatchEvent(new PVPItemEvent("onInPVP", this.data, true));
    }
}

