
import { _decorator, Node, director, Label, instantiate, Layout, Prefab, resources, Toggle, EventTouch, Sprite, sp, EditBox, ProgressBar } from 'cc';
import { AlertWin } from './AlertWin';
import { BaseComponent } from './BaseComponent';
import { ChooseWin } from './ChooseWin';
import { Constant, CONSUMABLES_CACHE_KEY, EQUIPMENT_CACHE_KEY } from "./Constant";
import { CreateRole } from "./CreateRole";
import Web3 from "web3/dist/web3.min.js";

const { ccclass, type } = _decorator;
const { padLeft, toHex } = Web3.utils;

import { Props } from './entitys/Props';

@ccclass('Role')
export class Role extends BaseComponent {

    @type(Node)
    bottom1: Node;

    @type(Node)
    bottom2: Node;

    @type(Label)
    roleName: Label;

    @type(Label)
    levelLab: Label;

    @type(Label)
    combatPower: Label;

    @type(Node)
    confirmPacket: Node;

    @type(CreateRole)
    createRole: CreateRole;

    @type(Node)
    groove: Node;

    @type(Node)
    useExpWin: Node;

    @type(Node)
    expBar: Node;

    heroAttr: any;
    heroStatus: any;
    allEquipment: Props[] = [];

    needSave: boolean = false;
    equipConfig: string[] = ["1", "3", "2", "0", "5", "5", "4", "4"];
    equipIndex: number = 0;
    equipmentSlot: string[] = ["0", "0", "0", "0", "0", "0", "0", "0"];
    currentSolt: Node | null = null;
    _reg: RegExp = new RegExp("^[0-9]*$");
    useExpAmount: number = 0;
    useExpBalance: number = 0;

    constructor() {
        super();
        this.bottom1 = new Node();
        this.bottom2 = new Node();
        this.roleName = new Label();
        this.combatPower = new Label();
        this.confirmPacket = new Node();
        this.createRole = new CreateRole();
        this.groove = new Node();
        this.useExpWin = new Node();
        this.levelLab = new Label();
        this.expBar = new Node();
    }


    onLoad() {
        super.onLoad();
        this.useExpWin.active = false;
        this._checkRole();
        this.createRole.onCreateRole = this._onCreateRole.bind(this);

    }

    _onCreateRole() {
        this._checkRole();
    }

    async _checkRole() {
        let info = await this.callContract("Hero", "getHeroInfo", this.api?.curAccount).catch(reason => {
            this.showErr(reason);
        });
        if (info.hero.tokenId == "0") {
            this.createRole.node.active = true;
            this.heroAttr = { profession: 0 };
        } else {
            await this._loadEquipments();
            this.createRole.node.active = false;
            this.heroAttr = info.attrs;
            this.heroStatus = info.hero;
            for (let i = 0; i < this.heroAttr.equipmentSlot.length; i++) {
                this.equipmentSlot[i] = this.heroAttr.equipmentSlot[i];
            }
            console.log("hero info: ", info);
            this._showRoleData();
        }
    }

    start() {
        this.confirmPacket.active = false;
        this.bottom1.active = false;
        // this._showRoleData();
    }

    _showRoleData() {
        this.levelLab.string = this.heroAttr.level + "级 " + Constant.profession[parseInt(this.heroAttr.profession)];
        this.roleName.string = this.heroAttr.name;
        this._caclPower();
        this._showEquipment();
        this._showExp();
    }

    private _showExp() {
        let expBar = this.expBar.getComponentInChildren(ProgressBar);
        let expTxt = this.expBar.getChildByPath("ProgressBar/expValue")?.getComponent(Label);
        if (!!expTxt) {
            expTxt.string = this.heroAttr.exp + "/" + this.heroAttr.upExp;
        }
        if (!!expBar) {
            let a = parseInt(this.heroAttr.exp.toString());
            let b = parseInt(this.heroAttr.upExp.toString());
            let c = a / b;
            if (c > 1) c = 1;
            expBar.progress = c;
        }
    }

    _caclPower() {
        let power = 0;
        this.equipmentSlot.forEach(id => {
            let equip = this.allEquipment.find((val) => { return val.id.toString() == id; });
            if (!!equip) {
                power += parseInt(equip.info.power);
            }
        });
        this.combatPower.string = "综合战斗力: " + power.toString();
    }

    update(deltaTime: number) {
        this._checkBottom();
    }

    onClose() {
        director.loadScene("Main");
    }

    async _loadEquipments() {
        this.allEquipment = [];
        this.allEquipment = await this.loadEquipments();
    }

    _showEquipment() {
        this.equipmentSlot.forEach((item, index) => {
            let sprite = this.groove.getChildByName(index.toString())?.getComponentInChildren(Sprite);
            let equip = this.allEquipment.find((val) => { return val.id.toString() == item; });
            if (!!equip) {
                // this.loadSprite(equip.img?.replace("icon/", ""), sprite);
                this.loadSprite(equip.img, sprite);
            } else {
                this.loadSprite(null, sprite);
            }
        });
    }

    onGrooveClick(event: EventTouch) {
        this.currentSolt = (event.currentTarget as Node);
        let name = this.currentSolt.name;
        this.equipIndex = parseInt(name);
        this.needSave = true;
        ChooseWin.show(true, "储物箱没有符合目前角色等级、部位或职业的装备!").then((cw: ChooseWin) => {
            cw.onChooseEvent = this.onChoose.bind(this);
            let data = this.allEquipment.filter((item: Props) => {
                // console.log("item.info.isEquip: ", typeof item.info.isEquip)
                return item.info.category == this.equipConfig[this.equipIndex]
                    && parseInt(this.heroAttr.level) >= parseInt(item.info.level)
                    && (item.info.profession.toString() == "0" || item.info.profession == this.heroAttr.profession)
                    && item.info.isEquip == false;
            });
            // data.forEach(item => {
            //     if (item.img?.indexOf("icon/") == -1)
            //         item.img = "icon/" + item.img;
            // });
            cw.setData(data);
        });
    }

    onGrooveDoubleClick(event: EventTouch) {
        let node = event.currentTarget as Node;
        let name = node.name;
        let index = parseInt(name);
        let oldProps = this.allEquipment.find(item => item.id == this.equipmentSlot[index]);
        if (!!oldProps) oldProps.info.isEquip = false;
        if (this.equipmentSlot[index] != "0") {
            this.needSave = true;
            this.equipmentSlot[index] = "0";
            let sprite = node.getComponentInChildren(Sprite);
            if (sprite) sprite.spriteFrame = null;
            this._caclPower();
        }
    }

    onSave() {
        this.needSave = false;
        // console.log("heroStatus: ", this.heroStatus.tokenId, this.equipmentSlot);
        this.sendContract("Hero", "equip", this.heroStatus.tokenId, this.equipmentSlot, { from: this.api?.curAccount })
            .then(result => {
                // loading.close();
                this._checkRole();
                localStorage.removeItem(EQUIPMENT_CACHE_KEY);
                this.api?.syncPower(this.api.curAccount);
            });
    }

    onCancel() {
        this.needSave = false;
        for (let i = 0; i < this.heroAttr.equipmentSlot.length; i++) {
            this.equipmentSlot[i] = this.heroAttr.equipmentSlot[i];
        }
        this._showRoleData();
    }

    onBox() {
        this.loadScene("StorageBox");
    }

    onPacket() {
        this.confirmPacket.active = true;
    }

    onConfirmPacket() {
        this.confirmPacket.active = false;
        this.showAlert("封包成功，角色卡与装备已进入储物箱。");
    }

    onApprove() {
        this.confirmPacket.active = false;
    }

    onCloseConfirm() {
        this.confirmPacket.active = false;
    }

    _checkBottom() {
        if (this.needSave) {
            this.bottom1.active = true;
            this.bottom2.active = false;
        } else {
            this.bottom1.active = false;
            this.bottom2.active = true;
        }
    }

    onChoose(data: Props) {
        // console.log("onChoose: ", data);
        let oldProps = this.allEquipment.find(item => item.id == this.equipmentSlot[this.equipIndex]);
        if (!!oldProps) oldProps.info.isEquip = false;
        data.info.isEquip = true;
        this.equipmentSlot[this.equipIndex] = data.id.toString();
        if (!!data.img) {
            // this.loadSprite(data.img.replace("icon/", ""), this.currentSolt?.getComponentInChildren(Sprite));
            this.loadSprite(data.img, this.currentSolt?.getComponentInChildren(Sprite));
        }
        this._caclPower();
        this.currentSolt = null;
        return true;
    }

    onAmountChange(data: string) {
        if (this._reg.test(data)) {
            this.useExpAmount = Number.parseInt(data);
            if (this.useExpBalance < this.useExpAmount) {
                this.useExpAmount = this.useExpBalance;
            }
        }
    }

    useExpClose() {
        this.useExpWin.active = false;
    }

    doUseExp() {
        if (this.useExpAmount > 0) {
            let id = Constant.consumables[3][1];
            let data = padLeft(toHex(6), 2) + padLeft(toHex(this.heroStatus.tokenId).substr(2), 64);
            this.sendContract("Fragment", "safeTransferFrom", this.api?.curAccount, Constant.address.Hero, id, this.useExpAmount, data, { from: this.api?.curAccount })
                .then(val => {
                    this.useExpWin.active = false;
                    this._checkRole();
                    localStorage.removeItem(CONSUMABLES_CACHE_KEY);
                });
        }
    }

    useExpProps() {
        this.useExpWin.active = true;
        let countNode = this.useExpWin.getChildByPath("window/count");
        if (countNode) {
            let lab = countNode.getComponent(Label);
            this.callContract("Fragment", "balanceOf", this.api?.curAccount, Constant.consumables[3][1])
                .then(value => {
                    if (lab) {
                        this.useExpBalance = parseInt(value);
                        lab.string = this.useExpBalance.toString();
                    }
                })
                .catch(reason => { console.log(reason); this.showErr(reason); });
        }
    }

    onUpgrade(event: Event) {
        //检查可否升级
        let a = parseInt(this.heroAttr.exp.toString());
        let b = parseInt(this.heroAttr.upExp.toString());
        if (a > b && a != 0) {
            this.sendContract("Hero", "upgrade", this.heroStatus.tokenId, { from: this.api?.curAccount })
                .then(result => {
                    // console.log(result);
                    this.showAlert("角色升级成功!\r\n你可以穿戴更高等级的装备了");
                    this._checkRole();
                });
        } else {
            this.showAlert("角色经验不足以升级!");
        }

    }


}

