export type RecentCall = {
  id: string;
  identity: string;
  cdrId: string;
  name: string;
  number: string;
  statusText: string;
  statusClass: string;
  direction: "outbound" | "inbound";
  timeLabel: string;
  dayKey: string;
  dayLabel: string;
  billsecLabel: string;
  sortKey: number;
};

export type Contact = {
  id: string;
  name: string;
  number: string;
};

function safeJsonParse(value: string | null, fallback: unknown) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeNumber(value: unknown) {
  return normalizeText(value).replace(/[^\d*#+]/g, "");
}

function formatClock(itemDate: string) {
  const text = normalizeText(itemDate).replace(" UTC", "");
  const parsed = new Date(`${text.replace(" ", "T")}Z`);
  if (Number.isNaN(parsed.getTime())) return text;
  return parsed.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDay(itemDate: string) {
  const text = normalizeText(itemDate).replace(" UTC", "");
  const parsed = new Date(`${text.replace(" ", "T")}Z`);
  if (Number.isNaN(parsed.getTime())) return text || "";
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
}

function formatBillsec(seconds: number) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  const remain = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
}

export function buddyKey(userId: string) {
  return `${userId}-Buddies`;
}

export function loadContacts(userId: string): Contact[] {
  const json = safeJsonParse(localStorage.getItem(buddyKey(userId)), { DataCollection: [] }) as { DataCollection?: any[] };
  const rows: Contact[] = [];
  for (const item of json.DataCollection || []) {
    if (!item || item.Type !== "contact") continue;
    rows.push({
      id: normalizeText(item.cID || item.uID || `c${Date.now()}`),
      name: normalizeText(item.DisplayName || item.ContactNumber1 || "Unknown"),
      number: normalizeText(item.ContactNumber1 || "")
    });
  }
  return rows;
}

export function saveContacts(userId: string, contacts: Contact[]) {
  localStorage.setItem(buddyKey(userId), JSON.stringify({
    TotalRows: contacts.length,
    DataCollection: contacts.map((c) => ({
      Type: "contact",
      cID: c.id,
      DisplayName: c.name,
      ContactNumber1: c.number
    }))
  }));
}

export function loadRecents(userId: string): RecentCall[] {
  const contacts = loadContacts(userId);
  const lookup = new Map(contacts.map((c) => [normalizeNumber(c.number), c.name]));
  const rows: RecentCall[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const storageKey = localStorage.key(i);
    if (!storageKey || !storageKey.endsWith("-stream")) continue;
    const identity = storageKey.slice(0, -7);
    const stream = safeJsonParse(localStorage.getItem(storageKey), null) as { DataCollection?: any[] } | null;
    if (!stream || !Array.isArray(stream.DataCollection)) continue;
    for (const item of stream.DataCollection) {
      if (!item || item.ItemType !== "CDR") continue;
      const isOutbound = item.SrcUserId === userId || item.CallDirection === "outbound";
      const number = normalizeText(isOutbound ? (item.DstDid || item.Dst || "") : (item.SrcDid || item.Src || ""));
      const name = lookup.get(normalizeNumber(number)) || normalizeText(isOutbound ? item.Dst : item.Src) || number;
      const cdrId = normalizeText(item.CdrId);
      if (!cdrId) continue;
      const billsec = Number(item.Billsec || 0) || 0;
      const disposition = String(item.Disposition || "");
      rows.push({
        id: `${identity}:${cdrId}`,
        identity,
        cdrId,
        name,
        number,
        statusText: disposition === "ANSWERED" ? "Answer" : "Missed",
        statusClass: disposition === "ANSWERED" ? "answered" : "missed",
        direction: isOutbound ? "outbound" : "inbound",
        timeLabel: formatClock(item.ItemDate),
        dayKey: formatDay(item.ItemDate),
        dayLabel: formatDay(item.ItemDate),
        billsecLabel: billsec > 0 ? formatBillsec(billsec) : "",
        sortKey: Date.parse(String(item.ItemDate).replace(" UTC", "Z").replace(" ", "T")) || 0
      });
    }
  }
  return rows.sort((a, b) => b.sortKey - a.sortKey);
}

export function saveRecent(userId: string, log: { direction: string; number: string; name: string; startedAt: Date; answeredAt: Date | null }) {
  const storageKey = `${userId}-stream`;
  const stream = safeJsonParse(localStorage.getItem(storageKey), { DataCollection: [] }) as { DataCollection: any[]; TotalRows?: number };
  const endedAt = new Date();
  const answeredAt = log.answeredAt;
  const billsec = answeredAt ? Math.max(1, Math.round((endedAt.getTime() - answeredAt.getTime()) / 1000)) : 0;
  const isOutbound = log.direction === "outgoing";
  stream.DataCollection.unshift({
    ItemType: "CDR",
    CdrId: `cdr-${log.startedAt.getTime()}-${Math.random().toString(16).slice(2)}`,
    ItemDate: log.startedAt.toISOString().replace("T", " ").replace(".000Z", " UTC"),
    SrcUserId: isOutbound ? userId : log.number,
    DstUserId: isOutbound ? log.number : userId,
    Src: isOutbound ? userId : log.name,
    SrcDid: isOutbound ? userId : log.number,
    Dst: isOutbound ? log.name : userId,
    DstDid: isOutbound ? log.number : userId,
    CallDirection: isOutbound ? "outbound" : "inbound",
    Disposition: answeredAt ? "ANSWERED" : "MISSED",
    Billsec: billsec
  });
  stream.TotalRows = stream.DataCollection.length;
  localStorage.setItem(storageKey, JSON.stringify(stream));
}

export function deleteRecent(recent: RecentCall) {
  const storageKey = `${recent.identity}-stream`;
  const stream = safeJsonParse(localStorage.getItem(storageKey), null) as { DataCollection?: any[]; TotalRows?: number } | null;
  if (!stream || !Array.isArray(stream.DataCollection)) return;
  stream.DataCollection = stream.DataCollection.filter((entry) => !entry || entry.CdrId !== recent.cdrId);
  stream.TotalRows = stream.DataCollection.length;
  localStorage.setItem(storageKey, JSON.stringify(stream));
}

export function clearRecents() {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.endsWith("-stream")) keys.push(key);
  }
  for (const key of keys) {
    const stream = safeJsonParse(localStorage.getItem(key), null) as { DataCollection?: any[]; TotalRows?: number } | null;
    if (!stream || !Array.isArray(stream.DataCollection)) continue;
    stream.DataCollection = stream.DataCollection.filter((item) => item && item.ItemType !== "CDR");
    stream.TotalRows = stream.DataCollection.length;
    localStorage.setItem(key, JSON.stringify(stream));
  }
}
