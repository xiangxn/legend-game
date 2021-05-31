
import { _decorator, Component, Node, Prefab, ScrollView, UITransform, instantiate, Layout, v3 } from 'cc';
import { BaseItem } from './BaseItem';

const { ccclass, type } = _decorator;

@ccclass('FixedScrollView')
export class FixedScrollView extends Component {
    @type(Prefab)
    itemTemplate: Prefab;

    @type(ScrollView)
    scrollView: ScrollView;

    content: Node;

    dataSet: any[] = [];
    // 当前活跃节点数组 是从头到尾排的
    activeNodes: Node[] = [];

    itemHeight: number = 0;
    itemSpaceX: number = 0;
    itemSpaceY: number = 0;
    lineHeight: number = 0;
    // 可视的节点数量（屏幕可以显示的）
    visitedItemCount: number = 0;
    // 额外的节点数量
    extraItemCount: number = 0;
    // 活跃的节点数量 = 可视节点 + 2*额外节点
    activeItemCount: number = 0;
    // 安全区域高度
    safeAreaHeight: number = 0;
    // 活跃区域高度
    activeAreaHeight: number = 0;
    // 父节点上一次的y，用于计算是上滑还是下滑
    contentNodeLastY: number = 0;
    // 容器(父)节点高度
    contentHeight: number = 0;
    // 活跃的头节点的下标
    activeHeadIndex = 0;
    // 活跃的尾节点的下标
    activeTailIndex = 0;
    //每行的列数
    constraintNum: number = 1;

    eventListener: Function | null = null;

    constructor() {
        super();
        this.itemTemplate = new Prefab();
        this.scrollView = new ScrollView();
        this.content = new Node("TEMP");
    }

    _getUIT(node: Node | null = null): UITransform {
        if (!!node) {
            return node.getComponent(UITransform) ?? new UITransform();
        }
        return this.node.getComponent(UITransform) ?? new UITransform();
    }

    onLoad() {
        // console.log("this.scrollView.content:",this.scrollView.content)
        this.content = this.scrollView.content ?? new Node();
        this.itemHeight = this._getUIT(this.itemTemplate.data).height;
        let layout = this.content.getComponent(Layout);
        this.itemSpaceX = layout?.spacingX ?? 0;
        this.itemSpaceY = layout?.spacingY ?? 0;

        // console.log(this._getUIT().height, this);
        // 单行高度 一个子节点+一个间距
        this.lineHeight = this.itemHeight + this.itemSpaceY;
        // 可视的节点数量（屏幕可以显示的）
        if (layout?.type == Layout.Type.GRID) {
            this.visitedItemCount = Math.round(this._getUIT().height / (this.lineHeight)) * layout.constraintNum;
            this.constraintNum = layout.constraintNum;
        } else {
            this.visitedItemCount = Math.round(this._getUIT().height / (this.lineHeight));
            this.constraintNum = 1;
        }
        // 额外的节点数量
        this.extraItemCount = (this.visitedItemCount + this.constraintNum) >> 1;
        // 活跃的节点数量 = 可视节点 + 2*额外节点
        this.activeItemCount = this.visitedItemCount + this.extraItemCount * 2;
        // 安全区域高度
        this.safeAreaHeight = this.extraItemCount / this.constraintNum * this.lineHeight;
        // 活跃区域高度
        this.activeAreaHeight = this.activeItemCount / this.constraintNum * this.lineHeight;
        // 父节点上一次的y，用于计算是上滑还是下滑
        this.contentNodeLastY = 0;
        // 父节点高度
        this.contentHeight = this._getUIT(this.content).height;
        // 活跃的头节点的下标
        this.activeHeadIndex = 0;
        // 活跃的尾节点的下标
        this.activeTailIndex = 0;
        // 监听滚动事件
        this.node.on('scrolling', this.onScrolling, this);
    }

    getPositionInView(item: Node) { // get item position in scrollview's node space
        let worldPos = this._getUIT(item.parent).convertToWorldSpaceAR(item.position);
        let viewPos = this._getUIT(this.scrollView.node).convertToNodeSpaceAR(worldPos);
        return viewPos;
    }

    //滚动监听
    onScrolling(arg0: string, onScrolling: any, arg2: this) {
        // 判断上滑/下滑
        let scrollUp = this.content.getPosition().y > this.contentNodeLastY;
        this.contentNodeLastY = this.content.getPosition().y;

        // 头节点
        let headNode: Node | undefined = this.activeNodes[0];
        // 头节点距离屏幕顶端的距离
        let dis_head = this.content.getPosition().y + headNode.getPosition().y;
        // console.log("dis_head ", headNode.getPosition().y, this.content.getPosition().y);
        if (scrollUp) {
            // 上滑 判断是否需要把头节点移动到尾部
            // 头节点超出安全区 且 后面还有数据可以加载（避免下标超出数组长度）
            if (dis_head > this.safeAreaHeight) {
                for (let i = 0; i < this.constraintNum && this.activeTailIndex + 1 < this.dataSet.length; i++) {
                    headNode = this.activeNodes.shift();
                    if (!!headNode) {
                        // console.log("移除头部节点", dis_head);
                        this.activeNodes.push(headNode);
                        // 修改活跃下标
                        this.activeTailIndex++;
                        this.activeHeadIndex++;
                        // headNode.setSiblingIndex(this.content.children.length - 1);
                        // 设置节点内容
                        this.setItemNode(headNode, this.activeTailIndex);
                    }
                }
            }
        } else {
            // 下滑 判断是否需要把尾节点移动到头部
            // 头节点在安全区内 且 前面还有数据
            if (dis_head < this.safeAreaHeight) {
                // console.log("移除尾节点");
                for (let i = 0; i < this.constraintNum && this.activeHeadIndex > 0; i++) {
                    let tailNode = this.activeNodes.pop();
                    if (!!tailNode) {
                        this.activeNodes.unshift(tailNode);
                        this.activeTailIndex--;
                        this.activeHeadIndex--;
                        // tailNode.setSiblingIndex(0);
                        this.setItemNode(tailNode, this.activeHeadIndex);
                    }
                }
            }
        }
    }

    // 设置节点内容
    setItemNode(node: Node, index: number) {
        let data = this.dataSet[index];
        let comp = node.getComponent(BaseItem);
        if (!!comp) {
            comp.setItem(data);
            // 根据下标计算并修改y
            let pos = node.getPosition();
            //计算行数
            let lines = Math.floor(index / this.constraintNum);
            // console.log("lines:", lines, -this.lineHeight * lines, this.content.position.y)
            node.setPosition(v3(pos.x, -this.lineHeight * lines, pos.z));

        }
    }

    init(eventListener: any) {
        // 传递事件监听器
        this.eventListener = eventListener;
    }

    setData(dataSet: any[]) {
        this.dataSet = dataSet;
        this.activeNodes = [];
        // 计算父节点的高度
        let lines = Math.floor(this.dataSet.length / this.constraintNum) + (this.dataSet.length % this.constraintNum > 0 ? 1 : 0);

        this.contentHeight = lines * (this.lineHeight);
        // 设置高度
        // let cUit = this._getUIT(this.content);
        // cUit.setContentSize(cUit.width, this.contentHeight);
        this._getUIT(this.content).height = this.contentHeight;
        // this.content.getComponent(Layout)?.updateLayout(true);
        // 清空父节点
        this.content.removeAllChildren();

        // 有可能数据比活跃节点少... 那就用小的那个
        let number = Math.min(this.dataSet.length, this.activeItemCount);
        for (let i = 0; i < number; i++) {
            // 实例化节点 并初始化、设置内容
            let node = instantiate(this.itemTemplate);
            if (!!node) {
                node.getComponent(BaseItem)?.init(this.eventListener);
                this.setItemNode(node, i);

                this.content.addChild(node);
                this.activeNodes.push(node);
            }
        }
        // 设置活跃的首尾节点下标
        this.activeHeadIndex = 0;
        this.activeTailIndex = number - 1;
    }
}
