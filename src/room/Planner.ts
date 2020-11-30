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
  tower: "",
}

function translate(points: Array<{x: number, y: number}>, by: {x: number, y: number}): Array<{x: number, y: number}> {
  return _.map(points, (p) => ({ x: p.x + by.x, y: p.y + by.y }));
}

const extensionShape = [ {x: 0, y:0}, {x: 0, y:2}, {x: 1, y:1}, {x: 2, y:0}, {x: 2, y:2} ];
const extensionShape2 = [
  {x: 0, y:0}, {x: 1, y:0}             ,
  {x: 0, y:1},              {x: 2, y:1},
               {x: 1, y:2}, {x: 2, y:2},
];

const roadPositions: RoomPosition[][] = [];

export class Planner {
  constructor(private room: Room, private logger: Logger) { }

  public drawPlan(plan: Blueprint[]): void {
    for (const blueprint of plan) {
      const room = Game.rooms[blueprint.pos.roomName];
      room.visual.text(structureIconMap[blueprint.structureType], blueprint.pos, { stroke: "white" });
    }
  }

  public plan() {
    if (roadPositions.length === 0) {
      // see roads
      const goals = _.map([
        ...this.room.find(FIND_MY_STRUCTURES),
        ...this.room.find(FIND_SOURCES),
      ], (goal) => {
        return { pos: goal.pos, range: 1 };
      });

      for (const goal of goals) {
        for (const dest of goals.filter((x) => x !== goal)) {

          const ret = PathFinder.search(
            goal.pos, dest.pos,
            {
              plainCost: 2,
              swampCost: 10,

              roomCallback: (roomName) => {
                const room = Game.rooms[roomName];

                const costs = new PathFinder.CostMatrix();

                if (!room) { return costs; }

                roadPositions.forEach((path) => {
                  path.forEach((road) => {
                    costs.set(road.x, road.y, 1);

                    if (room.controller && room.controller.pos.inRangeTo(road, 3)) {
                      costs.set(road.x, road.y, 3);
                    }
                  })
                });

                room.find(FIND_STRUCTURES).forEach((struct) => {
                  if (struct.structureType === STRUCTURE_ROAD) {
                    costs.set(struct.pos.x, struct.pos.y, 1);

                    if (room.controller && room.controller.pos.inRangeTo(struct.pos, 3)) {
                      costs.set(struct.pos.x, struct.pos.y, 3);
                    }
                  } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                            (struct.structureType !== STRUCTURE_RAMPART ||
                              !struct.my)) {
                    costs.set(struct.pos.x, struct.pos.y, 0xFF);
                  }
                });

                return costs;
              },
            }
          );

          roadPositions.unshift(ret.path);
        }
      }
    }

    const bigun = [
      ...translate(extensionShape, {x: 0, y:0}),
      ...translate(extensionShape, {x: 2, y:0}),
      ...translate(extensionShape, {x: 0, y:2}),
      ...translate(extensionShape, {x: 2, y:2}),
    ];

    const bigun2 = [
      ...translate(extensionShape2, {x: 0, y:0}),
      ...translate(extensionShape2, {x: 3, y:0}),
      ...translate(extensionShape2, {x: 0, y:3}),
      ...translate(extensionShape2, {x: 3, y:3}),
    ];

    const all = _.unique([
      ...translate(bigun, {x: 0, y:0}),
      ...translate(bigun, {x: 4, y:0}),
      ...translate(bigun, {x: 0, y:4}),
      ...translate(bigun, {x: 4, y:4}),
      ...translate(bigun, {x: 0, y:8}),
      ...translate(bigun, {x: 4, y:8}),
    ], (s) => s.x + s.y * 25);

    const all2 = _.take(_.sortBy(_.unique([
      ...translate(bigun2, {x: 0, y:0}),
      ...translate(bigun2, {x: 3, y:0}),
      ...translate(bigun2, {x: 0, y:6}),
      ...translate(bigun2, {x: 3, y:6}),
    ], (s) => s.x + s.y * 25), (s) => s.x + s.y * 25), 60);

    // all.forEach((point) => {
    //   this.room.visual.text("e", point.x, point.y, { opacity: 0.5 });
    // });

    translate(all2, {x: 10, y:0}).forEach((point) => {
      this.room.visual.text("e", point.x, point.y, { opacity: 0.5 });
    });

    // this.logger.logInfo("extension1 count: " + all.length);
    // this.logger.logInfo("extension2 count: " + all2.length);

    // translate(extensionShape, Game.spawns.Spawn1.pos).forEach((point) => {
    //   this.room.visual.text("e", point.x, point.y);
    // });

    roadPositions.forEach((path) => {
      this.room.visual.poly(path, { stroke: "#555", lineStyle: "dotted"})
    });
  }
}
