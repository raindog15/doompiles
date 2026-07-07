'use client';

import { AuthView } from "@neondatabase/auth/react/ui";

export default function Home() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1>DoomPiles</h1>
      <AuthView pathname="sign-in" />
    </main>
  );
}