
'use client'

import { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/hello/')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <main>
      <h1>Django + Next.js</h1>
      <p>Message from backend: {message}</p>
    </main>
  );
}
