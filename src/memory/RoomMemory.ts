interface RoomMemory {
  version: string;
  constructedForLevel: number;
  tasks: Array<TaskItem & {maxCreeps?: number, creeps: Array<Id<Creep>>}>,
}

type TaskItem = {
  id: Id<Source | Deposit | Mineral>,
  action: 'harvest',
} | {
  id: Id<StructureController>,
  action: 'upgrade',
} | {
  id: Id<StructureSpawn | StructureExtension
    | StructureStorage | StructureLink | StructureContainer | Creep>,
  action: 'transfer',
}