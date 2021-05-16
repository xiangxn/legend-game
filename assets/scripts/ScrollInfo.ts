
import { _decorator, Component, Node, Prefab, instantiate, RichText, Vec2, UITransform, Vec3 } from 'cc';
import { Constant } from './Constant';
import { OpenInfo } from './entitys/Props';
const { ccclass, type } = _decorator;



@ccclass('ScrollInfo')
export class ScrollInfo extends Component {

    @type(Prefab)
    itemPrefab: Prefab;

    infos: OpenInfo[] = [];
    speed: number = 2;
    delay: number = 6;
    isScroll: boolean = false;
    curTime: number = 0;
    curScroll: number = 0;

    constructor() {
        super();
        this.itemPrefab = new Prefab();
    }

    onLoad() {
        // this._createItems();
    }

    _createItems() {
        this.node.removeAllChildren();
        this.infos.forEach((info, index) => {
            this._createItem(info);
        });
    }

    _createItem(info: OpenInfo) {
        let item = instantiate(this.itemPrefab);
        let txt = item.getComponentInChildren(RichText) ?? new RichText();
        if (!!info.props) {
            let color = Constant.qualityColor[info.props.info.quality];
            let addr = info.address?.substr(0, 6) + "..." + info.address?.substr(-4);
            txt.string = "<color=#000000>" + info.time + " 恭喜 " + addr + " 获得了 </color><color=" + color + ">" + info.props.name + "</color>";
            this.node.addChild(item);
            info.uuid = item.uuid;
        } else if (!!info.address) {
            txt.string = info.address;
            this.node.addChild(item);
            info.uuid = item.uuid;
        }
        return info;
    }

    pushItem(item: OpenInfo) {
        if (this.infos.length > 20) {
            let info = this.infos.shift();
            if (!!info) {
                let tmp = this.node.getChildByUuid(info?.uuid);
                if (!!tmp)
                    this.node.removeChild(tmp)
            }
        }
        // console.log("this.infos: ", this.infos.length);
        let info = this._createItem(item);
        this.infos.push(info);
    }

    moveItem() {
        let allItem = this.node.children;
        let itemCount = allItem.length;
        if (itemCount < 2) return;
        for (let i = 0; i < itemCount; i++) {
            let n = allItem[i];
            n.setPosition(new Vec3(n.position.x, n.position.y + this.speed, n.position.z));
        }
        let sn = allItem[0];
        let en = allItem[itemCount - 1];
        let height = sn.getComponent(UITransform)?.height ?? 0;
        let enHeight = en.getComponent(UITransform)?.height ?? 0;
        this.curScroll += this.speed;
        if (this.curScroll >= height) {
            this.isScroll = false;
            this.curTime = 0;
            this.curScroll = 0;
            let y = en.position.y - enHeight / 2 - height / 2;
            sn.setPosition(new Vec3(sn.position.x, y, sn.position.z));
            let item = allItem.shift();
            if (item) allItem.push(item);
        }
    }

    update(dt: number) {
        this.curTime += dt;
        if (this.isScroll) {
            this.moveItem();
        } else {
            if (this.curTime > this.delay) {
                this.isScroll = true;
                this.curTime = 0;
            }
        }
    }


}
