import { Link } from 'react-router-dom';
import Container from './Container.jsx';
import Badge from '../ui/Badge.jsx';
import { BookOpenIcon } from '../ui/Icons.jsx';
import styles from './Footer.module.css';

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div className={styles.brandColumn}>
            <Link to="/" className={styles.brand}>
              <span className={styles.brandMark}>
                <BookOpenIcon size={20} />
              </span>
              <span>CourseCatalog</span>
            </Link>
            <p className={styles.blurb}>
              Browse the live catalog, purchase courses, and manage your library
              from one responsive storefront.
            </p>
          </div>

          <div className={styles.column}>
            <h2 className={styles.heading}>Explore</h2>
            <Link to="/">Home</Link>
            <Link to="/courses">All courses</Link>
            <Link to="/signup">Create account</Link>
          </div>

          <div className={styles.column}>
            <h2 className={styles.heading}>Account</h2>
            <Link to="/login">Sign in</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/admin/login">Admin sign-in</Link>
          </div>

          <div className={styles.column}>
            <h2 className={styles.heading}>Backend status</h2>
            <div className={styles.status}>
              <Badge variant="success">Catalog live</Badge>
              <Badge variant="success">Accounts live</Badge>
              <Badge variant="success">Purchases live</Badge>
            </div>
            <p className={styles.note}>
              Sessions use signed HttpOnly cookies, with separate student and
              administrator roles.
            </p>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {year} CourseCatalog. Frontend connected to the existing API.</p>
          <p>Built with React, Vite, and React Router.</p>
        </div>
      </Container>
    </footer>
  );
}
