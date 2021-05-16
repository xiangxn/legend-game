import { _decorator, Component, Node, find, resources, Prefab, instantiate, Sprite, SpriteFrame, Label, Color, Layout, ParticleSystem2D, RichText } from 'cc';
import { Props } from './entitys/Props';
import { BaseComponent } from './BaseComponent';
import { Constant } from './Constant';
import Web3 from "web3/dist/web3.min.js";
const { ccclass, type } = _decorator;
const { toWei, fromWei, toBN } = Web3.utils;

@ccclass('TotemCard')
export class TotemCard extends BaseComponent {

    @type(Sprite)
    propsSprite: Sprite = new Sprite();

    @type(Label)
    labName: Label = new Label();
    @type(Label)
    labTokens: Label = new Label();
    @type(Label)
    labNumber: Label = new Label();
    @type(Label)
    labCount: Label = new Label();
    @type(Label)
    labDesc: Label = new Label();

    props: Props;

    constructor() {
        super();
        this.props = new Props();
    }

    onLoad() {
        super.onLoad();
        this._show();
    }

    onClose() {
        this.node.active = false;
        this.node.parent?.removeChild(this.node);
    }

    _show() {
        if (!this.props) return;
        this.labName.string = this.props.name ?? "";
        this.labTokens.string = fromWei(this.props.info.tokens.toString(), "ether") + " LGC";
        this.labNumber.string = this.props.info.number + "期";
        this.labDesc.string = (Constant.totems as any)[this.props.info.smallType][1]
        this.loadSprite(this.props.img, this.propsSprite);
        this._showCount();
    }

    private _showCount() {
        if (!this.props) return;
        this.callContract("BonusPool", "getInfo").then(result => {
            // console.log(result)
            let info = result[6].awardsInfos.find((item: any) => item.types == this.props.info.smallType)
            this.labCount.string = fromWei(info.bonus.toString(), "ether") + " USDT";
        }).catch(reason => {
            console.log(reason)
        })
    }

    setProps(props: Props) {
        this.props = props;
        // this._show();
    }

    static show(props: Props, callback: Function | null = null): void {
        let node = find("Canvas");
        if (!!node) {
            resources.load("component/TotemCard", Prefab, (err, prefab) => {
                let win = instantiate(prefab);
                let logic = win.getComponent(TotemCard);
                if (logic) {
                    logic.setProps(props);
                    node?.addChild(win);
                    if (!!callback) callback();
                }
            });
        }
    }
}
