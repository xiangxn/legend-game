
import { _decorator, Component, Node, Sprite, SpriteFrame, Label, Color } from 'cc';
import { BaseItem } from './SpuerScrollView/BaseItem';
const { ccclass, type } = _decorator;

@ccclass('TopTenItem')
export class TopTenItem extends BaseItem {

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
    labPower: Label;

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
        this.labPower = new Label();
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
        this.labAddress.string = this.data.address.substr(0, 4) + "..." + this.data.address.substr(-4);
        this.labPower.string = this.data.power;
        if (this.data.isMe) {
            this.loadSpriteUrl(`img/top_${this.data.profession}_me`, this.sprPro);
            this.labName.color = new Color().fromHEX("#000000");
            this.labAddress.color = new Color().fromHEX("#ffffff");
            this.labPower.color = new Color().fromHEX("#000000");
            this.topBg.spriteFrame = this.itembgme;
        } else {
            this.loadSpriteUrl(`img/top_${this.data.profession}`, this.sprPro);
            this.labName.color = new Color().fromHEX("#a4b767");
            this.labAddress.color = new Color().fromHEX("#a4a4a4");
            this.labPower.color = new Color().fromHEX("#d8d8d8");
            this.topBg.spriteFrame = this.itembg;
        }
        this.labNum.color = this.labAddress.color;
    }
}

