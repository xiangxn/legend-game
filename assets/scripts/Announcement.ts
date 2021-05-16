
import { _decorator, Component, Node, director, assetManager, JsonAsset, Prefab, FixedJoint2D } from 'cc';
import { AnnDetail } from './AnnDetail';
import { Constant } from './Constant';
import { FixedScrollView } from './SpuerScrollView/FixedScrollView';
const { ccclass, type } = _decorator;

@ccclass('Announcement')
export class Announcement extends Component {

    @type(FixedScrollView)
    fixedScrollView: FixedScrollView;

    annList: any;

    constructor() {
        super();
        this.fixedScrollView = new FixedScrollView();
    }

    onLoad() {
        let url = Constant.annUrl + "?t=" + Date.now();
        assetManager.loadRemote(url, (err, jsonAsset: JsonAsset) => {
            if (!!err) {
                return;
            }
            // console.log("textAsset: ", )
            this.annList = jsonAsset.json;
            this.fixedScrollView.init({ onItemClick: this.onItemClick.bind(this) })
            this.fixedScrollView.setData(this.annList);
        });
    }

    onItemClick(data: any) {
        AnnDetail.show(data);
    }


    onClose() {
        director.loadScene("Main");
    }

}
