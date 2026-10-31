import styles from './Spinner.module.css';

export default function Spinner({ label = 'Loading', size = 'md' }) {
  return (
    <span className={styles.wrapper} role="status">
      <span className={`${styles.spinner} ${styles[size]}`} aria-hidden="true" />
      <span className="visuallyHidden">{label}</span>
    </span>
  );
}
