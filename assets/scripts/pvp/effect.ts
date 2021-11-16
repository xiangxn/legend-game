
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Effect')
export class Effect extends Component {

    onEffectEnd() {
        this.node.active = false;
    }

    onEffect() {
        this.node.active = true;
    }
}

