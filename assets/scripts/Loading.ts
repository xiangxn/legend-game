
import { _decorator, Component, Node, Label, resources, instantiate, Prefab } from 'cc';
const { ccclass, type } = _decorator;

@ccclass('Loading')
export class Loading extends Component {

    @type(Label)
    msg: Label;

    curTime: number = 0;

    points: number = 0;

    constructor() {
        super();
        this.msg = new Label();
    }

    update(deltaTime: number) {
        this.curTime += deltaTime;
        if (this.curTime > 1) {
            this.curTime = 0;
            this.points += 1;
        }
        if (this.points >= 6) {
            this.points = 0;
        }
        let p = ".";
        for (let i = 0; i < this.points; i++) {
            p += ".";
        }
        this.msg.string = "loading" + p;
    }

    close() {
        this.node?.parent?.removeChild(this.node);
    }


    static show(parent: Node): Promise<Loading> {
        if (parent) {
            return new Promise((resolve, reject) => {
                resources.load("component/Loading", Prefab, (err, prefab) => {
                    let win = instantiate(prefab);
                    let logic = win.getComponent(Loading);
                    if (logic) {
                        // console.log(logic.node);
                        logic.msg.string = "loading ";
                        parent.addChild(win);
                        resolve(logic);
                    } else {
                        reject();
                    }
                });
            });
        }
        return Promise.reject();
    }
}

