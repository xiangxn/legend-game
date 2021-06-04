
import { _decorator, Component, resources, game, log } from 'cc';
const { ccclass, property } = _decorator;
import Web3 from "web3/dist/web3.min.js";
import { JSONRPC } from "./JSONRPC";
import { BOX_CACHE_KEY, Constant, CONSUMABLES_CACHE_KEY, EQUIPMENT_CACHE_KEY, FRIEND_CACHE_KEY, TOTEM_CACHE_KEY, VERSION_CACHE_KEY } from "./Constant";
// import WalletConnectProvider from "@walletconnect/web3-provider";

const LS_ACCOUNT_KEY = "legend_account";

@ccclass('DataNode')
export class DataNode extends Component {

    accounts: string[] = [];
    curAccount: string = "";
    walletApi: Web3;
    //数据读取api
    dataApi: Web3 = new Web3(Constant.apiUrl);
    rpcApi: JSONRPC;

    accountsChanged: Function | null = null;

    constructor() {
        super();
        this.walletApi = this.dataApi;
        this.rpcApi = new JSONRPC(Constant.rpcUrl);
    }

    onLoad() {
        console.log("DataNode onLoad......");
        this._checkVersion();
        game.addPersistRootNode(this.node);
        game.setFrameRate(30);
        this._initAPI();
    }

    removeCache() {
        localStorage.removeItem(EQUIPMENT_CACHE_KEY);
        localStorage.removeItem(CONSUMABLES_CACHE_KEY);
        localStorage.removeItem(BOX_CACHE_KEY);
        localStorage.removeItem(TOTEM_CACHE_KEY);
        localStorage.removeItem(FRIEND_CACHE_KEY);
    }

    private _checkVersion() {
        let ver = localStorage.getItem(VERSION_CACHE_KEY);
        if (ver != Constant.version) {
            this.removeCache();
        }
        localStorage.setItem(VERSION_CACHE_KEY, Constant.version);
    }

    private async _initAPI() {
        let win: any = window;
        if (win.ethereum) {
            win.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length) {
                    this.accounts = accounts;
                    if (this.accounts[0] != this.curAccount) {
                        this.removeCache();
                    }
                    this.curAccount = accounts[0];
                    if (this.accountsChanged) this.accountsChanged(this.accounts);
                }
            });
            this.walletApi = new Web3(win.ethereum);
            try {
                await win.ethereum.enable();
            } catch (error) {
                console.error(error);
            }
        } else if (win.web3) {
            this.walletApi = win.web3;
        }
        // await this.getUsers();
    }

    async getUsers() {
        if (this.accounts.length > 0) return this.accounts;
        // console.log("从网络获取数据。。。。");
        this.accounts = await this.walletApi.eth.getAccounts();
        if (this.accounts && this.accounts.length > 0) {
            this.curAccount = this.accounts[0];
            this.dataApi.eth.defaultAccount = this.curAccount;
            this.walletApi.eth.defaultAccount = this.curAccount;
            this._checkUser();
        }
        return this.accounts;
    }

    private _checkUser() {
        let sU = localStorage.getItem("legend-user-address");
        if (sU != this.curAccount) {
            this.removeCache();
        }
        if (!!this.curAccount) {
            localStorage.setItem("legend-user-address", this.curAccount);
        }
    }

    setCurrentUser(account: string) {
        if (account in this.accounts) {
            if (account != this.curAccount) {
                this.removeCache();
            }
            this.curAccount = account;
            this.dataApi.eth.defaultAccount = this.curAccount;
            this.walletApi.eth.defaultAccount = this.curAccount;
        }
    }

    async selectWallet() {
        // const provider = new WalletConnectProvider({
        //     rpc: Constant.rpcProvider
        // });

        // // Subscribe to accounts change
        // provider.on("accountsChanged", (accounts: any) => {
        //     if (accounts.length) {
        //         this.accounts = accounts;
        //         if (this.accounts[0] != this.curAccount) {
        //             this.removeCache();
        //         }
        //         this.curAccount = accounts[0];
        //         if (this.accountsChanged) this.accountsChanged(this.accounts);
        //     }
        // });
        // // Subscribe to chainId change
        // provider.on("chainChanged", (chainId: any) => {
        //     console.log(chainId);
        // });
        // // Subscribe to session disconnection
        // provider.on("disconnect", (code: any, reason: any) => {
        //     console.log(code, reason);
        // });
        // try {
        //     await provider.enable();
        //     this.walletApi = new Web3((provider as any));
        // } catch {
        // }
    }

    async _loadAbi(name: string): Promise<any> {
        // console.log("name: ", name);
        return new Promise((resolve, reject) => {
            resources.load("abi/" + name, (err, data) => {
                if (err) {
                    log("load abi error: " + name + " " + err);
                    reject(err);
                }
                resolve((data as any).json);
            });
        });
    }

    async getDataContract(name: string, addr?: string | undefined) {
        let abi = await this._loadAbi(name);
        if (!addr)
            addr = (Constant.address as any)[name];
        // console.log(addr,abi);
        return new this.dataApi.eth.Contract(abi.abi, addr);
    }

    async getContract(name: string, addr?: string | undefined) {
        let abi = await this._loadAbi(name);
        if (!addr)
            addr = (Constant.address as any)[name];
        return new this.walletApi.eth.Contract(abi.abi, addr);
    }

    getTransactionReceipt(hash: string) {
        return this.dataApi.eth.getTransactionReceipt(hash);
    }

    onDestroy() {
        console.log("DataNode destroy...");
    }

    async getTopTen() {
        let result = await this.rpcApi.request({ method: "topTen" });
        // console.log(result);
        result = result ?? [];
        return result;
    }

    syncPower(address: string) {
        this.rpcApi.request({ method: "updatePower", params: [address] });
    }

    async searchGoods(gclass: number, profession: number, category: number, page: number, pageSize: number, seller?: string) {
        let result: any = {};
        if (!!seller) {
            result = await this.rpcApi.request({ method: "searchGoods", params: [gclass, profession, category, page, pageSize, seller] });
        } else {
            result = await this.rpcApi.request({ method: "searchGoods", params: [gclass, profession, category, page, pageSize] });
        }
        return result;
    }
}
