'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../dashboard.module.css';

const DEFAULT_ROOMS = [
  { name: 'Kitchen',      floor: 1, category: 'household' },
  { name: 'Living Room',  floor: 1, category: 'household' },
  { name: 'Bathroom',     floor: 1, category: 'household' },
  { name: 'Bedroom',      floor: 1, category: 'household' },
  { name: 'Closet',       floor: 1, category: 'household' },
  { name: 'Lost / Unknown',    floor: null, category: 'unknown' },
  { name: 'Trash / Discarded', floor: null, category: 'unknown' },
  { name: 'Offsite',           floor: null, category: 'external' },
];

type Room = { name: string; floor: number | null; category: string };

export default function SetupClient({ 
  householdId,
  hasLocations 
}: { 
  householdId: number;
  hasLocations: boolean;
}) {
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);
  const [includeCar, setIncludeCar] = useState(false);
  const [newRoom, setNewRoom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function addRoom() {
    if (!newRoom.trim()) return;
    setRooms(prev => [...prev, { name: newRoom.trim(), floor: 1, category: 'household' }]);
    setNewRoom('');
  }

  function removeRoom(index: number) {
    setRooms(prev => prev.filter((_, i) => i !== index));
  }

  async function handleCreate() {
    setLoading(true);
    setError(null);

    const toCreate = [
      ...rooms,
      ...(includeCar ? [{ name: 'Car', floor: null, category: 'vehicle' }] : []),
    ];

    try {
      const res = await fetch('/api/locations/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          household_id: householdId,
          locations: toCreate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'something went wrong');
        return;
      }

      router.push('/dashboard');

    } catch {
      setError('something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Courier New, monospace' }}>
      
      {/* topbar */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--accent)', fontSize: '22px', fontFamily: 'Courier New, monospace' }}>DoomPiles</span>
        <button
          onClick={() => router.push('/dashboard/setup/configure')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontFamily: 'Courier New, monospace', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
        >
          manual setup →
        </button>
      </div>

      {/* overlay if no locations yet */}
      {!hasLocations && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '480px', maxHeight: '80vh', overflowY: 'auto' }}>
            
            <h2 className={styles.modalTitle}>let's add some rooms.</h2>
            <p className={styles.modalSub}>we put together a starting point — edit it however you like.</p>

            {/* room list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {rooms.map((room, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px' }}>{room.name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{room.category}</span>
                    <button
                      onClick={() => removeRoom(i)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: '0 2px' }}
                      title="remove"
                    >
                      ×
                    </button>
                  </span>
                </div>
              ))}
            </div>

            {/* add room */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                value={newRoom}
                onChange={e => setNewRoom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addRoom()}
                placeholder="+ add a room"
                style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'Courier New, monospace', fontSize: '13px', padding: '8px 12px', outline: 'none' }}
              />
              <button
                onClick={addRoom}
                style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--accent)', fontFamily: 'Courier New, monospace', fontSize: '13px', padding: '8px 12px', cursor: 'pointer' }}
              >
                add
              </button>
            </div>

            {/* car checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                checked={includeCar}
                onChange={e => setIncludeCar(e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              include a car
            </label>

            {error && <p style={{ fontSize: '12px', color: 'var(--danger)', marginBottom: '12px' }}>{error}</p>}

            {/* actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => router.push('/dashboard/setup/configure')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontFamily: 'Courier New, monospace', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                manual setup instead
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || rooms.length === 0}
                className={styles.modalPrimary}
              >
                {loading ? 'creating...' : 'create'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* placeholder for when locations exist */}
      {hasLocations && (
        <div style={{ padding: '40px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
          location management coming soon.
        </div>
      )}

    </main>
  );
}