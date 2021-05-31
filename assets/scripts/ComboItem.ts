
import { _decorator, Component, Event, Label } from 'cc';
import { ComboItemEvent } from './events/ComboItemEvent';
const { ccclass, type } = _decorator;



@ccclass('ComboItem')
export class ComboItem extends Component {

    @type(Label)
    labName: Label;

    data: any;

    constructor() {
        super();
        this.labName = new Label();
    }

    setData(data: any) {
        this.data = data;
        this._show();
    }

    private _show() {
        this.labName.string = this.data.name;
    }

    onClick() {
        this.node.dispatchEvent(new ComboItemEvent("itemClick", this.data, true));
    }
}

