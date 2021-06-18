
import { _decorator, Component, Node, PageView, Toggle, Label, Color } from 'cc';
import { BaseComponent } from '../BaseComponent';
const { ccclass, type } = _decorator;

@ccclass('Referral')
export class Referral extends BaseComponent {

    @type(Node)
    page1: Node;

    @type(Node)
    page2: Node;

    @type(Node)
    helpWin: Node;

    constructor() {
        super();
        this.page1 = new Node();
        this.page2 = new Node();
        this.helpWin = new Node();
    }

    onLoad() {
        super.onLoad();
        this.page1.active = true;
        this.page2.active = false;
    }

    onCloseWin() {
        this.loadScene("Main");
    }

    _checkTab(target: Toggle): Number {
        let index = 0;
        target.node.parent?.children.forEach((item, i) => {
            let label = item.getComponentInChildren(Label);
            if (label) {
                if (item == target.node) {
                    label.color = Color.WHITE;
                    index = i;
                } else {
                    let c = new Color();
                    c.fromHEX("#a88655");
                    label.color = c;
                }
            }
        });
        return index;
    }

    onTabChange(data: Toggle) {
        let index = this._checkTab(data);
        switch (index) {
            case 0:
                this.page1.active = true;
                this.page2.active = false;
                break;
            case 1:
                this.page1.active = false;
                this.page2.active = true;
                break;
        }
    }

    onOpenHelp() {
        this.helpWin.active = true;
    }

    onCloseHelp() {
        this.helpWin.active = false;
    }

}

