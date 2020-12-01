import { Task } from "./Task";
import { UpgradeTask } from "./UpgradeTask";

function getEnergySource(room: Room): Resource<ResourceConstant> {
  return _.max(
    [...room.find(FIND_DROPPED_RESOURCES, { filter: (resource) => resource.resourceType === RESOURCE_ENERGY })],
    (r) => r.amount
  );
}

function getBuildable(room: Room): ConstructionSite<BuildableStructureConstant> {
  return _.first([...room.find(FIND_MY_CONSTRUCTION_SITES)]);
}

export class BuildTask extends Task<BuildMemory> {
  public act() {
    if (this.creep.store.getUsedCapacity() === 0) {
      this.memory.working = false;
    }
    if (this.creep.store.getFreeCapacity() === 0) {
      this.memory.working = true;
    }

    if (this.memory.working) {
      const toBuild = getBuildable(Game.rooms[this.memory.room]);

      if (toBuild) {
        if (this.creep.pos.inRangeTo(toBuild, 3)) {
          this.creep.build(toBuild);
        } else if (this.creep.fatigue === 0) {
          this.creep.moveTo(toBuild, { range: 3, ignoreCreeps: false });
        }
      } else {
        new UpgradeTask(this.creep, { ...this.memory, ...{ task: "upgrade" } }, this.logger).act();
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
