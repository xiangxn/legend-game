
import { _decorator, Component, Node, Prefab, resources, instantiate, find } from 'cc';
import { BaseComponent } from './BaseComponent';
import { FRIEND_CACHE_KEY } from './Constant';
import { FixedScrollView } from './SpuerScrollView/FixedScrollView';

const { ccclass, type } = _decorator;

@ccclass('FriendChoose')
export class FriendChoose extends BaseComponent {

    @type(FixedScrollView)
    scrollView: FixedScrollView;

    onChooseEvent: Function | null = null;

    constructor() {
        super();
        this.scrollView = new FixedScrollView();
    }

    onLoad() {
        super.onLoad();
        this.scrollView.init({ onItemClick: this.onItemClick.bind(this) });
        this._loadData();
    }

    private _loadData() {
        let list = this.loadFriends();
        if (!!list && list.length > 0) {
            this.scheduleOnce(() => { this.scrollView.setData(list); }, 1);
            return;
        }
        this.callContract("Friend", "getFriends", { from: this.api?.curAccount }).then(values => {
            let list = [];
            for (let i = 0; i < values.length; i++) {
                list.push(this.arrayToObject(values[i]));
            }
            localStorage.setItem(FRIEND_CACHE_KEY, JSON.stringify(list));
            this.scrollView.setData(list);
        })

    }

    onItemClick(data: any) {
        // console.log(data);
        if (this.onChooseEvent) this.onChooseEvent(data.data);
        this.onClose();
    }

    onClose() {
        this.node.active = false;
        this.getTopNode().removeChild(this.node);
    }

    static show(): Promise<FriendChoose> {
        let parent = find("Canvas");
        if (parent) {
            return new Promise((resolve, reject) => {
                resources.load("component/FriendChoose", Prefab, (err, prefab) => {
                    let win = instantiate(prefab);
                    let cw = win.getComponent(FriendChoose);
                    if (!!parent && !!cw) {
                        parent.addChild(win);
                        resolve(cw);
                    } else {
                        reject(err);
                    }
                });
            });
        }
        return Promise.reject();
    }
}
