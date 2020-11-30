interface CreepMemory {
  task: TaskMemory;
  [key: string]: any;
}

type Tasks = TaskMemory[keyof TaskMemory];

type TaskMemory = UpgradeMemory | HarvestMemory | BuildMemory;

interface UpgradeMemory {
  task: "upgrade";
  room: string;
  working: boolean;
}

interface BuildMemory {
  task: "build";
  target: ResourceConstant;
  room: string;
  working: boolean;
}

interface HarvestMemory {
  task: "harvest";
  source: Id<Source | Mineral>;
}
