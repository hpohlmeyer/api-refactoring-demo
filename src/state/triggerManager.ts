import { ApiSetterName } from '../apis';

interface TriggerStore {
  [key: string]: {
    [key: string]: () => (void | Promise<void>);
  };
}

class TriggerManager {
  public store: TriggerStore;
  constructor() {
    this.store = {};
  }

  addTrigger(triggerId: ApiSetterName, cbId: string, cb: () => (void | Promise<void>)) {
    this.store[triggerId]
      ? (this.store[triggerId][cbId] = cb)
      : (this.store[triggerId] = { [cbId]: cb });
  }

  removeTrigger(triggerId: ApiSetterName, cbId: string) {
    this.store[triggerId]
      ? delete this.store[triggerId][cbId]
      : delete this.store[triggerId];
  }

  run(triggerId: ApiSetterName) {
    if (!this.store[triggerId]) {
      return;
    }
    Object.values(this.store[triggerId]).forEach(cb => cb());
  }
}

export const triggerManager = new TriggerManager();
