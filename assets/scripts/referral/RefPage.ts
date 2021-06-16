
import { _decorator, Component, Node, PageView, ProgressBar, Label, Prefab, resources, instantiate } from 'cc';
import { BaseComponent } from '../BaseComponent';
import { RefReward } from './RefReward';
import Web3 from "web3/dist/web3.min.js";
const { ccclass, type } = _decorator;
const { toWei, fromWei, toBN } = Web3.utils;



@ccclass('RefPage')
export class RefPage extends BaseComponent {

    @type(PageView)
    rewardList: PageView;

    @type(ProgressBar)
    curLevel: ProgressBar;

    @type(Label)
    labComm: Label;

    @type(Node)
    btnCreate: Node;

    @type(Node)
    codeNode: Node;
    @type(Label)
    labCode: Label;

    @type(PageView)
    levelPageView: PageView;

    refData: any = {};
    refCode: string = "";

    constructor() {
        super();
        this.rewardList = new PageView();
        this.curLevel = new ProgressBar();
        this.labComm = new Label();
        this.btnCreate = new Node();
        this.labCode = new Label();
        this.codeNode = new Node();
        this.levelPageView = new PageView();
    }

    onLoad() {
        super.onLoad();
        this._loadConfig();
    }

    private _loadConfig() {
        this.levelPageView.removeAllPages();
        let ps: Promise<any>[] = [];
        ps.push(this.callContract("Referral", "getAllRefConfig"));
        ps.push(this.callContract("Referral", "getReferral", this.api?.curAccount));
        ps.push(this.callContract("Referral", "refConfigCount"));
        Promise.all(ps).then(values => {
            // console.log(values);
            //奖励配置
            let configs = values[0];
            //邀请人数据
            this.refData = values[1];
            resources.load("component/RefReward", Prefab, (err, prefab) => {
                configs.forEach((config: any) => {
                    let item = instantiate(prefab);
                    if (!!item) {
                        item.getComponent(RefReward)?.setData(config, this.refData);
                        this.levelPageView.addPage(item);
                    }
                });
            });
            //当前等级
            let maxConfig = parseInt(values[2]);
            this.curLevel.totalLength = maxConfig;
            this.curLevel.progress = parseInt(this.refData.level) / maxConfig;
            let labLevel = this.curLevel.getComponentInChildren(Label);
            if (!!labLevel) {
                labLevel.string = `${this.refData.level}/${this.curLevel.totalLength}`;
            }
            //已经获得的佣金
            this.labComm.string = fromWei(this.refData.amount, "ether");
            //邀请码/创建邀请码
            this._showCode();
        });
    }

    private _showCode() {
        //邀请码/创建邀请码
        if (this.refData.user == "0x0000000000000000000000000000000000000000") {
            this.btnCreate.active = true;
            this.codeNode.active = false;
        } else {
            this.btnCreate.active = false;
            this.codeNode.active = true;
            this.labCode.string = toBN(this.refData.user.substr(0, 10)).toString();
        }
    }

    onPrevPage() {
        let index = this.levelPageView.getCurrentPageIndex();
        if (index > 0) {
            this.levelPageView.scrollToPage(index - 1);
        }
    }

    onNextPage() {
        let count = this.levelPageView.getPages().length;
        let index = this.levelPageView.getCurrentPageIndex();
        if (index < count - 1) {
            this.levelPageView.scrollToPage(index + 1);
        }
    }

    onCreate() {
        if (!this.refData || this.refData.user == "0x0000000000000000000000000000000000000000") {
            this.sendContract("Referral", "create", 0, { from: this.api?.curAccount })
                .then(value => {
                    this.showAlert("成功创建邀请码!");
                    this.refData = Object.assign({}, this.refData);
                    this.refData.user = this.api?.curAccount;
                    this._showCode();
                });
        }
    }


    onCopyCode() {
        this.refCode = this.labCode.string;
        document.addEventListener('copy', this.handleCopy.bind(this));
        document.execCommand('copy');
        this.showAlert("已复制邀请码!");
    }

    handleCopy(e: ClipboardEvent) {
        e.clipboardData && e.clipboardData.setData('text/plain', this.refCode);
        e.preventDefault();
        document.removeEventListener('copy', this.handleCopy.bind(this));
    };
}

