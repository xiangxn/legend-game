
import { _decorator, Component, Node, Label } from 'cc';
import { BaseItem } from './SpuerScrollView/BaseItem';

const { ccclass, type } = _decorator;

@ccclass('FriendItem')
export class FriendItem extends BaseItem {

    @type(Label)
    labName: Label;

    @type(Label)
    labAddress: Label;

    constructor() {
        super();
        this.labName = new Label();
        this.labAddress = new Label();
    }

    onLoad() {
        super.onLoad();
        this._show();
    }

    private _show() {
        if (!!this.data) {
            this.labName.string = this.data.name;
            this.labAddress.string = this.data.user;
        }
    }

    onLongTouch(event: Event) {
        if (this.eventListener.onItemLongTouch) this.eventListener.onItemLongTouch(this);
    }

    onClick(event: Event) {
        if (this.eventListener.onItemClick) this.eventListener.onItemClick(this);
    }

    onDestroy() {
        this.eventListener.onItemLongTouch = null;
        this.eventListener.onItemClick = null;
    }

    init(eventListener: any) {
        super.init(eventListener);
    }

    setItem(data: any) {
        super.setItem(data);
        this._show();
    }
}
