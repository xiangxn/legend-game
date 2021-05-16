
import { _decorator, Component, Node, SpriteFrame, Button } from 'cc';
const { ccclass, type } = _decorator;

@ccclass('DCButton')
export class DCButton extends Component {

    //白色
    @type(SpriteFrame)
    btnBG1: SpriteFrame;
    //黄色
    @type(SpriteFrame)
    btnBG2: SpriteFrame;

    isWhite: boolean = true;

    constructor() {
        super();
        this.btnBG1 = new SpriteFrame();
        this.btnBG2 = new SpriteFrame();
    }

    setTheme(isWhite: boolean = true) {
        this.isWhite = isWhite
        let btn = this.node.getComponent(Button);
        if (!!btn) {
            if (this.isWhite) {
                btn.normalSprite = this.btnBG1;
                btn.pressedSprite = this.btnBG2;
                btn.hoverSprite = this.btnBG2;
            } else {
                btn.normalSprite = this.btnBG2;
                btn.pressedSprite = this.btnBG1;
                btn.hoverSprite = this.btnBG1;
            }
        }
    }
}
