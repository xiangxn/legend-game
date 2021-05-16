
import { _decorator, Component, Node, Label, Sprite } from 'cc';
import { BaseComponent } from './BaseComponent';

const { ccclass, type } = _decorator;

@ccclass('ZoneItem')
export class ZoneItem extends BaseComponent {

    @type(Label)
    labTitle: Label;

    @type(Label)
    labExps: Label;

    @type(Label)
    labPower: Label;

    @type(Label)
    labLevel: Label;

    @type(Label)
    labWeights: Label;

    @type(Label)
    labBtn: Label;

    @type(Label)
    labStatus: Label;

    zoneConfig: any;
    zoneInfo: any;
    roleInfo: any;
    onItemClick: Function | null = null;
    //0为角色可以进入,1可查看,2为可结束
    status: number = 0;

    constructor() {
        super();
        this.labTitle = new Label();
        this.labExps = new Label();
        this.labPower = new Label();
        this.labLevel = new Label();
        this.labWeights = new Label();
        this.labBtn = new Label();
        this.labStatus = new Label();
    }

    onLoad() {
        super.onLoad();
        this.labTitle.string = this.zoneInfo.name;
        this.labExps.string = this.zoneInfo.baseExp;
        this.labPower.string = this.zoneInfo.minPower;
        this.labLevel.string = this.zoneInfo.level;
        this.labWeights.string = this.zoneInfo.fragmentWeight + "%";
        this.labStatus.string = "";
        this.callContract("ZoneMine", "getRoleByAddr", this.api?.curAccount)
            .then(info => {
                this.roleInfo = info;
                // console.log(this.roleInfo.id,this.zoneInfo.id);
                if (this.roleInfo.id != this.zoneInfo.id) {
                    this.labBtn.string = "进入";
                    this.labStatus.string = "";
                } else {
                    if (parseInt(this.roleInfo.endTime) <= Math.floor(Date.now() / 1000)) {
                        this.labBtn.string = "结束";
                        this.labStatus.string = "冒险完成";
                        this.status = 2;
                    } else {
                        this.labStatus.string = "正在冒险";
                        this.labBtn.string = "查看";
                        this.status = 1;
                    }
                }
            })
            .catch(reason => { console.log(reason); });
        let img = this.node.getChildByName("img")?.getComponent(Sprite);
        this.loadSpriteUrl("img/" + this.zoneConfig.banner, img);
    }

    onInZoneClick() {
        if (!!this.onItemClick) this.onItemClick(this.zoneInfo, this.roleInfo, this.status, this.zoneConfig);
    }
}

