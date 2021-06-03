
import { _decorator, Component, Node, find, resources, Prefab, instantiate, Sprite, SpriteFrame, Label, Color, Layout, ParticleSystem2D } from 'cc';
import { Props } from './entitys/Props';
import { BaseComponent } from './BaseComponent';
import { Constant } from './Constant';
import Web3 from "web3/dist/web3.min.js";
const { ccclass, type } = _decorator;
const { toWei, fromWei, toBN } = Web3.utils;

@ccclass('Card')
export class Card extends BaseComponent {

    @type(Sprite)
    boxSprite: Sprite = new Sprite();

    @type(Sprite)
    propsSprite: Sprite = new Sprite();

    @type(Label)
    labName: Label = new Label();
    @type(Label)
    labTokens: Label = new Label();
    @type(Label)
    labIncrease: Label = new Label();
    @type(Label)
    labPower: Label = new Label();
    @type(Label)
    labLevel: Label = new Label();
    @type(Label)
    labCategory: Label = new Label();
    @type(Label)
    labProfession: Label = new Label();
    @type(Label)
    labIncreaseMax: Label = new Label();
    @type(Layout)
    mainAttrs: Layout;
    @type(Prefab)
    preMA: Prefab = new Prefab();
    @type(ParticleSystem2D)
    particle: ParticleSystem2D;

    props: Props;

    constructor() {
        super();
        this.props = new Props();
        this.mainAttrs = new Layout();
        this.particle = new ParticleSystem2D();
    }

    onLoad() {
        super.onLoad();
        // console.log("this.props.info.quality",this.props.info.quality)
        let name = "General";
        let color = Constant.qualityColor[parseInt(this.props.info.quality.toString())];
        switch (this.props.info.quality.toString()) {
            case "0":
                name = "General";
                this.particle.node.active = false;
                break;
            case "1":
                name = "Silver";
                this.particle.node.active = false;
                break;
            case "2":
                name = "Gold";
                this.particle.node.active = true;
                break;
        }
        resources.load("cards/" + name + "/spriteFrame", SpriteFrame, (err, sf) => {
            this.boxSprite.spriteFrame = sf;
        });
        this.loadSprite(this.props.info.number, this.propsSprite);
        this.labName.color = (new Color()).fromHEX(color);
        this.labName.string = (Constant.equipments as any)[this.props.info.number.toString()];
        this.labTokens.string = fromWei(this.props.info.tokens, "ether") + " LGC";
        this.labIncrease.string = "+" + this.props.info.increaseCount;
        this.labPower.string = this.props.info.power;
        this.labLevel.string = this.props.info.level;
        this.labCategory.string = Constant.equipmentType[parseInt(this.props.info.category)];
        this.labProfession.string = Constant.profession[parseInt(this.props.info.profession)];
        this.labIncreaseMax.string = this.props.info.increaseCount + "/" + this.props.info.increaseMax;
        this._showMainAttr(this.props.info.mainAttrs);
    }

    private _showMainAttr(ma: any) {
        // console.log(Object.keys(Constant.mainAttrs));
        Object.keys(Constant.mainAttrs).forEach(item => {
            if (ma[item].toString() != "0") {
                let name = (Constant.mainAttrs as any)[item];
                let value = ma[item];
                let labNode = instantiate(this.preMA);
                let txtName = labNode.getChildByName("txtName")?.getComponent(Label);
                if (!!txtName)
                    txtName.string = name + ":";
                let labValue = labNode.getChildByName("labValue")?.getComponent(Label);
                if (!!labValue)
                    labValue.string = value;
                this.mainAttrs.node.addChild(labNode);
                // this.mainAttrs.updateLayout();
            }
        });
    }

    onClose() {
        this.node.active = false;
        this.node.parent?.removeChild(this.node);
    }

    setProps(props: Props) {
        this.props = props;
        // console.log(this.props);
    }

    static show(props: Props, callback: Function | null = null): void {
        let node = find("Canvas");
        if (!!node) {
            resources.load("component/Card", Prefab, (err, prefab) => {
                let win = instantiate(prefab);
                let logic = win.getComponent(Card);
                if (logic) {
                    logic.setProps(props);
                    node?.addChild(win);
                    if (!!callback) callback();
                }
            });
        }
    }
}
