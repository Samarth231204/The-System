import { connectToDatabase } from '@/lib/db/connect';
import { Target } from '@/lib/db/models/Target';
import { XpEvent } from '@/lib/db/models/XpEvent';
import { Alert } from '@/lib/db/models/Alert';
import { getPlayer } from '@/lib/player/service';
import { hueForUrgency, theme } from '@/theme/tokens';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const RAMP_HOURS = 72; // Urgency starts climbing three days before a deadline.
const DISMISS_HOURS = 24; // A dismissed stagnation alert stays hidden for a day.

// Works out how urgent the player's nearest boss deadline is, plus any alerts to show.
// Returns urgency 0 to 1, the accent hue to use, and the alerts.
export async function urgencyFor(userId, now = Date.now()) {
  await connectToDatabase();
  const player = await getPlayer(userId);
  const warningHours = player?.settings?.warningHours ?? 2;
  const stagnationDays = player?.settings?.stagnationDays ?? 3;

  const [open, lastXp, dismissals] = await Promise.all([
    Target.find({ userId, claimedAt: null }).sort({ deadline: 1 }).select('title deadline').lean(),
    XpEvent.findOne({ userId }).sort({ createdAt: -1 }).select('createdAt').lean(),
    Alert.find({ userId, dismissedAt: { $ne: null } }).lean(),
  ]);

  const alerts = [];
  let urgency = 0;
  let banner = null;

  const nearest = open[0];
  if (nearest) {
    const hoursLeft = (new Date(nearest.deadline).getTime() - now) / HOUR;
    if (hoursLeft <= 0) {
      urgency = 1;
      banner = { tone: 'overdue', title: nearest.title, deadline: new Date(nearest.deadline).toISOString(), headline: 'OVERDUE' };
    } else if (hoursLeft <= warningHours) {
      urgency = 0.5 + 0.5 * (1 - hoursLeft / warningHours);
      banner = { tone: 'warning', title: nearest.title, deadline: new Date(nearest.deadline).toISOString(), headline: 'DEADLINE NEAR' };
    } else if (hoursLeft <= RAMP_HOURS) {
      urgency = 0.5 * (1 - (hoursLeft - warningHours) / (RAMP_HOURS - warningHours));
    }
  }

  // Stagnation: boss targets are open, but no XP has been earned for a while.
  const quietSince = lastXp ? new Date(lastXp.createdAt).getTime() : 0;
  const quietFor = now - quietSince;
  if (open.length > 0 && (!lastXp || quietFor >= stagnationDays * DAY)) {
    const dismissed = dismissals.find((d) => d.key === 'stagnation');
    const hiddenUntil = dismissed ? new Date(dismissed.dismissedAt).getTime() + DISMISS_HOURS * HOUR : 0;
    if (now >= hiddenUntil) {
      alerts.push({
        key: 'stagnation',
        kind: 'stagnation',
        title: 'Progress has stalled',
        message: lastXp
          ? `No XP for ${Math.floor(quietFor / DAY)} days. Your boss targets are waiting.`
          : 'No XP earned yet. Complete a quest to start the climb.',
      });
    }
  }

  const stagnating = alerts.some((a) => a.kind === 'stagnation');
  const hue = stagnating && urgency === 0 ? theme.STAGNATION_HUE : hueForUrgency(urgency);
  return { urgency, hue, banner, alerts, warningHours, stagnationDays };
}

export async function dismissAlert(userId, key) {
  await connectToDatabase();
  await Alert.findOneAndUpdate({ userId, key }, { $set: { dismissedAt: new Date() } }, { upsert: true, new: true });
}
