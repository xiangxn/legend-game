
import { _decorator, Component, Node, resources, find, Prefab, instantiate } from 'cc';
import { BaseComponent } from './BaseComponent';
import { Props } from './entitys/Props';
import { FilterProps } from './FilterProps';
import { PropsList } from './PropsList';
const { ccclass, type } = _decorator;

@ccclass('PropsChooseWin')
export class PropsChooseWin extends BaseComponent {
    @type(PropsList)
    propsList: PropsList;

    @type(FilterProps)
    filterProps: FilterProps

    onChooseEvent: Function | null = null;
    onCloseEvent: Function | null = null;

    constructor() {
        super();
        this.propsList = new PropsList();
        this.filterProps = new FilterProps();
    }

    onLoad() {
        super.onLoad();
        this.propsList.isSingleChoice = true;
        this.propsList.onChooseEvent = this.onChooseItem.bind(this);
        this.filterProps.onSelected = this.onFilterProps.bind(this);
        this.scheduleOnce(() => { this._loadProps() }, 1);
        // this._loadProps();
    }

    onDestroy() {
        this.propsList.onChooseEvent = null;
        this.filterProps.onSelected = null;
    }

    onChooseItem(data: Props) {
        // console.log(data);
        if (data) {
            this.node.active = false;
            if (this.onChooseEvent)
                this.onChooseEvent(data)
        }
    }

    onClose() {
        this.node.active = false;
        if (this.onCloseEvent) {
            this.onCloseEvent();
        }
    }

    setNoDataMsg(msg: string | null = null) {
        this.propsList.noDataMsg = msg;
    }

    async onFilterProps(data: any[]) {
        this._loadProps(data);
    }

    async _loadProps(data: any[] = [{ value: -1 }, { value: -1 }, { value: -1 }]) {
        // console.log(data);
        let list: Props[] = [];
        if (data[0].value == 1) {   //加载装备
            list = await this.loadEquips(data[1].value, data[2].value);
        } else if (data[0].value == 2) {    //加载碎片
            list = await this.getFragment();
        } else if (data[0].value == 2) {    //加载艺术品
        } else if (data[0].value == -1) {
            //加载碎片
            let fragments = await this.getFragment();
            list = list.concat(fragments);
            //加载装备
            let equips = await this.loadEquips();
            list = list.concat(equips);
        }
        this.propsList.setData(list);
    }

    async loadEquips(profession: number = -1, category: number = -1) {
        let list: Props[] = await this.loadEquipments();
        list = list.filter((item) => {
            return (profession == -1 || parseInt(item.info.profession) == profession) &&
                (category == -1 || parseInt(item.info.category) == category) &&
                item.info.isEquip == false &&
                item.info.locked == false;
        });
        return list;
    }

    static show(): Promise<PropsChooseWin> {
        let parent = find("Canvas");
        if (parent) {
            return new Promise((resolve, reject) => {
                resources.load("component/PropsChooseWin", Prefab, (err, prefab) => {
                    let win = instantiate(prefab);
                    let cw = win.getComponent(PropsChooseWin);
                    if (cw) {
                        cw.setNoDataMsg("没有可选道具");
                        parent?.addChild(win);
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

