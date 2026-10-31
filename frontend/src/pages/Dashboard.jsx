import { useCallback, useEffect, useState } from 'react';
import Container from '../components/layout/Container.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Alert from '../components/ui/Alert.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import CourseGrid from '../components/course/CourseGrid.jsx';
import { getPurchasedCourses } from '../api/courses.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/format.js';
import {
  BookOpenIcon,
  CheckCircleIcon,
  LayersIcon,
  TagIcon,
} from '../components/ui/Icons.jsx';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const auth = useAuth();
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setStatus('loading');
    setError(null);

    getPurchasedCourses({ signal: controller.signal })
      .then((data) => {
        setCourses(Array.isArray(data?.courses) ? data.courses : []);
        setStatus('success');
      })
      .catch((requestError) => {
        if (requestError?.name === 'AbortError') {
          return;
        }

        if (requestError?.status === 401) {
          auth.refresh();
          return;
        }

        setError(requestError);
        setStatus('error');
      });

    return () => controller.abort();
  }, [auth, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const libraryValue = courses.reduce((total, course) => {
    const price = Number(course?.price);
    return total + (Number.isFinite(price) ? price : 0);
  }, 0);

  return (
    <section className={styles.page}>
      <Container>
        <div className={styles.header}>
          <div>
            <Badge variant="primary">
              <CheckCircleIcon size={14} />
              Student dashboard
            </Badge>
            <h1 className={styles.title}>
              Welcome back, {auth.account?.username}
            </h1>
            <p className={styles.description}>
              Your purchased courses and account details live here. Browse the
              catalog any time to add another course.
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button to="/courses" variant="secondary">
              Browse courses
            </Button>
          </div>
        </div>

        <div className={styles.stats}>
          <Card className={styles.statCard}>
            <span className={styles.statIcon}>
              <BookOpenIcon size={21} />
            </span>
            <div>
              <p className={styles.statLabel}>Courses owned</p>
              <p className={styles.statValue}>
                {status === 'success' ? courses.length : '—'}
              </p>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <span className={styles.statIcon}>
              <TagIcon size={21} />
            </span>
            <div>
              <p className={styles.statLabel}>Library value</p>
              <p className={styles.statValue}>
                {status === 'success' ? formatPrice(libraryValue) : '—'}
              </p>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <span className={styles.statIcon}>
              <CheckCircleIcon size={21} />
            </span>
            <div>
              <p className={styles.statLabel}>Session</p>
              <p className={styles.statValue}>Active</p>
            </div>
          </Card>
        </div>

        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.kicker}>Your library</span>
            <h2 className={styles.sectionTitle}>Purchased courses</h2>
          </div>
          {status === 'success' && courses.length > 0 ? (
            <p className={styles.count}>
              {courses.length === 1 ? '1 course' : `${courses.length} courses`}
            </p>
          ) : null}
        </div>

        {status === 'loading' ? (
          <div className={styles.state}>
            <Spinner size="lg" label="Loading purchased courses" />
            <p>Loading your courses...</p>
          </div>
        ) : null}

        {status === 'error' ? (
          <Alert
            variant="error"
            title="Your courses could not be loaded"
            action={
              <Button size="sm" variant="secondary" onClick={reload}>
                Try again
              </Button>
            }
          >
            {error?.message}
          </Alert>
        ) : null}

        {status === 'success' && courses.length === 0 ? (
          <EmptyState
            icon={<LayersIcon size={26} />}
            title="Your library is empty"
            description="Purchase a course from the catalog and it will appear here."
            action={<Button to="/courses">Browse the catalog</Button>}
          />
        ) : null}

        {status === 'success' && courses.length > 0 ? (
          <CourseGrid courses={courses} />
        ) : null}

        <p className={styles.note}>
          Course lessons and content are not part of the current API, so this
          dashboard shows the course details that are available.
        </p>
      </Container>
    </section>
  );
}
