import { Planner } from "room/Planner";
import { AttackTask } from "task/AttackTask";
import { BuildTask } from "task/BuildTask";
import { HarvestTask } from "task/HarvestTask";
import { IdleTask } from "task/IdleTask";
import { SignTask } from "task/SignTask";
import { SpawnTask } from "task/SpawnTask";
import { UpgradeTask } from "task/UpgradeTask";
import { ErrorMapper } from "utils/ErrorMapper";
import { Timer } from "utils/Timer";
import { Version } from "utils/Version";
import { logger } from "./utils/Log";

logger.logAlert(`START - ${Version.name} - ${Version.string} - ${Game.shard.name}`);

function badTask(t: never): never;
function badTask(t: TaskMemory) {
  throw new Error("invalid task memory: " + t);
}

export const loop = ErrorMapper.wrapLoop(() =>
  Timer.log(logger, () => {
    if (Game.cpu.bucket === 10000) {
      Game.cpu.generatePixel();
      logger.logInfo("generated pixel");
    }

    for (const roomName in Game.rooms) {
      const roomLogger = logger.scoped(roomName, { room: roomName });
      const room = Game.rooms[roomName];

      if (!room.memory || !room.memory.harvestables) {
        const harvestables = [...room.find(FIND_SOURCES), ...room.find(FIND_MINERALS)];
        roomLogger.logInfo("found harvestables " + harvestables.join(" "));
        room.memory = { harvestables: _.map(harvestables, (s) => ({ id: s.id, nextSpawn: 0 })) };
      }

      if (room.controller && room.controller.my) {
        const spawns = room.find(FIND_MY_SPAWNS);

        for (const tower of room.find<StructureTower>(FIND_MY_STRUCTURES, {
          filter: (s) => s instanceof StructureTower
        })) {
          const attack = _.first(room.find(FIND_HOSTILE_CREEPS));
          if (attack) {
            tower.attack(attack);
          } else {
            const heal = _.first(room.find(FIND_MY_CREEPS, { filter: (s) => s.hits < s.hitsMax }));
            if (heal) {
              tower.heal(heal);
            } else {
              const repair = _.first(room.find(FIND_MY_STRUCTURES, { filter: (s) => s.hits < s.hitsMax }));
              if (repair) {
                tower.repair(repair);
              }
            }
          }
        }

        new Planner(room, roomLogger).plan();

        for (const spawn of spawns) {
          if (!spawn.spawning && room.energyAvailable === room.energyCapacityAvailable) {
            const potentialCreepName = `${roomName} ${Game.time % 9997}`;

            for (const sourceCheckInd in room.memory.harvestables) {
              const sourceCheck = room.memory.harvestables[sourceCheckInd];
              const source = Game.getObjectById(sourceCheck.id);

              if (source && sourceCheck.nextSpawn < Game.time) {
                if (source instanceof Source) {
                  if (
                    spawn.spawnCreep([WORK, MOVE, MOVE, WORK], potentialCreepName, {
                      memory: { task: { task: "harvest", source: sourceCheck.id } }
                    }) === OK
                  ) {
                    sourceCheck.nextSpawn = Game.time + 1500;
                  }
                } else {
                  const extractors = room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_EXTRACTOR
                  });
                  if (_.any(extractors, (ex) => source.pos.isEqualTo(ex.pos))) {
                    if (
                      spawn.spawnCreep([WORK, MOVE, MOVE, WORK], potentialCreepName, {
                        memory: { task: { task: "harvest", source: sourceCheck.id } }
                      }) === OK
                    ) {
                      sourceCheck.nextSpawn = Game.time + 1500;
                    }
                  }
                }
              }
            }

            const workerLimits: Record<Tasks, number> = {
              attack: room.find(FIND_HOSTILE_CREEPS).length > 0 ? 2 : 0,
              build: 2,
              harvest: 0,
              idle: 0,
              sign: 0,
              spawn: 2,
              upgrade: 1
            };

            for (const creepName in Game.creeps) {
              workerLimits[Game.creeps[creepName].memory.task.task]--;
            }

            for (const job in workerLimits) {
              if (workerLimits[job as Tasks] > 0) {
                switch (job as Tasks) {
                  case "attack":
                    spawn.spawnCreep([TOUGH, TOUGH, TOUGH, ATTACK, MOVE, MOVE], potentialCreepName, {
                      memory: { task: { task: "attack", room: roomName } }
                    });
                    break;
                  case "upgrade":
                    spawn.spawnCreep([WORK, MOVE, MOVE, CARRY, CARRY], potentialCreepName, {
                      memory: { task: { task: "upgrade", room: roomName, working: false } }
                    });
                    break;
                  case "build":
                    spawn.spawnCreep([WORK, MOVE, MOVE, CARRY, CARRY], potentialCreepName, {
                      memory: { task: { task: "build", room: roomName, working: false } }
                    });
                    break;
                  case "spawn":
                    spawn.spawnCreep([MOVE, MOVE, CARRY, CARRY], potentialCreepName, {
                      memory: { task: { task: "spawn", room: roomName, working: false } }
                    });
                    break;
                  case "sign":
                    spawn.spawnCreep([MOVE], potentialCreepName, {
                      memory: { task: { task: "sign" } }
                    });
                    break;
                  case "idle":
                    logger.logCrit("trying to spawn an idle creep");
                    break;
                }
              }
            }
          }
        }
      }
    }

    for (const creepName in Memory.creeps) {
      const creepLogger = logger.scoped("creep " + creepName);

      if (!Game.creeps[creepName]) {
        delete Memory.creeps[creepName];
        creepLogger.logDebug("removing memory");
        continue;
      }

      creepLogger.data = { ...creepLogger.data, ...{ room: Game.creeps[creepName].room.name } };

      const creep = Game.creeps[creepName];

      switch (creep.memory.task.task) {
        case "upgrade":
          new UpgradeTask(creep, creep.memory.task, creepLogger).act();
          break;
        case "harvest":
          new HarvestTask(creep, creep.memory.task, creepLogger).act();
          break;
        case "build":
          new BuildTask(creep, creep.memory.task, creepLogger).act();
          break;
        case "spawn":
          new SpawnTask(creep, creep.memory.task, creepLogger).act();
          break;
        case "attack":
          new AttackTask(creep, creep.memory.task, creepLogger).act();
          break;
        case "idle":
          new IdleTask(creep, creep.memory.task, creepLogger).act();
          break;
        case "sign":
          new SignTask(creep, creep.memory.task, creepLogger).act();
          break;
        default:
          badTask(creep.memory.task);
      }
    }
  })
);
