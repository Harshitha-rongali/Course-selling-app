import { useEffect, useState } from 'react';
import { getCourseInitials } from '../../utils/format.js';
import styles from './CourseImage.module.css';

const palettes = [
  'linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #a855f7 100%)',
  'linear-gradient(135deg, #0f766e 0%, #0ea5a4 55%, #22d3ee 100%)',
  'linear-gradient(135deg, #b45309 0%, #f59e0b 55%, #fcd34d 100%)',
  'linear-gradient(135deg, #be123c 0%, #e11d48 55%, #fb7185 100%)',
  'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #60a5fa 100%)',
];

function getPalette(title) {
  const hash = Array.from(String(title || '')).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return palettes[hash % palettes.length];
}

export default function CourseImage({
  src,
  alt = '',
  title = 'Course',
  eager = false,
  className = '',
}) {
  const [failed, setFailed] = useState(false);
  const hasImage = Boolean(src && String(src).trim()) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div
      className={`${styles.frame} ${className}`.trim()}
      style={hasImage ? undefined : { background: getPalette(title) }}
    >
      {hasImage ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className={styles.fallback} aria-hidden="true">
          <span className={styles.initials}>{getCourseInitials(title)}</span>
          <span className={styles.caption}>Course catalog</span>
        </div>
      )}
    </div>
  );
}
