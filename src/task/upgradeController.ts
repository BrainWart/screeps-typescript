export default function (creep: Creep) {
  if (creep.store.energy === 0) {
    creep.memory.tasks.push(Task.HARVEST_SOURCE);
    return;
  }

  if (creep.room.controller == null) {
    return;
  }

  const target = creep.room.controller;

  if (target) {
    switch (creep.upgradeController(target)) {
      case ERR_NOT_IN_RANGE:
        switch (creep.moveTo(target.pos)) {
          case ERR_NO_PATH:
            creep.memory.target = null;
            break;

          default:
            break;
        }
        break;

      default:
        break;
    }
  }
}
