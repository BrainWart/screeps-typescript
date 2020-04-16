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

  if (Game.time % 113 === 0) {
    // Do construction
    const roadPositions: RoomPosition[] = [];

    if (room.controller && room.controller.my) {
      for (const spawn of room.find(FIND_MY_SPAWNS)) {
        const path = room.findPath(room.controller.pos, spawn.pos, {
          ignoreCreeps: true,
          swampCost: 1
        });

        for (const pathStep of path) {
          const position = new RoomPosition(pathStep.x, pathStep.y, room.name);
          if (_.contains(roadPositions, position)) {
            continue;
          }

          roadPositions.push(position);
        }
      }
    }

    const sources = room.find(FIND_SOURCES);
    for (const source of sources) {
      let shortestPath: RoomPosition[] = null!;

      for (const pos of roadPositions) {
        const path = room.findPath(source.pos, pos, {
          ignoreCreeps: true,
          swampCost: 1
        });

        if (!shortestPath || path.length < shortestPath.length) {
          shortestPath = _.map(path, (p) => new RoomPosition(p.x, p.y, room.name));
        }
      }

      if (shortestPath) {
        for (const pathStep of shortestPath) {
          const position = new RoomPosition(pathStep.x, pathStep.y, room.name);
          if (_.contains(roadPositions, position)) {
            continue;
          }

          roadPositions.push(position);
        }
      }
    }

    room.memory.roads = roadPositions;

    console.log(`updated roads: ${Game.time}`);
  }

  if (room.memory.roads) {
    for (const pos of room.memory.roads) {
      let foundRoad = false;
      for (const found of room.lookAt(pos.x, pos.y)) {
        if (found.structure) {
          room.visual.circle(pos, { fill: "#00FF00" });
          foundRoad = true;
          break;
        } else if (found.constructionSite) {
          if (found.constructionSite.structureType === STRUCTURE_ROAD) {
            room.visual.circle(pos, { fill: "#FFFF00" });
            foundRoad = true;
            break;
          }
        }
      }

      if (!foundRoad) {
        room.visual.circle(pos, { fill: "#FF0000" });
      }
    }
  }
}
