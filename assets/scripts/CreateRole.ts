
import { _decorator, Component, Node, Toggle, Label, director, resources, log, math, Sprite } from 'cc';
import { AlertWin } from './AlertWin';
import { BaseComponent } from './BaseComponent';
import { Loading } from './Loading';
import { Constant } from "./Constant";
import Web3 from "web3/dist/web3.min.js";

const { ccclass, type } = _decorator;
const { toWei, padLeft, toHex, toBN, fromWei } = Web3.utils;

@ccclass('CreateRole')
export class CreateRole extends BaseComponent {

    @type(Node)
    professions: Node;

    @type(Node)
    chooseName: Node;

    heroAttr: any = { profession: 1, gender: 0, tokenType: 1, price: toWei("10", "ether") };

    onCreateRole: Function | null = null;

    //男名
    nameMen: string[] = [];
    //女名
    nameWomen: string[] = [];

    userBalance: any = toBN(0);

    constructor() {
        super();
        this.professions = new Node();
        this.chooseName = new Node();
    }

    onLoad() {
        super.onLoad();
        this.professions.active = true;
        this.chooseName.active = false;
        this._loadNames();
        let roleImg = this.node.getChildByPath("content/RoleImg")?.getComponent(Sprite) ?? new Sprite();
        this.loadSpriteUrl("img/role" + this.heroAttr.profession, roleImg);

        this.callContract("LGC", "balanceOf", this.api?.curAccount)
            .then((result) => {
                this.userBalance = toBN(result);
            });
    }

    _loadNames() {
        resources.load("name/men", (err, data: any) => {
            if (err) {
                log("load name/men err: ", err);
                return;
            }
            this.nameMen = data.json;
        });
        resources.load("name/women", (err, data: any) => {
            if (err) {
                log("load name/women err: ", err);
                return;
            }
            this.nameWomen = data.json;
        });
    }

    onCreateRoleClose() {
        director.loadScene("Main");
    }

    onConfirm() {
        if (this.professions.active) {
            this.professions.active = false;
            this.chooseName.active = true;
            // console.log(this.heroAttr);
        } else {
            let label = this.chooseName.getComponentInChildren(Label);
            this.heroAttr.name = label?.string;
            // console.log("heroAttr: ", this.heroAttr);
            let msg = "<color=#ffffff>创建角色将花费</color> <color=#EFD0A2>10</color> <color=#ffffff>LGC</color>";
            AlertWin.showRichText(this.node, msg, "创建角色", () => {
                if (this.userBalance.lt(toWei(toBN(10), "ether"))) {
                    this.showAlert("LGC余额不足!");
                    return;
                }
                let data = padLeft(toHex(7), 2);//操作符
                data += padLeft(toHex(this.heroAttr.gender).substr(2), 2)//性别
                data += padLeft(toHex(this.heroAttr.profession).substr(2), 2)//职业
                data += toHex(this.heroAttr.name).substr(2);//名字
                this.sendContract("LGC", "transferAndCall", Constant.address.Hero, this.heroAttr.price, data, { from: this.api?.curAccount })
                    .then(result => {
                        if (this.onCreateRole) this.onCreateRole();
                    });

                // this.sendContract("Hero", "create", this.heroAttr.name, this.heroAttr.gender, this.heroAttr.profession, this.heroAttr.tokenType, { from: this.api?.curAccount })
                //     .then(result => {
                //         if (this.onCreateRole) this.onCreateRole();
                //     });
            });
            // , () => {
            //     this.sendContract("LGC", "approve", Constant.address.Hero, Web3.utils.toWei("10", "ether"), { from: this.api?.curAccount })
            //         .then(result => { });
            // });
        }
    }

    onCheckProfession(target: Toggle) {
        let roleImg = this.node.getChildByPath("content/RoleImg")?.getComponent(Sprite) ?? new Sprite();
        let leb = this.chooseName.getChildByName("RoleName")?.getComponent(Label) ?? new Label();
        leb.string = this.nameMen[0];
        switch (target.node.name) {
            case "Toggle1":
                this.heroAttr.profession = 1;
                break;
            case "Toggle2":
                this.heroAttr.profession = 2;
                this.heroAttr.gender = 1;
                leb.string = this.nameWomen[0];
                break;
            case "Toggle3":
                this.heroAttr.profession = 3;
                break;
            default:
                this.heroAttr.profession = 1;
                break;
        }
        this.loadSpriteUrl("img/role" + this.heroAttr.profession, roleImg);
    }

    onRandomName() {
        let index = 0;
        let leb = this.chooseName.getChildByName("RoleName")?.getComponent(Label) ?? new Label();
        if (this.heroAttr.gender == 0) {
            if (this.nameMen.length > 0) {
                index = math.randomRangeInt(0, this.nameMen.length);
                leb.string = this.nameMen[index];
            }
        } else {
            if (this.nameWomen.length > 0) {
                index = math.randomRangeInt(0, this.nameWomen.length);
                leb.string = this.nameWomen[index];
            }
        }
    }

    onBack() {
        this.professions.active = true;
        this.chooseName.active = false;
    }

}

