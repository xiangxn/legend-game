
import { _decorator, Component, Node, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('People')
export class People extends Component {


    audios: AudioSource[];

    onLoad(){
        this.audios = this.node.getComponents(AudioSource);
    }

    public playDeath(tag: number) {
        this.audios[0].play();
    }

    public playUnderAttack() {
        this.audios[1].play();
    }

    public onAttackEnd() {
        this.node.emit("onAttackEnd");
    }

    public onAttacked() {
        this.node.emit("onAttacked");
    }

}

