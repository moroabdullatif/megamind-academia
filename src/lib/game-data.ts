export type Major = "Engineering" | "Nursing" | "Science" | "Business" | "General Campus";
export type Term = { term: string; hint: string; definition: string };

export const MAJORS: { id: Major; emoji: string; tag: string }[] = [
  { id: "Engineering", emoji: "⚙️", tag: "Circuits, loads & logic" },
  { id: "Nursing", emoji: "🩺", tag: "Care, anatomy & pharma" },
  { id: "Science", emoji: "🔬", tag: "Atoms, cells & forces" },
  { id: "Business", emoji: "📈", tag: "Markets, money & strategy" },
  { id: "General Campus", emoji: "🎓", tag: "Life on campus" },
];

export const TERMS: Record<Major, Term[]> = {
  Engineering: [
    { term: "TORQUE", hint: "Rotational force", definition: "A force that causes an object to rotate about an axis." },
    { term: "VOLTAGE", hint: "Electric pressure", definition: "The electric potential difference between two points." },
    { term: "STRESS", hint: "Force per area", definition: "Internal force per unit area within a material." },
    { term: "CIRCUIT", hint: "Closed electrical path", definition: "A closed loop through which electric current flows." },
    { term: "BEAM", hint: "Horizontal support", definition: "A structural element that resists loads applied laterally." },
    { term: "GEAR", hint: "Toothed wheel", definition: "A rotating machine part with teeth that mesh to transmit torque." },
    { term: "TURBINE", hint: "Spins from flow", definition: "A machine that extracts energy from a fluid flow to produce work." },
    { term: "ALLOY", hint: "Mixed metal", definition: "A metal made by combining two or more metallic elements." },
    { term: "SENSOR", hint: "Detects change", definition: "A device that detects and responds to physical input." },
    { term: "FRICTION", hint: "Resists sliding", definition: "The force resisting relative motion of surfaces in contact." },
  ],
  Nursing: [
    { term: "TRIAGE", hint: "Sort by urgency", definition: "Assigning priority of treatment based on severity." },
    { term: "PULSE", hint: "Felt heartbeat", definition: "The rhythmic throbbing of arteries as blood is propelled." },
    { term: "INSULIN", hint: "Glucose hormone", definition: "A pancreatic hormone that regulates blood sugar." },
    { term: "SUTURE", hint: "Surgical stitch", definition: "A stitch used to hold body tissues together." },
    { term: "DOSAGE", hint: "How much medicine", definition: "The size and frequency of a medicine dose." },
    { term: "VEIN", hint: "Returns blood", definition: "A vessel carrying blood toward the heart." },
    { term: "ASEPSIS", hint: "Germ-free state", definition: "The absence of disease-causing microorganisms." },
    { term: "EDEMA", hint: "Fluid swelling", definition: "Swelling caused by excess fluid trapped in tissues." },
    { term: "VITALS", hint: "Key body signs", definition: "Measurements like temperature, pulse, respiration and BP." },
    { term: "CATHETER", hint: "Drainage tube", definition: "A flexible tube inserted into the body to drain or deliver fluids." },
  ],
  Science: [
    { term: "ATOM", hint: "Basic unit of matter", definition: "The smallest unit of a chemical element." },
    { term: "ENZYME", hint: "Bio catalyst", definition: "A protein that speeds up biochemical reactions." },
    { term: "PHOTON", hint: "Light particle", definition: "A quantum of electromagnetic radiation." },
    { term: "GENOME", hint: "Full DNA set", definition: "The complete set of genetic material of an organism." },
    { term: "ISOTOPE", hint: "Same element, diff neutrons", definition: "Atoms with the same protons but different neutron counts." },
    { term: "OSMOSIS", hint: "Water crosses membrane", definition: "Movement of water across a semipermeable membrane." },
    { term: "GRAVITY", hint: "Pulls masses together", definition: "The force of attraction between masses." },
    { term: "CATALYST", hint: "Speeds reactions", definition: "A substance that increases reaction rate without being consumed." },
    { term: "NEURON", hint: "Nerve cell", definition: "A cell that transmits nerve impulses." },
    { term: "PLASMA", hint: "Fourth state", definition: "An ionized gas, often called the fourth state of matter." },
  ],
  Business: [
    { term: "EQUITY", hint: "Ownership value", definition: "The value of ownership interest in a company." },
    { term: "MARGIN", hint: "Profit slice", definition: "The difference between revenue and cost, as a share of revenue." },
    { term: "ASSET", hint: "Owned resource", definition: "A resource with economic value owned by a business." },
    { term: "BRAND", hint: "Market identity", definition: "The distinctive identity that sets a product apart." },
    { term: "AUDIT", hint: "Books check", definition: "An official inspection of an organization's accounts." },
    { term: "DIVIDEND", hint: "Shareholder payout", definition: "A portion of profits distributed to shareholders." },
    { term: "LIABILITY", hint: "What you owe", definition: "A financial obligation or debt owed by a business." },
    { term: "REVENUE", hint: "Top line", definition: "Total income generated from sales before expenses." },
    { term: "MERGER", hint: "Two become one", definition: "The combination of two companies into one entity." },
    { term: "STARTUP", hint: "Young venture", definition: "A newly established business seeking rapid growth." },
  ],
  "General Campus": [
    { term: "SYLLABUS", hint: "Course roadmap", definition: "An outline of the topics and schedule of a course." },
    { term: "SEMESTER", hint: "Half-year term", definition: "One of two main divisions of an academic year." },
    { term: "THESIS", hint: "Big final paper", definition: "A long research document submitted for a degree." },
    { term: "CAMPUS", hint: "University grounds", definition: "The grounds and buildings of a university." },
    { term: "LECTURE", hint: "Prof talks", definition: "An educational talk delivered to an audience of students." },
    { term: "CREDIT", hint: "Course unit", definition: "A unit measuring completed coursework toward a degree." },
    { term: "DEAN", hint: "Faculty head", definition: "The head of a faculty or department at a university." },
    { term: "SEMINAR", hint: "Small discussion class", definition: "A small class focused on discussion and research." },
    { term: "TRANSCRIPT", hint: "Grade record", definition: "An official record of a student's academic work." },
    { term: "ALUMNI", hint: "Graduates", definition: "Former students who have graduated from a school." },
  ],
};

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export type Placed = Term & { cells: [number, number][] };

export function buildGrid(terms: Term[], size: number) {
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(""));
  const dirs = [[0, 1], [1, 0], [1, 1], [-1, 1]];
  const placed: Placed[] = [];
  for (const t of terms) {
    const w = t.term;
    if (w.length > size) continue;
    for (let tries = 0; tries < 300; tries++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      const er = r + dr * (w.length - 1), ec = c + dc * (w.length - 1);
      if (er < 0 || er >= size || ec >= size) continue;
      let ok = true;
      for (let i = 0; i < w.length; i++) {
        const ch = grid[r + dr * i][c + dc * i];
        if (ch && ch !== w[i]) { ok = false; break; }
      }
      if (!ok) continue;
      const cells: [number, number][] = [];
      for (let i = 0; i < w.length; i++) {
        grid[r + dr * i][c + dc * i] = w[i];
        cells.push([r + dr * i, c + dc * i]);
      }
      placed.push({ ...t, cells });
      break;
    }
  }
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const row of grid) for (let i = 0; i < size; i++) if (!row[i]) row[i] = A[Math.floor(Math.random() * 26)];
  return { grid, placed };
}

export const RIVALS = [
  "Ama K.", "Kwesi B.", "Efua M.", "Yaw D.", "Akosua P.", "Kofi A.", "Abena S.", "Nana O.", "Esi T.",
];
