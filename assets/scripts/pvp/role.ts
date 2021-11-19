
import { _decorator, Component, Node, Animation, math, Label, Color } from 'cc';
import { PVPEvent } from '../events/PVPItemEvent';
import { People } from './people';
const { ccclass, type, property } = _decorator;

@ccclass('Role')
export class Role extends Component {

    @type(Node)
    people: Node;

    @type(Node)
    weapon: Node;

    @type(Node)
    effect: Node;

    @type(Label)
    deduction: Label;

    @type(Node)
    target: Node;

    //w:战士，m:法师, t:道士
    @type(String)
    tagRole: string = 'w';

    //0:站, 1:跑, 2:攻击, 3:死, 4:跑回
    status: number = 0;

    //是否是组合动画
    isGroup: boolean = false;

    //攻击目标
    attackTarget: Role;

    animPeople: Animation;
    animWeapon: Animation;
    animEffect: Animation;
    animMove: Animation;
    animDeduction: Animation;

    //攻击扣除的数值
    deductionValue: number = 0;

    //角色是否在左边
    @type(Boolean)
    isLeft: boolean = true;

    //是否暴击
    isCriticalHit: boolean = false;

    //攻击状态:0普通攻击, 1暴击, 2闪避
    attackStatus: number = 0;

    onLoad() {
        // console.log('onLoad')
        this.node.on("onAttackEnd", this._onAttackEnd.bind(this));
        this.node.on("onAttacked", this._onAttacked, this);
        this.animPeople = this.people.getComponent(Animation);
        this.animWeapon = this.weapon.getComponent(Animation);
        this.animEffect = this.effect.getComponent(Animation);
        this.animMove = this.node.getComponent(Animation);
        this.animDeduction = this.deduction.getComponent(Animation);
        if (this.target != null)
            this.attackTarget = this.target.getComponent(Role);
    }

    onDestroy() {
        this.node.off("onAttackEnd", this._onAttackEnd.bind(this));
        this.node.off("onAttacked", this._onAttacked, this);
    }

    _onAttacked(event: PVPEvent) {
        event.propagationStopped = true;
        if (!!this.attackTarget) {
            this.attackTarget.underAttack(this.deductionValue, this.attackStatus);
        }
    }

    _onAttackEnd(event: PVPEvent) {
        event.propagationStopped = true;
        this.node.dispatchEvent(new PVPEvent("AttackEnd", this.deductionValue, true));
        if (this.isGroup == false) {
            return;
        }
        this.runBack();
    }

    stand() {
        this.status = 0;
        this.stopAttack();
        if (this.isLeft) {
            this.node.setRotationFromEuler(0, 0);
        } else {
            this.node.setRotationFromEuler(0, 180);
        }
        this._enlarge();
        this.animPeople.play(`${this.tagRole}_stand`);
        this.animWeapon.play(`${this.tagRole}_weapon_stand`);
    }

    run() {
        this.status = 1;
        this.stopAttack();
        this._enlarge();
        if (this.isLeft) {
            this.animMove.getState("role_move_l").speed = 2.0;
            this.animMove.play('role_move_l');
        } else {
            this.animMove.getState("role_move_r").speed = 2.0;
            this.animMove.play('role_move_r');
        }
    }

    _enlarge() {
        this.node.setScale(new math.Vec3(1.5, 1.5, 1));
    }

    //组合动作
    groupAnim(value: number = 500, attackStatus: number = 1) {
        this.deductionValue = value;
        this.attackStatus = attackStatus;
        this.isGroup = true;
        this.run();
    }

    //跑回
    runBack() {
        this.status = 4;
        this._enlarge();
        if (this.isLeft) {
            this.node.setRotationFromEuler(0, 180);
            this.animMove.getState("role_back_l").speed = 2.0;
            this.animMove.play('role_back_l');
        } else {
            this.node.setRotationFromEuler(0, 0);
            this.animMove.getState("role_back_r").speed = 2.0;
            this.animMove.play('role_back_r');
        }
        this.isGroup = false;
    }

    //攻击
    attack(value: number | null = null, attackStatus: number | null = null) {
        if (value != null) {
            this.deductionValue = value;
        }
        if (attackStatus != null) {
            this.attackStatus = attackStatus;
        }
        this.status = 2;
        this._enlarge();
        this.animEffect.node.active = true;
        this.animPeople.play(`${this.tagRole}_attack`);
        this.animWeapon.play(`${this.tagRole}_weapon_attack`);
        this.animEffect.play(`${this.tagRole}_effect_attack`);
    }

    stopAttack() {
        this.animEffect.stop();
        this.animEffect.node.active = false;
    }

    underAttack(value: number = 0, attackStatus: number | null = null) {
        if (this.isLeft == false) {
            this.deduction.node.setRotationFromEuler(0, 180);
        } else {
            this.deduction.node.setRotationFromEuler(0, 0);
        }
        let people = this.people.getComponent(People);
        switch (attackStatus) {
            case 0:
                this.deduction.string = `${value}`;
                this.deduction.color = (new Color()).fromHEX("#ffffff");
                people.playUnderAttack();
                break;
            case 1:
                this.deduction.string = `暴击 ${value}`;
                this.deduction.color = (new Color()).fromHEX("#f7dc94");
                people.playUnderAttack();
                break;
            case 2:
                this.deduction.string = "闪避";
                this.deduction.color = (new Color()).fromHEX("#f7dc94");
                break;
        }
        this.animDeduction.play("deduction");
    }

    //死亡
    death() {
        this.status = 3;
        this.stopAttack();
        if (this.tagRole == 'm') {
            this.node.setScale(new math.Vec3(1, 1, 1));
        } else {
            this._enlarge();
        }
        if (this.isLeft) {
            this.node.setRotationFromEuler(0, 0);
        } else {
            this.node.setRotationFromEuler(0, 180);
        }
        this.animPeople.play(`${this.tagRole}_death`);
        this.animWeapon.play(`${this.tagRole}_weapon_death`);
    }

    public onRoleRun() {
        this.stopAttack();
        this._enlarge();
        this.animPeople.getState(`${this.tagRole}_run`).speed = 2.0;
        this.animWeapon.getState(`${this.tagRole}_weapon_run`).speed = 2.0;
        this.animPeople.play(`${this.tagRole}_run`);
        this.animWeapon.play(`${this.tagRole}_weapon_run`);
    }


    public onRunEnd() {
        if (this.status == 1)
            this.attack();
    }

    public onRunBack() {
        this.stand();
        // console.log("onRunBack")
        this.node.dispatchEvent(new PVPEvent("RunBack", true, true));
    }


}

