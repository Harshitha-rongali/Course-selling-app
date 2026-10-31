import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/layout/Container.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Alert from '../components/ui/Alert.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateSignup } from '../utils/validation.js';
import {
  ArrowRightIcon,
  CheckIcon,
  LockIcon,
  UserPlusIcon,
} from '../components/ui/Icons.jsx';
import styles from './Signup.module.css';

const initialForm = {
  username: '',
  password: '',
  confirmPassword: '',
};

export default function Signup() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (auth.status === 'authenticated') {
      navigate(auth.role === 'admin' ? '/admin' : '/dashboard', {
        replace: true,
      });
    }
  }, [auth.role, auth.status, navigate]);

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

    const validationErrors = validateSignup(form);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
      await auth.signup({
        username: form.username.trim(),
        password: form.password,
      });
    } catch (error) {
      setApiError(error);
      setSubmitting(false);
    }
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
              <UserPlusIcon size={15} />
              Create an account
            </span>
            <h1 className={styles.title}>Join the course catalog</h1>
            <p className={styles.description}>
              Create your account to purchase courses and keep your course
              library in one place. Your session starts immediately after
              signup.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {apiError ? (
              <Alert variant="error" title="Could not create the account">
                {apiError.message}
              </Alert>
            ) : null}

            <Input
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              error={fieldErrors.username}
              hint="Use 3-50 characters. This is the name you will sign in with."
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
              hint="Use at least 6 characters. Your password is hashed by the backend."
              autoComplete="new-password"
              disabled={submitting}
              required
            />

            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={fieldErrors.confirmPassword}
              autoComplete="new-password"
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
                  <Spinner size="sm" label="Creating account" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRightIcon size={18} />
                </>
              )}
            </Button>

            <p className={styles.privacy}>
              <LockIcon size={15} />
              Passwords never go into browser storage. After signup, your
              session is kept in a secure HttpOnly cookie.
            </p>
          </form>

          <p className={styles.switch}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        <aside className={styles.aside} aria-label="Account features">
          <div className={styles.asideCard}>
            <span className={styles.asideKicker}>Included with your account</span>
            <ul className={styles.asideList}>
              <li>
                <CheckIcon size={17} />
                Secure signup and password hashing
              </li>
              <li>
                <CheckIcon size={17} />
                Purchase courses from the live catalog
              </li>
              <li>
                <CheckIcon size={17} />
                A student dashboard for every course you own
              </li>
              <li>
                <CheckIcon size={17} />
                Role-protected admin tools for administrators
              </li>
            </ul>
            <p className={styles.asideNote}>
              Accounts are created through the real backend endpoint. No
              credentials are stored in the browser.
            </p>
          </div>

          <Alert variant="info" title="Automatic sign-in">
            When account creation succeeds, the backend issues your session and
            you are taken directly to your dashboard.
          </Alert>
        </aside>
      </Container>
    </section>
  );
}
