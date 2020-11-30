interface CreepMemory {
  tasks: TaskMemory[];
  [key: string]: any;
}

type Tasks = TaskMemory[keyof TaskMemory];

type TaskMemory = UpgradeMemory | HarvestMemory;

interface UpgradeMemory {
  task: "upgrade";
  room: string;
}

interface HarvestMemory {
  task: "harvest";
  source: Id<Source | Mineral>;
}
