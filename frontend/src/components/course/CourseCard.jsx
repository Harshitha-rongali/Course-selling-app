import { Link } from 'react-router-dom';
import CourseImage from './CourseImage.jsx';
import { ArrowRightIcon } from '../ui/Icons.jsx';
import { formatPrice } from '../../utils/format.js';
import styles from './CourseCard.module.css';

export default function CourseCard({ course }) {
  const courseId = course?._id;
  const title = course?.title || 'Untitled course';
  const description =
    course?.description || 'This course does not have a description yet.';

  return (
    <article className={styles.card}>
      <Link to={`/courses/${courseId}`} className={styles.link}>
        <div className={styles.media}>
          <CourseImage src={course?.imageLink} title={title} />
          <span className={styles.price}>{formatPrice(course?.price)}</span>
        </div>
        <div className={styles.body}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
          <span className={styles.footer}>
            <span>View course</span>
            <ArrowRightIcon size={18} />
          </span>
        </div>
      </Link>
    </article>
  );
}
