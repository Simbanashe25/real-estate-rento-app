import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset scroll immediately
    window.scrollTo(0, 0);
    
    // Fallback for slower rendering pages or browser scroll restoration
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
    
    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
