import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  const [activeTab, setActiveTab] = useState('homes');
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const navigate = useNavigate();

  const placeholderPhrases = [
    "Search 'Avondale'...",
    "Search 'Borrowdale'...",
    "Search 'Harare'...",
    "Search 'Bulawayo'...",
    "Search 'Apartments'...",
    "Search 'Guest Houses'...",
    "Search 'Shared Rooms'..."
  ];

  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    const type = () => {
      const currentPhrase = placeholderPhrases[phraseIndex];
      
      if (isDeleting) {
        setPlaceholder(currentPhrase.substring(0, charIndex - 1));
        charIndex--;
        typeSpeed = 50;
      } else {
        setPlaceholder(currentPhrase.substring(0, charIndex + 1));
        charIndex++;
        typeSpeed = 100;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typeSpeed = 2000; // Pause at the end
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % placeholderPhrases.length;
        typeSpeed = 500;
      }

      setTimeout(type, typeSpeed);
    };

    const timeoutId = setTimeout(type, typeSpeed);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    params.append('category', activeTab);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="hero">
      <div className="hero-background" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000")' }}>
        <div className="hero-overlay"></div>
      </div>
      
      <div className="container hero-content">
        <div className="hero-text-wrapper animate-fade-in">
          <h1 className="hero-title">Find your perfect rental.</h1>
          <p className="hero-subtitle">
            Discover exactly what you're looking for, whether it's an entire home or a cozy room.
          </p>
        </div>

        <div className="search-widget animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="search-tabs">
            <button 
              className={`search-tab ${activeTab === 'homes' ? 'active' : ''}`}
              onClick={() => setActiveTab('homes')}
            >
              Entire Homes
            </button>
            <button 
              className={`search-tab ${activeTab === 'rooms' ? 'active' : ''}`}
              onClick={() => setActiveTab('rooms')}
            >
              Rooms
            </button>
            <button 
              className={`search-tab ${activeTab === 'shared' ? 'active' : ''}`}
              onClick={() => setActiveTab('shared')}
            >
              Shared Flats
            </button>
            <button 
              className={`search-tab ${activeTab === 'student' ? 'active' : ''}`}
              onClick={() => setActiveTab('student')}
            >
              Student Housing
            </button>
          </div>

          <form className="search-bar-container" onSubmit={handleSearch}>
            <div className="search-input-group">
              <i className="fa-solid fa-location-dot" style={{ color: '#717171', fontSize: '18px', marginRight: '8px', marginLeft: '4px' }}></i>
              <input 
                type="text" 
                placeholder={placeholder} 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary search-submit">
              <Search size={20} className="hide-desktop" />
              <Search size={20} className="hide-mobile" />
              <span className="hide-mobile">Search</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
