import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/layout/Container.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Alert from '../components/ui/Alert.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Input from '../components/ui/Input.jsx';
import CourseImage from '../components/course/CourseImage.jsx';
import {
  createCourse,
  getAdminCourses,
  getAdminStats,
} from '../api/admin.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/format.js';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircleIcon,
  LayersIcon,
  PlusIcon,
  ShieldIcon,
  TagIcon,
  UserPlusIcon,
} from '../components/ui/Icons.jsx';
import styles from './AdminDashboard.module.css';

const initialForm = {
  title: '',
  description: '',
  imageLink: '',
  price: '',
};

function validateCourse(form) {
  const errors = {};
  const price = Number(form.price);

  if (!form.title.trim()) {
    errors.title = 'Enter a course title.';
  }

  if (form.price === '' || !Number.isFinite(price) || price < 0) {
    errors.price = 'Enter a valid price of zero or more.';
  }

  return errors;
}

export default function AdminDashboard() {
  const auth = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setStatus('loading');
    setError(null);

    Promise.all([
      getAdminCourses({ signal: controller.signal }),
      getAdminStats({ signal: controller.signal }),
    ])
      .then(([courseData, statsData]) => {
        setCourses(Array.isArray(courseData?.courses) ? courseData.courses : []);
        setStats(statsData?.stats || null);
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

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));

    if (submitError) {
      setSubmitError(null);
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateCourse(form);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setCreating(true);
    setSubmitError(null);
    setSuccessMessage('');

    try {
      const course = {
        title: form.title.trim(),
        description: form.description.trim(),
        imageLink: form.imageLink.trim(),
        price: Number(form.price),
      };

      await createCourse(course);
      setForm(initialForm);
      setFieldErrors({});
      setSuccessMessage(`“${course.title}” was added to the catalog.`);
      reload();
    } catch (requestError) {
      if (requestError?.status === 401) {
        auth.refresh();
      } else {
        setSubmitError(requestError);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className={styles.page}>
      <Container>
        <div className={styles.header}>
          <div>
            <Badge variant="primary">
              <ShieldIcon size={14} />
              Admin workspace
            </Badge>
            <h1 className={styles.title}>Manage the course catalog</h1>
            <p className={styles.description}>
              Review store activity, inspect every published course, and add new
              courses to the live catalog.
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button to="/courses" variant="secondary">
              View public catalog
            </Button>
          </div>
        </div>

        {status === 'error' ? (
          <Alert
            className={styles.loadError}
            variant="error"
            title="Admin data could not be loaded"
            action={
              <Button size="sm" variant="secondary" onClick={reload}>
                Try again
              </Button>
            }
          >
            {error?.message}
          </Alert>
        ) : null}

        <div className={styles.stats}>
          <Card className={styles.statCard}>
            <span className={styles.statIcon}>
              <LayersIcon size={21} />
            </span>
            <div>
              <p className={styles.statLabel}>Courses</p>
              <p className={styles.statValue}>
                {status === 'success' ? stats?.totalCourses ?? 0 : '—'}
              </p>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <span className={styles.statIcon}>
              <UserPlusIcon size={21} />
            </span>
            <div>
              <p className={styles.statLabel}>Students</p>
              <p className={styles.statValue}>
                {status === 'success' ? stats?.totalUsers ?? 0 : '—'}
              </p>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <span className={styles.statIcon}>
              <CheckCircleIcon size={21} />
            </span>
            <div>
              <p className={styles.statLabel}>Purchases</p>
              <p className={styles.statValue}>
                {status === 'success' ? stats?.totalPurchases ?? 0 : '—'}
              </p>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <span className={styles.statIcon}>
              <TagIcon size={21} />
            </span>
            <div>
              <p className={styles.statLabel}>Catalog value</p>
              <p className={styles.statValue}>
                {status === 'success'
                  ? formatPrice(stats?.totalCatalogValue ?? 0)
                  : '—'}
              </p>
            </div>
          </Card>
        </div>

        <div className={styles.layout}>
          <section className={styles.catalog} aria-labelledby="admin-catalog">
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.kicker}>Published courses</span>
                <h2 id="admin-catalog" className={styles.sectionTitle}>
                  Catalog
                </h2>
              </div>
              {status === 'success' ? (
                <p className={styles.count}>
                  {courses.length === 1
                    ? '1 course'
                    : `${courses.length} courses`}
                </p>
              ) : null}
            </div>

            {status === 'loading' ? (
              <div className={styles.state}>
                <Spinner size="lg" label="Loading admin data" />
                <p>Loading the catalog...</p>
              </div>
            ) : null}

            {status === 'success' && courses.length === 0 ? (
              <EmptyState
                icon={<BookOpenIcon size={26} />}
                title="No courses yet"
                description="Publish the first course with the form beside this list."
              />
            ) : null}

            {status === 'success' && courses.length > 0 ? (
              <div className={styles.courseList}>
                {courses.map((course) => (
                  <article key={course._id} className={styles.courseRow}>
                    <div className={styles.courseMedia}>
                      <CourseImage
                        src={course.imageLink}
                        title={course.title}
                      />
                    </div>
                    <div className={styles.courseBody}>
                      <h3 className={styles.courseTitle}>
                        {course.title || 'Untitled course'}
                      </h3>
                      <p className={styles.courseDescription}>
                        {course.description ||
                          'This course does not have a description yet.'}
                      </p>
                      <Link
                        to={`/courses/${course._id}`}
                        className={styles.courseLink}
                      >
                        View public page
                        <ArrowRightIcon size={16} />
                      </Link>
                    </div>
                    <p className={styles.coursePrice}>
                      {formatPrice(course.price)}
                    </p>
                  </article>
                ))}
              </div>
            ) : null}

            <p className={styles.note}>
              Editing and deleting courses are not exposed by the current API,
              so this workspace only publishes new courses.
            </p>
          </section>

          <aside className={styles.formPanel} aria-labelledby="new-course-title">
            <Card className={styles.formCard} variant="elevated">
              <span className={styles.formIcon}>
                <PlusIcon size={22} />
              </span>
              <span className={styles.kicker}>New course</span>
              <h2 id="new-course-title" className={styles.formTitle}>
                Publish a course
              </h2>
              <p className={styles.formText}>
                New courses appear in the public catalog and student purchase
                flows immediately.
              </p>

              {successMessage ? (
                <Alert variant="success" title="Course published">
                  {successMessage}
                </Alert>
              ) : null}

              {submitError ? (
                <Alert variant="error" title="Could not publish the course">
                  {submitError.message}
                </Alert>
              ) : null}

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <Input
                  label="Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  error={fieldErrors.title}
                  hint="A clear title shown on course cards."
                  disabled={creating}
                  required
                />

                <Input
                  label="Price (INR)"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={form.price}
                  onChange={handleChange}
                  error={fieldErrors.price}
                  disabled={creating}
                  required
                />

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="course-description">
                    Description
                  </label>
                  <textarea
                    id="course-description"
                    name="description"
                    className={styles.textarea}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="What will students learn?"
                    rows="4"
                    disabled={creating}
                  />
                </div>

                <Input
                  label="Image URL"
                  name="imageLink"
                  type="url"
                  value={form.imageLink}
                  onChange={handleChange}
                  hint="Optional. A cover image is generated when this is empty."
                  placeholder="https://example.com/course.jpg"
                  disabled={creating}
                />

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Spinner size="sm" label="Publishing course" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish course
                      <PlusIcon size={18} />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </aside>
        </div>
      </Container>
    </section>
  );
}
