
import { _decorator, Component, Node, Button, Color, Label } from 'cc';
const { ccclass, type } = _decorator;

@ccclass('MyBotton')
export class MyButton extends Button {

    @type(Color)
    hoverLabelColor;

    labelColor;

    label: Label | null = null;

    constructor() {
        super();
        this.hoverLabelColor = new Color();
        this.labelColor = new Color();
    }

    onLoad() {
        if (this.interactable) {
            this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseMoveIn, this);
            this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseMoveOut, this);
            this.node.on(Node.EventType.MOUSE_UP, this.onMouseMoveIn, this);
            this.node.on(Node.EventType.TOUCH_START, this.onMouseMoveIn, this);
            this.node.on(Node.EventType.TOUCH_END, this.onMouseMoveOut, this);

            this.label = this.getComponentInChildren(Label);
            if (this.label) {
                this.labelColor = this.label.color.clone();
            }
        }
    }

    onMouseMoveIn(event: Event) {
        if (this.label) {
            this.label.color = this.hoverLabelColor;
        }
    }

    onMouseMoveOut(event: Event) {
        if (this.label) {
            this.label.color = this.labelColor;
        }
    }

    onDestroy() {
        if (this.interactable) {
            this.node.off(Node.EventType.MOUSE_ENTER, this.onMouseMoveIn, this);
            this.node.off(Node.EventType.MOUSE_LEAVE, this.onMouseMoveOut, this);
            this.node.off(Node.EventType.MOUSE_UP, this.onMouseMoveIn, this);
            this.node.off(Node.EventType.TOUCH_START, this.onMouseMoveIn, this);
            this.node.off(Node.EventType.TOUCH_END, this.onMouseMoveOut, this);
        }
    }
}
