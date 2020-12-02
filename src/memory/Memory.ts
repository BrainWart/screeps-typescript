interface Memory {
  version: string;
  creeps: { [key: string]: CreepMemory };
  flags: { [key: string]: FlagMemory };
  rooms: { [key: string]: RoomMemory };
  spawns: { [key: string]: SpawnMemory };
}
