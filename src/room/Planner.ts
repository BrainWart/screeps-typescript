import { Logger } from "utils/logging/Logger";

const structureIconMap: Record<BuildableStructureConstant, { icon: string; style: TextStyle }> = {
  constructedWall: { icon: "w", style: {} },
  container: { icon: "c", style: {} },
  extension: { icon: "e", style: {} },
  extractor: { icon: "x", style: {} },
  factory: { icon: "f", style: {} },
  lab: { icon: "l", style: {} },
  link: { icon: "L", style: {} },
  nuker: { icon: "n", style: {} },
  observer: { icon: "o", style: {} },
  powerSpawn: { icon: "p", style: {} },
  rampart: { icon: "r", style: {} },
  road: { icon: "~", style: {} },
  spawn: { icon: "s", style: {} },
  storage: { icon: "S", style: {} },
  terminal: { icon: "t", style: {} },
  tower: { icon: "T", style: {} }
};

interface Blueprint {
  pos: Position;
  structureType: BuildableStructureConstant;
}

interface Position {
  x: number;
  y: number;
}

interface Bounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

function translate(points: Blueprint, by: Position): Blueprint;
function translate(points: Blueprint[], by: Position): Blueprint[];
function translate(points: Blueprint[] | Blueprint, by: Position): Blueprint[] | Blueprint {
  if (Array.isArray(points)) {
    return _.map(points, (p) => ({ structureType: p.structureType, pos: { x: p.pos.x + by.x, y: p.pos.y + by.y } }));
  } else {
    return { structureType: points.structureType, pos: { x: points.pos.x + by.x, y: points.pos.y + by.y } };
  }
}

function multiply(points: Blueprint, by: Position): Blueprint;
function multiply(points: Blueprint[], by: Position): Blueprint[];
function multiply(points: Blueprint[] | Blueprint, by: Position): Blueprint[] | Blueprint {
  if (Array.isArray(points)) {
    return _.map(points, (p) => ({ structureType: p.structureType, pos: { x: p.pos.x * by.x, y: p.pos.y * by.y } }));
  } else {
    return { structureType: points.structureType, pos: { x: points.pos.x * by.x, y: points.pos.y * by.y } };
  }
}

function size(points: Blueprint[]): Position {
  const x = _.map(points, (p) => p.pos.x);
  const y = _.map(points, (p) => p.pos.y);

  return { x: Math.max(...x) - Math.min(...x), y: Math.max(...y) - Math.min(...y) };
}

// function bounds(points: Position[]): Bounds {
//   const x = _.map(points, (p) => p.x);
//   const y = _.map(points, (p) => p.y);

//   return { right: Math.max(...x), left: Math.min(...x), bottom: Math.max(...y), top: Math.min(...y) };
// }

function flipX(points: Blueprint[]): Blueprint[] {
  const x = _.map(points, (p) => p.pos.x);

  return translate(multiply(points, { x: -1, y: 1 }), { x: Math.max(...x) * 2 - size(points).x, y: 0 });
}

// prettier-ignore
const extensionShape: Blueprint[] = [
  { pos: { x: 0, y: 0 }, structureType: STRUCTURE_EXTENSION }, { pos: { x: 1, y: 0 }, structureType: STRUCTURE_EXTENSION }, { pos: { x: 2, y: 0 }, structureType: STRUCTURE_ROAD },
  { pos: { x: 0, y: 1 }, structureType: STRUCTURE_EXTENSION }, { pos: { x: 1, y: 1 }, structureType: STRUCTURE_ROAD },      { pos: { x: 2, y: 1 }, structureType: STRUCTURE_EXTENSION },
  { pos: { x: 0, y: 2 }, structureType: STRUCTURE_ROAD },      { pos: { x: 1, y: 2 }, structureType: STRUCTURE_EXTENSION }, { pos: { x: 2, y: 2 }, structureType: STRUCTURE_EXTENSION }
];

const roadPositions: RoomPosition[][] = [];

export class Planner {
  constructor(private room: Room, private logger: Logger) {}

  public drawPlan(plan: Blueprint[]): void {
    for (const blueprint of plan) {
      this.room.visual.text(
        structureIconMap[blueprint.structureType].icon,
        new RoomPosition(blueprint.pos.x, blueprint.pos.y, this.room.name),
        { ...{ opacity: 0.5 }, ...structureIconMap[blueprint.structureType].style }
      );
    }
  }

  public buildPlan(plan: Blueprint[]): void {
    for (const blueprint of plan) {
      if (
        _.find(
          this.room.lookAt(blueprint.pos.x, blueprint.pos.y),
          (la) => la.structure && la.structure.structureType === blueprint.structureType
        ) ||
        _.find(Game.constructionSites, (s) => s.pos.x === blueprint.pos.x && s.pos.y === blueprint.pos.y)
      ) {
        this.logger.logDebug(`already build ${blueprint.structureType} at ${JSON.stringify(blueprint.pos)}`);
        continue;
      }
      const code = this.room.createConstructionSite(blueprint.pos.x, blueprint.pos.y, blueprint.structureType);
      if (code !== OK) {
        this.logger.logDebug(
          `couldn't build ${blueprint.structureType} at ${JSON.stringify(blueprint.pos)}; code: ${code}`
        );
      }
    }
  }

  public plan(): Blueprint[] {
    if (roadPositions.length === 0) {
      // see roads
      const goals = _.map([...this.room.find(FIND_MY_STRUCTURES), ...this.room.find(FIND_SOURCES)], (goal) => {
        return { pos: goal.pos, range: 1 };
      });

      for (const goal of goals) {
        for (const dest of goals.filter((x) => x !== goal)) {
          const ret = PathFinder.search(goal.pos, dest.pos, {
            plainCost: 2,
            swampCost: 10,

            roomCallback: (roomName) => {
              const room = Game.rooms[roomName];

              const costs = new PathFinder.CostMatrix();

              if (!room) {
                return costs;
              }

              roadPositions.forEach((path) => {
                path.forEach((road) => {
                  costs.set(road.x, road.y, 1);

                  if (room.controller && room.controller.pos.inRangeTo(road, 3)) {
                    costs.set(road.x, road.y, 3);
                  }
                });
              });

              room.find(FIND_STRUCTURES).forEach((struct) => {
                if (struct.structureType === STRUCTURE_ROAD) {
                  costs.set(struct.pos.x, struct.pos.y, 1);

                  if (room.controller && room.controller.pos.inRangeTo(struct.pos, 3)) {
                    costs.set(struct.pos.x, struct.pos.y, 3);
                  }
                } else if (
                  struct.structureType !== STRUCTURE_CONTAINER &&
                  (struct.structureType !== STRUCTURE_RAMPART || !struct.my)
                ) {
                  costs.set(struct.pos.x, struct.pos.y, 0xff);
                }
              });

              return costs;
            }
          });

          roadPositions.unshift(ret.path);
        }
      }
    }

    const bigun = [
      ...translate(extensionShape, { x: 0, y: 0 }),
      ...translate(extensionShape, { x: 3, y: 0 }),
      ...translate(extensionShape, { x: 0, y: 3 }),
      ...translate(extensionShape, { x: 3, y: 3 })
    ];

    const single: (num: Blueprint) => number = (pos) => pos.pos.x + pos.pos.y * 50;

    const all = _.unique(
      [
        ...translate(bigun, { x: 0, y: 0 }),
        ...translate(bigun, { x: 3, y: 0 }),
        ...translate(bigun, { x: 0, y: 6 }),
        ...translate(bigun, { x: 3, y: 6 }),
        ...translate(bigun, { x: 0, y: 6 }),
        ...translate(bigun, { x: 3, y: 6 })
      ],
      single
    );

    const availableExtensionCount = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][this.room.controller?.level ?? 1];

    const [exitLeft, exitTop, exitRight, exitBottom] = [
      _.any(this.room.find(FIND_EXIT_LEFT)) ? -1 : 0,
      _.any(this.room.find(FIND_EXIT_TOP)) ? -1 : 0,
      _.any(this.room.find(FIND_EXIT_RIGHT)) ? 1 : 0,
      _.any(this.room.find(FIND_EXIT_BOTTOM)) ? 1 : 0
    ];

    const sizeAll = size(all);

    const baseLoc = {
      x: 25 - (exitLeft + exitRight) * 8 + sizeAll.x * -0.5,
      y: 25 - (exitTop + exitBottom) * 8 + sizeAll.y * -0.5
    };

    const fBp: Blueprint[] = [];

    const spawn = _.first(this.room.find(FIND_MY_SPAWNS));
    if (spawn) {
      const xFlip = spawn.pos.x < baseLoc.x;
      const yFlip = spawn.pos.y > baseLoc.y;

      let bp = translate(all, baseLoc);

      if ((xFlip && !yFlip) || (!xFlip && yFlip)) {
        bp = _.sortBy(flipX(bp), (blu) => Game.spawns.Spawn1.pos.getRangeTo(blu.pos.x, blu.pos.y));
      } else {
        bp = _.sortBy(bp, (blu) => Game.spawns.Spawn1.pos.getRangeTo(blu.pos.x, blu.pos.y));
      }

      let eCount = 0;
      for (const b of bp) {
        fBp.unshift({ pos: { x: Math.floor(b.pos.x), y: Math.floor(b.pos.y) }, structureType: b.structureType });

        if (b.structureType === STRUCTURE_EXTENSION) {
          eCount++;
        }
        if (eCount === availableExtensionCount) {
          break;
        }
      }
    }

    for (const r of roadPositions) {
      for (const rp of r) {
        fBp.unshift({ pos: { x: rp.x, y: rp.y }, structureType: STRUCTURE_ROAD });
      }
    }

    return fBp;
  }
}
