interface RoomMemory {
  contructedForLevel: number;
  harvestables: Array<IdSpawn<Source | Mineral<MineralConstant>>>;
}

interface IdSpawn<T> {
  id: Id<T>;
  nextSpawn: number;
}
