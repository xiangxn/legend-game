
import { _decorator, Component, Node, Layout, Prefab, instantiate, EventTouch, UITransform, ScrollView, Label } from 'cc';
import { BaseComponent } from './BaseComponent';
import { Props } from './entitys/Props';
import { PropsItem } from './PropsItem';
import { FixedScrollView } from './SpuerScrollView/FixedScrollView';
const { ccclass, type } = _decorator;

@ccclass('PropsList')
export class PropsList extends BaseComponent {


    @type(FixedScrollView)
    fixedScrollView: FixedScrollView;

    @type(Label)
    noData: Label;

    isSingleChoice: boolean = true;
    currentChoose: Set<Props> = new Set<Props>();
    onChooseEvent: Function | null = null;
    onDoubleEvent: Function | null = null;

    noDataMsg: string | null = null;
    defaultLoading: string = "加载中...";
    defaultNoData: string = "没有数据";

    constructor() {
        super();
        this.fixedScrollView = new FixedScrollView();
        this.noData = new Label();
    }

    onLoad() {
        this.noData.string = this.defaultLoading;
    }

    private _showNoData() {
        if (this.fixedScrollView.dataSet.length < 1) {
            this.noData.string = this.noDataMsg ?? this.defaultNoData;
        } else {
            this.noData.string = "";
        }
    }

    setIsSingleChoice(sc: boolean) {
        this.isSingleChoice = sc;
    }

    _show(data: Props[]) {
        // console.log("data:", data);
        this.fixedScrollView.init({
            onItemClick: this.onChooseItem.bind(this),
            onItemDoubleClick: this.onDoubleClick.bind(this)
        });
        this.fixedScrollView.setData(data);
        this._showNoData();
    }

    clear() {
        this.noData.string = this.defaultLoading;
        this.currentChoose.clear();
        this.fixedScrollView.content.removeAllChildren();
        this.fixedScrollView.content.setPosition(this.fixedScrollView.content.position.x, 0);
    }

    setData(data: Props[]) {
        this.clear();
        this._show(data);
    }

    _clearChoose(item: PropsItem) {
        let items = this.fixedScrollView.content.children;
        // console.log(items);
        for (let i = 0; i < items.length; i++) {
            let eItem = items[i].getComponent(PropsItem);
            if (item == eItem) continue;
            if (eItem)
                eItem.setIsSelect(false);

        }
    }

    onChooseItem(eItem: PropsItem) {
        // console.log(eItem,this.isSingleChoice);
        if (eItem && eItem.data) {
            if (this.isSingleChoice) {
                this._clearChoose(eItem);
                eItem.setIsSelect(!eItem.isSelect);
                this.currentChoose.clear();
                if (eItem.isSelect)
                    this.currentChoose.add(eItem.data);
                if (this.onChooseEvent) this.onChooseEvent(eItem.data);
            } else {
                eItem.setIsSelect(!eItem.isSelect);
                if (!eItem.isSelect) {
                    this.currentChoose.delete(eItem.data);
                } else {
                    this.currentChoose.add(eItem.data);
                }
                if (this.onChooseEvent) this.onChooseEvent(eItem.data);
            }
        }
    }

    onDoubleClick(eItem: PropsItem) {
        if (this.onDoubleEvent) this.onDoubleEvent(eItem.data);
    }

    onDestroy() {
        this.onChooseEvent = null;
        this.onDoubleEvent = null;
    }
}

