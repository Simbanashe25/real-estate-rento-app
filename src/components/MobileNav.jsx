import { Link, useLocation } from 'react-router-dom';
import './MobileNav.css';

const MobileNav = () => {
  const location = useLocation();
  
  // Hide mobile nav on property details page to feel more native
  if (location.pathname.startsWith('/property/')) return null;

  return (
    <nav className="mobile-nav-bar">
      <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <i className="fa-solid fa-house" style={{ fontSize: '28px' }}></i>
        <span>Home</span>
      </Link>
      <Link to="/search?category=homes" className={`mobile-nav-item ${location.search.includes('category=homes') ? 'active' : ''}`}>
        <i className="fa-solid fa-compass" style={{ fontSize: '28px' }}></i>
        <span>Explore</span>
      </Link>
      <Link to="/list-property" className={`mobile-nav-item ${location.pathname === '/list-property' ? 'active' : ''}`}>
        <i className="fa-solid fa-circle-plus" style={{ fontSize: '28px', color: 'var(--primary)' }}></i>
        <span>List</span>
      </Link>
      <Link to="/favorites" className={`mobile-nav-item ${location.pathname === '/favorites' ? 'active' : ''}`}>
        <i className="fa-solid fa-face-grin-hearts" style={{ fontSize: '28px' }}></i>
        <span>Saved</span>
      </Link>
      <Link to="/profile" className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
        <i className="fa-duotone fa-solid fa-user" style={{ fontSize: '28px' }}></i>
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default MobileNav;
