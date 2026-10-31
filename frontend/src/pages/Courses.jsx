import { useMemo, useState } from 'react';
import Container from '../components/layout/Container.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import CourseGrid from '../components/course/CourseGrid.jsx';
import useCourses from '../hooks/useCourses.js';
import { LayersIcon, SearchIcon } from '../components/ui/Icons.jsx';
import styles from './Courses.module.css';

const sortOptions = [
  { value: 'default', label: 'Default order' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'title-asc', label: 'Title: A to Z' },
];

function getNumericPrice(course) {
  const price = Number(course?.price);
  return Number.isFinite(price) ? price : 0;
}

export default function Courses() {
  const { courses, status, error, reload, isLoading } = useCourses();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('default');

  const visibleCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = normalizedQuery
      ? courses.filter((course) => {
          const title = String(course?.title || '').toLowerCase();
          const description = String(course?.description || '').toLowerCase();

          return title.includes(normalizedQuery) || description.includes(normalizedQuery);
        })
      : courses;

    const sorted = [...filtered];

    if (sort === 'price-asc') {
      sorted.sort((first, second) => getNumericPrice(first) - getNumericPrice(second));
    } else if (sort === 'price-desc') {
      sorted.sort((first, second) => getNumericPrice(second) - getNumericPrice(first));
    } else if (sort === 'title-asc') {
      sorted.sort((first, second) =>
        String(first?.title || '').localeCompare(String(second?.title || '')),
      );
    }

    return sorted;
  }, [courses, query, sort]);

  const hasCourses = status === 'success' && courses.length > 0;
  const hasSearch = query.trim().length > 0;

  return (
    <>
      <section className={styles.header}>
        <Container>
          <span className={styles.kicker}>Course catalog</span>
          <h1 className={styles.title}>Browse every course</h1>
          <p className={styles.description}>
            Search the live catalog by title or description, then sort by price
            or name to find the right fit.
          </p>
        </Container>
      </section>

      <section className={styles.body} aria-labelledby="course-results-title">
        <Container>
          <h2 id="course-results-title" className="visuallyHidden">
            Course results
          </h2>

          <div className={styles.toolbar}>
            <div className={styles.searchField}>
              <SearchIcon size={19} className={styles.searchIcon} />
              <label htmlFor="course-search" className="visuallyHidden">
                Search courses
              </label>
              <input
                id="course-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title or description"
                autoComplete="off"
              />
            </div>

            <div className={styles.sortField}>
              <label htmlFor="course-sort">Sort by</label>
              <select
                id="course-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {status === 'success' ? (
            <p className={styles.resultMeta} aria-live="polite">
              {visibleCourses.length === 1
                ? '1 course found'
                : `${visibleCourses.length} courses found`}
              {hasSearch ? ` for “${query.trim()}”` : ''}
            </p>
          ) : null}

          {isLoading ? (
            <div className={styles.state}>
              <Spinner size="lg" label="Loading courses" />
              <p>Loading the catalog...</p>
            </div>
          ) : null}

          {status === 'error' ? (
            <Alert
              variant="error"
              title="We could not load the catalog"
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
              title="The catalog is empty"
              description="No courses have been added yet. Check back after courses are created through the backend."
            />
          ) : null}

          {hasCourses && visibleCourses.length === 0 ? (
            <EmptyState
              icon={<SearchIcon size={26} />}
              title="No matching courses"
              description={`Nothing in the catalog matches “${query.trim()}”. Try a different search term.`}
              action={
                <Button variant="secondary" onClick={() => setQuery('')}>
                  Clear search
                </Button>
              }
            />
          ) : null}

          {visibleCourses.length > 0 ? (
            <CourseGrid courses={visibleCourses} />
          ) : null}
        </Container>
      </section>
    </>
  );
}
