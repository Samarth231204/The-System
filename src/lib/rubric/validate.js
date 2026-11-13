// Checks a list of XP parameters before it is saved or shown.
// Accepts only the fields we store. Returns { value } or { error }.
const KEY_PATTERN = /^[a-z][a-z0-9-]{0,39}$/;

export function slugify(label) {
  return String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function validateParameters(list) {
  if (!Array.isArray(list)) return { error: 'Parameters must be a list.' };
  if (list.length < 2 || list.length > 6) return { error: 'Use between 2 and 6 parameters.' };

  const seen = new Set();
  const value = [];
  for (const raw of list) {
    const label = String(raw?.label ?? '').trim();
    if (!label || label.length > 40) return { error: 'Each parameter needs a label of 1 to 40 characters.' };
    const key = String(raw?.key || slugify(label));
    if (!KEY_PATTERN.test(key)) return { error: `"${label}" needs a simpler name.` };
    if (seen.has(key)) return { error: `Two parameters are called "${label}". Rename one.` };
    seen.add(key);
    const weight = Number(raw?.weight);
    if (!Number.isInteger(weight) || weight < 1 || weight > 5) return { error: `Weight for "${label}" must be 1 to 5.` };
    const description = String(raw?.description ?? '').trim();
    if (description.length > 240) return { error: `Description for "${label}" is too long.` };
    value.push({ key, label, weight, description });
  }
  return { value };
}
