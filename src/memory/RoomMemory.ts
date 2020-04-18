interface RoomMemory {
  jobs: string[];
  map: Terrain[][];
  highlights: {
    exits: ExitHighlight[];
    sources: Array<IdedRoomPosition<Source>>;
    minerals: Array<IdedRoomPosition<Mineral>>;
  };
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
