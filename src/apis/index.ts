import { triggerManager } from '../state/triggerManager';
import { delay } from '../utils/delay';

// ----------------- Pseudo DB ---------------------- //
let pseudoDbParents = 0;
let pseudoDbCommands = 0;

// -------------------- API ------------------------ //

export const getters = {
  async fetchEntityCommands() {
    await delay(1000);
    return pseudoDbCommands;
  },
  async fetchEntityParents(someDependecy: boolean) {
    if (someDependecy === undefined) {
      throw new Error('some dependency should be defined!');
    }
    await delay(1000);
    return pseudoDbParents;
  },
};

export const setters = {
  async updateEntityCommands() {
    pseudoDbCommands++;
    triggerManager.run('updateEntityCommands');
  },
  async updateEntityParents() {
    pseudoDbParents++;
    triggerManager.run('updateEntityParents');
  }
};

// ------------------- Types ------------------------ //
export type ApiSetter = typeof setters;
export type ApiSetterName = keyof ApiSetter;

export type ApiGetter = typeof setters;
export type ApiGetterName = keyof ApiGetter;