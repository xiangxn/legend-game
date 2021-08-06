
import { _decorator, Component, Node, Label, Button, Prefab, instantiate } from 'cc';
import { ComboItem } from './ComboItem';
import { ComboItemEvent } from './events/ComboItemEvent';
const { ccclass, type, property } = _decorator;

@ccclass('ComboBox')
export class ComboBox extends Component {

    @type(Label)
    labCurTxt: Label;

    @type(Node)
    btnList: Node;

    @type(Prefab)
    btnTmp: Prefab;

    @type(String)
    curTxt: string = "";

    @type(Boolean)
    changeName: Boolean = true;

    data: any[] = [];

    selected: any;

    onChanage: Function | null = null;

    constructor() {
        super();
        this.btnTmp = new Prefab();
        this.labCurTxt = new Label();
        this.btnList = new Node();
    }

    onLoad() {
        this.btnList.active = false;
        // this.data.push({ name: "艺术品", value: 3 });
        // this.data.push({ name: "图腾", value: 2 });
        // this.data.push({ name: "装备", value: 1 });
        // this.data.push({ name: this.curTxt, value: 0 });
        this.labCurTxt.string = this.curTxt;
        this.selected = this.data[0];
        this.node.on("itemClick", this.onItemClick, this);
        this.btnList.removeAllChildren();
        for (let i = 0; i < this.data.length; i++) {
            let btn = instantiate(this.btnTmp);
            if (!!btn) {
                btn.getComponent(ComboItem)?.setData(this.data[i]);
                this.btnList.addChild(btn);
            }
        }
    }

    setCurTxt(name: string) {
        this.curTxt = name;
        this.labCurTxt.string = this.curTxt;
    }

    closeList() {
        this.btnList.active = false;
    }

    showList() {
        this.btnList.active = true;
    }

    checkList() {
        this.btnList.active = !this.btnList.active;
    }

    onDestroy() {
        this.node.off("itemClick", this.onItemClick, this);
    }

    showBtnList() {
        this.showList();
    }

    onItemClick(event: ComboItemEvent) {
        event.propagationStopped = true;
        this.closeList();
        if (this.changeName == true) {
            this.labCurTxt.string = event.data.name;
            if (this.selected.value != event.data) {
                this.selected = event.data;
                if (!!this.onChanage) this.onChanage(this.selected);
            }
        }else{
            this.selected = event.data;
            if (!!this.onChanage) this.onChanage(this.selected);
        }

    }

    onClick() {
        this.checkList();
    }
}
