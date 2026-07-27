/**
 * Client-generated ids. Every synced row needs one that is stable across devices,
 * so ids are minted here and never by the database.
 *
 * Math.random is sufficient for a single user on at most two devices. If this ever
 * becomes multi-device enough to worry about, swap in expo-crypto's randomUUID —
 * the call site is this one function.
 */
export function newId(): string {
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      out += '-';
    } else if (i === 14) {
      out += '4';
    } else if (i === 19) {
      out += hex[(Math.floor(Math.random() * 16) & 0x3) | 0x8];
    } else {
      out += hex[Math.floor(Math.random() * 16)];
    }
  }
  return out;
}
