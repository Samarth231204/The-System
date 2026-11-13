const KINDS = ['quest', 'side', 'note'];

// Public shape for the browser.
export function toTaskDto(t) {
  return {
    id: String(t._id),
    kind: t.kind,
    title: t.title,
    details: t.details || '',
    dueAt: t.dueAt ? new Date(t.dueAt).toISOString() : null,
    status: t.status,
    completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : null,
  };
}

// Validates a new task or a partial update. Returns { value } or { error }.
export function parseTaskInput(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object') return { error: 'Send the task as JSON.' };
  const out = {};

  if ('kind' in body || !partial) {
    if (!KINDS.includes(body.kind)) return { error: 'Kind must be quest, side or note.' };
    out.kind = body.kind;
  }
  if ('title' in body || !partial) {
    const title = String(body.title ?? '').trim();
    if (!title) return { error: 'Give the task a title.' };
    if (title.length > 140) return { error: 'Title must be 140 characters or fewer.' };
    out.title = title;
  }
  if ('details' in body) {
    const details = String(body.details ?? '').trim();
    if (details.length > 1000) return { error: 'Details must be 1000 characters or fewer.' };
    out.details = details;
  }
  if ('dueAt' in body) {
    if (body.dueAt === null || body.dueAt === '') {
      out.dueAt = null;
    } else {
      const d = new Date(body.dueAt);
      if (Number.isNaN(d.getTime())) return { error: 'Due time is not a valid date.' };
      out.dueAt = d;
    }
  }
  if ('status' in body) {
    if (!['open', 'done'].includes(body.status)) return { error: 'Status must be open or done.' };
    out.status = body.status;
    out.completedAt = body.status === 'done' ? new Date() : null;
  }
  return { value: out };
}
