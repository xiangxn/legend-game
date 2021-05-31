
import { _decorator, Component, Node, Toggle, Label, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TabBar')
export class TabBar extends Component {

    onChanage: Function | null = null;

    checkTab(target: Toggle) {
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
        if (!!this.onChanage) this.onChanage(index);
    }
}

