import Ticker from '@/components/arcade/Ticker';
import Panel from '@/components/arcade/Panel';
import Button from '@/components/arcade/Button';
import GlitchTitle from '@/components/arcade/GlitchTitle';
import HueTuner from '@/components/arcade/HueTuner';
import { getDatabaseStatus } from '@/lib/db/connect';

export const dynamic = 'force-dynamic';

const DB_LABEL = { connected: 'Connected', not_configured: 'Not configured', error: 'Error' };

// Phase 1 home: the themed shell plus a system check.
// Replaced by login and onboarding in Phases 2 and 3.
export default async function Home() {
  const db = await getDatabaseStatus();

  return (
    <>
      <Ticker items={['The System online', 'Phase 1 · foundation', 'Accounts arrive in Phase 2', 'Onboarding arrives in Phase 3']} />
      <main className="sys-main">
        <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="sys-eyebrow">Player one // standby</div>
          <GlitchTitle text="THE SYSTEM" />
          <p className="sys-muted">Clear quests, earn XP from an AI judge, and spend it on the targets you care about.</p>
        </header>

        <div className="sys-cols">
          <div className="sys-col">
            <Panel>
              <h2 className="sys-h2">System check</h2>
              <div className="sys-row sys-between">
                <span>App</span>
                <span className="sys-chip">Online</span>
              </div>
              <div className="sys-row sys-between">
                <span>Database</span>
                <span className={`sys-chip${db.status === 'connected' ? '' : ' sys-chip--hot'}`}>{DB_LABEL[db.status]}</span>
              </div>
              <p className="sys-small sys-muted">{db.message}</p>
              <div className="sys-row">
                <Button href="/api/health">Open health check</Button>
              </div>
            </Panel>

            <Panel variant="solid">
              <h2 className="sys-h2">Theme preview</h2>
              <p className="sys-small">
                Drag to preview how the whole app shifts from blue through purple to red as a deadline gets close. The real
                trigger arrives in Phase 9.
              </p>
              <HueTuner />
            </Panel>
          </div>

          <div className="sys-col">
            <Panel>
              <h2 className="sys-h2">Components</h2>
              <div className="sys-row">
                <Button variant="primary">Primary</Button>
                <Button>Default</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="sys-field">
                <label className="sys-label" htmlFor="demo-input">
                  Text field
                </label>
                <input id="demo-input" className="sys-input" placeholder="Type to test the field style" />
              </div>
              <div className="sys-row sys-between">
                <strong style={{ letterSpacing: 2, textTransform: 'uppercase' }}>Sample bar</strong>
                <span className="sys-xp">620 XP</span>
              </div>
              <div className="sys-bar">
                <i style={{ width: '62%' }} />
              </div>
              <div className="sys-row">
                <span className="sys-chip">Chip</span>
                <span className="sys-chip sys-chip--hot">Hot chip</span>
              </div>
            </Panel>
          </div>
        </div>
      </main>
    </>
  );
}
