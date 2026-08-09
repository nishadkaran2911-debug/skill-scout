import type {
  Assessment,
  Department,
  Employee,
  JobRole,
  Skill,
  TrainingCourse,
  User,
} from "./domain";

export interface DB {
  departments: Department[];
  skills: Skill[];
  roles: JobRole[];
  employees: Employee[];
  users: User[];
  assessments: Assessment[];
  courses: TrainingCourse[];
}

const SKILLS: Array<[string, Skill["category"], string]> = [
  ["JavaScript", "Technical", "Core language for web application development."],
  ["React", "Technical", "Component-based UI library for building interfaces."],
  ["Node.js", "Technical", "Server-side JavaScript runtime for APIs and services."],
  ["MongoDB", "Technical", "Document database design, querying and aggregation."],
  ["SQL & Data Modelling", "Technical", "Relational querying, joins and schema design."],
  ["Python", "Technical", "Scripting, automation and data analysis with Python."],
  ["Excel & Spreadsheets", "Technical", "Advanced formulas, pivot tables and modelling."],
  ["SEO & Content Strategy", "Domain", "Search visibility, keyword and content planning."],
  ["Google Analytics", "Technical", "Web analytics setup, reporting and interpretation."],
  ["Paid Campaign Management", "Domain", "Planning and optimising paid media campaigns."],
  ["Financial Modelling", "Domain", "Building forecasting and valuation models."],
  ["Budgeting & Forecasting", "Domain", "Annual planning, variance and cash-flow analysis."],
  ["Regulatory Compliance", "Domain", "Applying statutory and sector regulations."],
  ["Patient Records Management", "Domain", "Handling clinical records accurately and securely."],
  ["Hospital Operations", "Domain", "Scheduling, capacity and service-delivery operations."],
  ["Recruitment & Sourcing", "Domain", "End-to-end hiring and candidate sourcing."],
  ["Payroll Administration", "Domain", "Salary processing, statutory deductions and audits."],
  ["Labour Law", "Domain", "Employment legislation and workplace policy."],
  ["Communication", "Soft Skill", "Clear written and verbal communication with stakeholders."],
  ["Teamwork", "Soft Skill", "Collaborating effectively within cross-functional teams."],
  ["Problem Solving", "Soft Skill", "Structured analysis and resolution of issues."],
  ["Adaptability", "Soft Skill", "Responding positively to change and ambiguity."],
  ["Leadership", "Management", "Guiding, motivating and developing team members."],
  ["Stakeholder Management", "Management", "Aligning expectations across business partners."],
  ["Project Management", "Management", "Planning, tracking and delivering work on time."],
  ["Data Interpretation", "Management", "Drawing sound conclusions from reports and metrics."],
];

const DEPARTMENTS: Array<[string, string]> = [
  ["Engineering", "Product engineering, platform and quality."],
  ["Marketing", "Brand, demand generation and digital growth."],
  ["Healthcare Operations", "Clinical service delivery and patient administration."],
  ["Finance", "Financial planning, reporting and controls."],
  ["Human Resources", "Talent acquisition, payroll and employee relations."],
];

// role -> [skillName, requiredLevel][]  (8 skills per role, technical + soft mix)
const ROLE_DEFS: Array<{ name: string; dept: number; desc: string; skills: Array<[string, number]> }> = [
  {
    name: "Software Developer",
    dept: 0,
    desc: "Builds and maintains web applications across the stack.",
    skills: [
      ["JavaScript", 4],
      ["React", 4],
      ["Node.js", 4],
      ["MongoDB", 3],
      ["SQL & Data Modelling", 3],
      ["Problem Solving", 4],
      ["Communication", 3],
      ["Teamwork", 3],
    ],
  },
  {
    name: "Digital Marketer",
    dept: 1,
    desc: "Drives digital acquisition across search, content and paid media.",
    skills: [
      ["SEO & Content Strategy", 4],
      ["Google Analytics", 4],
      ["Paid Campaign Management", 4],
      ["Data Interpretation", 3],
      ["Excel & Spreadsheets", 3],
      ["Communication", 4],
      ["Adaptability", 3],
      ["Project Management", 3],
    ],
  },
  {
    name: "Healthcare Operations Executive",
    dept: 2,
    desc: "Coordinates patient services and daily hospital operations.",
    skills: [
      ["Hospital Operations", 4],
      ["Patient Records Management", 4],
      ["Regulatory Compliance", 3],
      ["Excel & Spreadsheets", 3],
      ["Communication", 4],
      ["Teamwork", 4],
      ["Problem Solving", 3],
      ["Stakeholder Management", 3],
    ],
  },
  {
    name: "Financial Analyst",
    dept: 3,
    desc: "Delivers financial analysis, forecasting and management reporting.",
    skills: [
      ["Financial Modelling", 4],
      ["Budgeting & Forecasting", 4],
      ["Excel & Spreadsheets", 5],
      ["SQL & Data Modelling", 3],
      ["Regulatory Compliance", 3],
      ["Data Interpretation", 4],
      ["Communication", 3],
      ["Problem Solving", 4],
    ],
  },
  {
    name: "HR Generalist",
    dept: 4,
    desc: "Supports hiring, payroll and employee relations end to end.",
    skills: [
      ["Recruitment & Sourcing", 4],
      ["Payroll Administration", 3],
      ["Labour Law", 4],
      ["Excel & Spreadsheets", 3],
      ["Communication", 4],
      ["Stakeholder Management", 3],
      ["Teamwork", 3],
      ["Leadership", 3],
    ],
  },
];

const PEOPLE: Array<[string, number]> = [
  ["Ananya Sharma", 0],
  ["Rohit Verma", 0],
  ["Meera Iyer", 0],
  ["Kabir Nair", 1],
  ["Sneha Kulkarni", 1],
  ["Arjun Malhotra", 1],
  ["Divya Rao", 2],
  ["Imran Qureshi", 2],
  ["Priya Menon", 2],
  ["Vikram Desai", 3],
  ["Neha Chatterjee", 3],
  ["Aditya Ghosh", 3],
  ["Ritu Bansal", 4],
  ["Sameer Joshi", 4],
  ["Farah Khan", 4],
];

// Deterministic pseudo-random generator so the demo data never shifts.
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const COURSE_DEFS: Array<[string, string, string, number, string, TrainingCourse["level"], number]> = [
  ["Modern JavaScript: The Complete Guide", "JavaScript", "Udemy", 3499, "45 Days", "Intermediate", 1],
  ["Advanced React Patterns & Performance", "React", "Coursera", 4200, "60 Days", "Advanced", 2],
  ["Node.js API Masterclass", "Node.js", "Udemy", 3899, "50 Days", "Advanced", 2],
  ["MongoDB for Developers (M001)", "MongoDB", "MongoDB University", 0, "30 Days", "Beginner", 1],
  ["SQL & Data Modelling Bootcamp", "SQL & Data Modelling", "Udemy", 2999, "40 Days", "Intermediate", 1],
  ["Python Programming Course", "Python", "Udemy", 3200, "100 Days", "Beginner", 2],
  ["Advanced Excel & Financial Modelling", "Excel & Spreadsheets", "LinkedIn Learning", 2500, "35 Days", "Advanced", 1],
  ["Complete SEO & Content Strategy", "SEO & Content Strategy", "Coursera", 3600, "45 Days", "Intermediate", 1],
  ["Google Analytics 4 Certification", "Google Analytics", "Google Skillshop", 0, "20 Days", "Intermediate", 1],
  ["Performance Marketing & Paid Ads", "Paid Campaign Management", "Udemy", 4100, "50 Days", "Advanced", 2],
  ["Financial Modelling & Valuation", "Financial Modelling", "CFI", 8900, "90 Days", "Advanced", 2],
  ["Budgeting and Forecasting Essentials", "Budgeting & Forecasting", "LinkedIn Learning", 2200, "30 Days", "Intermediate", 1],
  ["Regulatory Compliance Fundamentals", "Regulatory Compliance", "Coursera", 3100, "40 Days", "Beginner", 1],
  ["Health Information & Records Management", "Patient Records Management", "Coursera", 3400, "45 Days", "Intermediate", 1],
  ["Hospital Operations Management", "Hospital Operations", "edX", 5200, "60 Days", "Advanced", 2],
  ["Talent Sourcing & Recruitment Strategy", "Recruitment & Sourcing", "LinkedIn Learning", 2800, "35 Days", "Intermediate", 1],
  ["Payroll Administration Practitioner", "Payroll Administration", "Udemy", 2400, "30 Days", "Beginner", 1],
  ["Labour Law & Industrial Relations", "Labour Law", "Coursera", 3900, "50 Days", "Advanced", 2],
  ["Business Communication Skills", "Communication", "Coursera", 1900, "25 Days", "Intermediate", 1],
  ["Collaboration & High-Performing Teams", "Teamwork", "LinkedIn Learning", 1500, "20 Days", "Beginner", 1],
  ["Structured Problem Solving", "Problem Solving", "edX", 2600, "30 Days", "Intermediate", 1],
  ["Thriving Through Change", "Adaptability", "LinkedIn Learning", 1400, "15 Days", "Beginner", 1],
  ["Leadership Foundations for New Leaders", "Leadership", "Coursera", 4500, "55 Days", "Intermediate", 1],
  ["Stakeholder Management Essentials", "Stakeholder Management", "LinkedIn Learning", 2100, "25 Days", "Intermediate", 1],
  ["Project Management Professional Prep", "Project Management", "Udemy", 5400, "70 Days", "Advanced", 2],
  ["Data-Driven Decision Making", "Data Interpretation", "edX", 3000, "35 Days", "Intermediate", 1],
];

export function buildSeed(): DB {
  const rng = makeRng(20260809);

  const skills = SKILLS.map(([name, category, description], i) => ({
    _id: `sk${String(i + 1).padStart(2, "0")}`,
    name,
    category,
    description,
    active: true,
  }));
  const skillByName = new Map(skills.map((s) => [s.name, s._id]));

  const departments: Department[] = DEPARTMENTS.map(([name, description], i) => ({
    _id: `dp${i + 1}`,
    name,
    description,
    managerId: null,
  }));

  const roles: JobRole[] = ROLE_DEFS.map((r, i) => ({
    _id: `rl${i + 1}`,
    name: r.name,
    departmentId: departments[r.dept]!._id,
    description: r.desc,
    requiredSkills: r.skills.map(([sn, lvl]) => ({ skillId: skillByName.get(sn)!, requiredLevel: lvl })),
  }));

  const employees: Employee[] = PEOPLE.map(([name, dept], i) => ({
    _id: `em${String(i + 1).padStart(2, "0")}`,
    employeeCode: `EMP${String(i + 1).padStart(3, "0")}`,
    name,
    email: `${name.toLowerCase().split(" ").join(".")}@nexoracorp.com`,
    departmentId: departments[dept]!._id,
    roleId: roles.find((r) => r.departmentId === departments[dept]!._id)!._id,
    managerId: null,
    joiningDate: new Date(Date.UTC(2019 + (i % 6), (i * 3) % 12, ((i * 7) % 27) + 1)).toISOString(),
    status: "active",
  }));

  // first employee of each department is the department manager
  departments.forEach((d) => {
    const team = employees.filter((e) => e.departmentId === d._id);
    d.managerId = team[0]!._id;
    team.slice(1).forEach((e) => (e.managerId = team[0]!._id));
  });

  const users: User[] = [
    {
      _id: "us00",
      name: "Priyanka Deshmukh",
      email: "hr@nexoracorp.com",
      password: "Admin@123",
      role: "admin",
      employeeId: null,
      status: "active",
    },
    ...employees.map((e, i) => ({
      _id: `us${String(i + 1).padStart(2, "0")}`,
      name: e.name,
      email: e.email,
      password: e.managerId === null ? "Manager@123" : "Employee@123",
      role: (e.managerId === null ? "manager" : "employee") as User["role"],
      employeeId: e._id,
      status: "active" as const,
    })),
  ];

  const assessments: Assessment[] = [];
  employees.forEach((emp, ei) => {
    const role = roles.find((r) => r._id === emp.roleId)!;
    role.requiredSkills.forEach((rs, si) => {
      const r = rng();
      // spread of outcomes: exceeding, on target, monitor, critical, unassessed
      let actual: number;
      if (r < 0.12) actual = Math.min(5, rs.requiredLevel + 1);
      else if (r < 0.42) actual = rs.requiredLevel;
      else if (r < 0.74) actual = Math.max(1, rs.requiredLevel - 1);
      else actual = Math.max(1, rs.requiredLevel - 2);

      const self = Math.max(1, Math.min(5, actual + (rng() < 0.45 ? 1 : 0)));
      const submittedOnly = (ei + si) % 11 === 0; // some awaiting manager review
      assessments.push({
        _id: `as${emp._id}-${rs.skillId}`,
        employeeId: emp._id,
        skillId: rs.skillId,
        selfRating: self,
        managerRating: submittedOnly ? null : actual,
        hrOverride: null,
        comments: "",
        managerComments: submittedOnly ? "" : "Reviewed during the quarterly capability cycle.",
        status: submittedOnly ? "submitted" : "validated",
        assessmentDate: new Date(Date.UTC(2026, 5, 10 + (ei % 15))).toISOString(),
        assessedBy: submittedOnly ? null : emp.managerId ?? "us00",
      });
    });
  });

  const courses: TrainingCourse[] = COURSE_DEFS.map(
    ([title, skillName, platform, cost, duration, level, minGap], i) => ({
      _id: `tc${String(i + 1).padStart(2, "0")}`,
      title,
      skillId: skillByName.get(skillName)!,
      platform,
      cost,
      duration,
      level,
      minGap,
      courseUrl: `https://example.com/courses/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    }),
  );

  return { departments, skills, roles, employees, users, assessments, courses };
}