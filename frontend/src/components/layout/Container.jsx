import styles from './Container.module.css';

export default function Container({ className = '', children }) {
  return <div className={`${styles.container} ${className}`.trim()}>{children}</div>;
}
