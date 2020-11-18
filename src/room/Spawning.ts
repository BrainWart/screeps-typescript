const conversion: { [id in RequirementSkill]: { part: BodyPartConstant; units: number } } = {
  attack: { part: ATTACK, units: 30 },
  build: { part: WORK, units: 5 },
  carry: { part: CARRY, units: 50 },
  claim: { part: CLAIM, units: 1 },
  dismantle: { part: WORK, units: 50 },
  harvestEnergy: { part: WORK, units: 2 },
  harvestMineral: { part: WORK, units: 1 },
  heal: { part: HEAL, units: 8 },
  move: { part: MOVE, units: 1 },
  range_attack: { part: RANGED_ATTACK, units: 4 },
  repair: { part: WORK, units: 100 },
  tough: { part: TOUGH, units: 100 },
  upgrade: { part: WORK, units: 1 }
};

export class Spawning {
  public static fillRequirements(task: Task, energyAvailable: number): BodyPartConstant[] {
    const requirements = task.requirements;
    let parts: BodyPartConstant[] = [];

    for (const requirement of requirements) {
      if (requirement.hard) {
        parts = parts.concat(
          _.fill(
            Array(requirement.minimumUnits / conversion[requirement.skill].units),
            conversion[requirement.skill].part
          )
        );
      } else {
        parts = parts.concat([conversion[requirement.skill].part]);
      }
    }

    if (_.sum(parts, (part) => BODYPART_COST[part]) > energyAvailable) {
      const groups = _.groupBy(parts);
    }

    return parts;
  }
}
