
import { _decorator, Component, Node, Label, EditBox, find, resources, instantiate, Prefab } from 'cc';
import { Constant } from './Constant';
const { ccclass, type } = _decorator;

@ccclass('AmountConfirm')
export class AmountConfirm extends Component {

    @type(Label)
    labTitle: Label;

    @type(Label)
    labMsg: Label;

    @type(Label)
    labBalance: Label

    @type(EditBox)
    editValue: EditBox;

    @type(Node)
    btnMax: Node;

    onOKCallback: Function | null = null;
    balance: number = 0;
    title: string = "请输入数量确认";

    constructor() {
        super();
        this.labTitle = new Label();
        this.labBalance = new Label();
        this.editValue = new EditBox();
        this.btnMax = new Node();
        this.labMsg = new Label();
    }

    onLoad() {
        this.labTitle.string = this.title;
        this.labBalance.string = this.balance.toString();
    }

    private _showValue(value: string) {
        if (value != "0")
            this.editValue.string = value;
        else
            this.editValue.string = "";
    }

    onMax() {
        this.editValue.string = this.balance.toString();
    }

    onOK() {
        if (!!this.onOKCallback) {
            let val = 0;
            try {
                val = parseInt(this.editValue.string);
            } catch { }
            this.onOKCallback(val);
        }
        this.onClose();
    }

    onClose() {
        this.node.active = false;
        this.node.parent?.removeChild(this.node);
    }

    onAmountChange(value: string) {
        if (Constant.intRegExp.test(value)) {
            this._showValue(value);
        }
    }

    setConfig(balance: number, title: string | null, showMaxBtn: boolean, msg: string | null = null) {
        this.balance = balance;
        if (!!title)
            this.title = title;
        this.btnMax.active = showMaxBtn;
        if (!!msg) {
            this.labMsg.node.active = true;
            this.labMsg.string = msg;
        } else {
            this.labMsg.node.active = false;
        }
    }

    static show(balance: number, title: string | null, onOKCallback: Function | null = null, showMaxBtn: boolean = false, msg: string | null = null): void {
        let node = find("Canvas");
        if (!!node) {
            resources.load("component/AmountConfirm", Prefab, (err, prefab) => {
                let win = instantiate(prefab);
                let logic = win.getComponent(AmountConfirm);
                if (logic) {
                    logic.setConfig(balance, title, showMaxBtn, msg);
                    logic.onOKCallback = onOKCallback;
                    node?.addChild(win);
                }
            });
        }
    }
}


