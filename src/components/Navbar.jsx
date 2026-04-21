import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CircleUser, Menu } from 'lucide-react';
import { supabase } from '../supabase/config';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const isHomePage = location.pathname === '/';
  const isPropertyDetails = location.pathname.startsWith('/property/');

  // Hide top navbar on mobile property details to avoid overlap with native floating header
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // The early return will be placed after all hooks to prevent React Hook rule violations
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const isSearchPage = location.pathname.startsWith('/search');
  const isProfilePage = location.pathname.startsWith('/profile');
  const isListPage = location.pathname.startsWith('/list-property');
  const isFavoritesPage = location.pathname.startsWith('/favorites');

  // Safe early return after all React Hooks have been declared
  if (isMobile && (isPropertyDetails || isSearchPage || isProfilePage || isListPage || isFavoritesPage)) return null;

  return (
    <nav className={`navbar ${(scrolled || !isHomePage) ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <Home size={24} color="white" />
          </div>
          <span className="logo-text">Rentor</span>
        </Link>
        
        <div className="navbar-links">
          <Link to="/search?category=homes" className="nav-link">Rent Homes</Link>
          <Link to="/search?category=rooms" className="nav-link">Rent Rooms</Link>
          <Link to="/list-property" className="nav-link">List Property</Link>
        </div>

        <div className="navbar-actions">
          {loading ? (
            <div className="nav-loading-placeholder"></div>
          ) : user ? (
            <div className="user-nav-item">
              <Link to="/profile" className="btn btn-outline sign-in-btn">
                <img 
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || user.email || 'User')}&background=random`} 
                  alt="Avatar" 
                  className="nav-avatar"
                  loading="lazy"
                  style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '8px' }}
                />
                <span>{(user.user_metadata?.full_name || user.email)?.split(' ')[0] || 'Account'}</span>
              </Link>
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline sign-in-btn">
              <CircleUser size={18} />
              <span>Sign In</span>
            </Link>
          )}
          <button className="menu-btn hide-desktop">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
