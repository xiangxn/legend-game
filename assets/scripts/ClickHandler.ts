
import { _decorator, Component, Node, EventHandler, EventTouch } from 'cc';
const { ccclass, type } = _decorator;

@ccclass('ClickHandler')
export class ClickHandler extends Component {


    //单击
    @type(EventHandler)
    clickEvent: EventHandler;
    //双击
    @type(EventHandler)
    doubleClickEvent: EventHandler;
    //长按
    @type(EventHandler)
    longTouchEvent: EventHandler;

    //是否单
    @type(Boolean)
    isClick: boolean = false;
    //是否长按
    @type(Boolean)
    isLongTouch: boolean = false;
    //是否双击
    @type(Boolean)
    isDoubleClick: boolean = false;

    //最长点击间隔时间(单位（ms/毫秒）)
    @type(Number)
    maxOffTime: number = 30;
    //最短触摸响应时间(单位:（ms/毫秒）)
    @type(Number)
    minTouchTime: number = 2000;

    // 触摸状态 是否触摸中
    _touchState: boolean = false;
    // 触摸时长
    _touchTime: number = 0;
    // 记录单击状态
    _clickState: boolean = false;
    // 记录点击的间隔时间
    _offTime: number = 0;

    _timeTask: any | null;



    constructor() {
        super();
        this.clickEvent = new EventHandler();
        this.longTouchEvent = new EventHandler();
        this.doubleClickEvent = new EventHandler();
    }

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this._onTouchStart.bind(this));
        this.node.on(Node.EventType.TOUCH_END, this._onTouchEnd.bind(this));
    }

    _onTouchStart(event: Event) {
        this._touchState = true;
        this._touchTime = 0;
    }

    _onTouchEnd(event: EventTouch) {
        this._touchState = false;
        event.propagationStopped = true;
        // 触摸时间 < 最小触摸时间
        if (this._touchTime < this.minTouchTime) {
            // 记录点击状态
            this._clickState = true;
            // 双击间隔时间 <= 最大间隔时间
            // console.log("time: ", this._offTime, this.maxOffTime, this._clickState, this._timeTask);
            if (this._clickState && this._offTime && this._offTime <= this.maxOffTime) {
                // console.log("双击");
                this._offTime = 0;
                this._clickState = false;
                //关闭单击
                if (!!this._timeTask) {
                    clearTimeout(this._timeTask);
                    this._timeTask = null;
                }
                //双击
                if (this.isDoubleClick) {
                    this.doubleClickEvent.emit([event, this.doubleClickEvent.customEventData]);
                }
            } else {
                //单击
                if (!this._timeTask) {
                    this._timeTask = setTimeout(() => {
                        this._offTime = 0;
                        this._clickState = false;
                        this._timeTask = null;
                        // console.log("单击");
                        // 允许单击
                        if (this.isClick) {
                            this.clickEvent.emit([event, this.clickEvent.customEventData]);
                        }
                    }, this.maxOffTime);
                }
            }
        } else {
            // 允许长按
            if (this.isLongTouch) {
                console.log("isLongTouch")
                this.longTouchEvent.emit([event, this.longTouchEvent.customEventData]);
            }
        }
        this._touchTime = 0;
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this._onTouchStart.bind(this));
        this.node.off(Node.EventType.TOUCH_END, this._onTouchEnd.bind(this));
    }


    update(dt: number) {
        // 触摸计时
        if (this._touchState) {
            this._touchTime = this._touchTime + dt * 1000;
        }
        // 点击间隔计时
        if (this._clickState) {
            this._offTime = this._offTime + dt * 1000;
        }
    }
}
