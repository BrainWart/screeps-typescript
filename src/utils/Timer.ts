import { Logger } from "utils/logging/Logger";

export class Timer {
  public static decimals: number = 2;

  public static measure(func: () => void): number {
    const startTime = Game.cpu.getUsed();
    func();
    return Game.cpu.getUsed() - startTime;
  }

  public static log(logger: Logger, func: () => void): void {
    logger.log(`${this.measure(func).toFixed(this.decimals)}`);
  }
}
