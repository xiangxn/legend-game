
import { _decorator, Component, Node, Layout, EditBox, Label, resources, Prefab, instantiate, Button } from 'cc';
import { BaseComponent } from '../BaseComponent';
import { RefUserReward } from './RefUserReward';
const { ccclass, type } = _decorator;

@ccclass('RefUserPage')
export class RefUserPage extends BaseComponent {

    @type(Layout)
    layoutReward: Layout;

    @type(EditBox)
    txtCode: EditBox;

    @type(Label)
    labBtn: Label;

    userData: any;

    constructor() {
        super();
        this.layoutReward = new Layout();
        this.txtCode = new EditBox();
        this.labBtn = new Label();
    }

    onLoad() {
        super.onLoad();
        this._loadData();
    }

    private _loadData() {
        //获取URL参数
        let code = this.getQueryString("ref");
        if (!code) code = "0";
        this.layoutReward.node.removeAllChildren();
        let ps: Promise<any>[] = [];
        ps.push(this.callContract("Referral", "getAllRefUserConfig"));
        ps.push(this.callContract("Referral", "getUser", this.api?.curAccount));
        ps.push(this.callContract("Referral", "refCode", code));
        Promise.all(ps).then(values => {
            // console.log(values);
            //奖励配置
            let configs = values[0];
            resources.load("component/RefUserReward", Prefab, (err, prefab) => {
                configs.forEach((config: any) => {
                    let item = instantiate(prefab);
                    if (!!item) {
                        item.getComponent(RefUserReward)?.setData(config, values[1]);
                        this.layoutReward.node.addChild(item);
                    }
                });
            });
            this.userData = values[1];
            //邀请码
            if (this.userData.parentCode == "0") {
                this.labBtn.string = "绑定";
                //邀请人为空
                if (values[2] == "0x0000000000000000000000000000000000000000") {
                    this.txtCode.string = "";
                } else {
                    this.txtCode.string = code ?? "";
                }
            } else {
                this.txtCode.string = this.userData.parentCode;
                this.labBtn.string = "已绑定";
                let btn = this.labBtn.node.parent?.getComponent(Button);
                if (!!btn) {
                    btn.interactable = false;
                }
            }
        });
    }

    onBind() {
        if (!!this.userData && this.userData.parentCode != "0") return;
        if (this.txtCode.string != "") {
            this.sendContract("Referral", "bind", this.txtCode.string, { from: this.api?.curAccount })
                .then(value => {
                    this._loadData();
                    this.showAlert("邀请码绑定成功!");
                });
        } else {
            this.showAlert("无效的邀请码!");
        }
    }
}