
import { _decorator, Component, Node, director, Toggle, Color, Label, EditBox, Button, resources, instantiate, Prefab, EventHandler, math, Sprite, SpriteFrame, color, sys } from 'cc';
const { ccclass, type } = _decorator;
import { BOX_CACHE_KEY, Constant, CONSUMABLES_CACHE_KEY } from "./Constant";
import { BaseComponent } from './BaseComponent';
import { MyButton } from './MyButton';
import Web3 from "web3/dist/web3.min.js";
import { ComboBox } from './ComboBox';

const { padLeft, toHex, toBN } = Web3.utils;

@ccclass('Store')
export class Store extends BaseComponent {


    @type(Node)
    aBtns: Node;

    @type(Node)
    bBtns: Node;

    @type(Node)
    confirmWin: Node;

    @type(EditBox)
    amountInput: EditBox;

    @type(Label)
    buyAmount: Label;

    @type(Label)
    balanceAmount: Label;

    @type(Label)
    buyCount: Label;

    @type(SpriteFrame)
    btnBG1: SpriteFrame;
    @type(SpriteFrame)
    btnBG2: SpriteFrame;

    @type(ComboBox)
    combox: ComboBox;

    unitPrice: any = toBN(0);
    userBalance: any = toBN(0);
    goods: any | null = null;
    goodsObj: any | null = null;

    amount: number = 0;
    approveAmount: any = toBN(0);


    _reg = new RegExp("^[0-9]*$");

    constructor() {
        super();
        this.aBtns = new Node();
        this.bBtns = new Node();
        this.confirmWin = new Node();

        this.amountInput = new EditBox();
        this.buyAmount = new Label();
        this.balanceAmount = new Label();
        this.buyCount = new Label();
        this.btnBG1 = new SpriteFrame();
        this.btnBG2 = new SpriteFrame();
        this.combox = new ComboBox();
    }


    onLoad() {
        super.onLoad();
        this.aBtns.active = true;
        this.bBtns.active = false;
        this.confirmWin.active = false;
        this.combox.onChanage = this.onComboBoxChange.bind(this);
        //加载商品列表
        this._loadGoodsList();
        //加载买币入口
        this._loadCoinEnter();
    }

    onDestroy() {
        this.combox.onChanage = null;
    }

    private _loadCoinEnter() {
        this.combox.data = [];
        Constant.coinMarket.forEach((item, i) => {
            this.combox.data.push({ name: item.name, value: item.url });
        });
        this.combox.onLoad();
    }

    onComboBoxChange(data: any) {
        console.log(data);
        sys.openURL(data.value);
    }

    _loadGoodsList() {
        resources.load("component/GoodsItemBtn", Prefab, (err, prefab) => {
            Constant.store.LGC.forEach(item => {
                // console.log(item);
                let btnPre = instantiate(prefab);
                let btn = btnPre.getComponent(Button);
                let spriteName = btnPre.getChildByName("SpriteName")?.getComponent(Sprite);
                let spriteIcon = btnPre.getChildByName("SpriteIcon")?.getComponent(Sprite);
                btn?.node.on("click", () => { this.onSelect(item); });
                if (!!spriteName)
                    this.loadSpriteUrl(`img/${item.name}`, spriteName);
                if (!!spriteIcon)
                    this.loadSpriteUrl(`props/${item.img}`, spriteIcon);
                this.aBtns.addChild(btnPre);
            });
            Constant.store.USDT.forEach(item => {
                let btnPre = instantiate(prefab);
                let btn = btnPre.getComponent(Button);
                let spriteName = btnPre.getChildByName("SpriteName")?.getComponent(Sprite);
                let spriteIcon = btnPre.getChildByName("SpriteIcon")?.getComponent(Sprite);
                btn?.node.on("click", () => { this.onSelect(item); });
                if (!!spriteName)
                    this.loadSpriteUrl(`img/${item.name}`, spriteName);
                if (!!spriteIcon)
                    this.loadSpriteUrl(`props/${item.img}`, spriteIcon);
                this.bBtns.addChild(btnPre);
            });
        });
    }

    update(t: Number) {
        if (this.amount > 0) {
            this.amountInput.string = this.amount.toString();
        } else {
            this.amountInput.string = "";
        }

    }

    onClose() {
        director.loadScene("Main");
    }

    _showBtns(index: Number) {
        this.aBtns.active = false;
        this.bBtns.active = false;
        switch (index) {
            case 0:
                this.aBtns.active = true;
                break;
            case 1:
                this.bBtns.active = true;
                break;
        }
    }

    onTabcheck(target: Toggle) {
        let index = this._checkTab(target);
        this._showBtns(index);
    }

    _checkTab(target: Toggle): Number {
        let index = 0;
        target.node.parent?.children.forEach((item, i) => {
            let label = item.getComponentInChildren(Label);
            if (label) {
                if (item == target.node) {
                    label.color = Color.WHITE;
                    index = i;
                } else {
                    let c = new Color();
                    c.fromHEX("#a88655");
                    label.color = c;
                }
            }
        });
        return index;
    }

    onConfirmWinClose() {
        this.confirmWin.active = false;
    }

    _showConfirm(goods: any) {
        let topImg = this.confirmWin.getChildByPath("content/box/top/TopImg")?.getComponent(Sprite) ?? new Sprite();
        let btnApprove = this.confirmWin.getChildByPath("content/box/btns/BtnApprove")?.getComponent(Button) ?? new Button();
        let btnBuy = this.confirmWin.getChildByPath("content/box/btns/BtnBuy")?.getComponent(Button) ?? new Button();
        let explain = this.confirmWin.getChildByPath("content/box/top/topExplain/Explain")?.getComponent(Label) ?? new Label();
        let confirmWinTitle = this.confirmWin.getChildByName("title")?.getComponent(Label) ?? new Label();
        let labNote = this.confirmWin.getChildByPath("content/LabNote")?.getComponent(Label) ?? new Label();

        this.confirmWin.active = true;
        this.goodsObj = goods;
        explain.string = this.goodsObj.desc;
        this._checkCoin(btnApprove, btnBuy, this.goodsObj);

        labNote.string = this.goodsObj.note;
        this.loadSprite(this.goodsObj.img, topImg);
        confirmWinTitle.string = this.goodsObj.name;
        this._loadBalance(this.goodsObj.coin);
        this._loadGoodsInfo();
    }

    _checkCoin(btnApprove: Button, btnBuy: Button, goods: any) {
        if (goods.coin == "LGC") {
            btnBuy.normalSprite = this.btnBG1;
            btnBuy.pressedSprite = this.btnBG2;
            btnBuy.hoverSprite = this.btnBG2;
            btnApprove.node.active = false;

        } else {
            btnApprove.node.active = true;
            //获取授权金额
            this.callContract(goods.coin, "allowance", this.api?.curAccount, Constant.address.Store).then(amount => {
                this.approveAmount = toBN(amount);
                this._checkApprove();
            });
        }
    }

    async _loadBalance(coin: string) {
        // console.log(coin);
        this.callContract(coin, "balanceOf", this.api?.curAccount)
            .then((result) => {
                this.userBalance = Web3.utils.toBN(result);
                this.balanceAmount.string = Web3.utils.fromWei(result, "ether").toString() + " " + coin;
            });
    }

    async _loadGoodsInfo() {
        let result = await this.callContract("Store", "goods", this.goodsObj.goodsId).catch((reason: any) => {
            console.log(reason);
        });
        if (!!result) {
            this.goods = result;
            this.unitPrice = Web3.utils.toBN(result.unitPrice);
            let amount = this.unitPrice.mul(Web3.utils.toBN(this.amount));
            // console.log(amount.toString());
            this.buyAmount.string = Web3.utils.fromWei(amount, "ether").toString() + " " + this.goodsObj.coin;
            this.buyCount.string = (this.goods.quantityCount - this.goods.quantitySold) + "/" + this.goods.quantityCount;
        }
    }

    onSelect(goods: any) {
        this._showConfirm(goods);
    }

    _showBuyAmount() {
        let amount = this.unitPrice.mul(toBN(this.amount));
        this.buyAmount.string = Web3.utils.fromWei(amount, "ether").toString() + " " + this.goodsObj.coin;
        if (this.goodsObj.coin != "LGC")
            this._checkApprove();
    }

    _calcMax() {
        let max = this.userBalance.div(this.unitPrice).toNumber();
        let max2 = this.goods.quantityCount - this.goods.quantitySold;
        return Math.min(max, max2);
    }

    onAmountAdd() {
        if (this.amount < this._calcMax()) {
            this.amount += 1;
            this._showBuyAmount();
        }
    }

    onAmountSub() {
        if (this.amount > 0) {
            this.amount -= 1;
            this._showBuyAmount();
        }
    }

    onMax() {
        // 计算max
        if (this.unitPrice.gt(0)) {
            this.amount = this._calcMax();
            this._showBuyAmount();
        }
    }

    onAmountChange(data: string) {
        if (this._reg.test(data)) {
            this.amount = Number.parseInt(data);
            this._showBuyAmount();
        }
    }

    _checkApprove() {
        let btnApprove = this.confirmWin.getChildByPath("content/box/btns/BtnApprove")?.getComponent(Button) ?? new Button();
        let btnBuy = this.confirmWin.getChildByPath("content/box/btns/BtnBuy")?.getComponent(Button) ?? new Button();

        let amount = this.unitPrice.mul(toBN(this.amount));
        if (this.approveAmount.gte(amount)) {
            btnApprove.normalSprite = this.btnBG2;
            btnApprove.pressedSprite = this.btnBG1;
            btnApprove.hoverSprite = this.btnBG1;

            btnBuy.normalSprite = this.btnBG1;
            btnBuy.pressedSprite = this.btnBG2;
            btnBuy.hoverSprite = this.btnBG2;
        } else {
            btnApprove.normalSprite = this.btnBG1;
            btnApprove.pressedSprite = this.btnBG2;
            btnApprove.hoverSprite = this.btnBG2;

            btnBuy.normalSprite = this.btnBG2;
            btnBuy.pressedSprite = this.btnBG1;
            btnBuy.hoverSprite = this.btnBG1;
        }
    }

    async onApprove() {
        let amount = this.unitPrice.mul(toBN(this.amount));
        this.sendContract(this.goodsObj.coin, "approve", Constant.address.Store, amount, { from: this.api?.curAccount })
            .then(result => {
                this.approveAmount = amount;
                this._checkApprove();
            });
    }

    async onBuy() {
        if (this.amount < 1) {
            this.showAlert("请输入数量!");
            return;
        }
        let amount = this.unitPrice.mul(toBN(this.amount));
        if (this.goodsObj.coin == "LGC") {
            let data = padLeft(toHex(8), 2) + padLeft(toHex(this.goodsObj.goodsId).substr(2), 64) + padLeft(toHex(this.amount).substr(2), 64);
            // console.log(data);
            this.sendContract("LGC", "transferAndCall", Constant.address.Store, amount, data, { from: this.api?.curAccount })
                .then(result => {
                    this.showAlert("成功购买了" + this.amount + "个[" + this.goodsObj.name + "]", () => {
                        this._loadBalance(this.goodsObj.coin);
                        this._loadGoodsInfo();
                        if (this.goodsObj.goodsId == 9) {
                            // console.log("this.goodsObj.goodsId ",typeof(this.goodsObj.goodsId));
                            localStorage.removeItem(CONSUMABLES_CACHE_KEY);
                        }
                        else
                            localStorage.removeItem(BOX_CACHE_KEY);
                    });
                });
        } else {
            if (this.approveAmount.gte(amount)) {
                this.sendContract("Store", "buy", this.goodsObj.goodsId, this.amount, { from: this.api?.curAccount })
                    .then(result => {
                        this.showAlert("成功购买了" + this.amount + "个[" + this.goodsObj.name + "]", () => {
                            this._loadBalance(this.goodsObj.coin);
                            this._loadGoodsInfo();
                            if ([1, 2].indexOf(this.goodsObj.goodsId) > -1) {
                                localStorage.removeItem(CONSUMABLES_CACHE_KEY);
                            }
                            else
                                localStorage.removeItem(BOX_CACHE_KEY);
                            this.approveAmount = this.approveAmount.sub(amount);
                        });
                    });
            } else {
                this.showAlert("授权金额不足，请先授权！");
            }

        }
    }

}
