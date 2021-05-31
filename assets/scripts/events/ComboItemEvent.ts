import { _decorator, Event } from 'cc';

export class ComboItemEvent extends Event {
    data: any;
    constructor(type: string, data: any, bubbles?: boolean) {
        super(type, bubbles);
        this.data = data;
    }
}