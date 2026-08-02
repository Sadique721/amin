import { EventEmitter } from 'events';

export const appEventBus = new EventEmitter();
appEventBus.setMaxListeners(50);
