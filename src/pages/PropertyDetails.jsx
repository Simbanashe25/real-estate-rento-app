import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { BedDouble, Bath, Square, MapPin } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';
import { formatWhatsAppNumber } from '../utils/phoneUtils';
import SEO from '../components/SEO';
import PropertyCard from '../components/PropertyCard';
import SkeletonCard from '../components/SkeletonCard';
import 'leaflet/dist/leaflet.css';
import './PropertyDetails.css';

// Fix for default Leaflet icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [mapPosition, setMapPosition] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mobileSlideIndex, setMobileSlideIndex] = useState(1);
  const galleryRef = useRef(null);

  const navigate = useNavigate();

  const getAvailabilityStatus = () => {
    if (!property) return '';
    if (property.status === 'occupied') return 'Occupied';
    if (!property.available_from) return 'Available Now';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const availDate = new Date(property.available_from);
    availDate.setHours(0, 0, 0, 0);
    
    if (availDate <= today) return 'Available Now';
    return `Available ${availDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data?.manager_id) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('avatar_url, phone')
              .eq('id', data.manager_id)
              .single();
            
            if (profile) {
              if (profile.avatar_url) data.manager_avatar = profile.avatar_url;
              if (!data.phone) data.phone = profile.phone;
            }
          } catch (e) {
            console.error("Error fetching manager info:", e);
          }
        }

        setProperty(data);
        setLoading(false); // Unblock the UI as soon as we have the core property data

        // Handle Map Position (Geocoding) in background
        if (data.lat && data.lng) {
          setMapPosition([data.lat, data.lng]);
        } else {
          // Geocode using free OpenStreetMap Nominatim API
          const addressQuery = data.city ? `${data.address}, ${data.city}` : data.address;
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}`)
            .then(res => res.json())
            .then(geoData => {
              if (geoData && geoData.length > 0) {
                setMapPosition([parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)]);
              } else {
                setMapPosition([-17.8248, 31.0530]); // Harare Fallback
              }
            })
            .catch(() => setMapPosition([-17.8248, 31.0530]));
        }

        // Check if saved if user is logged in (in background)
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            supabase
              .from('favorites')
              .select('*')
              .eq('user_id', session.user.id)
              .eq('property_id', id)
              .maybeSingle()
              .then(({ data: favorite }) => {
                setIsSaved(!!favorite);
              });
          }
        });

      } catch (error) {
        console.error("Error fetching property:", error);
        setLoading(false); // Ensure loading is cleared on error
      }
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    const fetchSimilar = async () => {
      if (!property?.type) return;
      setSimilarLoading(true);
      try {
        const { data } = await supabase
          .from('properties')
          .select('*')
          .eq('type', property.type)
          .neq('id', id)
          .neq('status', 'occupied')
          .limit(8);
        setSimilarProperties(data || []);
      } catch (error) {
        console.error("Error fetching similar properties:", error);
      } finally {
        setSimilarLoading(false);
      }
    };
    
    if (property) fetchSimilar();
  }, [property, id]);

  const toggleSave = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/property/${id}` } });
      return;
    }

    setSavingLoading(true);
    try {
      if (isSaved) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', id);
        if (!error) setIsSaved(false);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, property_id: id }]);
        if (!error) setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    } finally {
      setSavingLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''; // cleanup on unmount
    };
  }, []);

  if (loading) {
    return (
      <div className="property-details-page container" style={{paddingTop: '150px', textAlign: 'center'}}>
        <SEO title="Loading Property..." />
        <i className="fa-solid fa-spinner fa-spin" style={{fontSize: '48px', margin: '0 auto', color: 'var(--primary)'}}></i>
        <p style={{marginTop: '1rem'}}>Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="property-details-page container" style={{paddingTop: '150px', textAlign: 'center'}}>
        <SEO title="Property Not Found" />
        <h2>Property not found</h2>
        <Link to="/" className="btn btn-primary mt-4">Return Home</Link>
      </div>
    );
  }

  const baseTitle = property.title || `${property.type || 'Home'} in ${property.city || property.address || 'Zimbabwe'}`;
  const desktopTitle = baseTitle + (property.price ? ` - $${property.price}/mo` : '');
  const displayAddress = 
    property.suburb && property.city 
      ? `${property.suburb}, ${property.city}` 
      : property.suburb || property.city || property.address;
  const displayImages = property.all_images && property.all_images.length > 0 
    ? property.all_images 
    : (property.image ? [property.image] : ["https://placehold.co/1200x800/f3f4f6/666666?text=No+Photos+Available"]);
    
  const mainImg = displayImages[0];
  const position = [property.lat || -17.8248, property.lng || 31.0530];

  const openGallery = (index) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    document.body.style.overflow = '';
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleMobileScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width) + 1;
      setMobileSlideIndex(newIndex);
    }
  };

  const scrollToImage = (index) => {
    if (galleryRef.current) {
      const width = galleryRef.current.clientWidth;
      galleryRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="property-details-page">
      <SEO 
        title={desktopTitle}
        description={`Rent this ${property.category || 'property'} in ${property.city || property.address || 'Zimbabwe'}. ${property.description?.substring(0, 150) || ''}...`}
        ogImage={displayImages[0]}
      />
      
      {/* Mobile Floating Header */}
      <div className="mobile-app-header">
        <button className="mobile-back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="mobile-header-actions">
          <button className="mobile-action-btn" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
          }}>
            <i className="fa-solid fa-share-nodes"></i>
          </button>
          <button className="mobile-action-btn" onClick={toggleSave}>
            <i className={`fa-${isSaved ? 'solid' : 'regular'} fa-heart`} style={{ color: isSaved ? 'var(--primary)' : 'white' }}></i>
          </button>
        </div>
      </div>

      <div className="gallery-wrapper-mobile-full">
        <div 
          ref={galleryRef}
          className={`gallery-grid gallery-count-${Math.min(displayImages.length, 5)}`} 
          onScroll={handleMobileScroll}
        >
          {displayImages.slice(0, 5).map((img, idx) => (
            <div key={idx} className={`gallery-item item-${idx}`} onClick={() => openGallery(idx)} style={{ cursor: 'pointer' }}>
              <img src={img} alt={`Property ${idx}`} />
            </div>
          ))}
          <button className="show-all-btn" onClick={() => openGallery(0)}>
            <i className="fa-solid fa-images"></i> Show all photos
          </button>
        </div>

        {/* Mobile Gallery Counter */}
        <div className="mobile-gallery-counter show-mobile">
          {mobileSlideIndex} / {displayImages.length}
        </div>

      </div>

      {/* Mobile Thumbnail Strip */}
      <div className="mobile-thumbnail-strip show-mobile">
        {displayImages.map((img, idx) => (
          <div 
            key={`thumb-${idx}`} 
            className={`mobile-thumbnail-item ${mobileSlideIndex === idx + 1 ? 'active' : ''}`}
            onClick={() => scrollToImage(idx)}
          >
            <img src={img} alt={`Thumb ${idx}`} />
          </div>
        ))}
      </div>

      <div className="container main-content-wrapper">
        <div className="property-header-row hide-mobile">
          <div className="title-block">
            <h1 className="title">{desktopTitle}</h1>
          </div>
          <div className="action-block">
            <button className="btn-text" onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }}><i className="fa-solid fa-share-nodes"></i> Share</button>
            <button className="btn-text" onClick={toggleSave}>
              <i className={`fa-${isSaved ? 'solid' : 'regular'} fa-heart`} style={{ color: isSaved ? 'var(--primary)' : 'inherit' }}></i> {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <div className="mobile-title-section show-mobile">
          <h1 className="mobile-title">{baseTitle}</h1>
        </div>

        <div className="property-subheader">
          <p className="address">{displayAddress}</p>
          <div className="badges">
            <span className="badge badge-home">{property.type}</span>
            {property.verified && (
              <span className="badge badge-verified">
                <i className="fa-solid fa-circle-check" style={{ color: '#1da1f2', marginRight: '6px' }}></i> Verified
              </span>
            )}
            {property.status === 'occupied' && (
              <span className="badge badge-occupied" style={{ backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
                <i className="fa-solid fa-ban" style={{ marginRight: '6px' }}></i> Occupied
              </span>
            )}
            {property.available_from && property.status !== 'occupied' && (() => {
              const today = new Date(); today.setHours(0,0,0,0);
              const avail = new Date(property.available_from); avail.setHours(0,0,0,0);
              const isNow = avail <= today;
              return (
                <span className={`badge ${isNow ? 'badge-avail-now' : 'badge-avail-future'}`}>
                  {isNow
                    ? <><i className="fa-solid fa-circle" style={{ fontSize: '8px', marginRight: '5px' }}></i>Available Now</>
                    : <><i className="fa-regular fa-calendar" style={{ marginRight: '5px' }}></i>From {avail.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                  }
                </span>
              );
            })()}
          </div>
        </div>

        <div className="content-grid border-top">
          <div className="main-content">
            <div className="property-stats-large">
              <div className="stat">
                <BedDouble size={24} strokeWidth={1.5} />
                <span><strong>{property.beds || 0}</strong> Beds</span>
              </div>
              <div className="stat">
                <Bath size={24} strokeWidth={1.5} />
                <span><strong>{property.baths || 0}</strong> Baths</span>
              </div>
              <div className="stat">
                <Square size={24} strokeWidth={1.5} />
                <span><strong>{property.sqft || '—'}</strong> sqft</span>
              </div>
            </div>


            <section className="features-section">
              <h3>Features & Amenities</h3>
              <ul className="features-list">
                {(property.features || property.amenities || []).map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </section>

            <section className="map-section">
              <h3>Location</h3>
              <div className="map-container">
                {mapPosition ? (
                  <div className="map-inner">
                    <MapContainer center={mapPosition} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%", borderRadius: "12px", zIndex: 1 }}>
                      <TileLayer
                        url={import.meta.env.VITE_MAPBOX_TOKEN && import.meta.env.VITE_MAPBOX_TOKEN !== 'your_mapbox_access_token_here'
                          ? `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
                          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                        attribution={import.meta.env.VITE_MAPBOX_TOKEN && import.meta.env.VITE_MAPBOX_TOKEN !== 'your_mapbox_access_token_here'
                          ? '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
                      />
                      <Marker position={mapPosition}>
                        <Popup>{displayAddress}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                ) : (
                  <div className="map-inner" style={{ backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px" }}>
                    Loading Map...
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="sidebar">
            <div className="contact-card">
              <h3>Contact Manager</h3>
              <div className="manager-info">
                <img src={property.manager_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(property.manager_name || 'Admin')}&background=random`} alt="Manager" className="manager-avatar" loading="lazy" />
                <div>
                  <Link to={`/lister/${encodeURIComponent(property.manager_name || 'Rentor Admin')}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <strong>{property.manager_name || 'Rentor Admin'}</strong>
                  </Link>
                  <p>Verified Partner</p>
                  {property.phone && (
                    <a href={`tel:${property.phone}`} className="manager-phone-link">
                      {property.phone}
                    </a>
                  )}
                </div>
              </div>
                <div className="contact-actions hide-mobile" style={{marginTop: '1.5rem', width: '100%'}}>
                  <a 
                    href={`https://wa.me/${formatWhatsAppNumber(property.phone)}?text=${encodeURIComponent(`Hi, I'm interested in your property: ${property.title} ($${property.price.toLocaleString()}/mo). Is it still available?`)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary" 
                    style={{width: '100%', borderRadius: 'var(--radius-full)', justifyContent: 'center', backgroundColor: '#25D366', color: 'white', border: 'none'}}
                  >
                    WhatsApp Manager
                  </a>
                </div>
            </div>
          </div>
        </div>
        
        {/* Similar Properties Section */}
        {(similarLoading || similarProperties.length > 0) && (
          <div className="similar-properties-section">
            <div className="container">
              <h2 className="section-title">Similar {property.type}s</h2>
              <div className="similar-carousel-wrapper">
                <div className="similar-grid">
                  {similarLoading ? (
                    [1, 2, 3, 4].map(i => (
                      <div key={`skel-sim-${i}`} className="similar-card-item">
                        <SkeletonCard />
                      </div>
                    ))
                  ) : (
                    similarProperties.map(prop => (
                      <div key={prop.id} className="similar-card-item">
                        <PropertyCard property={prop} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>      {/* Mobile Sticky CTA Footer */}
      <div className="mobile-sticky-footer">
        <div className="footer-price-info">
          <div className="price-row">
            <span className="price-amt">${property.price.toLocaleString()}</span>
            <span className="price-unit">/mo</span>
          </div>
          <div className={`availability-tag ${property.status === 'occupied' ? 'occupied' : ''}`}>
            {getAvailabilityStatus()}
          </div>
        </div>
        <a 
          href={`https://wa.me/${formatWhatsAppNumber(property.phone)}?text=${encodeURIComponent(`Hi, I'm interested in your property: ${property.title} ($${property.price.toLocaleString()}/mo). Is it still available?`)}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary mobile-cta-btn" 
          style={{backgroundColor: '#25D366', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px'}}
        >
          <i className="fa-brands fa-whatsapp" style={{ fontSize: '20px' }}></i> WhatsApp
        </a>
      </div>

      {/* Lightbox Modal */}
      {isGalleryOpen && (
        <div className="lightbox-modal" onClick={closeGallery}>
          <button className="lightbox-close" onClick={closeGallery}>
            <i className="fa-solid fa-xmark"></i>
          </button>
          
          <button className="lightbox-nav prev" onClick={prevImage}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={displayImages[currentImageIndex]} alt={`Gallery view ${currentImageIndex + 1}`} />
            <div className="lightbox-counter">
              {currentImageIndex + 1} / {displayImages.length}
            </div>
          </div>
          
          <button className="lightbox-nav next" onClick={nextImage}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884h.001c2.64 0 5.122 1.029 6.989 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.63 1.432h.006c6.551 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default PropertyDetails;
