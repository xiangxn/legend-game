
import { _decorator, Component, Node } from 'cc';
import { BaseComponent } from '../BaseComponent';
const { ccclass } = _decorator;


@ccclass('BaseItem')
export class BaseItem extends BaseComponent {
    eventListener: any;
    data: any;

    init(eventListener: any) {
        this.eventListener = eventListener;
    }

    setItem(data: any) {
        this.data = data;
    }
}
