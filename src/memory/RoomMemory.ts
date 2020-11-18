interface RoomMemory {
  jobs: string[];
  map: Terrain[][];
  sources: { [id: string]: IdedRoomPosition<Source> } | null;
  minerals: { [id: string]: IdedRoomPosition<Mineral> } | null;
}

interface ExitHighlight {
  direction: ExitConstant;
  min: RoomPosition;
  max: RoomPosition;
}

interface IdedRoomPosition<T extends RoomObject & { id: string }> {
  id: Id<T>;
  pos: RoomPosition;
}
