
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
        super.onLoad();
        this.callContract("PVP", "checkQueue", this.data.id, this.api?.curAccount)
            .then(isIn => {
                if (isIn) {
                    this.showStatus();
                } else {
                    this.hideStatus();
                }
            });
    }

    setData(data: any) {
        this.data = data;
        this.labMemo.string = this.data.memo;
        this.labName.string = this.data.name;
        this.loadSpriteUrl("img/" + this.data.background, this.background);
    }

    onClick() {
        if (this.labStatus.node.active) {
            this.showConfirm("你确定要退出匹配队列吗?", () => {
                this.sendContract("PVP", "quitQueue", this.data.id)
                    .then(result => {
                        this.hideStatus();
                    });
            });

        } else {
            this.node.dispatchEvent(new PVPItemEvent("onInPVP", this.data, true));
        }
    }

    showStatus() {
        this.labStatus.node.active = true;
    }
    hideStatus() {
        this.labStatus.node.active = false;
    }
}

