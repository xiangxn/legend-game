
import { _decorator, Component, Node, Label, resources, instantiate, Prefab, Button, RichText } from 'cc';
const { ccclass, type } = _decorator;

@ccclass('AlertWin')
export class AlertWin extends Component {

    @type(Label)
    labelMsg: Label;

    @type(RichText)
    richMsg: RichText;

    @type(Node)
    btnApprove: Node;

    @type(Label)
    title: Label;

    msg: string = "";
    msgRich: string = "";
    onEventOk: Function | null = null;
    onEventApprove: Function | null = null;
    onEventCancel: Function | null = null;

    constructor() {
        super();
        this.labelMsg = new Label();
        this.richMsg = new RichText();
        this.btnApprove = new Node();
        this.title = new Label();
    }

    onClose() {
        this.node.active = false;
        this.labelMsg.string = "";
    }

    onOK() {
        this.onClose();
        if (this.node.parent) {
            this.node.parent.removeChild(this.node);
        }
        if (this.onEventOk) this.onEventOk(true);
    }

    onApprove() {
        if (this.onEventCancel) {
            this.onClose();
            this.onEventCancel();
        } else if (this.onEventApprove) this.onEventApprove();
    }

    onLoad() {
        if (this.onEventApprove != null || this.onEventCancel != null) {
            this.btnApprove.active = true;
        } else {
            this.btnApprove.active = false;
        }
    }

    start() {
        if (this.msgRich.length > 0) {
            this.richMsg.string = this.msgRich;
        } else {
            this.labelMsg.string = this.msg;
        }
    }

    static show(parent: Node, msg: string, title: string = "提示", okCallback: Function | null = null): void {
        if (parent) {
            resources.load("component/Alert", Prefab, (err, prefab) => {
                let win = instantiate(prefab);
                let logic = win.getComponent(AlertWin);
                if (logic) {
                    logic.msg = msg;
                    logic.title.string = title;
                    if (okCallback != null) logic.onEventOk = okCallback;
                }
                parent.addChild(win);
            });
        }
    }

    static showConfirm(parent: Node, msg: string, title: string = "提示", okCallback: Function | null = null, cancelCallback: Function | null = null): void {
        if (parent) {
            resources.load("component/Alert", Prefab, (err, prefab) => {
                let win = instantiate(prefab);
                let logic = win.getComponent(AlertWin);
                if (logic) {
                    logic.msg = msg;
                    logic.title.string = title;
                    let cancel = logic.btnApprove.getComponentInChildren(Label);
                    if (!!cancel) {
                        cancel.string = "取消";
                    }
                    if (okCallback != null) logic.onEventOk = okCallback;
                    if (!!cancelCallback) { logic.onEventCancel = cancelCallback; }
                }
                parent.addChild(win);
            });
        }
    }

    static showRichText(parent: Node, msg: string, title: string = "提示", okCallback: Function | null = null, approveCallback: Function | null = null): void {
        if (parent) {
            resources.load("component/Alert", Prefab, (err, prefab) => {
                let win = instantiate(prefab);
                let logic = win.getComponent(AlertWin);
                if (logic) {
                    logic.msgRich = msg;
                    logic.title.string = title;
                    if (approveCallback != null) logic.onEventApprove = approveCallback;
                    if (okCallback != null) logic.onEventOk = okCallback;
                }
                parent.addChild(win);
            });
        }
    }

}

