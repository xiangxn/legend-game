
import { _decorator, Component, Node, Label, find, resources, Prefab, instantiate, RichText } from 'cc';
const { ccclass, type } = _decorator;

@ccclass('AnnDetail')
export class AnnDetail extends Component {

    @type(Label)
    labTitle: Label;

    @type(RichText)
    labDetail: RichText;

    info: any;

    constructor() {
        super();
        this.labTitle = new Label();
        this.labDetail = new RichText();
    }

    onLoad() {
        if (!!this.info) {
            this.labTitle.string = this.info.title;
            this.labDetail.string = this.info.content;
        }
    }

    setInfo(info: any) {
        this.info = info;
    }

    onClose() {
        this.node.active = false;
        this.node.parent?.removeChild(this.node);
    }

    static show(info:any){
        let node = find("Canvas");
        if (!!node) {
            resources.load("component/AnnDetail", Prefab, (err, prefab) => {
                let win = instantiate(prefab);
                let logic = win.getComponent(AnnDetail);
                if (logic) {
                    logic.setInfo(info);
                    node?.addChild(win);
                }
            });
        }
    }
}

