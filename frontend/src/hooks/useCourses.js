import { useCallback, useEffect, useState } from 'react';
import { getCourses } from '../api/courses.js';

export default function useCourses() {
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    setStatus('loading');
    setError(null);

    getCourses({ signal: controller.signal })
      .then((data) => {
        if (!isActive) {
          return;
        }

        setCourses(Array.isArray(data?.courses) ? data.courses : []);
        setStatus('success');
      })
      .catch((requestError) => {
        if (!isActive || requestError.name === 'AbortError') {
          return;
        }

        setError(requestError);
        setStatus('error');
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return {
    courses,
    status,
    error,
    reload,
    isLoading: status === 'loading',
  };
}
