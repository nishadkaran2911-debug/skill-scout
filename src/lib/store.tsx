import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildSeed, type DB } from "./seed";
import {
  buildGapRow,
  DEFAULT_RUBRIC,
  type Assessment,
  type Employee,
  type GapRow,
  type ProficiencyLevel,
  type TrainingCourse,
  type User,
} from "./domain";

const DB_KEY = "sgas.db.v1";
const SESSION_KEY = "sgas.session.v1";
const RUBRIC_KEY = "sgas.rubric.v1";

interface StoreValue {
  db: DB;
  rubric: ProficiencyLevel[];
  setRubric: (r: ProficiencyLevel[]) => void;
  update: (fn: (db: DB) => DB) => void;
  resetDemoData: () => void;
  ready: boolean;
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => buildSeed());
  const [rubric, setRubricState] = useState<ProficiencyLevel[]>(DEFAULT_RUBRIC);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) setDb(JSON.parse(raw) as DB);
      const rb = localStorage.getItem(RUBRIC_KEY);
      if (rb) setRubricState(JSON.parse(rb) as ProficiencyLevel[]);
      const sess = localStorage.getItem(SESSION_KEY);
      if (sess) {
        const { userId, exp } = JSON.parse(sess) as { userId: string; exp: number };
        if (exp > Date.now()) {
          const source = raw ? (JSON.parse(raw) as DB) : null;
          const users = source?.users ?? buildSeed().users;
          setUser(users.find((u) => u._id === userId) ?? null);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      /* corrupted storage – fall back to seed */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: DB) => {
    setDb(next);
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const update = useCallback(
    (fn: (current: DB) => DB) => {
      setDb((current) => {
        const next = fn(current);
        try {
          localStorage.setItem(DB_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const setRubric = useCallback((r: ProficiencyLevel[]) => {
    setRubricState(r);
    try {
      localStorage.setItem(RUBRIC_KEY, JSON.stringify(r));
    } catch {
      /* ignore */
    }
  }, []);

  const login = useCallback<StoreValue["login"]>(
    (email, password) => {
      const found = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!found || found.password !== password) return { ok: false, error: "Invalid email or password." };
      if (found.status !== "active") return { ok: false, error: "This account has been deactivated." };
      setUser(found);
      try {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ userId: found._id, exp: Date.now() + 8 * 60 * 60 * 1000 }),
        );
      } catch {
        /* ignore */
      }
      return { ok: true };
    },
    [db.users],
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const resetDemoData = useCallback(() => {
    persist(buildSeed());
    setRubric(DEFAULT_RUBRIC);
  }, [persist, setRubric]);

  const value = useMemo(
    () => ({ db, rubric, setRubric, update, resetDemoData, ready, user, login, logout }),
    [db, rubric, setRubric, update, resetDemoData, ready, user, login, logout],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/* ---------------- selectors ---------------- */

export function useLookups() {
  const { db } = useStore();
  return useMemo(
    () => ({
      skillById: new Map(db.skills.map((s) => [s._id, s])),
      deptById: new Map(db.departments.map((d) => [d._id, d])),
      roleById: new Map(db.roles.map((r) => [r._id, r])),
      employeeById: new Map(db.employees.map((e) => [e._id, e])),
    }),
    [db],
  );
}

export function assessmentFor(db: DB, employeeId: string, skillId: string): Assessment | undefined {
  return db.assessments.find((a) => a.employeeId === employeeId && a.skillId === skillId);
}

export function gapRowsForEmployee(db: DB, employee: Employee): GapRow[] {
  const role = db.roles.find((r) => r._id === employee.roleId);
  if (!role) return [];
  return role.requiredSkills.map((rs) =>
    buildGapRow(employee._id, rs.skillId, rs.requiredLevel, assessmentFor(db, employee._id, rs.skillId)),
  );
}

export function allGapRows(db: DB): GapRow[] {
  return db.employees.filter((e) => e.status === "active").flatMap((e) => gapRowsForEmployee(db, e));
}

export function useGapRows() {
  const { db } = useStore();
  return useMemo(() => allGapRows(db), [db]);
}

export function recommendationsFor(db: DB, rows: GapRow[]): Array<{ row: GapRow; courses: TrainingCourse[] }> {
  return rows
    .filter((r) => r.gap >= 1)
    .map((row) => ({
      row,
      courses: db.courses
        .filter((c) => c.skillId === row.skillId && row.gap >= c.minGap)
        .sort((a, b) => b.minGap - a.minGap),
    }))
    .filter((r) => r.courses.length > 0)
    .sort((a, b) => b.row.gap - a.row.gap);
}

export function currentEmployee(db: DB, user: User | null): Employee | null {
  if (!user?.employeeId) return null;
  return db.employees.find((e) => e._id === user.employeeId) ?? null;
}

export function teamOf(db: DB, managerEmployeeId: string): Employee[] {
  return db.employees.filter((e) => e.managerId === managerEmployeeId && e.status === "active");
}