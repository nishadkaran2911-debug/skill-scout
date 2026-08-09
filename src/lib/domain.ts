// Core domain model + skill-gap engine (shared by UI and the exported MERN backend)

export type UserRole = "admin" | "manager" | "employee";
export type SkillCategory = "Technical" | "Soft Skill" | "Management" | "Domain";
export type GapStatus = "RED" | "YELLOW" | "GREEN";

export interface ProficiencyLevel {
  level: number;
  label: string;
  description: string;
}

export const DEFAULT_RUBRIC: ProficiencyLevel[] = [
  { level: 1, label: "Awareness", description: "Basic awareness of the skill and its terminology." },
  { level: 2, label: "Basic", description: "Can perform simple tasks with guidance." },
  { level: 3, label: "Independent", description: "Can independently perform normal tasks using the skill." },
  { level: 4, label: "Advanced", description: "Can handle complex tasks and solve problems independently." },
  { level: 5, label: "Expert / Mentor", description: "Has expert-level knowledge and can guide or mentor others." },
];

export interface Department {
  _id: string;
  name: string;
  description: string;
  managerId: string | null;
}

export interface Skill {
  _id: string;
  name: string;
  category: SkillCategory;
  description: string;
  active: boolean;
}

export interface RoleSkill {
  skillId: string;
  requiredLevel: number;
}

export interface JobRole {
  _id: string;
  name: string;
  departmentId: string;
  description: string;
  requiredSkills: RoleSkill[];
}

export interface Employee {
  _id: string;
  employeeCode: string;
  name: string;
  email: string;
  departmentId: string;
  roleId: string;
  managerId: string | null;
  joiningDate: string;
  status: "active" | "inactive";
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string; // hashed in the MERN backend; plain demo value here
  role: UserRole;
  employeeId: string | null;
  status: "active" | "inactive";
}

export interface Assessment {
  _id: string;
  employeeId: string;
  skillId: string;
  selfRating: number | null;
  managerRating: number | null;
  hrOverride: number | null;
  comments: string;
  managerComments: string;
  status: "draft" | "submitted" | "validated";
  assessmentDate: string;
  assessedBy: string | null;
}

export interface TrainingCourse {
  _id: string;
  title: string;
  skillId: string;
  platform: string;
  cost: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  minGap: number;
  courseUrl: string;
}

/** Validated / actual level: HR override > manager rating > self rating. */
export function validatedRating(a?: Assessment | null): number | null {
  if (!a) return null;
  return a.hrOverride ?? a.managerRating ?? a.selfRating ?? null;
}

/** Raw difference, may be negative. */
export function rawGap(required: number, actual: number | null): number {
  if (actual == null) return required;
  return required - actual;
}

/** Gap used for action classification: never negative. */
export function effectiveGap(required: number, actual: number | null): number {
  return Math.max(0, rawGap(required, actual));
}

export function gapStatus(gap: number): GapStatus {
  if (gap >= 2) return "RED";
  if (gap === 1) return "YELLOW";
  return "GREEN";
}

export function gapAction(gap: number): string {
  if (gap >= 2) return "Urgent Training";
  if (gap === 1) return "Monitor";
  return "No Action";
}

export const STATUS_LABEL: Record<GapStatus, string> = {
  RED: "Critical",
  YELLOW: "Monitor",
  GREEN: "On Target",
};

export interface GapRow {
  employeeId: string;
  skillId: string;
  requiredLevel: number;
  selfRating: number | null;
  managerRating: number | null;
  actualLevel: number | null;
  gap: number;
  status: GapStatus;
  action: string;
  exceeds: boolean;
  assessed: boolean;
}

export function buildGapRow(
  employeeId: string,
  skillId: string,
  requiredLevel: number,
  assessment?: Assessment | null,
): GapRow {
  const actual = validatedRating(assessment);
  const gap = effectiveGap(requiredLevel, actual);
  return {
    employeeId,
    skillId,
    requiredLevel,
    selfRating: assessment?.selfRating ?? null,
    managerRating: assessment?.managerRating ?? null,
    actualLevel: actual,
    gap,
    status: gapStatus(gap),
    action: gapAction(gap),
    exceeds: actual != null && actual > requiredLevel,
    assessed: actual != null,
  };
}