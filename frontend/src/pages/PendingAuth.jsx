import Container from '../components/layout/Container.jsx';
import Button from '../components/ui/Button.jsx';
import { LockIcon } from '../components/ui/Icons.jsx';
import styles from './PendingAuth.module.css';

const missingSupport = [
  'No user or admin login endpoint',
  'No token or session issued by the backend',
  'No logout or profile endpoint',
  'Protected routes expect credentials on every request',
];

export default function PendingAuth({ eyebrow, title, description }) {
  return (
    <section className={styles.page}>
      <Container className={styles.wrapper}>
        <div className={styles.card}>
          <span className={styles.icon}>
            <LockIcon size={28} />
          </span>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>

          <div className={styles.missing}>
            <h2 className={styles.missingTitle}>Missing backend support</h2>
            <ul className={styles.list}>
              {missingSupport.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.actions}>
            <Button to="/courses">Browse courses</Button>
            <Button to="/signup" variant="secondary">
              Create an account
            </Button>
          </div>

          <p className={styles.note}>
            Nothing has been faked. This route will be enabled when the backend
            exposes proper authentication endpoints.
          </p>
        </div>
      </Container>
    </section>
  );
}
