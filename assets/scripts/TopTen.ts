
import { _decorator, Component, Node } from 'cc';
import { BaseComponent } from './BaseComponent';
import { FixedScrollView } from './SpuerScrollView/FixedScrollView';
const { ccclass, type } = _decorator;

@ccclass('TopTen')
export class TopTen extends BaseComponent {

    @type(FixedScrollView)
    fixedScrollView: FixedScrollView;

    constructor() {
        super()
        this.fixedScrollView = new FixedScrollView();
    }

    onLoad() {
        super.onLoad();
        this.fixedScrollView.init({
            onItemClick: this.onChooseItem.bind(this)
        });
        this._loadData();
    }

    private async _loadData() {
        // console.log(this.api?.curAccount);
        let data: any = await this.api?.getTopTen();
        // console.log("data: ", data);
        let info = await this.callContract("Hero", "getHeroInfo", this.api?.curAccount);
        // console.log("info: ", info);
        let meIn = false;
        if (!!data) {
            data = data.map((item: any, i: number) => {
                item.number = i + 1;
                if (item.address == this.api?.curAccount) {
                    item.isMe = true;
                    meIn = true;
                }
                return item;
            });
            if (meIn == false) {
                data.push({
                    address: this.api?.curAccount,
                    name: info.attrs.name,
                    number: "?",
                    power: parseInt(info.attrs.power),
                    profession: parseInt(info.attrs.profession),
                    isMe: true
                });
                // console.log("data: ", data);
            }
            this.fixedScrollView.setData(data);
        }
    }

    onChooseItem(item: any) {
        console.log(item);
    }

    onClose() {
        this.node.active = false;
    }

}

