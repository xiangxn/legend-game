
import { _decorator, Component, Node, director, ScrollView, EditBox } from 'cc';
import { BaseComponent } from './BaseComponent'
import { FRIEND_CACHE_KEY } from './Constant';
import { FixedScrollView } from './SpuerScrollView/FixedScrollView';

const { ccclass, type } = _decorator;



@ccclass('Friend')
export class Friend extends BaseComponent {

    @type(FixedScrollView)
    scrollView: FixedScrollView;

    @type(Node)
    addWin: Node;

    @type(EditBox)
    editName: EditBox;

    @type(EditBox)
    editAddr: EditBox;

    constructor() {
        super();
        this.scrollView = new FixedScrollView();
        this.addWin = new Node();
        this.editName = new EditBox();
        this.editAddr = new EditBox();
    }

    onLoad() {
        super.onLoad();
        this.addWin.active = false;
        this.scrollView.init({ onItemLongTouch: this.onItemLongTouch.bind(this) });
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

    onItemLongTouch(item: any) {
        // console.log("data:", item.data);
        this.showConfirm("你确认要删除[" + item.data.name + "]吗?", () => {
            this.sendContract("Friend", "remove", item.data.user).then(val => {
                this.showAlert("删除成功!");
                localStorage.removeItem(FRIEND_CACHE_KEY);
                this._loadData();
            });
        }, () => { });
    }

    onClose() {
        director.loadScene("Main");
    }

    onAdd() {
        this.addWin.active = true;
    }

    onAddWinClose() {
        this.addWin.active = false;
        this.editAddr.string = "";
        this.editName.string = "";
    }

    onAddFriendOK() {
        if (this.editName.string.length < 1) {
            this.showAlert("请输入备注名!");
            return;
        }
        if (this.editAddr.string.length < 1) {
            this.showAlert("请输入好友钱包地址!");
            return;
        }
        if (this.editAddr.string.indexOf("0x") != 0 || this.editAddr.string.length != 42) {
            this.showAlert("钱包地址无效!");
            return;
        }
        this.sendContract("Friend", "insert", {
            "keyIndex": 0,
            "user": this.editAddr.string,
            "name": this.editName.string
        }, { from: this.api?.curAccount }).then(value => {
            this.showAlert("添加成功!");
            localStorage.removeItem(FRIEND_CACHE_KEY);
            this.onAddWinClose();
            this._loadData();
        });
    }
}

