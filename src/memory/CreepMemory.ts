interface CreepMemory {
  version: string;
  specialization?: TaskItem["action"];
  task?: TaskItem;
  [key: string]: any;
}
