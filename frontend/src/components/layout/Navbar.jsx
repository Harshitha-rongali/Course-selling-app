import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Container from './Container.jsx';
import Button from '../ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  BookOpenIcon,
  CloseIcon,
  LogOutIcon,
  MenuIcon,
} from '../ui/Icons.jsx';
import styles from './Navbar.module.css';

const baseNavigation = [
  { label: 'Home', to: '/', end: true },
  { label: 'Courses', to: '/courses' },
];

function navLinkClass({ isActive }) {
  return `${styles.navLink} ${isActive ? styles.active : ''}`.trim();
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const navigation =
    auth.status === 'authenticated'
      ? [
          ...baseNavigation,
          auth.role === 'admin'
            ? { label: 'Admin', to: '/admin' }
            : { label: 'Dashboard', to: '/dashboard' },
        ]
      : baseNavigation;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setSigningOut(true);
    await auth.logout();
    setSigningOut(false);
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.bar}>
          <Link to="/" className={styles.brand} aria-label="Course Catalog home">
            <span className={styles.brandMark}>
              <BookOpenIcon size={22} />
            </span>
            <span className={styles.brandName}>
              Course<span>Catalog</span>
            </span>
          </Link>

          <nav className={styles.desktopNav} aria-label="Primary">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.desktopActions}>
            {auth.status === 'authenticated' ? (
              <>
                <span className={styles.session}>
                  <span className={styles.sessionName}>
                    {auth.account?.username}
                  </span>
                  <span className={styles.sessionRole}>
                    {auth.role === 'admin' ? 'Admin' : 'Student'}
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={signingOut}
                >
                  <LogOutIcon size={16} />
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </Button>
              </>
            ) : (
              <>
                <Button to="/login" variant="ghost" size="sm">
                  Sign in
                </Button>
                <Button to="/signup" size="sm">
                  Create account
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        {menuOpen ? (
          <div id="mobile-navigation" className={styles.mobilePanel}>
            <nav className={styles.mobileNav} aria-label="Mobile primary">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={navLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}
              {auth.status !== 'authenticated' ? (
                <NavLink to="/login" className={navLinkClass}>
                  Sign in
                </NavLink>
              ) : null}
            </nav>

            {auth.status === 'authenticated' ? (
              <div className={styles.mobileSession}>
                <p className={styles.mobileName}>
                  Signed in as <strong>{auth.account?.username}</strong>
                </p>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleLogout}
                  disabled={signingOut}
                >
                  <LogOutIcon size={17} />
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </Button>
              </div>
            ) : (
              <Button to="/signup" fullWidth>
                Create account
              </Button>
            )}
          </div>
        ) : null}
      </Container>
    </header>
  );
}
