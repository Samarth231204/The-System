'use client';

import { useEffect, useState } from 'react';

// Types a line out one character at a time with a block caret.
// Under reduced motion it shows the full text straight away.
export default function TypeWriter({ text, speed = 28, className = '', onDone }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
  }, [text]);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setCount(text.length);
      onDone?.();
      return;
    }
    if (count >= text.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(t);
  }, [count, text, speed, onDone]);

  const done = count >= text.length;
  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      <span className={`sys-caret${done ? ' sys-caret--idle' : ''}`} aria-hidden="true">
        █
      </span>
    </span>
  );
}
