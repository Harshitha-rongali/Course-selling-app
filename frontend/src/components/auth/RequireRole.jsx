import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../ui/Spinner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './RequireRole.module.css';

export default function RequireRole({ role, children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === 'loading') {
    return (
      <div className={styles.state}>
        <Spinner size="lg" label="Checking your session" />
        <p>Checking your session...</p>
      </div>
    );
  }

  if (auth.status !== 'authenticated') {
    return (
      <Navigate
        to={role === 'admin' ? '/admin/login' : '/login'}
        replace
        state={{ from: location }}
      />
    );
  }

  if (auth.role !== role) {
    return (
      <Navigate
        to={auth.role === 'admin' ? '/admin' : '/dashboard'}
        replace
      />
    );
  }

  return children;
}
