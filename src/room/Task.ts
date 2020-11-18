type TaskAction = "harvest" | "upgrade";

interface Task {
  id: string;
  pos: RoomPosition;
  action: TaskAction;
  target: Id<any> | null;
  working: Array<Id<Creep>>;
  requirements: Requirement[];
}

type RequirementSkill =
  | "harvestEnergy"
  | "harvestMineral"
  | "heal"
  | "repair"
  | "attack"
  | "claim"
  | "dismantle"
  | "range_attack"
  | "upgrade"
  | "carry"
  | "build"
  | "tough"
  | "move";

interface SoftRequirement {
  hard: false;
  skill: RequirementSkill;
}

interface HardRequirement {
  hard: true;
  skill: RequirementSkill;
  // Minimum units needed per tick (for spawning creeps for task)
  minimumUnits: number;
}

type Requirement = SoftRequirement | HardRequirement;
