'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

const COLOURS = ['yellow', 'amber', 'silver', 'crimson', 'indigo', 'tawny', 'jade', 'ashen', 'copper', 'violet', 'russet'];
const ADJECTIVES = ['autumn', 'winter', 'summer', 'spring', 'bright', 'sunny', 'peaceful', 'solemn', 'quiet', 'dusty', 'sleepy', 'hollow', 'mossy', 'creaky', 'misty', 'sturdy', 'murky', 'fuzzy', 'bold'];
const NOUNS = ['leaves', 'tree', 'mask', 'badger', 'kettle', 'cauldron', 'lantern', 'hammer', 'raven', 'thistle', 'ferret', 'acorn', 'hamster', 'hedgehog'];

function generateName() {
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  return `${pick(COLOURS)}-${pick(ADJECTIVES)}-${pick(NOUNS)}`;
}

export default function HouseholdModal() {
  const [name, setName] = useState(generateName());
  const [view, setView] = useState<'create' | 'join'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/households/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'something went wrong');
        return;
      }

      router.refresh(); // re-runs server component, modal won't show again
    } catch {
      setError('something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>You seem new here.</h2>
        <p className={styles.modalSub}>first, let&apos;s name your household.</p>

        <div className={styles.modalTabs}>
          <button
            className={`${styles.modalTab} ${view === 'create' ? styles.modalTabActive : ''}`}
            onClick={() => setView('create')}
          >
            create
          </button>
          <button
            className={`${styles.modalTab} ${view === 'join' ? styles.modalTabActive : ''}`}
            onClick={() => setView('join')}
          >
            join existing
          </button>
        </div>

        {view === 'create' && (
          <div className={styles.modalBody}>
            <p className={styles.modalHint}>we generated something for you — change it if you want.</p>
            <div className={styles.modalInputRow}>
              <input
                className={styles.modalInput}
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <button
                className={styles.rerollBtn}
                onClick={() => setName(generateName())}
                title="generate another"
              >
                ↺
              </button>
            </div>
            {error && <p className={styles.modalError}>{error}</p>}
            <button
              className={styles.modalPrimary}
              onClick={handleCreate}
              disabled={loading || !name.trim()}
            >
              {loading ? 'creating...' : 'create household'}
            </button>
          </div>
        )}

        {view === 'join' && (
          <div className={styles.modalBody}>
            <p className={styles.modalHint}>joining an existing household isn&apos;t built yet.<br/>check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}