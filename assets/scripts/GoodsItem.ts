
import { _decorator, Component, Node, Sprite, Label } from 'cc';
import Web3 from "web3/dist/web3.min.js";
import { Constant } from './Constant';
import { BaseItem } from './SpuerScrollView/BaseItem';
const { toBN, padLeft, toHex, fromWei } = Web3.utils;
const { ccclass, type } = _decorator;

@ccclass('GoodsItem')
export class GoodsItem extends BaseItem {

    @type(Sprite)
    img: Sprite

    @type(Label)
    labName: Label

    @type(Label)
    labPrice: Label

    @type(Node)
    btnPullOff: Node;
    @type(Node)
    btnDetail: Node;

    constructor() {
        super();
        this.img = new Sprite();
        this.labName = new Label();
        this.labPrice = new Label();
        this.btnPullOff = new Node();
        this.btnDetail = new Node();
    }

    setItem(data: any) {
        this.data = data;
        this._show();
    }

    private _show() {
        switch (this.data.gclass) {
            case 1:
                this.loadSprite(this.data.content.number, this.img);
                this.labName.string = (Constant.equipments as any)[this.data.content.number.toString()];
                break
            case 2:
                let bigType = toBN(this.data.contentId).shrn(248);
                let smallType = toBN("0x" + padLeft(toHex(this.data.contentId), 64).substr(4, 16)).toNumber();
                this.loadSprite(bigType + "-" + smallType, this.img);
                this.labName.string = (Constant.totems as any)[smallType][0].replace("图腾", "碎片");
                break
            case 3:
                break
        }
        this.labPrice.string = fromWei(this.data.price, "ether") + " " + (Constant.paymode as any)[this.data.payContract];
        if (!!this.data.showPullOff) {
            this.btnPullOff.active = true;
        } else {
            this.btnPullOff.active = false;
        }
    }

    onPullOff() {
        if (!!this.eventListener && !!this.eventListener.onPullOff) this.eventListener.onPullOff(this.data);
    }

    onDetail() {
        if (!!this.eventListener && !!this.eventListener.onDetail) this.eventListener.onDetail(this.data);
    }
}

