function getBody(energy: number): BodyPartConstant[] {
  const body = [MOVE, CARRY, WORK, WORK];

  if (energy > _.sum(_.select(body, (part) => BODYPART_COST[part]))) {
    return body;
  }

  return [];
}

export default function (room: Room) {
  if (getBody(room.energyAvailable).length > 0) {
    for (const spawn of room.find(FIND_MY_SPAWNS)) {
      if (spawn.spawning) {
        continue;
      }

      spawn.spawnCreep(getBody(room.energyAvailable), `creep${Game.time}`, {
        memory: {
          target: null,
          tasks: []
        }
      });
    }
  }
}
