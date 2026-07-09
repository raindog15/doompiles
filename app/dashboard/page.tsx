

  




'use client';

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {

  // get the session info
  const { data: session } = await auth.getSession();
  // send back to root if no session
//  if (!session) {
//    redirect('/');
//  }
  
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  return (
    <main style={{ minHeight: '100vh', background: '#1C1C1C', color: '#F0EBE0', fontFamily: 'Courier New, monospace' }}>
      
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderBottom: '1px solid #2a2a2a' }}>
        
        {/* Search bar */}
        <input
          type="search"
          placeholder="Where is my stuff?"
          style={{
            flex: 1,
            background: '#222',
            border: '1px solid #2e2e2e',
            color: '#F0EBE0',
            fontFamily: 'Courier New, monospace',
            fontSize: '14px',
            padding: '10px 14px',
            outline: 'none',
          }}
        />

        {/* User icon + dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="User menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="5.5" r="3" stroke="#F0EBE0" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#F0EBE0" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {menuOpen && (
            <div style={{ position: 'absolute', right: 0, top: '44px', background: '#222', border: '1px solid #2e2e2e', minWidth: '140px', zIndex: 50 }}>
              <button
                onClick={handleSignOut}
                style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: '#F0EBE0', fontFamily: 'Courier New, monospace', fontSize: '13px', textAlign: 'left', cursor: 'pointer' }}
              >
                sign out
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Placeholder content */}
      <div style={{ padding: '40px 20px', color: '#555', fontFamily: 'Courier New, monospace', fontSize: '13px' }}>

        welcome {session.user.name}
      </div>

    </main>
  );
}