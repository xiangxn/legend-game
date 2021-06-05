
import { _decorator, Component, Node } from 'cc';
import { ComboBox } from './ComboBox';
import { ComboItemEvent } from './events/ComboItemEvent';
const { ccclass, type } = _decorator;

@ccclass('FilterProps')
export class FilterProps extends Component {

    @type(ComboBox)
    cbType: ComboBox;
    @type(ComboBox)
    cbProfession: ComboBox;
    @type(ComboBox)
    cbEquipType: ComboBox;
    @type(ComboBox)
    cbEquipLevel: ComboBox;

    selected: any[] = [];
    onSelected: Function | null = null;

    constructor() {
        super();
        this.cbType = new ComboBox();
        this.cbProfession = new ComboBox();
        this.cbEquipType = new ComboBox();
        this.cbEquipLevel = new ComboBox();
    }

    onLoad() {
        this.cbType.data = [];
        this.cbType.onChanage = this.onCbTypeChanage.bind(this);
        this.cbType.curTxt = "分类";
        this.cbType.data.push({ name: this.cbType.curTxt, value: -1 });
        this.cbType.data.push({ name: "艺术品", value: 3 });
        this.cbType.data.push({ name: "碎片", value: 2 });
        this.cbType.data.push({ name: "装备", value: 1 });
        this.selected.push(this.cbType.data[0])

        this.cbProfession.data = [];
        this.cbProfession.onChanage = this.onProfessionChanage.bind(this);
        this.cbProfession.curTxt = "职业";
        this.cbProfession.data.push({ name: this.cbProfession.curTxt, value: -1 });
        this.cbProfession.data.push({ name: "道士", value: 3 });
        this.cbProfession.data.push({ name: "法师", value: 2 });
        this.cbProfession.data.push({ name: "战士", value: 1 });
        this.cbProfession.data.push({ name: "通用", value: 0 });
        this.selected.push(this.cbProfession.data[0])

        this.cbEquipType.data = [];
        this.cbEquipType.onChanage = this.onEquipTypeChanage.bind(this);
        this.cbEquipType.curTxt = "部位";
        this.cbEquipType.data.push({ name: this.cbEquipType.curTxt, value: -1 });
        this.cbEquipType.data.push({ name: "手镯", value: 5 });
        this.cbEquipType.data.push({ name: "戒指", value: 4 });
        this.cbEquipType.data.push({ name: "项链", value: 3 });
        this.cbEquipType.data.push({ name: "盔甲", value: 2 });
        this.cbEquipType.data.push({ name: "头盔", value: 1 });
        this.cbEquipType.data.push({ name: "武器", value: 0 });
        this.selected.push(this.cbEquipType.data[0])

        this.cbEquipLevel.data = [];
        this.cbEquipLevel.onChanage = this.onEquipLevelChanage.bind(this);
        this.cbEquipLevel.curTxt = "等级";
        this.cbEquipLevel.data.push({ name: this.cbEquipLevel.curTxt, value: -1 });
        this.cbEquipLevel.data.push({ name: "41-50", value: 4 });
        this.cbEquipLevel.data.push({ name: "31-40", value: 3 });
        this.cbEquipLevel.data.push({ name: "21-30", value: 2 });
        this.cbEquipLevel.data.push({ name: "11-20", value: 1 });
        this.cbEquipLevel.data.push({ name: "1-10", value: 0 });
        this.selected.push(this.cbEquipLevel.data[0])
    }

    onDestroy() {
        this.cbType.onChanage = null;
        this.cbProfession.onChanage = null;
        this.cbEquipType.onChanage = null;
        this.cbEquipLevel.onChanage = null;
        this.onSelected = null;
    }

    bindOnSelected(onselected: Function) {
        this.onSelected = onselected;
    }

    onCbTypeChanage(data: any) {
        if (data.value == 1) {
            this.cbProfession.node.active = true;
            this.cbEquipType.node.active = true;
            this.cbEquipLevel.node.active = true;
            this.cbProfession.setCurTxt("职业");
            this.cbEquipType.setCurTxt("部位");
            this.cbEquipLevel.setCurTxt("等级");
        } else {
            this.cbProfession.node.active = false;
            this.cbEquipType.node.active = false;
            this.cbEquipLevel.node.active = false;
            this.cbProfession.selected = this.cbProfession.data[0];
            this.cbEquipType.selected = this.cbEquipType.data[0];
            this.cbEquipLevel.selected = this.cbEquipLevel.data[0];
            this.selected[1] = this.cbProfession.selected;
            this.selected[2] = this.cbEquipType.selected;
            this.selected[3] = this.cbEquipLevel.selected;
        }
        this.selected[0] = data;
        // console.log(this.selected, this.onSelected)
        if (!!this.onSelected) this.onSelected(this.selected);
    }

    onProfessionChanage(data: any) {
        this.selected[1] = data;
        // console.log(this.selected)
        if (!!this.onSelected) this.onSelected(this.selected);
    }

    onEquipTypeChanage(data: any) {
        this.selected[2] = data;
        // console.log(this.selected)
        if (!!this.onSelected) this.onSelected(this.selected);
    }

    onEquipLevelChanage(data: any) {
        this.selected[3] = data;
        if (!!this.onSelected) this.onSelected(this.selected);
    }
}

