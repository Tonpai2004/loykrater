import { Fragment, type ReactNode } from 'react';

const THAI = /[ก-๛]/;
// Single-letter words that read wrong when left dangling at a line end ('ณ ท่าน้ำ')
const LEADING_PARTICLE = /^[ก-๛]$/;
// Repetition / abbreviation marks that belong to the word before them ('ต่าง ๆ')
const TRAILING_MARK = /^[ๆฯ]+$/;

// Compounds and names the browser dictionaries split ('ก⏎ลีบบัว', 'แม่⏎น้ำ', 'เอเชีย⏎ตะวันออก').
// They stay whole even inside a phrase too long for one line.
const COMPOUNDS = [
  'เอเชียตะวันออกเฉียงใต้',
  'พระแม่คงคา',
  'แม่คงคา',
  'นัมมทานที',
  'ลอยกระทง',
  'กระทง',
  'โคมลอย',
  'กลีบบัว',
  'ริมฝั่ง',
  'ดวงวิญญาณ',
  'เป้าหมาย',
  'เว็บแคม',
  'หน้าจอ',
  'วงแสง',
  'ปลายนิ้ว',
  'แม่น้ำ',
  'กระแสน้ำ',
  'สายน้ำ',
  'ท่าน้ำ',
  'ลงน้ำ',
  'ท่าพระนคร',
  'คำอธิษฐาน',
  'คำพร',
  'ข้อตกลง',
  'ความหมาย',
  'เดินทาง',
  'หล่อเลี้ยง',
  'เอ่ยปาก',
  'ผืนฟ้า',
  'ฟากฟ้า',
  'คืนเพ็ญ',
  'วันเพ็ญ',
  'ใบตอง',
  'นางนพมาศ',
];
// Longest first so a compound wins over the word inside it. Only match on syllable edges: not after a leading vowel, not before a vowel or tone mark
const COMPOUND_RE = new RegExp(
  `(?<![\\u0E40-\\u0E44])(${[...COMPOUNDS].sort((a, b) => b.length - a.length).join('|')})(?![\\u0E30-\\u0E3A\\u0E45\\u0E47-\\u0E4E])`,
  'g',
);

function glueCompounds(phrase: string): ReactNode {
  const parts = phrase.split(COMPOUND_RE);
  if (parts.length === 1) return phrase;
  // split() with a capture group puts matches at odd indexes
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className='whitespace-nowrap'>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

// Browsers break Thai with a dictionary, which splits compounds mid-phrase
// ('ความ⏎หมาย', 'ลอย⏎กระทง'). Thai writers put spaces where a line may break, so each
// space-separated phrase becomes an inline-block (.lk-phrase): the line wraps only at
// spaces, and a phrase wider than the line still wraps inside itself instead of overflowing.
export function keepThaiPhrases(text: ReactNode): ReactNode {
  if (typeof text !== 'string' || !THAI.test(text)) return text;

  const words = text.split(/\s+/).filter(Boolean);
  const phrases: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (TRAILING_MARK.test(word) && phrases.length > 0) {
      phrases[phrases.length - 1] += ` ${word}`;
    } else if (LEADING_PARTICLE.test(word) && i + 1 < words.length) {
      words[i + 1] = `${word} ${words[i + 1]}`;
    } else {
      phrases.push(word);
    }
  }

  // One wrapper element, so a flex or grid parent still sees a single item instead of one per phrase
  return (
    <span>
      {phrases.map((phrase, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          {THAI.test(phrase) ? (
            <span className='lk-phrase'>{glueCompounds(phrase)}</span>
          ) : (
            phrase
          )}
        </Fragment>
      ))}
    </span>
  );
}
