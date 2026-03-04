import { useState, useEffect } from "react";

const LEVELS = [
  { value: 0, label: "Not Trained",      text: "#555",    badge: "#2a2a3a" },
  { value: 1, label: "Viewed",           text: "#8ab4e8", badge: "#151d2e" },
  { value: 2, label: "Assisted",         text: "#4a9be8", badge: "#1a3550" },
  { value: 3, label: "Supervised",       text: "#f5a623", badge: "#3a2f10" },
  { value: 4, label: "Independent",      text: "#5cb85c", badge: "#1e3a1e" },
  { value: 5, label: "Can Train Others", text: "#c97de8", badge: "#3a1f4a" },
];
const ICONS = ["✖", "👁", "A", "S", "✔", "★"];

const SUB_SKILLS = {
  "Fixtures":           ["Tap Install", "Toilet Install", "Basin / Sink", "Quoss Bath Set", "Quoss Shower", "Thermoz", "Basin Set", "Fridge Connection"],
  "Hot Water Units":    ["Storage Gas HWS", "Gas Continuous Flow", "Electric Storage (Internal)", "Instant Electric", "Heat Pump", "Solar System", "Under Sink HWS"],
  "Filtration Systems": ["Triple Stage Filter (Metal Stand)", "Triple Stage Filter (Wall)", "Filter System with Softener", "Under Sink Filter System", "Reverse Osmosis System", "Back Wash Filter"],
  "Blockages":          ["Drain Camera", "Hydro Jetting", "Kitchen Blockages", "Large Cable Machine", "Small Cable Machine", "Vanity Blockages", "Locator"],
  "Drainage":           ["Leak Detection", "Kitchen & Basin Wastes", "Mains Sewer Run", "Drain Repairs", "Drain Stacks"],
  "Gas":                ["Gas Line Install", "Gas Bayonet", "Gas Cooktop", "Gas Freestanding Cooker", "Gas Fireplace", "Snap Vents", "BBQ Conversion"],
  "Servicing":          ["Toilets", "Internal Cisterns", "Close Couple Toilets", "Tapware", "Mixer Cartridge", "Hot Water Storage Unit", "Electric Storage"],
  "Repairs":            ["Burst Pipes – Copper", "Burst Pipes – Poly", "Burst Pipes – In-Wall", "Burst Pipes – Underground", "Flexi Hose", "Leaking Joints", "Pipe Relining"],
  "Renovations":        ["Shower Mixers", "Wall Mounted Basin Mixers", "Wall Hung Vanity", "Floor Wet Cutting", "Wall Chasing", "Tile Wall Cutting", "Understanding Designs", "Read Plans", "Can Advise Owners on Job", "Inwall Toilets", "Kitchen Renovation", "Laundry Underbench Set Up", "Outside Kitchen Set Up"],
  "Quoting":            ["Hot Water Units", "Servicing", "Renovations", "Toilets", "Filtration", "Blockages", "Pipework Re-Runs", "Drainage", "Emergencies", "Burst Pipes"],
  "Compliance":         ["Commissioning", "Pressure Test (Water)", "Pressure Test (Gas)", "Backflow Testing"],
};

const CATEGORIES = Object.keys(SUB_SKILLS);

const CAT_COLORS = {
  "Fixtures":           "#e8704a",
  "Hot Water Units":    "#f5a623",
  "Filtration Systems": "#4ae8c9",
  "Blockages":          "#e84a8a",
  "Drainage":           "#4a9be8",
  "Gas":                "#c97de8",
  "Servicing":          "#5cb85c",
  "Compliance":         "#8ab4e8",
  "Repairs":            "#ff6b6b",
  "Renovations":        "#a8e063",
  "Quoting":            "#f5e642",
};

const initialEmployees = [
  { id: 1, name: "Rhys Booth",      role: "Supervisor",          color: "#e8704a" },
  { id: 2, name: "Blake Watts",     role: "Level 3 Tradesman",   color: "#4a9be8" },
  { id: 3, name: "Alex Jones",      role: "Level 2 Tradesman",   color: "#f5a623" },
  { id: 4, name: "Jack McGee",      role: "Level 2 Tradesman",   color: "#5cb85c" },
  { id: 5, name: "Lachlan Pissani", role: "Level 1 Tradesman",   color: "#c97de8" },
  { id: 6, name: "Sonny Geddes",    role: "Apprentice Yr 3",     color: "#e84a8a" },
  { id: 7, name: "Flynn Tulk",      role: "Apprentice Yr 1",     color: "#4ae8c9" },
];

const buildMatrix = (employees) => {
  const m = {};
  employees.forEach(e => {
    m[e.id] = {};
    const isSup = e.role === "Supervisor";
    const isL3  = e.role === "Level 3 Tradesman";
    const isL2  = e.role === "Level 2 Tradesman";
    const isL1  = e.role === "Level 1 Tradesman";
    const isA3  = e.role === "Apprentice Yr 3";
    CATEGORIES.forEach(cat => {
      SUB_SKILLS[cat].forEach(sub => {
        const key = `${e.id}::${cat}::${sub}`;
        if (isSup)     m[e.id][key] = 5;
        else if (isL3) m[e.id][key] = cat === "Gas" || cat === "Compliance" ? 4 : 5;
        else if (isL2) m[e.id][key] = cat === "Gas" || cat === "Compliance" ? 3 : 4;
        else if (isL1) m[e.id][key] = ["Fixtures","Drainage","Blockages"].includes(cat) ? 3 : cat === "Gas" ? 1 : 2;
        else if (isA3) m[e.id][key] = ["Fixtures","Drainage"].includes(cat) ? 2 : 1;
        else           m[e.id][key] = cat === "Fixtures" ? 1 : 0;
      });
    });
  });
  return m;
};

const getCatAvg = (matrix, empId, cat) => {
  const subs = SUB_SKILLS[cat];
  if (!subs?.length) return 0;
  const vals = subs.map(sub => matrix[empId]?.[`${empId}::${cat}::${sub}`] ?? 0);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
};

const getPct = avg => Math.round((avg / 5) * 100);

const getOverall = (matrix, empId) => {
  let total = 0, count = 0;
  CATEGORIES.forEach(cat => {
    SUB_SKILLS[cat].forEach(sub => {
      total += matrix[empId]?.[`${empId}::${cat}::${sub}`] ?? 0;
      count++;
    });
  });
  return count ? Math.round((total / (count * 5)) * 100) : 0;
};

function PctCircle({ pct, color, size = 48, onClick, active }) {
  const r = (size - 7) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div onClick={onClick} title="Click to see breakdown" style={{
      position: "relative", width: size, height: size,
      cursor: onClick ? "pointer" : "default",
      transform: active ? "scale(1.12)" : "scale(1)",
      transition: "transform 0.15s ease",
      filter: active ? `drop-shadow(0 0 6px ${color}88)` : "none",
    }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3.5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3.5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.22, fontWeight: 800,
        color: active ? "#fff" : color,
        fontFamily: "'Barlow Condensed', sans-serif",
        transition: "color 0.15s",
      }}>{pct}%</div>
    </div>
  );
}

function LevelBadge({ value, onClick }) {
  const lv = LEVELS[value] || LEVELS[0];
  return (
    <div onClick={onClick} style={{
      width: 34, height: 34, borderRadius: 8,
      background: lv.badge, color: lv.text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 14, fontWeight: 800,
      cursor: onClick ? "pointer" : "default",
      fontFamily: "'Barlow Condensed', sans-serif",
      border: `1.5px solid ${lv.text}55`,
      transition: "transform 0.1s, box-shadow 0.1s",
      userSelect: "none",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.boxShadow = `0 0 10px ${lv.text}55`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
    >{ICONS[value]}</div>
  );
}

export default function SkillsMatrix() {
  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem("sm_employees");
      return saved ? JSON.parse(saved) : initialEmployees;
    } catch { return initialEmployees; }
  });

  const [matrix, setMatrix] = useState(() => {
    try {
      const savedM = localStorage.getItem("sm_matrix");
      const savedE = localStorage.getItem("sm_employees");
      const emps = savedE ? JSON.parse(savedE) : initialEmployees;
      return savedM ? JSON.parse(savedM) : buildMatrix(emps);
    } catch { return buildMatrix(initialEmployees); }
  });

  const [saveStatus, setSaveStatus] = useState("");
  const [panel, setPanel] = useState(null);

  // Auto-save to localStorage whenever matrix or employees change
  useEffect(() => {
    try {
      localStorage.setItem("sm_matrix", JSON.stringify(matrix));
      localStorage.setItem("sm_employees", JSON.stringify(employees));
      setSaveStatus("saved");
      const t = setTimeout(() => setSaveStatus(""), 1500);
      return () => clearTimeout(t);
    } catch {}
  }, [matrix, employees]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: "", role: "Apprentice Yr 1" });
  const COLORS = ["#e8704a","#4a9be8","#f5a623","#5cb85c","#c97de8","#e84a8a","#4ae8c9","#f5e642"];

  const cycleLevel = (empId, cat, sub) => {
    const key = `${empId}::${cat}::${sub}`;
    setMatrix(prev => ({
      ...prev,
      [empId]: { ...prev[empId], [key]: ((prev[empId]?.[key] ?? 0) + 1) % 6 }
    }));
  };

  const openPanel = (cat) => setPanel(p => p === cat ? null : cat);

  const addEmployee = () => {
    if (!newEmployee.name.trim()) return;
    const id = Date.now();
    const color = COLORS[employees.length % COLORS.length];
    const emp = { id, name: newEmployee.name, role: newEmployee.role, color };
    const newRow = {};
    CATEGORIES.forEach(cat => {
      SUB_SKILLS[cat].forEach(sub => { newRow[`${id}::${cat}::${sub}`] = 0; });
    });
    setEmployees(prev => [...prev, emp]);
    setMatrix(prev => ({ ...prev, [id]: newRow }));
    setNewEmployee({ name: "", role: "Apprentice Yr 1" });
    setShowAddEmployee(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f18", fontFamily: "'Barlow', 'Segoe UI', sans-serif", color: "#dde0ea", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #1a1a28; }
        ::-webkit-scrollbar-thumb { background: #3a3a5a; border-radius: 2px; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        input:focus, select:focus { outline: none; border-color: #4a9be8 !important; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "24px 28px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#f5a623", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 5 }}>Trade Skills & Compliance</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1 }}>
            Plumbing Skills <span style={{ color: "#4a9be8" }}>Competency Matrix</span>
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {saveStatus === "saved" && (
              <div style={{ fontSize: 11, color: "#5cb85c", fontFamily: "'Barlow Condensed', sans-serif", display: "flex", alignItems: "center", gap: 5, animation: "fadeIn 0.2s ease" }}>
                <span>✔</span> Saved
              </div>
            )}
            <button onClick={() => setShowAddEmployee(true)} style={{ background: "rgba(245,166,35,0.12)", border: "1.5px solid #f5a62355", borderRadius: 8, padding: "8px 18px", color: "#f5a623", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}>
              + Add Employee
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Levels:</span>
          {LEVELS.map(l => (
            <div key={l.value} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: l.badge, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: l.text, fontFamily: "'Barlow Condensed', sans-serif", border: `1px solid ${l.text}44` }}>
                {ICONS[l.value]}
              </div>
              <span style={{ fontSize: 11, color: "#777" }}>{l.label}</span>
              {l.value < 5 && <span style={{ color: "#333" }}>·</span>}
            </div>
          ))}
          <span style={{ fontSize: 11, color: "#444", marginLeft: 8 }}>Click % to drill down · Click badge to cycle level</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Table */}
        <div style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
          <table style={{ borderCollapse: "separate", borderSpacing: 0, minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ ...TH, width: 190, textAlign: "left", padding: "12px 16px", position: "sticky", left: 0, zIndex: 3 }}>
                  <span style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif" }}>Employee</span>
                </th>
                <th style={{ ...TH, width: 58, textAlign: "center", padding: "12px 8px" }}>
                  <span style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Barlow Condensed', sans-serif" }}>Overall</span>
                </th>
                {CATEGORIES.map(cat => (
                  <th key={cat} style={{ ...TH, minWidth: 88 }}>
                    <div onClick={() => openPanel(cat)} style={{ padding: "8px 10px", cursor: "pointer", borderBottom: panel === cat ? `2px solid ${CAT_COLORS[cat]}` : "2px solid transparent", transition: "border-color 0.15s", userSelect: "none" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: panel === cat ? CAT_COLORS[cat] : "#444", margin: "0 auto 5px", transition: "background 0.15s" }} />
                      <div style={{ fontSize: 11, fontWeight: 700, color: panel === cat ? CAT_COLORS[cat] : "#aaa", textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.03em", lineHeight: 1.3, transition: "color 0.15s" }}>{cat}</div>
                      <div style={{ fontSize: 9, color: panel === cat ? CAT_COLORS[cat] : "#444", textAlign: "center", marginTop: 3 }}>{panel === cat ? "▶ open" : "click %"}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, ei) => {
                const overall = getOverall(matrix, emp.id);
                return (
                  <tr key={emp.id} style={{ animation: `fadeIn 0.2s ease ${ei * 0.04}s both` }}>
                    <td style={{ ...TD, padding: "10px 16px", position: "sticky", left: 0, background: "#0f0f18", zIndex: 1, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: emp.color + "22", border: `2px solid ${emp.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: emp.color, fontFamily: "'Barlow Condensed', sans-serif", flexShrink: 0 }}>
                          {emp.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#e8e8f0", lineHeight: 1.2 }}>{emp.name}</div>
                          <div style={{ fontSize: 10, color: emp.color, fontFamily: "'Barlow Condensed', sans-serif" }}>{emp.role}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...TD, textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 8px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", color: overall >= 75 ? "#5cb85c" : overall >= 45 ? "#f5a623" : "#e8704a" }}>{overall}%</span>
                        <div style={{ width: 36, height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${overall}%`, height: "100%", background: overall >= 75 ? "#5cb85c" : overall >= 45 ? "#f5a623" : "#e8704a", borderRadius: 2, transition: "width 0.5s ease" }} />
                        </div>
                      </div>
                    </td>
                    {CATEGORIES.map(cat => {
                      const avg = getCatAvg(matrix, emp.id, cat);
                      const pct = getPct(avg);
                      const isActive = panel === cat;
                      return (
                        <td key={cat} style={{ ...TD, textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "8px 6px", background: isActive ? `${CAT_COLORS[cat]}08` : "transparent", transition: "background 0.2s" }}>
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <PctCircle pct={pct} color={CAT_COLORS[cat]} size={48} onClick={() => openPanel(cat)} active={isActive} />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr>
                <td colSpan={2 + CATEGORIES.length} style={{ padding: "10px 16px" }}>
                  <div onClick={() => setShowAddEmployee(true)}
                    style={{ fontSize: 12, color: "#f5a623", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", opacity: 0.5, transition: "opacity 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
                    <span style={{ fontSize: 16 }}>+</span> Add employee
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Slide-out panel - opens when % circle clicked */}
        <div style={{
          width: panel ? 340 : 0,
          flexShrink: 0,
          overflow: "hidden",
          transition: "width 0.3s cubic-bezier(.4,0,.2,1)",
          borderLeft: panel ? "1px solid rgba(255,255,255,0.07)" : "none",
          background: "#13131f",
        }}>
          {panel && (
            <div style={{ width: 340, height: "100%", overflowY: "auto", animation: "slideIn 0.25s ease" }}>
              <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "#13131f", zIndex: 2 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: CAT_COLORS[panel] }} />
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, fontWeight: 800, color: "#fff" }}>{panel}</span>
                  </div>
                  <button onClick={() => setPanel(null)} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6, color: "#777", fontSize: 12, padding: "4px 9px", cursor: "pointer" }}>✕ Close</button>
                </div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>Click any badge to cycle through levels</div>
              </div>
              <div style={{ padding: "14px 18px" }}>
                {SUB_SKILLS[panel].map((sub, si) => {
                  const capable = employees.filter(e => (matrix[e.id]?.[`${e.id}::${panel}::${sub}`] ?? 0) >= 4).length;
                  return (
                    <div key={sub} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: si < SUB_SKILLS[panel].length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#ccc" }}>{sub}</span>
                        <span style={{ fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", color: capable >= 2 ? "#5cb85c" : "#e8704a" }}>
                          {capable}/{employees.length} capable
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {employees.map(emp => {
                          const val = matrix[emp.id]?.[`${emp.id}::${panel}::${sub}`] ?? 0;
                          return (
                            <div key={emp.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                              <LevelBadge value={val} onClick={() => cycleLevel(emp.id, panel, sub)} />
                              <span style={{ fontSize: 9, color: emp.color, fontFamily: "'Barlow Condensed', sans-serif", maxWidth: 38, textAlign: "center", lineHeight: 1.2 }}>
                                {emp.name.split(" ")[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowAddEmployee(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, animation: "fadeIn 0.15s ease" }}>
          <div style={{ background: "#16161f", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 28, width: "100%", maxWidth: 400 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 20 }}>Add Employee</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif" }}>Full Name</label>
              <input value={newEmployee.name} onChange={e => setNewEmployee(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Chris Taylor"
                style={{ width: "100%", background: "#0f0f18", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#e8e8f0", fontSize: 14, fontFamily: "'Barlow', sans-serif" }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif" }}>Role</label>
              <select value={newEmployee.role} onChange={e => setNewEmployee(p => ({ ...p, role: e.target.value }))}
                style={{ width: "100%", background: "#0f0f18", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#e8e8f0", fontSize: 14, fontFamily: "'Barlow', sans-serif", cursor: "pointer", colorScheme: "dark" }}>
                {["Supervisor","Level 3 Tradesman","Level 2 Tradesman","Level 1 Tradesman","Apprentice Yr 3","Apprentice Yr 2","Apprentice Yr 1","Off-sider"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowAddEmployee(false)} style={{ flex: 1, background: "transparent", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 11, color: "#888", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontSize: 14 }}>Cancel</button>
              <button onClick={addEmployee} style={{ flex: 2, background: "linear-gradient(135deg, #f5a623, #e8704a)", border: "none", borderRadius: 10, padding: 11, color: "#0f0f18", fontWeight: 800, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, letterSpacing: "0.05em" }}>Add Employee</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TH = { background: "#0f0f18", position: "sticky", top: 0, zIndex: 2, verticalAlign: "bottom" };
const TD = { background: "transparent", verticalAlign: "middle" };
