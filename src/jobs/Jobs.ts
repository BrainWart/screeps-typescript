export type MineType = "mine";
export type UpgraderType = "upgrader";
export type NoType = undefined;
export type JobType = MineType | UpgraderType | NoType;

export { Job } from "./Job";
export { Mine } from "./Mine";

export interface Worker {
  a: any;
}
