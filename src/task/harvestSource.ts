export default function (creep: Creep) {
  if (creep.store.getFreeCapacity() === 0) {
    creep.memory.tasks.pop();
    creep.memory.target = null;
    return;
  }

  if (creep.memory.target == null) {
    let distance = Number.MAX_VALUE;

    for (const source of creep.room.find(FIND_SOURCES)) {
      if (source.energy > 0) {
        const sourceDistance = creep.room.findPath(creep.pos, source.pos).length;

        if (sourceDistance < distance && sourceDistance > 0) {
          creep.memory.target = source.id;
          distance = sourceDistance;
        }
      }
    }
  }

  if (creep.memory.target) {
    const target = Game.getObjectById(creep.memory.target);

    if (target) {
      switch (creep.harvest(target as Source)) {
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
}
