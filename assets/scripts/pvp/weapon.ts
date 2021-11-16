
import { _decorator, Component, Node, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

 
@ccclass('Weapon')
export class Weapon extends Component {
    
    onAttack(tag:number){
        // console.log(tag);
        const m = this.node.getComponent(AudioSource);
        m.play();
    }
}

