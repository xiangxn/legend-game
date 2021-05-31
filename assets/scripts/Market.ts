
import { _decorator, Component, Node, director } from 'cc';
import { BaseComponent } from './BaseComponent';
import { FilterProps } from './FilterProps';
import { FixedScrollView } from './SpuerScrollView/FixedScrollView';
import { TabBar } from './TabBar';
const { ccclass, type } = _decorator;

@ccclass('Market')
export class Market extends BaseComponent {

    @type(TabBar)
    tabBar: TabBar;

    @type(FixedScrollView)
    fixedScrollView: FixedScrollView

    @type(FilterProps)
    filterProps: FilterProps

    page: number = 1;
    pageSize: number = 20;

    constructor() {
        super();
        this.tabBar = new TabBar();
        this.fixedScrollView = new FixedScrollView();
        this.filterProps = new FilterProps();
    }

    onLoad() {
        super.onLoad();
        this.tabBar.onChanage = this.onTabBarChanage.bind(this);
        this.fixedScrollView.init({ onPullOff: this.onPullOff.bind(this), onDetail: this.onDetail.bind(this) })
        this.filterProps.onSelected = this.onFilterProps.bind(this);
        this.loadData();
    }

    onFilterProps(data: any[]) {
        this.loadData(data[0].value, data[1].value, data[2].value);
    }

    onDetail(data: any) {
        console.log(data);
    }

    onPullOff(data: any) {
        console.log(data);
    }

    async loadData(gclass: number = -1, profession: number = -1, category: number = -1) {
        let result: any = await this.api?.searchGoods(gclass, profession, category, this.page, this.pageSize);
        console.log(result)
        let list = [];
        if (!!result) {
            if (result.list.indexOf("[") == 0) {
                list = JSON.parse(result.list);
                list = list.map((item: any) => {
                    item.showPullOff = false;
                    return item;
                });
                this.fixedScrollView.setData(list);
            }
        }
    }

    onTabBarChanage(index: number) {
        console.log(index);
    }

    onClose() {
        director.loadScene("Main");
    }

    onDestroy() {
        this.tabBar.onChanage = null;
    }
}
