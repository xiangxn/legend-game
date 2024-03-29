
import { _decorator, Component, Node, Label, Sprite, Button } from 'cc';
import { BaseComponent } from '../BaseComponent';
import { BOX_CACHE_KEY, Constant } from '../Constant';
const { ccclass, type } = _decorator;

@ccclass('RefReward')
export class RefReward extends BaseComponent {

    @type(Label)
    labTitle: Label;

    @type(Label)
    labRatio: Label;

    @type(Sprite)
    spriteBox: Sprite;

    @type(Label)
    labBox: Label;

    @type(Label)
    labBtn: Label;

    data: any;
    refData: any;

    constructor() {
        super();
        this.labTitle = new Label();
        this.labRatio = new Label();
        this.labBox = new Label();
        this.labBtn = new Label();
        this.spriteBox = new Sprite();
    }

    onLoad() {
        super.onLoad();
        this._show();
    }

    private _show() {
        // console.log(this.data);
        this.labTitle.string = `${this.data.level}级推广大师`;
        this.labRatio.string = `分成比例${parseFloat(this.data.ratio) * 100 / 1000}%`;
        this.labBox.string = `${(Constant.boxs as any)[this.data.boxType]}x${this.data.boxAmount}`;
        this.loadSprite(`box${this.data.boxType}`, this.spriteBox);
        if (this.refData.withdraw.indexOf(this.data.id) > -1) {
            this.labBtn.string = "已领取";
            let btn = this.labBtn.node.parent?.getComponent(Button);
            if (!!btn) {
                btn.interactable = false;
            }
        } else {
            this.labBtn.string = "领取";
        }
    }

    setData(data: any, refData: any) {
        this.data = data;
        this.refData = Object.assign({}, refData);
    }

    onReceive() {
        if (this.refData.withdraw.indexOf(this.data.id) == -1) {
            if (parseInt(this.data.level) > parseInt(this.refData.level)) {
                this.showAlert("您未达到可领取等级,加油吧!");
                return;
            }
            this.sendContract("Referral", "refClaim", this.data.id, { from: this.api?.curAccount })
                .then(value => {
                    let arr = Array.from(this.refData.withdraw);
                    arr.push(this.data.id);
                    this.refData.withdraw = arr;
                    localStorage.removeItem(BOX_CACHE_KEY);
                    this.showAlert("领取奖励成功!");
                    this._show();
                });
        } else {
            this.showAlert("您已经领取过了!");
        }
    }
}

