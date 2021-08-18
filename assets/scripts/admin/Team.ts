
import { _decorator, Component, Node, Label, EditBox } from 'cc';
import { BaseComponent } from '../BaseComponent';
import Web3 from "web3/dist/web3.min.js";
import { Constant } from '../Constant';

const { ccclass, type } = _decorator;
const { toBN, padLeft, toHex, fromWei, toWei } = Web3.utils;

@ccclass('Team')
export class Team extends BaseComponent {

    @type(EditBox)
    inputOp: EditBox;

    @type(EditBox)
    inputTo: EditBox;

    @type(EditBox)
    inputAmount: EditBox;

    constructor() {
        super();
        this.inputOp = new EditBox();
        this.inputTo = new EditBox();
        this.inputAmount = new EditBox();
    }

    onLoad() {
        super.onLoad();
    }

    onConfirm() {
        let opHash = this.inputOp.string;
        if (opHash.length == 66) {
            this.sendContract("Team", "confirm", opHash, { from: this.api?.curAccount }).then((result: any) => {
                if ("MultiTransact" in result.events) {
                    this.showAlert("Successful operation!", null, "Prompt");
                } else {
                    this.showAlert("You have confirmed success, waiting for other members to confirm.", null, "Prompt");
                }
            });
        } else {
            this.showAlert("Invalid proposal hash", null, "Prompt");
        }
    }

    onProposal() {
        let toAddr = this.inputTo.string;
        if (toAddr.length != 42) {
            this.showAlert("Invalid to address", null, "Prompt");
            return;
        }
        let strAmount = this.inputAmount.string;
        strAmount = strAmount == "" ? "0" : strAmount;
        if (strAmount == "0") {
            this.showAlert("Invalid amount", null, "Prompt");
            return;
        }
        let amount = toWei(strAmount, "ether");
        let data = this.api?.dataApi.eth.abi.encodeFunctionCall({ "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "activityClaim", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, [toAddr, amount]);
        // console.log(data);
        this.sendContract("Team", "execute", Constant.address.LGC, data, { from: this.api?.curAccount }).then((result: any) => {
            console.log(result);
            if ("NeedConfirm" in result.events) {
                this.inputOp.string = result.events.NeedConfirm.returnValues.operation;
                this.showAlert("You have confirmed success, waiting for other members to confirm.", null, "Prompt");
            } else if ("SingleTransact" in result.events) {
                this.showAlert("Successful operation!", null, "Prompt");
            }
        });
    }
}

