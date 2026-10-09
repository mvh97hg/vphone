/**
 * SIP digest auth helpers (plain vs HA1).
 * HA1 = MD5(username:realm:password) — preferred in-memory form for SIP digest auth.
 */

function isMd5Hex32(value) {
  return /^[a-f0-9]{32}$/i.test(String(value || "").trim());
}

function md5cycle(x, k) {
  let [a, b, c, d] = x;

  a = ff(a, b, c, d, k[0], 7, -680876936);
  d = ff(d, a, b, c, k[1], 12, -389564586);
  c = ff(c, d, a, b, k[2], 17, 606105819);
  b = ff(b, c, d, a, k[3], 22, -1044525330);
  a = ff(a, b, c, d, k[4], 7, -176418897);
  d = ff(d, a, b, c, k[5], 12, 1200080426);
  c = ff(c, d, a, b, k[6], 17, -1473231341);
  b = ff(b, c, d, a, k[7], 22, -45705983);
  a = ff(a, b, c, d, k[8], 7, 1770035416);
  d = ff(d, a, b, c, k[9], 12, -1958414417);
  c = ff(c, d, a, b, k[10], 17, -42063);
  b = ff(b, c, d, a, k[11], 22, -1990404162);
  a = ff(a, b, c, d, k[12], 7, 1804603682);
  d = ff(d, a, b, c, k[13], 12, -40341101);
  c = ff(c, d, a, b, k[14], 17, -1502002290);
  b = ff(b, c, d, a, k[15], 22, 1236535329);

  a = gg(a, b, c, d, k[1], 5, -165796510);
  d = gg(d, a, b, c, k[6], 9, -1069501632);
  c = gg(c, d, a, b, k[11], 14, 643717713);
  b = gg(b, c, d, a, k[0], 20, -373897302);
  a = gg(a, b, c, d, k[5], 5, -701558691);
  d = gg(d, a, b, c, k[10], 9, 38016083);
  c = gg(c, d, a, b, k[15], 14, -660478335);
  b = gg(b, c, d, a, k[4], 20, -405537848);
  a = gg(a, b, c, d, k[9], 5, 568446438);
  d = gg(d, a, b, c, k[14], 9, -1019803690);
  c = gg(c, d, a, b, k[3], 14, -187363961);
  b = gg(b, c, d, a, k[8], 20, 1163531501);
  a = gg(a, b, c, d, k[13], 5, -1444681467);
  d = gg(d, a, b, c, k[2], 9, -51403784);
  c = gg(c, d, a, b, k[7], 14, 1735328473);
  b = gg(b, c, d, a, k[12], 20, -1926607734);

  a = hh(a, b, c, d, k[5], 4, -378558);
  d = hh(d, a, b, c, k[8], 11, -2022574463);
  c = hh(c, d, a, b, k[11], 16, 1839030562);
  b = hh(b, c, d, a, k[14], 23, -35309556);
  a = hh(a, b, c, d, k[1], 4, -1530992060);
  d = hh(d, a, b, c, k[4], 11, 1272893353);
  c = hh(c, d, a, b, k[7], 16, -155497632);
  b = hh(b, c, d, a, k[10], 23, -1094730640);
  a = hh(a, b, c, d, k[13], 4, 681279174);
  d = hh(d, a, b, c, k[0], 11, -358537222);
  c = hh(c, d, a, b, k[3], 16, -722521979);
  b = hh(b, c, d, a, k[6], 23, 76029189);
  a = hh(a, b, c, d, k[9], 4, -640364487);
  d = hh(d, a, b, c, k[12], 11, -421815835);
  c = hh(c, d, a, b, k[15], 16, 530742520);
  b = hh(b, c, d, a, k[2], 23, -995338651);

  a = ii(a, b, c, d, k[0], 6, -198630844);
  d = ii(d, a, b, c, k[7], 10, 1126891415);
  c = ii(c, d, a, b, k[14], 15, -1416354905);
  b = ii(b, c, d, a, k[5], 21, -57434055);
  a = ii(a, b, c, d, k[12], 6, 1700485571);
  d = ii(d, a, b, c, k[3], 10, -1894986606);
  c = ii(c, d, a, b, k[10], 15, -1051523);
  b = ii(b, c, d, a, k[1], 21, -2054922799);
  a = ii(a, b, c, d, k[8], 6, 1873313359);
  d = ii(d, a, b, c, k[15], 10, -30611744);
  c = ii(c, d, a, b, k[6], 15, -1560198380);
  b = ii(b, c, d, a, k[13], 21, 1309151649);
  a = ii(a, b, c, d, k[4], 6, -145523070);
  d = ii(d, a, b, c, k[11], 10, -1120210379);
  c = ii(c, d, a, b, k[2], 15, 718787259);
  b = ii(b, c, d, a, k[9], 21, -343485551);

  x[0] = (a + x[0]) | 0;
  x[1] = (b + x[1]) | 0;
  x[2] = (c + x[2]) | 0;
  x[3] = (d + x[3]) | 0;
}

function cmn(q, a, b, x, s, t) {
  a = (a + q + x + t) | 0;
  return (((a << s) | (a >>> (32 - s))) + b) | 0;
}
function ff(a, b, c, d, x, s, t) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | ~d), a, b, x, s, t); }

function md51(s) {
  const n = s.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i;
  for (i = 64; i <= n; i += 64) {
    md5cycle(state, md5blk(s.substring(i - 64, i)));
  }
  s = s.substring(i - 64);
  const tail = new Array(16).fill(0);
  for (i = 0; i < s.length; i += 1) {
    tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
  }
  tail[i >> 2] |= 0x80 << ((i % 4) << 3);
  if (i > 55) {
    md5cycle(state, tail);
    for (let j = 0; j < 16; j += 1) tail[j] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);
  return state;
}

function md5blk(s) {
  const md5blks = [];
  for (let i = 0; i < 64; i += 4) {
    md5blks[i >> 2] = s.charCodeAt(i)
      + (s.charCodeAt(i + 1) << 8)
      + (s.charCodeAt(i + 2) << 16)
      + (s.charCodeAt(i + 3) << 24);
  }
  return md5blks;
}

function rhex(n) {
  const hex = "0123456789abcdef";
  let s = "";
  for (let j = 0; j < 4; j += 1) {
    s += hex.charAt((n >> (j * 8 + 4)) & 0x0f) + hex.charAt((n >> (j * 8)) & 0x0f);
  }
  return s;
}

/** Compact MD5 (hex). */
export function md5Hex(input) {
  const str = unescape(encodeURIComponent(String(input ?? "")));
  return md51(str).map(rhex).join("");
}

export function computeHa1(username, realm, password) {
  return md5Hex(`${String(username || "")}:${String(realm || "")}:${String(password || "")}`);
}

/**
 * Interpret password for SIP auth.
 * - SipPasswordType === "ha1" → value is already HA1
 * - unset / "plain" → value is plaintext (never auto-detect hex as HA1)
 * Prefix "ha1:..." / "md5:..." always means HA1 material.
 * @returns {{ password: string, type: "plain" | "ha1" }}
 */
export function normalizeSipPasswordAndType(rawPassword, rawType) {
  let password = String(rawPassword || "").trim();
  const type = String(rawType || "").toLowerCase().trim();
  const prefixed = password.match(/^(?:md5|ha1)\s*[:=]\s*([a-f0-9]{32})$/i);
  if (prefixed) {
    return { password: prefixed[1].toLowerCase(), type: "ha1" };
  }
  if (type === "ha1") {
    if (isMd5Hex32(password)) return { password: password.toLowerCase(), type: "ha1" };
    // Declared ha1 but value is not 32-hex (e.g. user typed a new plain password) → treat as plain.
    return { password, type: "plain" };
  }
  // unset or "plain"
  return { password, type: "plain" };
}

/**
 * Persist password as HA1 whenever possible.
 * Input may be plain (SipPasswordType unset) or already HA1 (SipPasswordType=ha1).
 * Storage always writes { password: ha1Hex, type: "ha1" }.
 */
export function prepareSipPasswordForStorage(rawPassword, {
  username = "",
  realm = "",
  passwordType = ""
} = {}) {
  const normalized = normalizeSipPasswordAndType(rawPassword, passwordType);
  if (!normalized.password) return { password: "", type: "ha1" };
  if (normalized.type === "ha1") return normalized;
  if (!username || !realm) {
    // Cannot compute HA1 without realm; keep plain only as last resort.
    return { password: normalized.password, type: "plain" };
  }
  return {
    password: computeHa1(username, realm, normalized.password),
    type: "ha1"
  };
}

/** Build SIP.js UserAgent authorization fields. */
export function sipAuthorizationOptions(rawPassword, rawType) {
  const auth = normalizeSipPasswordAndType(rawPassword, rawType);
  if (auth.type === "ha1") {
    return { authorizationHa1: auth.password, authorizationPassword: undefined };
  }
  return { authorizationPassword: auth.password, authorizationHa1: undefined };
}
