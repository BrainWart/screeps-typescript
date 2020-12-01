interface CreepMemory {
  task: TaskMemory;
  [key: string]: any;
}

type Tasks = TaskMemory[keyof TaskMemory];

type TaskMemory = UpgradeMemory | HarvestMemory | BuildMemory | SpawnMemory | AttackMemory | IdleMemory | SignMemory;

interface UpgradeMemory {
  task: "upgrade";
  room: string;
  working: boolean;
}

interface BuildMemory {
  task: "build";
  room: string;
  working: boolean;
}

interface SpawnMemory {
  task: "spawn";
  room: string;
  working: boolean;
}

interface AttackMemory {
  task: "attack";
  room: string;
}

interface IdleMemory {
  task: "idle";
}

interface SignMemory {
  task: "sign";
  controllerId?: Id<StructureController>;
  message?: string;
}

interface HarvestMemory {
  task: "harvest";
  source: Id<Source | Mineral>;
}
