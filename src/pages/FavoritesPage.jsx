import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ChevronLeft } from 'lucide-react';
import { supabase } from '../supabase/config';
import PropertyCard from '../components/PropertyCard';
import SkeletonCard from '../components/SkeletonCard';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login', { state: { from: '/favorites' } });
        return;
      }
      setUser(session.user);
      fetchFavorites(session.user.id);
    });
  }, [navigate]);

  const fetchFavorites = async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*, properties(*)')
        .eq('user_id', userId);

      if (error) throw error;

      if (data) {
        // Filter out any potential null properties if a favorite exists but property was deleted
        const properties = data
          .map(f => f.properties)
          .filter(p => p !== null);
        setSavedProperties(properties);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (propertyId, isSaved) => {
    if (!isSaved) {
      setSavedProperties(prev => prev.filter(p => p.id !== propertyId));
    }
  };

  return (
    <div className="favorites-page">
      {/* Native Mobile Header */}
      <div className="favorites-header-mobile">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1>Saved Properties</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="container favorites-content">
        <header className="favorites-header-desktop hide-mobile">
          <div className="title-row">
            <Heart size={32} className="heart-icon" fill="var(--primary)" color="var(--primary)" />
            <h1>Saved Properties</h1>
          </div>
          <p>{savedProperties.length} properties saved to your account</p>
        </header>

        {loading ? (
          <div className="favorites-grid">
            {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
          </div>
        ) : savedProperties.length > 0 ? (
          <div className="favorites-grid">
            {savedProperties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <Heart size={48} color="var(--text-muted)" />
            </div>
            <h2>No favorites yet</h2>
            <p>Start exploring properties and tap the heart icon to save them here.</p>
            <Link to="/search" className="btn btn-primary">Browse Properties</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
