
import { _decorator, Component, Node, Label, Prefab, Layout, instantiate, resources, find } from 'cc';
const { ccclass, type } = _decorator;
import { Props } from './entitys/Props';
import { PropsList } from './PropsList';

@ccclass('ChooseWin')
export class ChooseWin extends Component {
    @type(Label)
    chooseTitle: Label;

    @type(PropsList)
    propsList: PropsList;

    @type(Node)
    chooseBtn: Node;

    title: string = "选择装备";

    onCloseEvent: Function | null = null;
    onChooseEvent: Function | null = null;
    isSingleChoice: boolean = true;

    constructor() {
        super();
        this.chooseTitle = new Label();
        this.propsList = new PropsList();
        this.chooseBtn = new Node();
    }

    onLoad() {
        this.propsList.isSingleChoice = this.isSingleChoice;
        this.propsList.onChooseEvent = this.onChooseItem.bind(this);
    }

    start() {
        this.chooseTitle.string = this.title;
        if (this.isSingleChoice) {
            this.chooseBtn.active = false;
        } else {
            this.chooseBtn.active = true;
        }
    }

    setNoDataMsg(msg: string | null = null) {
        this.propsList.noDataMsg = msg;
    }

    setData(data: Props[]) {
        this.propsList.setData(data);
    }

    onClose() {
        this.node.active = false;
        if (this.onCloseEvent) {
            this.onCloseEvent();
        }
    }

    getCurrentChoose() {
        return Array.from(this.propsList.currentChoose);
    }

    onChooseItem(data: Props) {
        if (data) {
            if (this.isSingleChoice) {
                if (this.onChooseEvent) {
                    if (this.onChooseEvent(data))
                        this.node.active = false;
                }
            }
        }
    }

    onChoose() {
        this.node.active = false;
        if (this.onChooseEvent) this.onChooseEvent(Array.from(this.propsList.currentChoose));
    }

    static show(isSingleChoice: boolean = true, noDataMsg: string = "没有数据", title: string = ""): Promise<ChooseWin> {
        let parent = find("Canvas") ?? new Node();
        return new Promise((resolve, reject) => {
            resources.load("component/chooseWin", Prefab, (err, prefab) => {
                let win = instantiate(prefab);
                let cw = win.getComponent(ChooseWin);
                if (cw) {
                    if (!!title) cw.title = title;
                    cw.isSingleChoice = isSingleChoice;
                    cw.setNoDataMsg(noDataMsg);
                    parent?.addChild(win);
                    resolve(cw);
                } else {
                    reject(err);
                }
            });
        });
    }

}
