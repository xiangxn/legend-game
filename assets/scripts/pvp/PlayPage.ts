import { _decorator, Component, Node, Prefab, instantiate, find, Label, Sprite, UITransform } from 'cc';
import { BaseComponent } from '../BaseComponent';
import { Constant } from '../Constant';
import { PVPEvent } from '../events/PVPItemEvent';
import { Role } from './role';
import Web3 from "web3/dist/web3.min.js";
import { AlertWin } from '../AlertWin';

const { ccclass, type } = _decorator;

const { padLeft, toHex, toWei, toBN } = Web3.utils;

@ccclass('PlayPage')
export class PlayPage extends BaseComponent {

    @type(Label)
    p1Name: Label;
    @type(Label)
    p1Profession: Label;
    @type(Label)
    p1Attack: Label;
    @type(Label)
    p1Defense: Label;
    @type(Label)
    p1Health: Label;

    @type(Label)
    p2Name: Label;
    @type(Label)
    p2Profession: Label;
    @type(Label)
    p2Attack: Label;
    @type(Label)
    p2Defense: Label;
    @type(Label)
    p2Health: Label;

    @type(Node)
    roleStage: Node;
    @type(Prefab)
    warriorPrefab: Prefab;
    @type(Prefab)
    magePrefab: Prefab;
    @type(Prefab)
    taoistPrefab: Prefab;

    @type(Label)
    labRound: Label;

    @type(Sprite)
    hpL: Sprite;
    @type(Sprite)
    hpR: Sprite;


    battleData: any;
    p1Data: any;
    p2Data: any;

    leftRole: Role;
    rightRole: Role;

    round: number = 0;
    hpLeft: number = 0;
    hpRight: number = 0;
    curAttack: any;
    attackStatus: number = 0;

    onLoad() {
        super.onLoad();
        this.node.on("AttackEnd", this._onAttackEnd, this);
        this.node.on("RunBack", this._onRunBack, this);
    }

    onDestroy() {
        this.node.off("AttackEnd", this._onAttackEnd, this);
        this.node.off("RunBack", this._onRunBack, this);
    }

    openBattle(data: any) {
        this.node.active = true;
        this.battleData = data;
        // console.log(this.battleData);
        this.showLoading().then(loading => {
            this.callContract("PVP", "getRoleView", this.battleData.p1, this.battleData.p2)
                .then(result => {
                    loading.close();
                    // console.log(result);
                    if (this.battleData.p1.toLowerCase() == this.api?.curAccount.toLowerCase()) {
                        this.p1Data = Object.assign({}, result.p1Attr);
                        this.p1Data.battle = this.battleData.p1List;
                        this.p1Data.addr = this.battleData.p1;
                        this.p2Data = Object.assign({}, result.p2Attr);
                        this.p2Data.battle = this.battleData.p2List;
                        this.p2Data.addr = this.battleData.p2;
                    } else {
                        this.p1Data = Object.assign({}, result.p2Attr);
                        this.p1Data.battle = this.battleData.p2List;
                        this.p1Data.addr = this.battleData.p2;
                        this.p2Data = Object.assign({}, result.p1Attr);
                        this.p2Data.battle = this.battleData.p1List;
                        this.p2Data.addr = this.battleData.p1;
                    }
                    this.curAttack = this.battleData.p1 == this.p1Data.addr ? this.p1Data : this.p2Data;
                    this._showData();
                    this._play();
                })
                .catch(reason => {
                    loading.close();
                    this.showErr(reason);
                });
        });
    }

    private _showData() {
        this.p1Name.string = this.p1Data.name;
        this.p1Profession.string = Constant.profession[this.p1Data.profession];
        this.p1Attack.string = this.p1Data.attack;
        this.p1Defense.string = this.p1Data.defense;
        this.p1Health.string = this.p1Data.health;

        this.p2Name.string = this.p2Data.name;
        this.p2Profession.string = Constant.profession[this.p2Data.profession];
        this.p2Attack.string = this.p2Data.attack;
        this.p2Defense.string = this.p2Data.defense;
        this.p2Health.string = this.p2Data.health;
    }

    private _play() {
        // console.log(this.p1Data, this.p2Data);
        //开始播放
        this._loadRole(this.p1Data.profession);
        this._loadRole(this.p2Data.profession, false);
        this.round = this.p1Data.battle.length;
        this.hpLeft = parseInt(this.p1Data.health);
        this.hpRight = parseInt(this.p2Data.health);
        this._updateUI();
        this._doAttack();
    }

    private _doAttack() {
        // console.log("_doAttack", this.p1Data.battle.length, this.round);
        let role = this._getCurRole();
        let ad: any = this._getAttackData(this.curAttack.battle[this.p1Data.battle.length - this.round]);
        // console.log("ad: ", ad);
        role.groupAnim(ad.value, ad.status);
    }

    private _getAttackData(data: string) {
        // console.log("data: ", data);
        let value = 0;
        let status = 0;
        if (data == "0") {
            status = 2;
        } else {
            let val = toBN(data);
            let tmp = val.shrn(62).and(toBN(1).shln(1).notn(2)).toNumber()
            status = tmp == 1 ? 1 : 0;
            value = toBN("0x" + padLeft(toHex(data), 16).substr(10)).toNumber()
        }
        return { value, status };
    }

    private _getCurRole() {
        if (this.curAttack.addr == this.p1Data.addr) {
            return this.leftRole;
        } else {
            return this.rightRole;
        }
    }

    private _updateUI() {
        this.labRound.string = this.round.toString();
        this.hpL.node.setScale(this.hpLeft / parseInt(this.p1Data.health), 1);
        this.hpR.node.setScale(this.hpRight / parseInt(this.p2Data.health), 1);
    }

    private _onAttackEnd(event: PVPEvent) {
        event.propagationStopped = true;
        // console.log("val: ", event.data);
        //处理血量
        if (this.curAttack.addr == this.p1Data.addr) {
            this.hpRight -= event.data;
            this.hpRight = this.hpRight < 0 ? 0 : this.hpRight;
        } else {
            this.hpLeft -= event.data;
            this.hpLeft = this.hpLeft < 0 ? 0 : this.hpLeft;
        }
        this._updateUI();
        this._checkDeath();
    }

    private _checkDeath() {
        let role = this.leftRole;
        let hp = this.hpLeft;
        if (this.curAttack.addr == this.p1Data.addr) {
            role = this.rightRole;
            hp = this.hpRight;
        }
        if (hp == 0) {
            role.death();
        }
    }

    private _onRunBack(event: PVPEvent) {
        event.propagationStopped = true;
        //检查胜负
        if (this.hpLeft == 0 || this.hpRight == 0) {
            this._showResult();
            return;
        }
        //处理回合
        if (this.curAttack.addr == this.p1Data.addr) {
            this.curAttack = this.p2Data;
        } else {
            this.curAttack = this.p1Data;
        }
        if (this.attackStatus == 0) {
            //换对方攻击
            this.attackStatus = 1;
        } else {
            this.attackStatus = 0;
            //检查回合结束
            if(this.round == 1){
                this._showResult();
                return;
            }
            //开始新的回合
            this.round -= 1;
            this._updateUI();
        }
        this._doAttack();
    }

    private _showResult() {
        let msg = "";
        if (this.battleData.win.toLowerCase() == this.api?.curAccount.toLowerCase()) {
            //我方胜利
            msg = `<color=#ffffff>恭喜你赢得了本次挑战!将赢得</color> <color=#EFD0A2>${this._getReward()}</color> <color=#ffffff>LGC</color>`;
        } else {
            //对方胜利
            msg = `<color=#ffffff>很遗憾，你输掉了本次挑战!</color>`;
        }
        AlertWin.showRichText(find("Canvas") ?? this.node, msg, "战报", () => { });
    }

    private _getReward() {
        let item = Constant.pvpList.find(obj => { return obj.id = this.battleData.queueId }) ?? { fee: 0 };
        return Math.floor((item.fee * 2) - (item.fee * 2 * 0.1));
    }

    private _loadRole(roleKey: string, isLeft: boolean = true) {
        let role: Node;
        switch (roleKey) {
            case "1":
                role = instantiate(this.warriorPrefab);
                break;
            case "2":
                role = instantiate(this.magePrefab);
                break;
            case "3":
                role = instantiate(this.taoistPrefab);
                break;
            default:
                role = instantiate(this.warriorPrefab);
                break;
        }
        this.roleStage.addChild(role);
        if (isLeft) {
            role.setPosition(-295, -90);
            this.leftRole = role.getComponent(Role);
            this.leftRole.isLeft = isLeft;
        } else {
            role.setPosition(295, -90);
            role.setRotationFromEuler(0, 180);
            this.rightRole = role.getComponent(Role);
            this.rightRole.isLeft = isLeft;
        }
        if (this.roleStage.children.length == 2) {
            this.leftRole.attackTarget = this.rightRole;
            this.rightRole.attackTarget = this.leftRole;
        }
    }
}