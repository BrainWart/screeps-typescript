interface RoomMemory {
  // map: Terrain[][];
  roomData: MyRoomData | EnemyRoomData;
  sources: { [id: string]: IdedRoomPosition<Source> };
  minerals: { [id: string]: IdedRoomPosition<Mineral> };
  spawns: { [id: string]: IdedRoomPosition<StructureSpawn> };
}

interface MyRoomData {
  controlled: true;
  defcon: number;
}

interface EnemyRoomData {
  controlled: false;
  hostility: number;
}

interface IdedRoomPosition<T extends RoomObject & { id: string }> {
  id: Id<T>;
  pos: RoomPosition;
}
