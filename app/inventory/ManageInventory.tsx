'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/dashboard/dashboard.module.css';

export default function ManageInventory(){
 
  async function getItems()
  try {
    const res = await fetch ('/api/inventory/items', {
                method: 'GET',
                headers: { Content-type: 'application/json' },
    } );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'something went wrong');
        return;
      }    
    router.refresh();
    
  }
  return (
    <h2>stuff will show here</h2>
  );
}