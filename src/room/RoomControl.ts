import { Logger } from "utils/Logger";

const logger = new Logger("RoomControl");

export class RoomControl {
  public static getTasks(room: Room): Task[] {
    const tasks = room.memory.tasks || [];

    if (room.controller && room.controller.my) {
      tasks.push({
        action: "upgrade",
        id: room.controller.id as string,
        pos: room.controller.pos,
        requirements: [
          { hard: false, skill: "upgrade" },
          { hard: false, skill: "carry" },
          { hard: false, skill: "move" }
        ],
        target: room.controller.id,
        working: []
      });

      for (const sourceData of Object.values(room.memory.sources)) {
        const source = Game.getObjectById(sourceData.id);

        if (source) {
          tasks.push({
            action: "harvest",
            id: sourceData.id as string,
            pos: sourceData.pos,
            requirements: [
              { hard: true, skill: "harvestEnergy", minimumUnits: source.energyCapacity / 300 },
              { hard: false, skill: "move" }
            ],
            target: sourceData.id,
            working: []
          });
        }
      }
    }

    return _.uniq(tasks, "id");
  }

  public static setupMemory(room: Room): void {
    if (_.isEmpty(room.memory)) {
      if (room.controller && room.controller.my) {
        room.memory = {
          minerals: {},
          roomData: {
            controlled: true,
            defcon: 5
          },
          sources: {},
          spawns: {},
          tasks: []
        };
      } else {
        room.memory = {
          minerals: {},
          roomData: {
            controlled: false,
            hostility: 0
          },
          sources: {},
          spawns: {},
          tasks: []
        };
      }
    }

    if (_.isEmpty(room.memory.sources)) {
      room.memory.sources = {};
      for (const source of room.find(FIND_SOURCES)) {
        logger.logTrace2(`found source ${source.id}`);
        room.memory.sources[source.id] = { id: source.id, pos: source.pos };
      }
    }

    if (_.isEmpty(room.memory.minerals)) {
      room.memory.minerals = {};
      for (const mineral of room.find(FIND_MINERALS)) {
        logger.logTrace2(`found mineral ${mineral.id}`);
        room.memory.minerals[mineral.id] = { id: mineral.id, pos: mineral.pos };
      }
    }

    if (_.isEmpty(room.memory.spawns)) {
      room.memory.spawns = {};
      for (const spawn of room.find(FIND_MY_SPAWNS)) {
        logger.logTrace2(`found spawn ${spawn.id}`);
        room.memory.spawns[spawn.id] = { id: spawn.id, pos: spawn.pos };
      }
    }
  }
}
