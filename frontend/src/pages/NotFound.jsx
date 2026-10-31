import Container from '../components/layout/Container.jsx';
import Button from '../components/ui/Button.jsx';
import { CompassIcon } from '../components/ui/Icons.jsx';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <section className={styles.page}>
      <Container className={styles.wrapper}>
        <span className={styles.icon}>
          <CompassIcon size={30} />
        </span>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>This page is not in the catalog</h1>
        <p className={styles.description}>
          The link may be incorrect, or the page may not exist. Head back to the
          courses to keep exploring.
        </p>
        <div className={styles.actions}>
          <Button to="/courses">Browse courses</Button>
          <Button to="/" variant="secondary">
            Back to home
          </Button>
        </div>
      </Container>
    </section>
  );
}
