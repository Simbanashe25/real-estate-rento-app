import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, BedDouble, Bath, Square, MapPin, BadgeCheck } from 'lucide-react';
import { supabase } from '../supabase/config';
import { getPropertyDisplayTitle } from '../utils/propertyUtils';
import './PropertyCard.css';

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const { id, type, image, price, beds, baths, sqft, address, verified, available_from, suburb, city } = property;

  const displayTitle = getPropertyDisplayTitle(property);
  const locationLabel = suburb && city ? `${suburb}, ${city}` : suburb || city || address?.split(',')[0] || '';

  const getAvailabilityLabel = () => {
    if (!available_from) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const avail = new Date(available_from);
    avail.setHours(0, 0, 0, 0);
    if (avail <= today) return { label: 'Available Now', isNow: true };
    return { 
      label: `From ${avail.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      isNow: false
    };
  };

  const availability = getAvailabilityLabel();

  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkIfSaved(session.user.id);
      }
    });
  }, [id]);

  const checkIfSaved = async (userId) => {
    const { data } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('property_id', id)
      .maybeSingle();
    setIsSaved(!!data);
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isSaved) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('property_id', id);
        setIsSaved(false);
        if (onToggleFavorite) onToggleFavorite(id, false);
      } else {
        await supabase.from('favorites').insert([{ user_id: user.id, property_id: id }]);
        setIsSaved(true);
        if (onToggleFavorite) onToggleFavorite(id, true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  return (
    <div className={`property-card ${property.status === 'occupied' ? 'property-card-occupied' : ''}`} onClick={() => navigate(`/property/${id || 1}`)}>
      <div className="property-image-container">
        {property.status === 'occupied' && (
          <div className="card-occupied-overlay">Occupied</div>
        )}
        <img 
          src={image || "https://placehold.co/600x400/f3f4f6/666666?text=No+Photo"} 
          alt={address} 
          className="property-image" 
        />
        <div className="property-tags">
          <span className={`badge ${type?.toLowerCase().includes('room') ? 'badge-room' : 'badge-home'}`}>
            {type}
          </span>
          {verified && (
            <span className="badge badge-verified" title="Verified">
              <i className="fa-solid fa-circle-check" style={{ color: '#1da1f2', fontSize: '18px' }}></i>
            </span>
          )}
        </div>
        <button 
          className={`favorite-btn ${isSaved ? 'is-saved' : ''}`} 
          onClick={toggleFavorite}
        >
          <i className={`${isSaved ? 'fa-solid' : 'fa-regular'} fa-heart`} style={{ fontSize: '20px', color: isSaved ? 'var(--primary)' : 'inherit' }}></i>
        </button>
      </div>

      <div className="property-details">
        {locationLabel && (
          <p className="card-location-text">
            {locationLabel}
          </p>
        )}
        <h3 className="property-title-main">
          {displayTitle} in <strong>{suburb || city || 'Zimbabwe'}</strong>
        </h3>
        
        <div className="property-header">
          <div className="property-stats-mini">
            <div className="stat-item">
              <BedDouble size={14} strokeWidth={2} />
              <span>{beds}</span>
            </div>
            <div className="stat-item">
              <Bath size={14} strokeWidth={2} />
              <span>{baths}</span>
            </div>
            <div className="stat-item">
              <Square size={14} strokeWidth={2} />
              <span>{sqft}</span>
            </div>
          </div>
          <div className="property-price">
            <span className="price-value">${price.toLocaleString()}</span>
            <span className="price-period">/mo</span>
          </div>
        </div>

        {availability && (
          <p className={`availability-text ${availability.isNow ? 'avail-now-text' : 'avail-future-text'}`}>
            {availability.isNow 
              ? <><i className="fa-solid fa-circle" style={{ fontSize: '7px', marginRight: '5px' }}></i>Available Now</>
              : <><i className="fa-regular fa-calendar" style={{ fontSize: '11px', marginRight: '5px' }}></i>{availability.label}</>
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
