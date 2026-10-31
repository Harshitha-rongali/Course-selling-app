import { Link } from 'react-router-dom';
import Container from '../components/layout/Container.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Alert from '../components/ui/Alert.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import CourseGrid from '../components/course/CourseGrid.jsx';
import useCourses from '../hooks/useCourses.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  LayersIcon,
  SparklesIcon,
  TagIcon,
  UserPlusIcon,
} from '../components/ui/Icons.jsx';
import styles from './Home.module.css';

const features = [
  {
    icon: BookOpenIcon,
    title: 'The full catalog',
    description:
      'Every course from the existing API appears in one searchable, responsive catalog.',
  },
  {
    icon: TagIcon,
    title: 'Clear pricing',
    description:
      'See the listed price on every course card before opening the details page.',
  },
  {
    icon: UserPlusIcon,
    title: 'Accounts and purchases',
    description:
      'Create a secure account, purchase a course, and open it again from your personal dashboard.',
  },
];

export default function Home() {
  const auth = useAuth();
  const { courses, status, error, reload, isLoading } = useCourses();
  const featuredCourses = courses.slice(0, 6);
  const accountPath = auth.role === 'admin' ? '/admin' : '/dashboard';
  const accountLabel =
    auth.role === 'admin' ? 'Admin dashboard' : 'My dashboard';

  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <Container className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <Badge variant="primary" className={styles.eyebrow}>
              <SparklesIcon size={14} />
              Course catalog
            </Badge>
            <h1 id="hero-title" className={styles.heroTitle}>
              Find your next course with{' '}
              <span className={styles.highlight}>clarity.</span>
            </h1>
            <p className={styles.heroText}>
              Browse the complete catalog, compare prices, and purchase the right
              course for you. Your library stays organized in one place.
            </p>
            <div className={styles.heroActions}>
              <Button to="/courses" size="lg">
                Browse courses
                <ArrowRightIcon size={18} />
              </Button>
              {auth.status === 'authenticated' ? (
                <Button to={accountPath} variant="secondary" size="lg">
                  {accountLabel}
                </Button>
              ) : (
                <Button to="/signup" variant="secondary" size="lg">
                  Create account
                </Button>
              )}
            </div>
            <p className={styles.heroNote}>
              <CheckIcon size={16} />
              Catalog, accounts, and course purchasing are live.
            </p>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.glow} />
            <div className={styles.catalogCard}>
              <div className={styles.catalogTop}>
                <span className={styles.catalogIcon}>
                  <BookOpenIcon size={22} />
                </span>
                <span className={styles.catalogPill}>Live catalog</span>
              </div>
              <p className={styles.catalogLabel}>Available courses</p>
              <p className={styles.catalogCount}>
                {isLoading ? '...' : courses.length}
              </p>
              <div className={styles.catalogLines}>
                <span />
                <span />
                <span />
              </div>
              <div className={styles.catalogRows}>
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className={styles.floatingCard}>
              <span className={styles.floatingIcon}>
                <TagIcon size={18} />
              </span>
              <span>
                <strong>Transparent pricing</strong>
                <small>Every price shown up front</small>
              </span>
            </div>
            <div className={styles.floatingBadge}>
              <SparklesIcon size={15} />
              Built on your API
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.features} aria-labelledby="features-title">
        <Container>
          <div className={styles.sectionIntro}>
            <span className={styles.kicker}>What you can do today</span>
            <h2 id="features-title" className={styles.sectionTitle}>
              A storefront that respects the backend
            </h2>
            <p className={styles.sectionText}>
              Browse freely, then sign in to purchase a course or open the
              administrator workspace. Sessions and roles are handled by the
              backend.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title} className={styles.featureCard}>
                  <span className={styles.featureIcon}>
                    <Icon size={22} />
                  </span>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureText}>{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section className={styles.catalog} aria-labelledby="catalog-title">
        <Container>
          <div className={styles.catalogHeader}>
            <div>
              <span className={styles.kicker}>Course catalog</span>
              <h2 id="catalog-title" className={styles.sectionTitle}>
                Featured courses
              </h2>
            </div>
            <Link to="/courses" className={styles.viewAll}>
              View all courses
              <ArrowRightIcon size={17} />
            </Link>
          </div>

          {isLoading ? (
            <div className={styles.state}>
              <Spinner size="lg" label="Loading courses" />
              <p>Loading the catalog...</p>
            </div>
          ) : null}

          {status === 'error' ? (
            <Alert
              variant="error"
              title="The catalog could not be loaded"
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
              title="No courses yet"
              description="The backend returned an empty catalog. Courses will appear here as soon as they are added."
            />
          ) : null}

          {status === 'success' && featuredCourses.length > 0 ? (
            <CourseGrid courses={featuredCourses} />
          ) : null}
        </Container>
      </section>

      <section className={styles.callout} aria-labelledby="callout-title">
        <Container>
          <div className={styles.calloutCard}>
            <div>
              <span className={styles.kicker}>Ready when you are</span>
              <h2 id="callout-title" className={styles.calloutTitle}>
                Start browsing and build your course library
              </h2>
              <p className={styles.calloutText}>
                Create an account to purchase any course in the catalog. Your
                dashboard keeps every course you own within reach.
              </p>
            </div>
            <div className={styles.calloutActions}>
              {auth.status === 'authenticated' ? (
                <Button to={accountPath} size="lg">
                  {accountLabel}
                </Button>
              ) : (
                <Button to="/signup" size="lg">
                  Create account
                </Button>
              )}
              <Button to="/courses" variant="secondary" size="lg">
                Explore courses
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
