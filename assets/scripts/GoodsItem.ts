
import { _decorator, Component, Node, Sprite, Label, Color } from 'cc';
import Web3 from "web3/dist/web3.min.js";
import { Constant } from './Constant';
import { BaseItem } from './SpuerScrollView/BaseItem';
const { toBN, padLeft, toHex, fromWei } = Web3.utils;
const { ccclass, type } = _decorator;

@ccclass('GoodsItem')
export class GoodsItem extends BaseItem {

    @type(Sprite)
    img: Sprite;

    @type(Label)
    labName: Label;

    @type(Sprite)
    sprNameBG: Sprite;

    @type(Label)
    labPrice: Label;

    @type(Label)
    labIncrease: Label;

    @type(Node)
    btnPullOff: Node;
    @type(Node)
    btnDetail: Node;
    @type(Node)
    btnBuy: Node

    constructor() {
        super();
        this.img = new Sprite();
        this.labName = new Label();
        this.labPrice = new Label();
        this.btnPullOff = new Node();
        this.btnDetail = new Node();
        this.btnBuy = new Node();
        this.sprNameBG = new Sprite();
        this.labIncrease = new Label();
    }

    onLoad() {
        super.onLoad();
        this._show();
    }

    setItem(data: any) {
        this.data = data;
        this._show();
    }

    private _show() {
        if (!(this.api?.curAccount)) return;
        switch (this.data.gclass) {
            case 1:
                this.loadSprite(this.data.content.number, this.img);
                this.labName.string = (Constant.equipments as any)[this.data.content.number.toString()];
                this.sprNameBG.color = new Color().fromHEX(Constant.qualityColor[parseInt(this.data.content.quality)]);
                // console.log(this.data.content)
                if (this.data.content.increaseCount > 0) {
                    this.labIncrease.node.active = true;
                    this.labIncrease.string = `+${this.data.content.increaseCount}`;
                } else {
                    this.labIncrease.node.active = false;
                }
                break
            case 2:
                this.labIncrease.node.active = false;
                let bigType = toBN(this.data.contentId).shrn(248);
                let smallType = toBN("0x" + padLeft(toHex(this.data.contentId), 64).substr(4, 16)).toNumber();
                this.loadSprite(bigType + "-" + smallType, this.img);
                this.labName.string = (Constant.totems as any)[smallType][0].replace("图腾", "碎片");
                this.sprNameBG.color = new Color().fromHEX(Constant.qualityColor[2]);
                break
            case 3:
                //TODO: 艺术品
                break
        }
        this.labPrice.string = fromWei(this.data.price, "ether") + " " + (Constant.paymode as any)[this.data.payContract];
        if (!!this.data.showPullOff) {
            this.btnPullOff.active = true;
            this.btnBuy.active = false;
        } else {
            this.btnPullOff.active = false;
            if (this.data.seller == this.api?.curAccount) {
                this.btnBuy.active = false;
            } else {
                this.btnBuy.active = true;
            }
        }
    }

    onPullOff() {
        if (!!this.eventListener && !!this.eventListener.onPullOff) this.eventListener.onPullOff(this.data);
    }

    onDetail() {
        if (!!this.eventListener && !!this.eventListener.onDetail) this.eventListener.onDetail(this.data);
    }

    onBuy() {
        if (!!this.eventListener && !!this.eventListener.onBuy) this.eventListener.onBuy(this.data);
    }
}

