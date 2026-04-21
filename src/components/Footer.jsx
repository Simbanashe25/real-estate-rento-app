import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isHomePage = location.pathname === '/';

  if (isMobile && !isHomePage) return null;

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div className="logo-icon">
              <Home size={20} color="white" />
            </div>
            <span className="logo-text">Rentor</span>
          </Link>
          <p className="footer-desc">
            Your destination for finding the perfect home or room to rent. We connect renters with the best properties.
          </p>
        </div>

        <div className="footer-links">
          <div className="link-group">
            <h4 className="link-title">Find Rent</h4>
            <ul>
              <li><Link to="/search">Search Homes</Link></li>
              <li><Link to="/search">Search Rooms</Link></li>
              <li><Link to="/search">Shared Flats</Link></li>
              <li><Link to="/search">Student Housing</Link></li>
            </ul>
          </div>

          <div className="link-group">
            <h4 className="link-title">Rentor</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/support">Contact Support</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Rentor. All rights reserved. Prices and availability subject to change.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
