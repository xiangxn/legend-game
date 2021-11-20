
import { _decorator, Component, Node, Sprite, SpriteFrame, Label, Color } from 'cc';
import { BaseItem } from './SpuerScrollView/BaseItem';
const { ccclass, type } = _decorator;

@ccclass('PVPTopItem')
export class PVPTopItem extends BaseItem {

    @type(SpriteFrame)
    top1Sp: SpriteFrame;

    @type(SpriteFrame)
    top2Sp: SpriteFrame;

    @type(SpriteFrame)
    top3Sp: SpriteFrame;

    @type(SpriteFrame)
    itembg: SpriteFrame;

    @type(SpriteFrame)
    itembgme: SpriteFrame;

    @type(Sprite)
    topIcon: Sprite;

    @type(Sprite)
    topBg: Sprite;

    @type(Label)
    labNum: Label;

    @type(Sprite)
    sprPro: Sprite;

    @type(Label)
    labName: Label;

    @type(Label)
    labAddress: Label;

    @type(Label)
    labCount: Label;

    constructor() {
        super();
        this.top1Sp = new SpriteFrame();
        this.top2Sp = new SpriteFrame();
        this.top3Sp = new SpriteFrame();
        this.itembg = new SpriteFrame();
        this.itembgme = new SpriteFrame();

        this.topIcon = new Sprite();
        this.topBg = new Sprite();
        this.sprPro = new Sprite();
        this.labNum = new Label();
        this.labName = new Label();
        this.labAddress = new Label();
        this.labCount = new Label();
    }

    onLoad() {
        super.onLoad();
    }

    setItem(data: any) {
        super.setItem(data);
        this._show();
    }

    private _show() {
        // console.log(this.data);
        this.topIcon.node.active = true;
        this.labNum.node.active = false;
        switch (this.data.number) {
            case 1:
                this.topIcon.spriteFrame = this.top1Sp;
                break;
            case 2:
                this.topIcon.spriteFrame = this.top2Sp;
                break;
            case 3:
                this.topIcon.spriteFrame = this.top3Sp;
                break;
            default:
                this.topIcon.node.active = false;
                this.labNum.node.active = true;
                this.labNum.string = this.data.number;
                break;
        }
        this.labName.string = this.data.name;
        this.labAddress.string = this.data.addr.substr(0, 4) + "..." + this.data.addr.substr(-4);
        this.labCount.string = this.data.count;
        this.loadSpriteUrl(`img/top_${this.data.profession}`, this.sprPro);
        this.labName.color = new Color().fromHEX("#a4b767");
        this.labAddress.color = new Color().fromHEX("#a4a4a4");
        this.labCount.color = new Color().fromHEX("#ECB157");
        this.topBg.spriteFrame = this.itembg;
        this.labNum.color = this.labAddress.color;
    }
}

