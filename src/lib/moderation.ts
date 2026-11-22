// Light client-side guard for text that other players will see on the shared river.
// It runs on publish and again on every incoming record, so an older or tampered client
// still can't put raw profanity or links on someone else's screen.

const MASK = '✿';

// Thai: substring matches with look-aheads for the innocent words they hide inside
// (หีบ = box, เหี้ยม = ruthless, สัดส่วน = proportion)
const THAI_PROFANITY = [
  'ควย',
  'เหี้ย(?!ม)',
  'สัส',
  'สัด(?!ส่วน)',
  'เย็ด',
  'หี(?![บด\u0E48-\u0E4B])',
  'แตด',
  'จัญไร',
  'ระยำ',
  'ส้นตีน',
  'ชาติชั่ว',
  'ไอ้สัตว์',
  'อีสัตว์',
  'อีดอก',
  'ดอกทอง',
  'กะหรี่',
  'ร่าน',
  'เงี่ยน',
  'แม่ง',
  'พ่อมึง',
  'แม่มึง',
  'มึงตาย',
  'ชิบหาย',
  'ฉิบหาย',
  'เสือก',
  'ไอ้เวร',
  'อีเวร',
];

const ENGLISH_PROFANITY = [
  'f+[u*@]+c+k\\w*',
  'motherf\\w*',
  's+h+[i1!]t+\\w*',
  'b+[i1!]+t+c+h\\w*',
  'c+u+n+t+s?',
  'dick(?:head)?s?',
  'puss(?:y|ies)',
  'a+s+s+h+o+l+e+s?',
  'bastards?',
  'whores?',
  'sluts?',
  'n+[i1!]+g+g+\\w*',
  'fag(?:got)?s?',
  'retard(?:ed|s)?',
];

const THAI_RE = new RegExp(THAI_PROFANITY.join('|'), 'g');
const ENGLISH_RE = new RegExp(`\\b(?:${ENGLISH_PROFANITY.join('|')})\\b`, 'gi');
const LINK_RE = /\b(?:https?:\/\/|www\.)\S+|\b[\w-]+\.(?:com|net|org|co|io|me|ly|th|xyz|info|link|app)\b(?:\/\S*)?/gi;
// Phone numbers: Thai mobiles and other 9+ digit runs, with or without separators
const PHONE_RE = /(?:\+?\d[\s-]?){9,}/g;
const INVISIBLE_RE = /[\u200B-\u200D\u2060\uFEFF]/g;

function mask(match: string): string {
  return MASK.repeat(Math.min(3, Array.from(match).length));
}

function hasProfanity(text: string): boolean {
  THAI_RE.lastIndex = 0;
  ENGLISH_RE.lastIndex = 0;
  return THAI_RE.test(text) || ENGLISH_RE.test(text);
}

// Masks profanity, links and phone numbers. If spacing tricks ("ค ว ย", "f.u.c.k") still hide
// a match once separators are squeezed out, the whole text is dropped instead.
export function moderatePublicText(raw: string): string {
  let text = raw.replace(INVISIBLE_RE, '').normalize('NFC');

  text = text
    .replace(LINK_RE, mask)
    .replace(PHONE_RE, mask)
    .replace(THAI_RE, mask)
    .replace(ENGLISH_RE, mask);

  const squeezed = text.replace(/[\s.\-_*~,'"`|/\\]+/g, '');
  if (hasProfanity(squeezed)) return '';

  return text.replace(/\s{2,}/g, ' ').trim();
}

const PUBLISH_LOG_KEY = 'loykrater_publish_log_v1';
const PUBLISH_WINDOW_MS = 60_000;
// A full round is at most 5 offerings, so this allows two rounds a minute
const PUBLISH_LIMIT_PER_WINDOW = 10;

let memoryPublishLog: number[] = [];

function readPublishLog(): number[] {
  try {
    const raw = window.localStorage.getItem(PUBLISH_LOG_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      return parsed.filter((t): t is number => typeof t === 'number');
    }
  } catch {
    // Storage blocked; the in-memory log still limits this tab
  }
  return memoryPublishLog;
}

// Per-device throttle on writes to the shared river. Over the limit the offering still floats
// on the player's own screen; it just isn't sent to everyone else.
export function takePublishSlot(now: number = Date.now()): boolean {
  if (typeof window === 'undefined') return true;

  const recent = readPublishLog().filter((t) => now - t < PUBLISH_WINDOW_MS);
  if (recent.length >= PUBLISH_LIMIT_PER_WINDOW) return false;

  memoryPublishLog = [...recent, now];
  try {
    window.localStorage.setItem(PUBLISH_LOG_KEY, JSON.stringify(memoryPublishLog));
  } catch {
    // Ignore storage errors
  }
  return true;
}
