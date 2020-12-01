import { Logger } from "utils/logging/Logger";
import { BuildTask } from "./BuildTask";
import { IdleTask } from "./IdleTask";
import { Task } from "./Task";

function getEnergySource(room: Room): Resource<ResourceConstant> | AnyStoreStructure | Tombstone | undefined {
  const sources = [
    ...room.find(FIND_DROPPED_RESOURCES, { filter: (resource) => resource.resourceType === RESOURCE_ENERGY }),
    ...room.find(FIND_TOMBSTONES)
  ];

  return sources.length > 0
    ? _.max(sources, (r) => ("amount" in r && r.amount) || ("store" in r && r.store.getUsedCapacity("energy")))
    : undefined;
}

function getSpawnRelated(room: Room): StructureSpawn | StructureExtension | StructureTower | undefined {
  return _.first([
    ...room.find<StructureTower>(FIND_MY_STRUCTURES, {
      filter: (s) => s instanceof StructureTower && (s.store.getFreeCapacity(RESOURCE_ENERGY) ?? 0) !== 0
    }),
    ...room.find(FIND_MY_SPAWNS, { filter: (s) => (s.store.getFreeCapacity(RESOURCE_ENERGY) ?? 0) !== 0 }),
    ...room.find<StructureExtension>(FIND_MY_STRUCTURES, {
      filter: (s) => s instanceof StructureExtension && (s.store.getFreeCapacity(RESOURCE_ENERGY) ?? 0) !== 0
    })
  ]);
}

export class SpawnTask extends Task<SpawnMemory> {
  constructor(creep: Creep, memory: SpawnMemory, logger: Logger) {
    super(creep, memory, logger);
  }

  public act() {
    if (this.creep.store.getUsedCapacity() === 0) {
      this.memory.working = false;
    }
    if (this.creep.store.getFreeCapacity() === 0) {
      this.memory.working = true;
    }

    if (this.memory.working) {
      const toFill = getSpawnRelated(Game.rooms[this.memory.room]);

      if (toFill) {
        if (this.creep.pos.isNearTo(toFill)) {
          this.creep.transfer(
            toFill,
            RESOURCE_ENERGY,
            Math.min(this.creep.store.getUsedCapacity(RESOURCE_ENERGY), toFill.store.getFreeCapacity(RESOURCE_ENERGY))
          );
        } else if (this.creep.fatigue === 0) {
          this.creep.moveTo(toFill, { range: 1, ignoreCreeps: false });
        }
      } else if (this.creep.body.find((part) => part.type === WORK)) {
        new BuildTask(this.creep, { ...this.memory, ...{ task: "build" } }, this.logger).act();
      } else {
        new IdleTask(this.creep, { ...this.memory, ...{ task: "idle" } }, this.logger).act();
      }
    } else {
      const source = getEnergySource(this.creep.room);

      if (source) {
        if (this.creep.pos.isNearTo(source)) {
          if ("store" in source) {
            this.creep.withdraw(source, "energy", this.creep.store.getFreeCapacity());
          } else {
            this.creep.pickup(source);
          }
        } else if (this.creep.fatigue === 0) {
          this.creep.moveTo(source);
        }
      } else {
        this.memory.working = true;
      }
    }
  }
}
