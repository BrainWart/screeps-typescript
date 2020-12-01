import { Logger } from "utils/logging/Logger";

interface Blueprint {
  pos: RoomPosition;
  structureType: BuildableStructureConstant;
}

const structureIconMap: Record<BuildableStructureConstant, string> = {
  constructedWall: "",
  container: "",
  extension: "",
  extractor: "",
  factory: "",
  lab: "",
  link: "",
  nuker: "",
  observer: "",
  powerSpawn: "",
  rampart: "",
  road: "",
  spawn: "",
  storage: "",
  terminal: "",
  tower: ""
};

function translate(
  points: Array<{ x: number; y: number }>,
  by: { x: number; y: number }
): Array<{ x: number; y: number }> {
  return _.map(points, (p) => ({ x: p.x + by.x, y: p.y + by.y }));
}

function multiply(
  points: Array<{ x: number; y: number }>,
  by: { x: number; y: number }
): Array<{ x: number; y: number }> {
  return _.map(points, (p) => ({ x: p.x * by.x, y: p.y * by.y }));
}

function size(points: Array<{ x: number; y: number }>): { x: number; y: number } {
  const x = _.map(points, (p) => p.x);
  const y = _.map(points, (p) => p.y);

  return { x: Math.max(...x) - Math.min(...x), y: Math.max(...y) - Math.min(...y) };
}

function bounds(points: Array<{ x: number; y: number }>): { top: number; right: number; bottom: number; left: number } {
  const x = _.map(points, (p) => p.x);
  const y = _.map(points, (p) => p.y);

  return { right: Math.max(...x), left: Math.min(...x), bottom: Math.max(...y), top: Math.min(...y) };
}

function flipX(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
  const x = _.map(points, (p) => p.x);

  return translate(multiply(points, { x: -1, y: 1 }), { x: Math.max(...x) * 2 - size(points).x, y: 0 });
}

const extensionShape = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 2, y: 1 },
  { x: 1, y: 2 },
  { x: 2, y: 2 }
];

const roadPositions: RoomPosition[][] = [[new RoomPosition(0, 0, "E56S53")]];

export class Planner {
  constructor(private room: Room, private logger: Logger) {}

  public drawPlan(plan: Blueprint[]): void {
    for (const blueprint of plan) {
      const room = Game.rooms[blueprint.pos.roomName];
      room.visual.text(structureIconMap[blueprint.structureType], blueprint.pos, { stroke: "white" });
    }
  }

  public plan() {
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

    const single: (num: { x: number; y: number }) => number = (pos) => pos.x + pos.y * 25;

    const all = _.unique(
      [
        ...translate(bigun, { x: 0, y: 0 }),
        ...translate(bigun, { x: 3, y: 0 }),
        ...translate(bigun, { x: 0, y: 6 }),
        ...translate(bigun, { x: 3, y: 6 })
      ],
      single
    );

    translate(all, { x: 0, y: 0 }).forEach((point) => {
      this.room.visual.text("e", point.x, point.y, { opacity: 0.5 });
    });

    _.take(
      _.sortBy(flipX(translate(all, { x: 20, y: 10 })), (pos) => Game.spawns.Spawn1.pos.getRangeTo(pos.x, pos.y)),
      CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][this.room.controller?.level ?? 1]
    ).forEach((point) => {
      this.room.visual.text("e", point.x, point.y, { opacity: 0.5 });
    });

    this.logger.logInfo("flipped extensions bounds: " + JSON.stringify(bounds(flipX(translate(all, { x: 20, y: 0 })))));

    // translate(extensionShape, Game.spawns.Spawn1.pos).forEach((point) => {
    //   this.room.visual.text("e", point.x, point.y);
    // });

    roadPositions.forEach((path) => {
      this.room.visual.poly(path, { stroke: "#555", lineStyle: "dotted" });
    });
  }
}
