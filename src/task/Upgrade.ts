export class Upgrade {
  constructor(private creep: Creep, private memory: UpgradeMemory) { }

  public act() {
    if (this.creep.store.getUsedCapacity() === 0) { ; }
  }
}
