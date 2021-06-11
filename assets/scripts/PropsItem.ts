
import { _decorator, Component, Node, Label, Sprite, Color, resources, SpriteFrame, Texture2D, EventMouse, Button, color, Layout } from 'cc';
import { BaseItem } from './SpuerScrollView/BaseItem'
const { ccclass, type } = _decorator;
import { Props } from './entitys/Props'

@ccclass('PropsItem')
export class PropsItem extends BaseItem {


    @type(Label)
    labName: Label;

    @type(Label)
    labCount: Label;

    @type(Label)
    labIncrease: Label;

    @type(Node)
    labIsEquip: Node;

    @type(Sprite)
    background: Sprite;

    @type(Sprite)
    img: Sprite;

    // onItemClick: Function | null = null;
    // onItemDoubleClick: Function | null = null;
    // onItemLongTouch: Function | null = null;
    isSelect: boolean = false;
    // data: Props | null = null;

    constructor() {
        super();
        this.labName = new Label();
        this.labCount = new Label();
        this.background = new Sprite();
        this.img = new Sprite();
        this.labIncrease = new Label();
        this.labIsEquip = new Node();
    }

    onLoad() {
        super.onLoad();
        this.labIncrease.node.active = false;
        this._show();
    }

    onClick(event: Event) {
        if (!!this.eventListener && !!this.eventListener.onItemClick) this.eventListener.onItemClick(this);
    }

    onDoubleClick(event: Event) {
        if (!!this.eventListener && !!this.eventListener.onItemDoubleClick) this.eventListener.onItemDoubleClick(this);
    }

    onLongTouch(event: Event) {
        if (!!this.eventListener && !!this.eventListener.onItemLongTouch) this.eventListener.onItemLongTouch(this);
    }

    start() {
        // this.labName.string = this.data?.name ?? "";
        // let count = this.data?.amount ?? 0;
        // if (count < 2) {
        //     this.labCount.node.active = false;
        // } else {
        //     this.labCount.node.active = true;
        //     this.labCount.string = count.toString();
        // }
    }

    onDestroy() {
        if (!!this.eventListener) {
            this.eventListener.onItemClick = null;
            this.eventListener.onItemDoubleClick = null;
            this.eventListener.onItemLongTouch = null;
        }
        if (!!this.img)
            this.img.spriteFrame = null;
    }

    init(eventListener: any) {
        super.init(eventListener);
    }

    setSelect(isSelect: boolean) {
        this.data.isSelect = isSelect;
        if (this.data.isSelect)
            this.background.color = (new Color()).fromHEX("#1ebf88");
        else
            this.background.color = (new Color()).fromHEX("#414141");
    }

    _show() {
        if (!this.data) return;
        this.background.color = (new Color()).fromHEX("#414141");
        this.loadSprite(this.data.img, this.img);
        this.labName.string = this.data?.name ?? "";
        let count = this.data?.amount ?? 0;
        if (count < 2) {
            this.labCount.node.active = false;
        } else {
            this.labCount.node.active = true;
            this.labCount.string = count.toString();
        }
        if (!!this.data.info) {
            let nameBG = this.node.getChildByName("Sprite")?.getComponent(Sprite);
            if (!!nameBG) {
                let n = "General";
                switch (this.data.info.quality) {
                    case "0":
                        n = "General";
                        break;
                    case "1":
                        n = "Silver";
                        break;
                    case "2":
                        n = "Gold";
                        break;
                }
                this.loadSpriteUrl("img/" + n, nameBG);
            }
            if (!!this.data.info.increaseCount && parseInt(this.data.info.increaseCount.toString()) > 0) {
                this.labIncrease.node.active = true;
                this.labIncrease.string = "+" + this.data.info.increaseCount;
            } else {
                this.labIncrease.node.active = false;
            }

            if (!!this.data.info.isEquip) {
                this.labIsEquip.active = true;
            } else {
                this.labIsEquip.active = false;
            }
        }
    }

    setItem(data: any) {
        super.setItem(data);
        this._show();
    }
}

