import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Container from '../components/layout/Container.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Alert from '../components/ui/Alert.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import CourseImage from '../components/course/CourseImage.jsx';
import useCourses from '../hooks/useCourses.js';
import {
  getPurchasedCourses,
  purchaseCourse,
} from '../api/courses.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/format.js';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  InfoIcon,
  LockIcon,
} from '../components/ui/Icons.jsx';
import styles from './CourseDetails.module.css';

export default function CourseDetails() {
  const { courseId } = useParams();
  const location = useLocation();
  const auth = useAuth();
  const { courses, status, error, reload } = useCourses();
  const [purchasedIds, setPurchasedIds] = useState(null);
  const [purchaseCheckError, setPurchaseCheckError] = useState(null);
  const [purchaseStatus, setPurchaseStatus] = useState('idle');
  const [purchaseError, setPurchaseError] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const course = courses.find((item) => String(item?._id) === String(courseId));
  const isUser = auth.status === 'authenticated' && auth.role === 'user';
  const isPurchased = Boolean(purchasedIds?.has(String(courseId)));

  useEffect(() => {
    setPurchaseStatus('idle');
    setPurchaseError(null);
    setPurchaseSuccess(false);
  }, [courseId]);

  useEffect(() => {
    if (!isUser) {
      setPurchasedIds(null);
      setPurchaseCheckError(null);
      return undefined;
    }

    const controller = new AbortController();

    getPurchasedCourses({ signal: controller.signal })
      .then((data) => {
        const ids = Array.isArray(data?.courses)
          ? data.courses.map((item) => String(item?._id))
          : [];
        setPurchasedIds(new Set(ids));
        setPurchaseCheckError(null);
      })
      .catch((requestError) => {
        if (requestError?.name === 'AbortError') {
          return;
        }

        if (requestError?.status === 401) {
          auth.refresh();
          return;
        }

        setPurchasedIds(new Set());
        setPurchaseCheckError(
          new Error('Your existing purchases could not be checked.'),
        );
      });

    return () => controller.abort();
  }, [auth, isUser, courseId]);

  async function handlePurchase() {
    setPurchaseStatus('purchasing');
    setPurchaseError(null);
    setPurchaseSuccess(false);

    try {
      await purchaseCourse(courseId);
      setPurchasedIds((current) => {
        const next = new Set(current || []);
        next.add(String(courseId));
        return next;
      });
      setPurchaseSuccess(true);
    } catch (requestError) {
      if (requestError?.status === 401) {
        await auth.refresh();
        setPurchaseError(
          new Error('Your session expired. Sign in again to purchase this course.'),
        );
      } else if (requestError?.status === 409) {
        setPurchasedIds((current) => {
          const next = new Set(current || []);
          next.add(String(courseId));
          return next;
        });
        setPurchaseSuccess(true);
      } else {
        setPurchaseError(requestError);
      }
    } finally {
      setPurchaseStatus('idle');
    }
  }

  if (status === 'loading') {
    return (
      <section className={styles.statePage}>
        <Container>
          <div className={styles.state}>
            <Spinner size="lg" label="Loading course" />
            <p>Loading course details...</p>
          </div>
        </Container>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className={styles.statePage}>
        <Container>
          <Link to="/courses" className={styles.backLink}>
            <ArrowLeftIcon size={17} />
            Back to courses
          </Link>
          <Alert
            variant="error"
            title="Course details could not be loaded"
            action={
              <Button size="sm" variant="secondary" onClick={reload}>
                Try again
              </Button>
            }
          >
            {error?.message}
          </Alert>
        </Container>
      </section>
    );
  }

  if (!course) {
    return (
      <section className={styles.statePage}>
        <Container>
          <EmptyState
            icon={<BookOpenIcon size={26} />}
            title="Course not found"
            description="This course is not in the current catalog. It may have been removed, or the link may be incorrect."
            action={
              <Button to="/courses" variant="secondary">
                Browse all courses
              </Button>
            }
          />
        </Container>
      </section>
    );
  }

  const title = course.title || 'Untitled course';
  const description = String(course.description || '').trim();
  const backToLogin = {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  };

  return (
    <section className={styles.page}>
      <Container>
        <Link to="/courses" className={styles.backLink}>
          <ArrowLeftIcon size={17} />
          Back to courses
        </Link>

        <div className={styles.layout}>
          <article className={styles.main}>
            <div className={styles.media}>
              <CourseImage
                src={course.imageLink}
                alt={`${title} cover`}
                title={title}
                eager
              />
            </div>

            <div className={styles.header}>
              <Badge variant="primary">Course</Badge>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.lead}>
                Review the course overview and listed price before enrollment.
              </p>
            </div>

            <div className={styles.content}>
              <h2 className={styles.contentTitle}>About this course</h2>
              <p className={styles.description}>
                {description || 'No description has been added for this course yet.'}
              </p>
            </div>

            <Alert variant="info" title="Curriculum is not available">
              The existing backend stores a title, description, image, and price
              for each course. It does not provide lessons or course content, so
              none is shown here.
            </Alert>
          </article>

          <aside className={styles.sidebar} aria-label="Purchase information">
            <div className={styles.purchaseCard}>
              <p className={styles.priceLabel}>One-time price</p>
              <p className={styles.price}>{formatPrice(course.price)}</p>

              {auth.status === 'loading' ? (
                <Button size="lg" fullWidth disabled>
                  <Spinner size="sm" label="Checking session" />
                  Checking session...
                </Button>
              ) : null}

              {auth.status === 'anonymous' ? (
                <>
                  <Button
                    to="/login"
                    state={{ from: backToLogin }}
                    size="lg"
                    fullWidth
                  >
                    <LockIcon size={18} />
                    Sign in to purchase
                  </Button>
                  <p className={styles.purchaseNote}>
                    Purchasing requires a student account. Sign in or create one
                    to continue.
                  </p>
                  <Button to="/signup" variant="secondary" fullWidth>
                    Create an account
                  </Button>
                </>
              ) : null}

              {auth.role === 'admin' ? (
                <>
                  <Button to="/admin" size="lg" fullWidth>
                    Open admin workspace
                    <ArrowRightIcon size={18} />
                  </Button>
                  <p className={styles.purchaseNote}>
                    Admin accounts manage the catalog and cannot purchase
                    courses.
                  </p>
                </>
              ) : null}

              {isUser ? (
                <>
                  {purchasedIds === null ? (
                    <Button size="lg" fullWidth disabled>
                      <Spinner size="sm" label="Checking purchases" />
                      Checking purchases...
                    </Button>
                  ) : null}

                  {purchasedIds !== null && isPurchased ? (
                    <>
                      <Button to="/dashboard" size="lg" fullWidth>
                        Go to my dashboard
                        <ArrowRightIcon size={18} />
                      </Button>
                      <p className={styles.purchasedNote}>
                        <CheckIcon size={17} />
                        You already own this course.
                      </p>
                    </>
                  ) : null}

                  {purchasedIds !== null && !isPurchased ? (
                    <Button
                      size="lg"
                      fullWidth
                      onClick={handlePurchase}
                      disabled={purchaseStatus === 'purchasing'}
                    >
                      {purchaseStatus === 'purchasing' ? (
                        <>
                          <Spinner size="sm" label="Purchasing course" />
                          Purchasing...
                        </>
                      ) : (
                        <>
                          Purchase course
                          <ArrowRightIcon size={18} />
                        </>
                      )}
                    </Button>
                  ) : null}

                  {purchaseCheckError ? (
                    <p className={styles.purchaseNote}>
                      {purchaseCheckError.message} You can still try purchasing
                      this course.
                    </p>
                  ) : null}
                </>
              ) : null}

              {purchaseError ? (
                <Alert
                  className={styles.purchaseAlert}
                  variant="error"
                  title="Purchase failed"
                >
                  {purchaseError.message}
                </Alert>
              ) : null}

              {purchaseSuccess ? (
                <Alert
                  className={styles.purchaseAlert}
                  variant="success"
                  title="Purchase complete"
                  action={
                    <Button to="/dashboard" size="sm" variant="secondary">
                      View dashboard
                    </Button>
                  }
                >
                  This course has been added to your library.
                </Alert>
              ) : null}

              <div className={styles.divider} />

              <ul className={styles.facts}>
                <li>
                  <CheckIcon size={17} />
                  Course details are loaded from the live catalog
                </li>
                <li>
                  <LockIcon size={17} />
                  Secure sign-in is required before enrollment
                </li>
                <li>
                  <InfoIcon size={17} />
                  Course content is not part of the current API
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
