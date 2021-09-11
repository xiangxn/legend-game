
import { _decorator, Component, Node, director, Label, EditBox, ScrollView, find } from 'cc';
import Web3 from "web3/dist/web3.min.js";
import { AlertWin } from './AlertWin';
import { BaseComponent } from './BaseComponent';
import { Card } from './Card';
import { ComboBox } from './ComboBox';
import { Constant, EQUIPMENT_CACHE_KEY, CONSUMABLES_CACHE_KEY } from './Constant';
import { Props } from './entitys/Props';
import { FilterProps } from './FilterProps';
import { FragmentCard } from './FragmentCard';
import { PropsChooseWin } from './PropsChooseWin';
import { PropsItem } from './PropsItem';
import { FixedScrollView } from './SpuerScrollView/FixedScrollView';
import { TabBar } from './TabBar';
const { ccclass, type } = _decorator;
const { toBN, padLeft, toHex, fromWei, toWei } = Web3.utils;

@ccclass('Market')
export class Market extends BaseComponent {

    @type(TabBar)
    tabBar: TabBar;

    @type(FixedScrollView)
    fixedScrollView: FixedScrollView

    @type(FilterProps)
    filterProps: FilterProps

    @type(Node)
    btnPutOn: Node;
    @type(Node)
    putOnWin: Node;

    //上架信息********************

    @type(EditBox)
    txtAmount: EditBox;
    @type(EditBox)
    txtPrice: EditBox;
    @type(Label)
    labRate: Label;
    @type(Label)
    labValue: Label;
    @type(Label)
    labSymbol: Label;
    @type(ComboBox)
    btnCombo: ComboBox
    //结束上架信息********************

    page: number = 1;
    pageSize: number = 20;
    selectProps: any;
    //交易手续费
    marketFee: number = 20;
    currentTabIndex = 0;
    totalPage: number = 0;

    constructor() {
        super();
        this.tabBar = new TabBar();
        this.fixedScrollView = new FixedScrollView();
        this.filterProps = new FilterProps();
        this.btnPutOn = new Node();
        this.putOnWin = new Node();
        this.txtAmount = new EditBox();
        this.txtPrice = new EditBox();
        this.labRate = new Label();
        this.labValue = new Label();
        this.labSymbol = new Label();
        this.btnCombo = new ComboBox();
    }

    onLoad() {
        super.onLoad();
        this.putOnWin.active = false;
        this.btnPutOn.active = false;
        this.tabBar.onChanage = this.onTabBarChanage.bind(this);
        this.fixedScrollView.init({ onPullOff: this.onPullOff.bind(this), onDetail: this.onDetail.bind(this), onBuy: this.onBuy.bind(this) })
        this.fixedScrollView.eventSlideUp = this.onSlideUp.bind(this);
        this.filterProps.onSelected = this.onFilterProps.bind(this);
        this.btnCombo.onChanage = this.onComboBoxChange.bind(this);
        this._showNoData("加载中...");
        this.loadData();
        this.loadMarketFee();
    }

    async onSlideUp() {
        // console.log("上滑加载。。。。");
        if (this.page + 1 <= this.totalPage) {
            this.page++;
            let list = [];
            let data = this.filterProps.selected;
            switch (this.currentTabIndex) {
                case 0:
                    list = await this._loadData(data[0].value, data[1].value, data[2].value, data[3].value);
                    break;
                case 1:
                    list = await this._loadMyData(data[0].value, data[1].value, data[2].value, data[3].value);
                    break;
            }
            this.fixedScrollView.addData(list);
        }
    }

    async loadMarketFee() {
        let fee = await this.callContract("Market", "fee");
        this.marketFee = parseInt(fee);
    }

    private _showNoData(msg: string = "没有数据") {
        let node = this.node.getChildByPath("Window/Node/ScrollView/labNoData");
        if (!!node) {
            let lab = node.getComponent(Label) ?? new Label();
            lab.string = msg;
        }
    }

    onFilterProps(data: any[]) {
        this.page = 1;
        switch (this.currentTabIndex) {
            case 0:
                this.loadData(data[0].value, data[1].value, data[2].value, data[3].value);
                break;
            case 1:
                this.loadMyData(data[0].value, data[1].value, data[2].value, data[3].value);
                break;
        }
    }

    async onDetail(data: any) {
        // console.log(data);
        let sv = this.fixedScrollView.getComponent(ScrollView);
        let offset = sv?.getScrollOffset();
        if (data.gclass == 1) {
            let e = new Props();
            e.id = data.contentId;
            e.name = (Constant.equipments as any)[data.content.number.toString()];
            e.img = data.content.number.toString();
            e.amount = 1;
            e.info = data.content;
            Card.show(e, () => {
                if (!!offset && !!sv) {
                    sv.scrollToOffset(offset, 1);
                }
            });
        } else if (data.gclass == 2) {
            let bigType = toBN(data.contentId).shrn(248).toNumber();
            let smallType = toBN("0x" + padLeft(toHex(data.contentId), 64).substr(4, 16)).toNumber();
            let num = toBN("0x" + padLeft(toHex(data.contentId), 64).substr(20, 8)).toNumber();
            let tokens = await this.callContract("Fragment", "lockTokens", data.contentId);
            // tokens = toWei(tokens, "ether");
            let e = new Props();
            e.id = data.contentId;
            e.name = (Constant.totems as any)[smallType][0].replace("图腾", "碎片");
            e.img = bigType + "-" + smallType;
            e.amount = data.amount;
            e.info = { quality: 2, bigType: bigType, smallType: smallType, tokens: tokens, number: num };
            FragmentCard.show(e, () => {
                if (!!offset && !!sv) {
                    sv.scrollToOffset(offset, 1);
                }
            });
        }
    }

    onBuy(data: any) {
        console.log("onBuy: ", data);
        let name = "";
        if (data.gclass == 1) {
            name = (Constant.equipments as any)[data.content.number.toString()];
        } else if (data.gclass == 2) {
            let smallType = toBN("0x" + padLeft(toHex(data.contentId), 64).substr(4, 16)).toNumber();
            name = (Constant.totems as any)[smallType][0].replace("图腾", "碎片");
        }
        let price = fromWei(data.price, "ether");
        let symbol = (Constant.paymode as any)[data.payContract];
        let msg = `<color=#ffffff>兑换${data.amount}个${name}</color> <color=#EFD0A2>${price}</color> <color=#ffffff>${symbol}</color>`;
        if (symbol == "LGC") {
            AlertWin.showRichText(find("Canvas") ?? this.node, msg, "兑换", () => {
                let buyPars = this.api?.dataApi.eth.abi.encodeParameters(["uint8", "uint256"], [2, data._id]);
                this.sendContract("LGC", "transferAndCall", Constant.address.Market, data.price, buyPars)
                    .then((value: any) => {
                        // console.log(value);
                        localStorage.removeItem(EQUIPMENT_CACHE_KEY);
                        let goodsId = 0;
                        if ("1" in value.events) {
                            goodsId = toBN(value.events["1"].raw.data).toNumber();
                            this.api?.rpcApi.request({ method: "delGoods", params: [goodsId] })
                                .then(value => {
                                    // console.log(value);
                                    this.showAlert("兑换成功!");
                                    this.onFilterProps(this.filterProps.selected);
                                });
                        } else {
                            this.getPastEvents("Market", "BuyGoods", { filter: { buyer: this.api?.curAccount }, toBlock: value.blockNumber })
                                .then((events: any) => {
                                    // console.log(events);
                                    if (events.length > 0) {
                                        goodsId = parseInt(events[0].returnValues.goodsId)
                                        this.api?.rpcApi.request({ method: "delGoods", params: [goodsId] })
                                            .then(value => {
                                                // console.log(value);
                                                this.showAlert("兑换成功!");
                                                this.onFilterProps(this.filterProps.selected);
                                            });
                                    }
                                });
                        }
                    });
            });
        } else {
            AlertWin.showRichText(find("Canvas") ?? this.node, msg, "兑换", () => {
                this.sendContract("Market", "buy", data._id, { from: this.api?.curAccount })
                    .then((value: any) => {
                        // console.log(value);
                        localStorage.removeItem(EQUIPMENT_CACHE_KEY);
                        let goodsId = 0;
                        if ("BuyGoods" in value.events) {
                            goodsId = parseInt(value.events.BuyGoods.returnValues.goodsId)
                            this.api?.rpcApi.request({ method: "delGoods", params: [goodsId] })
                                .then(value => {
                                    // console.log(value);
                                    this.showAlert("兑换成功!");
                                    this.onFilterProps(this.filterProps.selected);
                                });
                        } else {
                            this.getPastEvents("Market", "BuyGoods", { filter: { buyer: this.api?.curAccount }, toBlock: value.blockNumber })
                                .then((events: any) => {
                                    // console.log(events);
                                    if (events.length > 0) {
                                        let goodsId = parseInt(events[0].returnValues.goodsId)
                                        this.api?.rpcApi.request({ method: "delGoods", params: [goodsId] })
                                            .then(value => {
                                                // console.log(value);
                                                this.showAlert("兑换成功!");
                                                this.onFilterProps(this.filterProps.selected);
                                            });
                                    }
                                });
                        }
                    });
            }, () => {
                this.sendContractByAddr(data.payContract, "USDT", "approve", Constant.address.Market, data.price, { from: this.api?.curAccount })
                    .then(value => {
                        this.showAlert("授权成功!");
                    });
            });
        }

    }

    onPullOff(data: any) {
        // console.log(data);
        this.showConfirm("是否将该道具下架?", () => {
            this.sendContract("Market", "pullOff", data._id, { from: this.api?.curAccount }).then((value: any) => {
                // console.log(value);
                let goodsId = 0;
                localStorage.removeItem(EQUIPMENT_CACHE_KEY);
                localStorage.removeItem(CONSUMABLES_CACHE_KEY);
                if ("PullOff" in value.events) {
                    goodsId = parseInt(value.events.PullOff.returnValues.goodsId)
                    this.api?.rpcApi.request({ method: "delGoods", params: [goodsId] })
                        .then(value => {
                            // console.log(value);
                            this.onFilterProps(this.filterProps.selected);
                        });
                } else {
                    this.getPastEvents("Market", "PullOff", { filter: { seller: this.api?.curAccount } })
                        .then((events: any) => {
                            // console.log(events);
                            if (events.length > 0) {
                                goodsId = parseInt(events[0].returnValues.goodsId)
                                this.api?.rpcApi.request({ method: "delGoods", params: [goodsId] })
                                    .then(value => {
                                        // console.log(value, this.currentTabIndex);
                                        this.onFilterProps(this.filterProps.selected);
                                    });
                            }
                        });
                }
            });
        }, () => { });
    }

    async _loadData(gclass: number = -1, profession: number = -1, category: number = -1, level: number = -1) {
        let result: any = await this.api?.searchGoods(gclass, profession, category, level, this.page, this.pageSize);
        // console.log(result.list)
        let list = [];
        if (!!result) {
            this.totalPage = result.totalPage;
            if (result.list.indexOf("[") == 0) {
                list = JSON.parse(result.list);
                list = list.map((item: any) => {
                    item.showPullOff = false;
                    return item;
                });
            }
        } else {
            this.totalPage = 0;
        }
        return list;
    }

    async loadData(gclass: number = -1, profession: number = -1, category: number = -1, level: number = -1) {
        let list = await this._loadData(gclass, profession, category, level);
        this.fixedScrollView.setData(list);
        if (list.length > 0)
            this._showNoData("");
        else
            this._showNoData();
    }

    async _loadMyData(gclass: number = -1, profession: number = -1, category: number = -1, level: number = -1) {
        let result: any = await this.api?.searchGoods(gclass, profession, category, level, this.page, this.pageSize, this.api.curAccount);
        let list = [];
        if (!!result) {
            this.totalPage = result.totalPage;
            if (result.list.indexOf("[") == 0) {
                list = JSON.parse(result.list);
                list = list.map((item: any) => {
                    item.showPullOff = true;
                    return item;
                });
            }
        } else {
            this.totalPage = 0;
        }
        return list;
    }

    async loadMyData(gclass: number = -1, profession: number = -1, category: number = -1, level: number = -1) {
        let list = await this._loadMyData(gclass, profession, category, level);
        this.fixedScrollView.setData(list);
        if (list.length > 0)
            this._showNoData("");
        else
            this._showNoData();
    }

    onTabBarChanage(index: number) {
        this.currentTabIndex = index;
        this.fixedScrollView.reset();
        this.page = 1;
        switch (index) {
            case 0:
                this.btnPutOn.active = false;
                this.loadData();
                break;
            case 1:
                this.btnPutOn.active = true;
                this.loadMyData();
        }
    }

    onClose() {
        director.loadScene("Main");
    }

    onDestroy() {
        this.tabBar.onChanage = null;
        this.fixedScrollView.eventSlideUp = null;
        this.filterProps.onSelected = null;
        this.btnCombo.onChanage = null;
    }

    onPutOn() {
        PropsChooseWin.show().then(win => {
            win.onChooseEvent = this.onSelectProps.bind(this);
        });
    }

    onSelectProps(props: any) {
        // console.log(props);
        this._showPutOnInfo(props);
    }

    private _showPutOnInfo(props: any) {
        this.selectProps = props;
        let node = this.node.getChildByPath("PutOnWin/Node/goods/PropsItem");
        if (!!node) {
            let propsItem = node.getComponent(PropsItem);
            propsItem?.setItem(props);
            this.putOnWin.active = true;
        }
        this.txtAmount.string = props.amount;
        this.btnCombo.data = [];
        for (let key in Constant.paymode) {
            let name = (Constant.paymode as any)[key];
            if (name == "USDT") //只允许上架USDT
                this.btnCombo.data.push({ name: name, value: key });
        }
        this.btnCombo.onLoad();
        this.labRate.string = this.marketFee / 10 + " %";
        this.labSymbol.string = this.btnCombo.data[0].name;
    }

    onPutOnWinClose() {
        this.putOnWin.active = false;
    }

    doPutOn() {
        let dm: any;
        if ("profession" in this.selectProps.info) {
            //装备
            dm = this.api?.dataApi.eth.abi.encodeParameters(["uint8", { "Goods": { "id": "uint256", "class": "uint8", "status": "uint8", "price": "uint256", "amount": "uint32", "seller": "address", "buyer": "address", "contentId": "uint256", "payContract": "address" } }],
                [1, {
                    "id": 0, "class": 1, "status": 1, "price": toWei(this.txtPrice.string, "ether"),
                    "amount": parseInt(this.txtAmount.string), "seller": this.api.curAccount,
                    "buyer": "0x0000000000000000000000000000000000000000",
                    "contentId": this.selectProps.id,
                    "payContract": this.btnCombo.selected.value
                }]);
            this.sendContract("Equipment", "safeTransferFrom", this.api?.curAccount, Constant.address.Market, this.selectProps.id, dm)
                .then((value: any) => {
                    // console.log(value);
                    localStorage.removeItem(EQUIPMENT_CACHE_KEY);
                    let goodsId = 0;
                    if ("0" in value.events) {
                        goodsId = toBN(value.events["0"].raw.data).toNumber();
                        this.api?.rpcApi.request({ method: "syncGoods", params: [goodsId] })
                            .then(value => {
                                console.log("doPutOn: ",value);
                                this.showAlert("上架成功!");
                                this.onPutOnWinClose();
                                this.onFilterProps(this.filterProps.selected);
                            });
                    } else {
                        this.getPastEvents("Market", "PutOn", { filter: { seller: this.api?.curAccount }, toBlock: value.blockNumber })
                            .then((events: any) => {
                                if (events.length > 0) {
                                    goodsId = parseInt(events[0].returnValues.goodsId)
                                    this.api?.rpcApi.request({ method: "syncGoods", params: [goodsId] })
                                        .then(value => {
                                            // console.log(value);
                                            this.showAlert("上架成功!");
                                            this.onPutOnWinClose();
                                            this.onFilterProps(this.filterProps.selected);
                                        });
                                }
                            });
                    }
                });
        } else {
            //碎片
            dm = this.api?.dataApi.eth.abi.encodeParameters(["uint8", { "Goods": { "id": "uint256", "class": "uint8", "status": "uint8", "price": "uint256", "amount": "uint32", "seller": "address", "buyer": "address", "contentId": "uint256", "payContract": "address" } }],
                [1, {
                    "id": 0, "class": 2, "status": 1, "price": toWei(this.txtPrice.string, "ether"),
                    "amount": parseInt(this.txtAmount.string), "seller": this.api.curAccount,
                    "buyer": "0x0000000000000000000000000000000000000000",
                    "contentId": this.selectProps.id,
                    "payContract": this.btnCombo.selected.value
                }]);
            this.sendContract("Fragment", "safeTransferFrom", this.api?.curAccount, Constant.address.Market, this.selectProps.id, parseInt(this.txtAmount.string), dm)
                .then((value: any) => {
                    // console.log(value);
                    let goodsId = 0;
                    localStorage.removeItem(CONSUMABLES_CACHE_KEY);
                    if ("0" in value.events) {
                        goodsId = toBN(value.events["0"].raw.data).toNumber();
                        this.api?.rpcApi.request({ method: "syncGoods", params: [goodsId] })
                            .then(value => {
                                // console.log(value);
                                this.showAlert("上架成功!");
                                this.onPutOnWinClose();
                                this.onFilterProps(this.filterProps.selected);
                            });
                    } else {
                        this.getPastEvents("Market", "PutOn", { filter: { seller: this.api?.curAccount }, toBlock: value.blockNumber })
                            .then((events: any) => {
                                // console.log(events);
                                if (events.length > 0) {
                                    goodsId = parseInt(events[0].returnValues.goodsId)
                                    this.api?.rpcApi.request({ method: "syncGoods", params: [goodsId] })
                                        .then(value => {
                                            // console.log(value);
                                            this.showAlert("上架成功!");
                                            this.onPutOnWinClose();
                                            this.onFilterProps(this.filterProps.selected);
                                        });
                                }
                            });
                    }
                });
        }
    }

    onAmountChange(data: any) {
        let amount = parseInt(data);
        if (amount < 1) amount = 1;
        if (amount > parseInt(this.selectProps.amount)) amount = parseInt(this.selectProps.amount);
        this.txtAmount.string = amount.toString();
    }

    onPriceChange(data: any) {
        let value = parseFloat(data);
        if (value < 1) value = 1;
        if (value.toString() == "NaN") value = 0;
        this.txtPrice.string = value.toString();
        let inValue = value - (value * this.marketFee / 1000);
        if (inValue.toString() == "NaN") inValue = 0;
        this.labValue.string = inValue.toString();
    }

    onComboBoxChange(data: any) {
        this.labSymbol.string = data.name;
    }
}
