import CourseCard from './CourseCard.jsx';
import styles from './CourseGrid.module.css';

export default function CourseGrid({ courses }) {
  return (
    <div className={styles.grid}>
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
}
