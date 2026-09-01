/**
 * Gujarati - English Phonetic Search Utility
 * Enables matching Gujarati text with English transliterated input (e.g. "mala" -> "માળા")
 * and vice-versa.
 */

const GUJARATI_MAP: Record<string, string> = {
  // Vowels
  'અ': 'a', 'આ': 'a', 'ઇ': 'i', 'ઈ': 'i', 'ઉ': 'u', 'ઊ': 'u', 'ઋ': 'ru',
  'એ': 'e', 'ઐ': 'ai', 'ઓ': 'o', 'ઔ': 'au', 'અં': 'an', 'અઃ': 'ah',
  
  // Consonants
  'ક': 'k', 'ખ': 'kh', 'ગ': 'g', 'ઘ': 'gh', 'ઙ': 'ng',
  'ચ': 'ch', 'છ': 'chh', 'જ': 'j', 'ઝ': 'z', 'ઞ': 'ny',
  'ટ': 't', 'ઠ': 'th', 'ડ': 'd', 'ઢ': 'dh', 'ણ': 'n',
  'ત': 't', 'થ': 'th', 'દ': 'd', 'ધ': 'dh', 'ન': 'n',
  'પ': 'p', 'ફ': 'f', 'બ': 'b', 'ભ': 'bh', 'મ': 'm',
  'ય': 'y', 'ર': 'r', 'લ': 'l', 'વ': 'v', 'શ': 'sh',
  'ષ': 'sh', 'સ': 's', 'હ': 'h', 'ળ': 'l', 'ક્ષ': 'ksh', 'જ્ઞ': 'gn',
  
  // Matras (Vowel signs)
  'ા': 'a', 'િ': 'i', 'ી': 'i', 'ુ': 'u', 'ૂ': 'u', 'ૃ': 'ru',
  'ે': 'e', 'ૈ': 'ai', 'ો': 'o', 'ૌ': 'au', 'ં': 'n', 'ઃ': 'h',
  '્': '', 'ૅ': 'e', 'ૉ': 'o'
};

/**
 * Transliterates Gujarati unicode text to simplified Latin English string.
 * Example: "માળા" -> "mala", "સ્લીપર" -> "sliper", "ચંદન" -> "chandan"
 */
export function toGujlish(text: string): string {
  if (!text) return "";
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (GUJARATI_MAP[char] !== undefined) {
      result += GUJARATI_MAP[char];
    } else {
      result += char;
    }
  }
  return result.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Normalizes an English or Gujarati search string for fuzzy matching.
 * Handles double letters (e.g. "ee" -> "i", "oo" -> "u", "w" -> "v")
 */
export function normalizeSearchString(str: string): string {
  if (!str) return "";
  let s = str.toLowerCase().trim();
  // Transliterate any gujarati chars to latin
  s = toGujlish(s);
  // Normalize common phonetic variations
  s = s
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/w/g, "v")
    .replace(/ph/g, "f")
    .replace(/z/g, "j")
    .replace(/c(?!h)/g, "k")
    .replace(/aa/g, "a")
    .replace(/ii/g, "i")
    .replace(/uu/g, "u")
    .replace(/[^a-z0-9]/g, "");
  return s;
}

/**
 * Checks if a target string matches a search query using both direct
 * and phonetic Gujlish transliteration.
 */
export function matchesSearch(target: string | null | undefined, query: string | null | undefined): boolean {
  if (!query || !query.trim()) return true;
  if (!target) return false;

  const rawTarget = target.toLowerCase();
  const rawQuery = query.toLowerCase().trim();

  // 1. Direct standard substring match
  if (rawTarget.includes(rawQuery)) return true;

  // 2. Transliterated Gujlish phonetic match
  const normTarget = normalizeSearchString(target);
  const normQuery = normalizeSearchString(query);

  if (normQuery.length > 0 && normTarget.includes(normQuery)) {
    return true;
  }

  // 3. Multi-word search token matching
  const tokens = rawQuery.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    return tokens.every((token) => matchesSearch(target, token));
  }

  return false;
}
