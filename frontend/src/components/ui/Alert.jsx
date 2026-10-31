import { AlertIcon, CheckCircleIcon, InfoIcon } from './Icons.jsx';
import styles from './Alert.module.css';

const icons = {
  error: AlertIcon,
  success: CheckCircleIcon,
  info: InfoIcon,
  warning: AlertIcon,
};

export default function Alert({
  variant = 'info',
  title,
  children,
  action,
  className = '',
}) {
  const IconComponent = icons[variant] || InfoIcon;

  return (
    <div
      className={`${styles.alert} ${styles[variant]} ${className}`.trim()}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <span className={styles.icon}>
        <IconComponent size={20} />
      </span>
      <div className={styles.content}>
        {title ? <p className={styles.title}>{title}</p> : null}
        {children ? <div className={styles.body}>{children}</div> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
