import { _decorator, Event } from 'cc';

export class PVPItemEvent extends Event {
    data: any;
    constructor(name: string, data: any, bubbles?: boolean) {
        super(name, bubbles);
        this.data = data;
    }
}

export class PVPEvent extends Event {
    data: any;
    constructor(name: string, data: any, bubbles?: boolean) {
        super(name, bubbles);
        this.data = data;
    }
}