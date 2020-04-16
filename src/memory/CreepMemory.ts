interface CreepMemory {
  target: Id<RoomObject> | null;
  tasks: Task[];
}

const enum Task {
  HARVEST_SOURCE = "harvestSource",
  UPGRADE_CONTROLLER = "upgradeController"
}
