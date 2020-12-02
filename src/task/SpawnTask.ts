import { Logger } from "utils/logging/Logger";
import { takeUntil } from "utils/Utility";
import { BuildTask } from "./BuildTask";
import { IdleTask } from "./IdleTask";
import { Task } from "./Task";

function getEnergySource(
  pos: RoomPosition,
  room: Room
): Resource<ResourceConstant> | AnyStoreStructure | Tombstone | undefined {
  const sources = [
    ...room.find(FIND_DROPPED_RESOURCES, { filter: (resource) => resource.resourceType === RESOURCE_ENERGY }),
    ...room.find(FIND_TOMBSTONES)
  ];

  return sources.length > 0
    ? _.max(
        sources,
        (r) =>
          ("amount" in r && r.amount - pos.getRangeTo(r) * 30) ||
          ("store" in r && r.store.getUsedCapacity("energy") - pos.getRangeTo(r) * 50)
      )
    : undefined;
}

function getSpawnRelated(room: Room): StructureSpawn | StructureExtension | StructureTower | undefined {
  return _.first([
    ...room.find(FIND_MY_SPAWNS, { filter: (s) => (s.store.getFreeCapacity(RESOURCE_ENERGY) ?? 0) !== 0 }),
    ...room.find<StructureExtension>(FIND_MY_STRUCTURES, {
      filter: (s) => s instanceof StructureExtension && (s.store.getFreeCapacity(RESOURCE_ENERGY) ?? 0) !== 0
    }),
    ...room.find<StructureTower>(FIND_MY_STRUCTURES, {
      filter: (s) => s instanceof StructureTower && (s.store.getFreeCapacity(RESOURCE_ENERGY) ?? 0) !== 0
    })
  ]);
}

export class SpawnTask extends Task<SpawnMemory> {
  constructor(logger: Logger) {
    super("spawn", logger);
  }

  public act(creep: Creep, memory: SpawnMemory): void {
    if (creep.store.getUsedCapacity() === 0) {
      memory.working = false;
    }
    if (creep.store.getFreeCapacity() === 0) {
      memory.working = true;
    }

    if (memory.working) {
      const toFill = getSpawnRelated(Game.rooms[memory.room]);

      if (toFill) {
        if (creep.pos.isNearTo(toFill)) {
          creep.transfer(
            toFill,
            RESOURCE_ENERGY,
            Math.min(creep.store.getUsedCapacity(RESOURCE_ENERGY), toFill.store.getFreeCapacity(RESOURCE_ENERGY))
          );
        } else if (creep.fatigue === 0) {
          creep.moveTo(toFill, { range: 1, ignoreCreeps: false });
        }
      } else if (creep.body.find((part) => part.type === WORK)) {
        new BuildTask(this.logger).act(creep, { ...memory, ...{ task: "build" } });
      } else {
        new IdleTask(this.logger).act(creep, { ...memory, ...{ task: "idle" } });
      }
    } else {
      const source = getEnergySource(creep.pos, creep.room);

      if (source) {
        if (creep.pos.isNearTo(source)) {
          if ("store" in source) {
            creep.withdraw(source, "energy", creep.store.getFreeCapacity());
          } else {
            creep.pickup(source);
          }
        } else if (creep.fatigue === 0) {
          creep.moveTo(source);
        }
      } else if (creep.body.find((part) => part.type === WORK)) {
        const toMine = _.first(_.sortBy(creep.room.find(FIND_SOURCES), (s) => s.pos.getRangeTo(creep)));
        if (toMine) {
          if (creep.pos.isNearTo(toMine)) {
            creep.harvest(toMine);
          } else {
            creep.moveTo(toMine);
          }
        }
      } else {
        memory.working = true;
      }
    }
  }

  private *bodyGen(needsWork: boolean): IterableIterator<BodyPartConstant> {
    if (needsWork) {
      yield WORK;
    }

    for (let i = 0; i < MAX_CREEP_SIZE; i++) {
      yield MOVE;
      yield CARRY;
    }
  }

  public body(energyAvailable: number): BodyPartConstant[] {
    if (energyAvailable < 300) {
      return [];
    }

    return takeUntil(
      this.bodyGen(!_.any(Game.creeps)),
      (parts) => _.sum(parts, (part) => BODYPART_COST[part]) > energyAvailable
    );
  }

  public trySpawn(room: Room, spawn: StructureSpawn, potentialCreepName: string, body: BodyPartConstant[]): boolean {
    return (
      spawn.spawnCreep(body, potentialCreepName, {
        memory: { task: { task: "spawn", room: room.name, working: false } }
      }) === OK
    );
  }
}
