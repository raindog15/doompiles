'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

let category;
let floor;
let name;

function generateHousehold() {
  category = 'household';
  floor = 1;
  name = 'Living Room'
  return `${category}`;
}

export default function LocationsModal() {
  
  useState(generateHousehold());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // handle creation

  // modal for empty household prompt
    return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>Your house is kind of empty.</h2> 
        <p className={styles.modalSub}>Let's add some rooms.</p>
        <div className={styles.modalBody}>
        <p className={styles.modalHint}>You can define manually or have something generated</p>
        <button
                className={styles.rerollBtn}
                onClick={() => generateHousehold()
                }
                title="generate house"
              >
             it's a normal house.
              </button>
        </div>
      
      </div>
    </div>
  );
}