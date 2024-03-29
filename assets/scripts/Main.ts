
import { _decorator, Node, director, Label, game, resources, setDisplayStats, assetManager, JsonAsset, Sprite, sys, AudioSource } from 'cc';
import Web3 from "web3/dist/web3.min.js";
import { BaseComponent } from './BaseComponent';
import { Constant } from './Constant';
import { OpenInfo, Props } from './entitys/Props';
import { ScrollInfo } from './ScrollInfo';
import { MUSIC_IS_PLAY } from './Constant';

const { ccclass, type } = _decorator;
const { fromWei } = Web3.utils;


@ccclass('Main')
export class Main extends BaseComponent {

    @type(Node)
    btnCheckUser: Node | null = null;

    @type(ScrollInfo)
    srcollInfo: ScrollInfo | null = null;

    @type(Label)
    totalLab: Label;

    @type(Label)
    bonusLab: Label;

    @type(Node)
    viewTopTen: Node;

    @type(Node)
    unlockUI: Node;

    @type(Node)
    btnON: Node;

    @type(Node)
    btnOFF: Node;

    @type(AudioSource)
    music: AudioSource | null = null;

    curUser: string = "选择钱包";
    prevBlock: string = "latest";

    _heroId: string = "";

    constructor() {
        super();
        this.totalLab = new Label();
        this.bonusLab = new Label();
        this.viewTopTen = new Node();
        this.unlockUI = new Node();
        this.btnON = new Node();
        this.btnOFF = new Node();
        // setDisplayStats(true)
    }

    onLoad() {
        super.onLoad();
        this.btnOFF.active = false;
        this.btnCheckUser?.on(Node.EventType.TOUCH_END, this.selectWallet, this);
        director.preloadScene("Mine");
        director.preloadScene("Zone");
        director.preloadScene("StorageBox");
        director.preloadScene("Role");
        director.preloadScene("Pool");
        director.preloadScene("Store");
        director.preloadScene("Announcement");
        let role = this.getQueryString("role");
        if (role == "admin") {
            this.loadScene("Admin");
        } else if (role == "team") {
            this.loadScene("Team");
        } else {
            this._initAnnouncement();
        }
        this._initMusic();
    }

    _initMusic() {
        if(!!this.music){
            this.music.volume = 0.2;
        }
        let isplay = localStorage.getItem(MUSIC_IS_PLAY);
        if (null == isplay || isplay == "1") {
            this.music?.play();
            this.btnOFF.active = false;
            this.btnON.active = true;
        } else {
            this.music?.stop();
            this.btnOFF.active = true;
            this.btnON.active = false;
        }
    }

    async _initAnnouncement() {

        let latest = await this.api?.dataApi.eth.getBlock("latest");
        if (!!latest) {
            this.prevBlock = latest.number > 3000 ? (latest.number - 3000).toString() : "latest";
        }
        //加载最新公告
        let url = Constant.annUrl + "?t=" + Date.now();
        assetManager.loadRemote(url, (err, jsonAsset: JsonAsset) => {
            if (!!err) {
                return;
            }
            if (!!jsonAsset.json) {
                let item = new OpenInfo();
                item.address = (jsonAsset.json as any)[0].title;
                this.srcollInfo?.pushItem(item);
            }
        });
        this.checkUI();
        //加载掉落通知
        this._loadGain();
    }

    checkUI() {
        let unlock = this.getQueryString("unlock");
        if (!!unlock) {
            this.unlockUI.active = true;
        }
    }

    async _loadGain() {
        this.getPastEvents("Box", "Gain", { filter: { quality: [1, 2] }, fromBlock: this.prevBlock, toBlock: "latest" })
            .then((events: any) => {
                // console.log(events);
                events.forEach((e: any) => {
                    let item = new OpenInfo();
                    item.address = e.returnValues.user;
                    item.time = (new Date(parseInt(e.returnValues.time) * 1000)).toTimeString().split(" ")[0];
                    item.props = new Props();
                    item.props.name = (Constant.equipments as any)[e.returnValues.number];
                    item.props.info = { quality: parseInt(e.returnValues.quality) };
                    this.srcollInfo?.pushItem(item);
                    this.prevBlock = e.blockNumber;
                });
            });
        this.getPastEvents("ZoneMine", "Gain", { filter: { class: "0", quality: [1, 2] }, fromBlock: this.prevBlock, toBlock: "latest" })
            .then((events: any) => {
                // console.log("class 0: ",events);
                events.forEach((e: any) => {
                    let item = new OpenInfo();
                    item.address = e.returnValues.user;
                    item.time = (new Date(parseInt(e.returnValues.time) * 1000)).toTimeString().split(" ")[0];
                    item.props = new Props();
                    item.props.name = (Constant.equipments as any)[e.returnValues.number];
                    item.props.info = { quality: parseInt(e.returnValues.quality) };
                    this.srcollInfo?.pushItem(item);
                    this.prevBlock = e.blockNumber;
                });
            });
        this.getPastEvents("ZoneMine", "Gain", { filter: { class: "1" }, fromBlock: this.prevBlock, toBlock: "latest" })
            .then((events: any) => {
                // console.log("class 1: ",events);
                events.forEach((e: any) => {
                    let item = new OpenInfo();
                    item.address = e.returnValues.user;
                    item.time = (new Date(parseInt(e.returnValues.time) * 1000)).toTimeString().split(" ")[0];
                    item.props = new Props();
                    // item.props.name = e.returnValues.quality + "-" + e.returnValues.number;
                    item.props.name = (Constant.totems as any)[e.returnValues.number][0].replace("图腾", "碎片");
                    item.props.info = { quality: 2 };
                    this.srcollInfo?.pushItem(item);
                    this.prevBlock = e.blockNumber;
                });
            });
        this.schedule(this._loadGain.bind(this), 300);
    }

    onDestroy() {
        // this.btnCheckUser.off(Node.EventType.TOUCH_END, this.onCheckUser, this);
    }

    start() {
        this._getData();

    }

    selectWallet() {
        this.api?.selectWallet();
    }

    accountsChanged(accounts: string[]) {
        super.accountsChanged(accounts);
        if (accounts.length > 0) {
            this.curUser = accounts[0];
            this._showUser();
        }
    }

    _showUser() {
        let addr = this.btnCheckUser?.getComponentInChildren(Label);
        if (addr) {
            if (this.curUser.length > 4)
                addr.string = this.curUser.substr(0, 4) + "..." + this.curUser.substr(this.curUser.length - 4);
            else
                addr.string = this.curUser;
        }
    }

    async _getData() {
        let accounts = await this.api?.getUsers();

        if (accounts && accounts.length > 0) {
            this.curUser = this.api?.curAccount ?? "";
        }
        this._showUser();
        this._showBonusPool();
        this._checkChainId();
    }

    private _checkChainId() {
        this.api?.walletApi.eth.getChainId((err, version) => {
            if (version != Constant.chainId) {
                this.api?.removeCache();
                this.showAlert("你钱包网络不正确!");
            }
        });
    }

    async _showBonusPool() {
        this.callContract("BonusPool", "getInfo")
            .then(result => {
                if (!!result && !!this.totalLab && !!this.bonusLab) {
                    let stb = fromWei(result[0], "ether");
                    let scb = fromWei(result[1], "ether");
                    this.totalLab.string = parseFloat(stb).toFixed(4);
                    this.bonusLab.string = parseFloat(scb).toFixed(4);
                }
            })
            .catch(reason => { console.log(reason); this.showErr(reason); });
    }

    async onMineClick() {
        this.loadScene("Mine");
    }

    onZoneClick() {
        this.loadScene("Zone");
    }

    onStorageBoxClick() {
        this.loadScene("StorageBox");
    }

    onRoleClick() {
        this.loadScene("Role");
    }

    onPoolClick() {
        this.loadScene("Pool");
    }

    onStoreClick() {
        this.loadScene("Store");
    }

    onAuctionClick() {
        this.showAlert("暂未开放，敬请期待！");
    }

    onFriend() {
        this.loadScene("Friend");
    }

    onAnnouncementClick() {
        this.loadScene("Announcement");

    }

    onMarket() {
        this.loadScene("Market");
    }

    onPVP(){
        this.loadScene("PVP");
    }

    onTopTenClick() {
        this.viewTopTen.active = true;
    }

    onReferral() {
        this.loadScene("Referral");
    }


    async onPacketHero() {
        let info = await this.callContract("Hero", "getHeroInfo", this.api?.curAccount).catch(reason => {
            this.showErr(reason);
        });
        this._heroId = info.hero.tokenId;
        this.sendContract("Hero", "packet", info.hero.tokenId).then(value => {
            this.showAlert("操作成功！");
        });
    }

    async onActiveHero() {
        if (this._heroId == "" || this._heroId == null) {
            let infos = await this.callContract("Hero", "tokensOf", this.api?.curAccount, 0, 0).catch(reason => {
                this.showErr(reason);
            });
            // console.log(infos)
            if (infos.length > 0) {
                this._heroId = infos[0];
            } else {
                return;
            }
        }
        console.log(this._heroId);
        this.sendContract("Hero", "activation", this._heroId).then(value => {
            this.showAlert("操作成功！");
        });
    }

    onStrategy() {
        sys.openURL(Constant.strategy);
    }

    onTelegram() {
        sys.openURL(Constant.telegram);
    }

    onMusicON() {
        this.btnOFF.active = true;
        this.btnON.active = false;
        if (this.music) {
            this.music.stop();
            localStorage.setItem(MUSIC_IS_PLAY, "0");
        }
    }

    onMusicOFF() {
        this.btnOFF.active = false;
        this.btnON.active = true;
        if (this.music) {
            this.music.play();
            localStorage.setItem(MUSIC_IS_PLAY, "1");
        }
    }
}

