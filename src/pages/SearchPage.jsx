import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import PropertyCard from '../components/PropertyCard';
import SkeletonCard from '../components/SkeletonCard';
import { SlidersHorizontal, Map as MapIcon, List, Search as SearchIcon } from 'lucide-react';
import { supabase } from '../supabase/config';
import SEO from '../components/SEO';
import 'leaflet/dist/leaflet.css';
import './SearchPage.css';

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

const CATEGORY_MAP = {
  'homes': 'Entire Home',
  'rooms': 'Private Room',
  'shared': 'Shared Room',
  'student': 'Student Housing',
  'all': 'All Types'
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [viewMode, setViewMode] = useState(window.innerWidth <= 768 ? 'list' : 'split');
  const [locationStr, setLocationStr] = useState(queryParam);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [priceRange, setPriceRange] = useState('Any Price');
  const [minBeds, setMinBeds] = useState('Beds');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && viewMode === 'split') {
        setViewMode('list');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .neq('status', 'occupied')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setAllResults(data || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Sync state with URL params when they change (e.g. user searches again from Home)
  useEffect(() => {
    setLocationStr(queryParam);
    setActiveCategory(categoryParam);
  }, [queryParam, categoryParam]);

  // Combined filtering
  useEffect(() => {
    const term = locationStr.trim().toLowerCase();
    const categoryTarget = CATEGORY_MAP[activeCategory] || activeCategory;

    const filtered = allResults.filter(p => {
      const matchLocation = !term || 
        (p.address || '').toLowerCase().includes(term) ||
        (p.city || '').toLowerCase().includes(term) ||
        (p.province || '').toLowerCase().includes(term);
      
      const matchCategory = categoryTarget === 'All Types' || p.type === categoryTarget;
      
      let matchPrice = true;
      const price = Number(p.price);
      if (priceRange === '$0 - $500') matchPrice = price <= 500;
      else if (priceRange === '$500 - $1,000') matchPrice = price > 500 && price <= 1000;
      else if (priceRange === '$1,000 - $2,000') matchPrice = price > 1000 && price <= 2000;
      else if (priceRange === '$2,000+') matchPrice = price > 2000;

      let matchBeds = true;
      const beds = Number(p.beds);
      if (minBeds === '1+ Beds') matchBeds = beds >= 1;
      else if (minBeds === '2+ Beds') matchBeds = beds >= 2;
      else if (minBeds === '3+ Beds') matchBeds = beds >= 3;
      else if (minBeds === '4+ Beds') matchBeds = beds >= 4;
      
      return matchLocation && matchCategory && matchPrice && matchBeds;
    });

    setResults(filtered);
  }, [locationStr, activeCategory, allResults, priceRange, minBeds]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (locationStr.trim()) params.append('q', locationStr.trim());
    params.append('category', activeCategory);
    setSearchParams(params);
  };

  const toggleMobileView = () => {
    setViewMode(prev => prev === 'list' ? 'map' : 'list');
  };

  return (
    <div className={`search-page view-${viewMode}`}>
      <SEO 
        title={`${activeCategory !== 'all' ? CATEGORY_MAP[activeCategory] + 's' : 'Rentals'}${locationStr ? ` in ${locationStr}` : ''}`} 
        description={`Browse ${results.length} available rentals in ${locationStr || 'Zimbabwe'}. Find homes, rooms and apartments.`}
      />
      <div className="search-filters-bar">
        <form className="search-input-wrapper" onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            value={locationStr} 
            onChange={(e) => setLocationStr(e.target.value)}
            placeholder="Where to?"
            className="search-location-input"
          />
          <button type="submit" className="search-btn-icon"><SearchIcon size={18} /></button>
        </form>

        <div className="filters-group">
          <select 
            className="filter-select" 
            value={activeCategory} 
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="homes">Entire Homes</option>
            <option value="rooms">Private Rooms</option>
            <option value="shared">Shared Rooms</option>
            <option value="student">Student Housing</option>
          </select>
          <select 
            className="filter-select" 
            value={priceRange} 
            onChange={(e) => setPriceRange(e.target.value)}
          >
            <option>Any Price</option>
            <option>$0 - $500</option>
            <option>$500 - $1,000</option>
            <option>$1,000 - $2,000</option>
            <option>$2,000+</option>
          </select>
          <select 
            className="filter-select" 
            value={minBeds} 
            onChange={(e) => setMinBeds(e.target.value)}
          >
            <option>Beds</option>
            <option>1+ Beds</option>
            <option>2+ Beds</option>
            <option>3+ Beds</option>
            <option>4+ Beds</option>
          </select>
          <button className="btn btn-outline filter-more-btn">
            <SlidersHorizontal size={18} /> Filters
          </button>
        </div>

        <div className="view-toggle">
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <List size={20} />
          </button>
          <button 
            className={`view-btn disable-mobile ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => setViewMode('split')}
            title="Split View"
          >
            <SlidersHorizontal size={20} style={{transform: "rotate(90deg)"}} />
          </button>
          <button 
            className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
            title="Map View"
          >
            <MapIcon size={20} />
          </button>
        </div>
      </div>

      <div className={`search-content view-${viewMode}`}>
        {(viewMode === 'split' || viewMode === 'list') && (
          <div className="search-results-pane">
            <h1 className="results-title">
              {isLoading ? 'Finding rentals...' : `${results.length} Rental${results.length !== 1 ? 's' : ''}${locationStr ? ` in ${locationStr}` : ''}`}
            </h1>
            <div className={`results-grid ${viewMode === 'list' ? 'list-large' : ''}`}>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={`skel-search-${i}`} />)
                : results.length > 0 ? (
                    results.map(property => (
                      <PropertyCard key={property.id} property={property} />
                    ))
                  ) : (
                    <div className="empty-state-search">
                      <p>No properties found matching your criteria.</p>
                    </div>
                  )
              }
            </div>
          </div>
        )}

        {(viewMode === 'split' || viewMode === 'map') && (
          <div className="search-map-pane">
            <MapContainer 
              center={results.length > 0 ? [results[0].lat || -17.8248, results[0].lng || 31.0530] : [-17.8248, 31.0530]} 
              zoom={12} 
              scrollWheelZoom={true} 
              style={{ height: "100%", width: "100%", zIndex: 1 }}
            >
              <TileLayer
                url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`}
                attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {results.filter(p => p.lat && p.lng).map(property => (
                <Marker key={property.id} position={[property.lat, property.lng]}>
                  <Popup>
                    <div className="map-popup">
                      <img src={property.image} alt="prop" style={{width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px'}}/>
                      <strong>${property.price}/mo</strong>
                      <p>{property.beds}bds | {property.baths}ba</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      <button className="floating-view-toggle" onClick={toggleMobileView}>
        {viewMode === 'list' ? (
          <><MapIcon size={20} /> Map</>
        ) : (
          <><List size={20} /> List</>
        )}
      </button>
    </div>
  );
};

export default SearchPage;
