'use client';

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import styles from './dashboard.module.css';

export default function DashboardClient({ user }: { user: { name?: string | null, email?: string | null } }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  return (
    <main className={styles.page}>
        <aside className={styles.sidebar}>
        <div className={styles.sidebarItem}>Household</div>
        <div className={styles.sidebarItem}>Inventory</div>
        <div className={styles.sidebarItem}>Settings</div>
      </aside>
      <div className={styles.topbar}>
        <input
          type="search"
          placeholder="Where is my stuff?"
          className={styles.search}
        />
        <div className={styles.userMenu}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={styles.userButton}
            aria-label="User menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="5.5" r="3" stroke="#F0EBE0" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#F0EBE0" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {menuOpen && (
            <div className={styles.dropdown}>
              <button
                onClick={handleSignOut}
                className={styles.dropdownButton}
              >
                sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.content}>
        Doom, doom, doom doom doom...

        Doom coming soon.
      </div>
        <div className={styles.bottomBar}>
        <button className={styles.snap}>SNAP a doompile</button>
      </div>
    </main>
  );
}
