import { Task } from "./Task";

function getEnergySource(room: Room) {
  return _.max(
    [...room.find(FIND_DROPPED_RESOURCES, { filter: (resource) => resource.resourceType === RESOURCE_ENERGY })],
    (r) => r.amount
  );
}

export class UpgradeTask extends Task<UpgradeMemory> {
  public act() {
    if (this.creep.store.getUsedCapacity() === 0) {
      this.memory.working = false;
    }
    if (this.creep.store.getFreeCapacity() === 0) {
      this.memory.working = true;
    }

    if (this.memory.working) {
      const controller = Game.rooms[this.memory.room].controller;

      if (controller) {
        if (this.creep.pos.inRangeTo(controller, 3)) {
          this.creep.upgradeController(controller);
        } else if (this.creep.fatigue === 0) {
          this.creep.moveTo(controller, { range: 3, ignoreCreeps: false });
        }
      } else {
        this.creep.moveTo(new RoomPosition(25, 25, this.memory.room), { range: 15, ignoreCreeps: false });
      }
    } else {
      const source = getEnergySource(this.creep.room);

      if (this.creep.pos.isNearTo(source)) {
        this.creep.pickup(source);
      } else if (this.creep.fatigue === 0) {
        this.creep.moveTo(source);
      }
    }
  }
}
