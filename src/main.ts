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

export const loop = ErrorMapper.wrapLoop(() => {
  const cpuUsed = Timer.measure(() => {
    if (Game.cpu.bucket === 10000) {
      Game.cpu.generatePixel();
      logger.logInfo("generated pixel");
    }

    for (const roomName in Game.rooms) {
      const roomLogger = logger.scoped(roomName, { room: roomName });
      const room = Game.rooms[roomName];

      if (!room.memory || !room.memory.harvestables || !room.memory.contructedForLevel) {
        const harvestables = [...room.find(FIND_SOURCES), ...room.find(FIND_MINERALS)];
        roomLogger.logInfo("found harvestables " + harvestables.join(" "));
        room.memory = {
          contructedForLevel: -1,
          harvestables: _.map(harvestables, (s) => ({ id: s.id, nextSpawn: 0 }))
        };
      }

      if (
        _.any(room.find(FIND_MY_STRUCTURES, { filter: (s) => s.hits < s.hitsMax })) ||
        (room.controller && room.controller.ticksToDowngrade < 3000)
      ) {
        roomLogger.logAlert("room has been damaged. enabling safe-mode");
      }

      if (room.controller && room.controller.my) {
        const spawns = room.find(FIND_MY_SPAWNS);

        for (const tower of room.find<StructureTower>(FIND_MY_STRUCTURES, {
          filter: (s) => s instanceof StructureTower
        })) {
          const attack = _.first(
            room.find(FIND_HOSTILE_CREEPS, { filter: (creep) => creep.pos.getRangeTo(tower) < 20 })
          );
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

        if (room.memory.contructedForLevel < room.controller.level) {
          const planner = new Planner(room, roomLogger);
          const plan = planner.plan();

          roomLogger.logInfo("planning: " + JSON.stringify(_.groupBy(plan, (b) => b.structureType)));
          planner.drawPlan(plan);
          planner.buildPlan(plan);

          room.memory.contructedForLevel = room.controller.level;
        }

        for (const spawn of spawns) {
          if (!spawn.spawning && room.energyAvailable >= 300) {
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
                    sourceCheck.nextSpawn = Game.time + 750;
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
              attack: room.find(FIND_HOSTILE_CREEPS).length > 0 ? 1 : 0,
              build:
                2 +
                Math.floor(
                  _.sum(
                    room.find(FIND_DROPPED_RESOURCES, { filter: (r) => r.resourceType === RESOURCE_ENERGY }),
                    (r) => r.amount
                  ) / 400
                ),
              harvest: 0,
              idle: 0,
              sign: 0,
              spawn: 1,
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

    const creepJobTimer = new Timer();

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
          {
            const task = new UpgradeTask(creep, creep.memory.task, creepLogger);
            creepJobTimer.recordTime("upgrade", () => task.act());
          }
          break;
        case "harvest":
          {
            const task = new HarvestTask(creep, creep.memory.task, creepLogger);
            creepJobTimer.recordTime("harvest", () => task.act());
          }
          break;
        case "build":
          {
            const task = new BuildTask(creep, creep.memory.task, creepLogger);
            creepJobTimer.recordTime("build  ", () => task.act());
          }
          break;
        case "spawn":
          {
            const task = new SpawnTask(creep, creep.memory.task, creepLogger);
            creepJobTimer.recordTime("spawn  ", () => task.act());
          }
          break;
        case "attack":
          {
            const task = new AttackTask(creep, creep.memory.task, creepLogger);
            creepJobTimer.recordTime("attack ", () => task.act());
          }
          break;
        case "idle":
          {
            const task = new IdleTask(creep, creep.memory.task, creepLogger);
            creepJobTimer.recordTime("idle   ", () => task.act());
          }
          break;
        case "sign":
          {
            const task = new SignTask(creep, creep.memory.task, creepLogger);
            creepJobTimer.recordTime("sign   ", () => task.act());
          }
          break;
        default:
          badTask(creep.memory.task);
      }
    }

    logger.logTrace("creep cpu usage:");
    const summary = creepJobTimer.summary();
    for (const job in summary) {
      logger.logTrace(
        `    ${job}: ${summary[job].total.toFixed(3)} [${(summary[job].total / summary[job].count).toFixed(3)} avg]`
      );
    }
    logger.logTrace(
      `    totals : ${_.sum(summary, (s) => s.total).toFixed(3)} [${(
        _.sum(summary, (s) => s.total) / _.sum(summary, (s) => s.count)
      ).toFixed(3)} avg]`
    );
  });
  logger.logDebug("total cpu  : " + cpuUsed.toFixed(3));
});
