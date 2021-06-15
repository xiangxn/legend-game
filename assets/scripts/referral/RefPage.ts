
import { _decorator, Component, Node, PageView, ProgressBar, Label } from 'cc';
import { BaseComponent } from '../BaseComponent';
const { ccclass, type } = _decorator;

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

    onLoad(){
        super.onLoad();
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

    onCreate(){

    }

    onCopyCode(){

    }
}

