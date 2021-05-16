
import { _decorator, Component, Node, Label } from 'cc';
import { BaseItem } from './SpuerScrollView/BaseItem';
const { ccclass, type } = _decorator;

@ccclass('AnnItem')
export class AnnItem extends BaseItem {

    @type(Label)
    labTitle: Label;

    @type(Label)
    labTime: Label;

    constructor() {
        super();
        this.labTitle = new Label();
        this.labTime = new Label();
    }

    onItemClick() {
        if (!!this.eventListener && !!this.eventListener.onItemClick) {
            this.eventListener.onItemClick(this.data);
        }
    }

    init(eventListener: any) {
        super.init(eventListener);
    }

    setItem(data: any) {
        super.setItem(data);
        this.labTitle.string = this.data.title;
        this.labTime.string = "[" + this.data.time + "]";
    }
}
