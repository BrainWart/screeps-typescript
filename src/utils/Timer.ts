import { Logger } from "utils/Logger";

export class Timer {
  public static decimals: number = 2;

  public static measure(func: () => void): number {
    const startTime = Game.cpu.getUsed();
    func();
    return Game.cpu.getUsed() - startTime;
  }

  public static log(logger: Logger, func: () => void): void {
    logger.logTrace1(`${this.measure(func).toFixed(this.decimals)}`);
  }
}
