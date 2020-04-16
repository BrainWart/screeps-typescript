import RoomManager from "room/RoomManager";
import TaskManager from "task/TaskManager";
import { ErrorMapper } from "utils/ErrorMapper";

export const loop = ErrorMapper.wrapLoop(() => {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];

    RoomManager.Manage(room);
  }

  const unassigned: Creep[] = [];

  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];
    const tasks = creep.memory.tasks;

    if (creep.spawning) {
      continue;
    }

    if (tasks.length < 1) {
      unassigned.push(creep);
    } else {
      TaskManager.GetTask(tasks[tasks.length - 1])(creep);
    }
  }

  for (const creep of unassigned) {
    creep.memory.tasks.push(Task.UPGRADE_CONTROLLER);
  }

  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
