
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

    selected: any[] = [];
    onSelected: Function | null = null;

    constructor() {
        super();
        this.cbType = new ComboBox();
        this.cbProfession = new ComboBox();
        this.cbEquipType = new ComboBox();
    }

    onLoad() {
        this.cbType.data = [];
        this.cbType.onChanage = this.onCbTypeChanage.bind(this);
        this.cbType.curTxt = "分类";
        this.cbType.data.push({ name: this.cbType.curTxt, value: -1 });
        this.cbType.data.push({ name: "艺术品", value: 3 });
        this.cbType.data.push({ name: "图腾", value: 2 });
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
    }

    onDestroy() {
        this.cbType.onChanage = null;
        this.cbProfession.onChanage = null;
        this.cbEquipType.onChanage = null;
        this.onSelected = null;
    }

    onCbTypeChanage(data: any) {
        if (data.value == 1) {
            this.cbProfession.node.active = true;
            this.cbEquipType.node.active = true;
        } else {
            this.cbProfession.node.active = false;
            this.cbEquipType.node.active = false;
            this.cbProfession.selected = this.cbProfession.data[0];
            this.cbEquipType.selected = this.cbEquipType.data[0];
            this.selected[1] = this.cbProfession.selected
            this.selected[2] = this.cbEquipType.selected
        }
        this.selected[0] = data;
        // console.log(this.selected)
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
}

