import styles from './Card.module.css';

export default function Card({
  as: Element = 'div',
  variant = 'default',
  className = '',
  children,
  ...props
}) {
  return (
    <Element
      className={`${styles.card} ${styles[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </Element>
  );
}
