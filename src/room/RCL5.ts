import { RoomControl } from "room/RoomControl";
export class RCL1Controller implements RoomControl {
  private room: Room;

  constructor(room: Room) {
    this.room = room;
  }

  // tslint:disable-next-line: no-empty
  public getTasks(): void {}

  // tslint:disable-next-line: no-empty
  public createConstructionSites(): void {}
}
