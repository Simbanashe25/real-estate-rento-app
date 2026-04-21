import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import Home from './pages/Home';
import PropertyDetails from './pages/PropertyDetails';
import UserProfile from './pages/UserProfile';
import SearchPage from './pages/SearchPage';
import ListPropertyPage from './pages/ListPropertyPage';
import AuthPage from './pages/AuthPage';
import ListerProfilePage from './pages/ListerProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import AboutUs from './pages/AboutUs';
import Careers from './pages/Careers';
import ContactSupport from './pages/ContactSupport';
import PrivacyPolicy from './pages/PrivacyPolicy';


function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/list-property" element={<ListPropertyPage />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/lister/:name" element={<ListerProfilePage />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/login" element={<AuthPage initialMode="login" />} />
            <Route path="/signup" element={<AuthPage initialMode="signup" />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/support" element={<ContactSupport />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </main>
        <Footer />
        <MobileNav />
      </div>
    </Router>
  );
}

export default App;
