import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Search, SlidersHorizontal, Map as MapIcon, List, X, ChevronDown, BedDouble, Bath, Square } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import SkeletonCard from '../components/SkeletonCard';
import { supabase } from '../supabase/config';
import SEO from '../components/SEO';
import './SearchPage.css';

const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;


const CATEGORY_MAP = {
  'residential': 'Residential',
  'homes': 'Residential',
  'rooms': 'Private Room',
  'commercial': 'Commercial',
  'industrial': 'Industrial',
  'land': 'Land',
  'agricultural': 'Agricultural',
  'all': 'All Types'
};

const CITY_COORDINATES = {
  'Harare': [-17.8248, 31.0530],
  'Bulawayo': [-20.1465, 28.5703],
  'Mutare': [-18.9727, 32.6695],
  'Gweru': [-19.4606, 29.8149],
  'Masvingo': [-20.0637, 30.8277],
  'Kwekwe': [-18.9163, 29.8053],
  'Chinhoyi': [-17.3592, 30.2039]
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
    
    // Map URL aliases to dropdown values
    if (categoryParam === 'homes') {
      setActiveCategory('residential');
    } else if (categoryParam === 'rooms') {
      setActiveCategory('Private Room');
    } else {
      setActiveCategory(categoryParam);
    }
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
      
      const matchCategory = categoryTarget === 'All Types' || (() => {
        const type = p.type;
        if (categoryTarget === 'Residential') 
          return ['House', 'Townhouse', 'Apartment', 'Cottage', 'Private Room', 'Shared Room', 'Student Housing'].includes(type);
        if (categoryTarget === 'Commercial') 
          return ['Office', 'Retail', 'Hotel'].includes(type);
        if (categoryTarget === 'Industrial') 
          return ['Warehouse', 'Workshop'].includes(type);
        if (categoryTarget === 'Land') 
          return ['Residential Stand', 'Commercial Stand'].includes(type);
        if (categoryTarget === 'Agricultural') 
          return ['Farm', 'Smallholding'].includes(type);
        return type === categoryTarget;
      })();
      
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

  const getCategoryTitle = () => {
    if (activeCategory === 'all') return 'Rentals';
    if (activeCategory === 'homes' || activeCategory === 'residential') return 'Residential Properties';
    if (activeCategory === 'rooms') return 'Private Rooms';

    const mapped = CATEGORY_MAP[activeCategory];
    if (mapped) return mapped.endsWith('s') ? mapped : mapped + 's';
    
    // For specific sub-categories like "House", "Apartment", just add 's' if needed
    if (activeCategory.endsWith('s')) return activeCategory;
    if (activeCategory === 'Property' || activeCategory === 'Student Housing') return activeCategory;
    return activeCategory + 's';
  };

  return (
    <div className={`search-page view-${viewMode}`}>
      <SEO 
        title={`${getCategoryTitle()}${locationStr ? ` in ${locationStr}` : ''}`} 
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
          <button type="submit" className="search-btn-icon"><Search size={18} /></button>
        </form>

        <div className="filters-group">
          <select 
            className="filter-select" 
            value={activeCategory} 
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="residential">All Residential</option>
            <optgroup label="Residential Types">
              <option value="House">House / Villa</option>
              <option value="Townhouse">Townhouse / Cluster</option>
              <option value="Apartment">Apartment / Flat</option>
              <option value="Cottage">Cottage / Backyard Unit</option>
              <option value="Private Room">Private Room</option>
              <option value="Student Housing">Student Housing</option>
            </optgroup>
            <option value="commercial">All Commercial</option>
            <optgroup label="Commercial Types">
              <option value="Office">Office Building</option>
              <option value="Retail">Shop / Retail Space</option>
              <option value="Hotel">Hotel / Lodge</option>
            </optgroup>
            <option value="industrial">All Industrial</option>
            <optgroup label="Industrial Types">
              <option value="Warehouse">Warehouse</option>
              <option value="Workshop">Workshop</option>
            </optgroup>
            <option value="land">All Land / Stands</option>
            <optgroup label="Land Types">
              <option value="Residential Stand">Residential Stand</option>
              <option value="Commercial Stand">Commercial Stand</option>
            </optgroup>
            <option value="agricultural">All Agricultural</option>
            <optgroup label="Agricultural Types">
              <option value="Farm">Farm / Agricultural Land</option>
              <option value="Smallholding">Smallholding</option>
            </optgroup>
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
              attributionControl={false}
            >
              <TileLayer
                url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`}
                attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
              />
              {results.map(property => {
                const lat = property.lat || CITY_COORDINATES[property.city]?.[0] || -17.8248;
                const lng = property.lng || CITY_COORDINATES[property.city]?.[1] || 31.0530;
                
                // Add a tiny random jitter so markers don't overlap perfectly if coordinates are missing
                const jitterLat = property.lat ? 0 : (Math.random() - 0.5) * 0.05;
                const jitterLng = property.lng ? 0 : (Math.random() - 0.5) * 0.05;

                return (
                  <Marker key={property.id} position={[lat + jitterLat, lng + jitterLng]}>
                    <Popup>
                      <div className="map-popup">
                        <img src={property.image} alt="prop" style={{width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px'}}/>
                        <strong>${property.price}/mo</strong>
                        <p>{property.beds}bds | {property.baths}ba</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
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
