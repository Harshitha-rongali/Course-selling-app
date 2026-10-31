import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from '../components/layout/Container.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Alert from '../components/ui/Alert.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateLogin } from '../utils/validation.js';
import {
  ArrowRightIcon,
  CheckIcon,
  LockIcon,
  LogInIcon,
  ShieldIcon,
} from '../components/ui/Icons.jsx';
import styles from './Signup.module.css';

const roleCopy = {
  user: {
    eyebrow: 'Student sign in',
    title: 'Welcome back',
    description:
      'Sign in with your account to purchase courses and open your student dashboard.',
    asideKicker: 'Your student account',
    asideItems: [
      'Purchases are saved to your account',
      'Open every course you own from your dashboard',
      'Sessions are stored in a secure HttpOnly cookie',
    ],
    asideNote:
      'Your password is verified by the backend and is never stored by this frontend.',
  },
  admin: {
    eyebrow: 'Admin sign in',
    title: 'Admin workspace',
    description:
      'Sign in with an administrator account to view store statistics and publish courses.',
    asideKicker: 'Administrator access',
    asideItems: [
      'View catalog, student, and purchase statistics',
      'Publish new courses to the live catalog',
      'Admin routes require an administrator session',
    ],
    asideNote:
      'Only existing administrator accounts can sign in. Admin signup is not exposed in this frontend.',
  },
};

function getDestination(from, role) {
  const fallback = role === 'admin' ? '/admin' : '/dashboard';

  if (!from || typeof from !== 'object') {
    return fallback;
  }

  const path = `${from.pathname || ''}${from.search || ''}${from.hash || ''}`;

  if (!path.startsWith('/') || path.startsWith('//')) {
    return fallback;
  }

  if (role === 'admin' && !path.startsWith('/admin')) {
    return fallback;
  }

  if (role === 'user' && path.startsWith('/admin')) {
    return fallback;
  }

  return path;
}

export default function Login({ role = 'user' }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const copy = roleCopy[role];
  const RoleIcon = role === 'admin' ? ShieldIcon : LogInIcon;
  const isWrongRole =
    auth.status === 'authenticated' && auth.role !== role;
  const destination = getDestination(location.state?.from, role);

  useEffect(() => {
    if (auth.status === 'authenticated' && auth.role === role) {
      navigate(destination, { replace: true });
    }
  }, [auth.role, auth.status, destination, navigate, role]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));

    if (apiError) {
      setApiError(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateLogin(form);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
      await auth.login(role, {
        username: form.username.trim(),
        password: form.password,
      });
    } catch (error) {
      setApiError(error);
      setSubmitting(false);
    }
  }

  async function handleSwitchAccount() {
    await auth.logout();
    setForm({ username: '', password: '' });
    setApiError(null);
    setFieldErrors({});
  }

  return (
    <section className={styles.page}>
      <Container className={styles.layout}>
        <div className={styles.formColumn}>
          <Link to="/" className={styles.backLink}>
            Back to home
          </Link>

          <div className={styles.header}>
            <span className={styles.eyebrow}>
              <RoleIcon size={15} />
              {copy.eyebrow}
            </span>
            <h1 className={styles.title}>{copy.title}</h1>
            <p className={styles.description}>{copy.description}</p>
          </div>

          {isWrongRole ? (
            <div className={styles.form}>
              <Alert
                variant="info"
                title={`You are already signed in as a ${auth.role}`}
              >
                Sign out before opening the {role} sign-in page.
              </Alert>
              <div className={styles.successActions}>
                <Button to={auth.role === 'admin' ? '/admin' : '/dashboard'}>
                  Open my dashboard
                  <ArrowRightIcon size={17} />
                </Button>
                <Button variant="secondary" onClick={handleSwitchAccount}>
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              {apiError ? (
                <Alert variant="error" title="Could not sign in">
                  {apiError.message}
                </Alert>
              ) : null}

              <Input
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                error={fieldErrors.username}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                disabled={submitting}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                error={fieldErrors.password}
                autoComplete="current-password"
                disabled={submitting}
                required
              />

              <Button
                type="submit"
                size="lg"
                fullWidth
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" label="Signing in" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRightIcon size={18} />
                  </>
                )}
              </Button>

              <p className={styles.privacy}>
                <LockIcon size={15} />
                Your session is kept in an HttpOnly cookie. Passwords are never
                stored in browser storage.
              </p>
            </form>
          )}

          <p className={styles.switch}>
            {role === 'user' ? (
              <>
                New to the catalog? <Link to="/signup">Create an account</Link>
                <span> · </span>
                <Link to="/admin/login">Admin sign in</Link>
              </>
            ) : (
              <>
                Looking for a student account?{' '}
                <Link to="/login">Student sign in</Link>
              </>
            )}
          </p>
        </div>

        <aside className={styles.aside} aria-label={`${copy.eyebrow} details`}>
          <div className={styles.asideCard}>
            <span className={styles.asideKicker}>{copy.asideKicker}</span>
            <ul className={styles.asideList}>
              {copy.asideItems.map((item) => (
                <li key={item}>
                  <CheckIcon size={17} />
                  {item}
                </li>
              ))}
            </ul>
            <p className={styles.asideNote}>{copy.asideNote}</p>
          </div>

          <Alert variant="info" title="Secure session">
            The backend sets a signed session cookie after a successful login.
            Protected requests are authorized by your role.
          </Alert>
        </aside>
      </Container>
    </section>
  );
}
