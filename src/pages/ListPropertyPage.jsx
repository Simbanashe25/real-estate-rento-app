import { useState, useEffect } from 'react';
import { Home, Upload, DollarSign, CheckCircle, X, Loader2 } from 'lucide-react';
import './ListPropertyPage.css';
import { supabase } from '../supabase/config';
import { compressImage } from '../utils/imageUtils';
import { useNavigate } from 'react-router-dom';

const ListPropertyPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({}); // { fileId: working/done }
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const ZIM_LOCATIONS = {
    'Harare': [
      'Adelaide Park', 'Alexandra Park', 'Amby', 'Arcadia', 'Ardbennie', 'Ashdown Park', 'Aspindale', 'Aspindale Park', 
      'Athlone', 'Avenues', 'Avondale', 'Avonhurst', 'Avonlea', 'Ballantyne Park', 'Belvedere', 'Bloomingdale', 
      'Bluffhill', 'Borrowdale', 'Borrowdale Brooke', 'Borrowdale West', 'Braeside', 'Brookview', 'Budiriro', 
      'Carrick Creagh', 'Chadcombe', 'Chisipite', 'Chishawasha Hills', 'City Centre', 'Cold Comfort', 
      'Colne Valley', 'Cranborne', 'Crowborough', 'Crowhill', 'Dawnview', 'Derbyshire', 'Diamond Park', 
      'Donnybrook', 'Eastlea', 'Emerald Hill', 'Epworth', 'Fairview', 'Fidelity Southview', 'Gletwyn', 
      'Glen Lorne', 'Glen Norah', 'Glen View', 'Goodhope', 'Graniteside', 'Greendale', 'Groombridge', 
      'Gunhill', 'Harare North', 'Harare South', 'Hatfield', 'Haydon Park', 'Helensvale', 'Highfield', 
      'Highlands', 'Hillside', 'Hogerty Hill', 'Houghton Park', 'Kambanji', 'Kambuzuma', 'Kirkman Gardens', 
      'Kuwadzana', 'Lochinvar', 'Logan Park', 'Mabelreign', 'Mabvuku', 'Madokero', 'Mainway Meadows', 
      'Mandara', 'Manresa', 'Marimba Park', 'Marlborough', 'Meyrick Park', 'Milton Park', 'Monavale', 
      'Mount Hampden', 'Mount Pleasant', 'Mount Pleasant Heights', 'Mbare', 'Msasa', 'Msasa Park', 
      'Mufakose', 'Newlands', 'Northwood', 'Orange Grove', 'Parktown', 'Philadelphia', 'Pomona', 
      'Prospect', 'Queensdale', 'Ridgeview', 'Rolf Valley', 'Ruwa', 'Rydale Ridge', 'Sandton', 
      'Savannah Park', 'Shawasha Hills', 'Sherwood', 'Snake Park', 'Southerton', 'Southlea Park', 
      'St Martins', 'Stoneridge', 'Strathaven', 'Sunningdale', 'Sunridge', 'Tafara', 'The Grange', 
      'Tynwald', 'Vainona', 'Warren Park', 'Waterfalls', 'Westgate', 'Westwood', 'White Cliff', 
      'Willowvale', 'Workington', 'Zimre Park'
    ],
    'Bulawayo': [
      'Ascot', 'Barham Green', 'Belmont', 'Bradfield', 'Burnside', 'Cowdray Park', 'Douglasdale', 
      'Emganwini', 'Entumbane', 'Famona', 'Four Winds', 'Gwabalanda', 'Hillside', 'Ilanda', 
      'Kelvin', 'Khumalo', 'Lakeside', 'Lobengula', 'Magwegwe', 'Makokoba', 'Malindela', 
      'Matsheumhlope', 'Montrose', 'Morningside', 'Newton West', 'Nketa', 'Nkulumane', 
      'North End', 'Northvale', 'Paddonhurst', 'Parklands', 'Pumula', 'Queens Park', 
      'Riverside', 'Romney Park', 'Selbourne Park', 'Sizinda', 'Southworld', 'Steeldale', 
      'Suburbs', 'Thorngrove', 'Waterford', 'West Somerton', 'Woodlands'
    ],
    'Mutare': [
      'Bordervale', 'Chikanga', 'Dangamvura', 'Darlington', 'Fairbridge Park', 'Greenside', 
      'Morningside', 'Murambi', 'Palmerston', 'Sakubva', 'Yeovil'
    ],
    'Gweru': ['Daylesford', 'Houghton Park', 'Lundi Park', 'Mkoba', 'Riverside', 'Senga'],
    'Masvingo': ['Target Kopje', 'Rhodene', 'Mucheke', 'Victoria Range'],
    'Kwekwe': ['Msasa Park', 'Newton', 'Rutendo', 'Redcliff'],
    'Chinhoyi': ['Cold Stream', 'Mzari', 'Orange Grove']
  };

  const CITY_TO_PROVINCE = {
    'Harare': 'Harare Province',
    'Bulawayo': 'Bulawayo Province',
    'Mutare': 'Manicaland',
    'Gweru': 'Midlands',
    'Masvingo': 'Masvingo Province',
    'Kwekwe': 'Midlands',
    'Chinhoyi': 'Mashonaland West'
  };

  const [formData, setFormData] = useState({
    title: '',
    type: 'House',
    price: '',
    city: 'Harare',
    suburb: 'Avondale',
    beds: '1',
    baths: '1',
    sqft: '',
    available_from: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login', { state: { from: '/list-property' } });
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate('/login', { state: { from: '/list-property' } });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'city') {
      // Auto-select first suburb of the new city
      setFormData(prev => ({ 
        ...prev, 
        city: value,
        suburb: ZIM_LOCATIONS[value][0] 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const GROUPED_AMENITIES = {
    'Interior Features': [
      'Built-in cupboards (BICs)', 'Fitted kitchen', 'Tiled floors', 'Ceiling finishes', 
      'Main en-suite', 'Walk-in closet', 'Air conditioning', 'Modern Kitchen', 'Washer/Dryer'
    ],
    'Energy & Water': [
      'Borehole 💧', 'Water tank', 'Backup Power (Solar/Inverter)', 'Backup Generator', 
      'Solar Geyser', 'Electric Geyser', 'ZESA Connection', 'Municipal Water', 'Well'
    ],
    'Security': [
      'Durawall & Gated', 'Electric Fence', 'Electric Gate', 'CCTV Cameras', 
      'Alarm System', '24/7 Security Guard', 'Boom-gated Community', 'Complex Security'
    ],
    'Exterior & Leisure': [
      'Garden / Yard', 'Swimming pool', 'Paved driveway', 'Carport / Garage', 
      'Braai Area', 'Balcony', 'Private Garden', 'Pet Friendly'
    ],
    'Connectivity': [
      'WiFi / Fibre', 'Internet Connectivity'
    ],
    'Specific to Apartments': [
      'Elevator / Lift', 'Parking Space', 'Complex Security'
    ],
    'Specific to Commercial': [
      'Office partitions', 'Reception area', 'Parking bays', 'Backup generator'
    ],
    'Specific to Lodges/Hotels': [
      'Reception desk', 'Restaurant / Bar', 'Conference rooms', 'Laundry services', 'Room service'
    ]
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity) 
        : [...prev, amenity]
    );
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(async (file) => {
      const fileId = Math.random().toString(36).substr(2, 9);
      setImages(prev => [...prev, { id: fileId, url: URL.createObjectURL(file), isPlaceholder: true }]);
      setUploadProgress(prev => ({ ...prev, [fileId]: 50 })); // Mock progress

      try {
        const compressedBlob = await compressImage(file);
        const fileName = `${Date.now()}_${fileId}.${file.name.split('.').pop()}`;
        
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(`properties/${fileName}`, compressedBlob, {
            contentType: compressedBlob.type
          });

        if (error) {
          console.error('Supabase Storage Error:', error);
          throw new Error(error.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(data.path);

        setImages(prev => prev.map(img =>
          img.id === fileId ? { ...img, url: publicUrl, isPlaceholder: false } : img
        ));
        setUploadProgress(prev => { const n = { ...prev }; delete n[fileId]; return n; });
      } catch (err) {
        console.error('Upload process error:', err);
        alert(`Upload failed: ${err.message || 'Unknown error'}`);
        setImages(prev => prev.filter(img => img.id !== fileId));
        setUploadProgress(prev => { const n = { ...prev }; delete n[fileId]; return n; });
      }
    });
  };

  const removeImage = (id) => {
    setImages(images.filter(img => img.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length < 4) {
      alert('Please upload at least 4 images of your property to provide a better viewing experience.');
      return;
    }
    
    if (Object.keys(uploadProgress).length > 0) {
      alert('Please wait for images to finish uploading.');
      return;
    }

    try {
      setIsFinalizing(true);
      
      // Geocode the location to get coordinates for the map
      let lat = null;
      let lng = null;
      try {
        const query = encodeURIComponent(`${formData.suburb}, ${formData.city}, Zimbabwe`);
        const geoRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&limit=1`);
        const geoData = await geoRes.json();
        if (geoData.features && geoData.features.length > 0) {
          [lng, lat] = geoData.features[0].center;
        }
      } catch (geoErr) {
        console.warn("Geocoding failed, falling back to null coordinates:", geoErr);
      }

      const generatedTitle = `${formData.type} in ${formData.suburb}`;
      const newListing = {
        ...formData,
        title: generatedTitle,
        lat,
        lng,
        address: `${formData.suburb}, ${formData.city}`, // Use location as address fallback
        province: CITY_TO_PROVINCE[formData.city] || 'Zimbabwe', // Auto-fill province to satisfy DB constraint
        price: Number(formData.price),
        beds: Number(formData.beds),
        baths: Number(formData.baths),
        sqft: Number(formData.sqft),
        amenities: selectedAmenities,
        image: images[0]?.url,
        all_images: images.map(img => img.url),
        verified: false,
        manager_name: user.user_metadata?.full_name || user.email || 'Rentor Member',
        manager_id: user.id,
        manager_avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || 'User')}&background=random`,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('properties')
        .insert([newListing]);

      if (error) {
        console.error("Supabase Save Error:", error);
        throw new Error(error.message);
      }
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to save property:", error);
      alert(`Error saving property: ${error.message}`);
    } finally {
      setIsFinalizing(false);
    }
  };

  if (submitted) {
    return (
      <div className="list-property-page container">
        <div className="success-state glass-panel animate-fade-in">
          <CheckCircle size={64} className="success-icon" />
          <h1>Property Listed Successfully!</h1>
          <p>Your property is now live and stored securely in the cloud.</p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/'}>Return Home</button>
        </div>
      </div>
    );
  }

  const isAnyUploading = Object.keys(uploadProgress).length > 0;

  return (
    <div className="list-property-page container">
      <div className="form-container glass-panel">
        <div className="form-header">
          <h1>List Your Property</h1>
          <p>Fill out the details below to find the perfect tenant.</p>
          
          <div className="progress-bar">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Details</div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Photos</div>
          </div>
        </div>

        <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }}>
          {step === 1 && (
            <div className="form-section animate-fade-in">

              <div className="form-row">
                <div className="form-group">
                  <label>Property Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} required>
                    <optgroup label="Residential">
                      <option value="House">House / Villa</option>
                      <option value="Townhouse">Townhouse / Cluster</option>
                      <option value="Apartment">Apartment / Flat</option>
                      <option value="Cottage">Cottage / Backyard Unit</option>
                      <option value="Private Room">Private Room</option>
                      <option value="Student Housing">Student Housing</option>
                    </optgroup>
                    <optgroup label="Commercial & Industrial">
                      <option value="Office">Office Building</option>
                      <option value="Retail">Shop / Retail Space</option>
                      <option value="Hotel">Hotel / Lodge</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Workshop">Workshop</option>
                    </optgroup>
                    <optgroup label="Land & Agriculture">
                      <option value="Residential Stand">Residential Stand</option>
                      <option value="Commercial Stand">Commercial Stand</option>
                      <option value="Farm">Farm / Agricultural Land</option>
                      <option value="Smallholding">Smallholding</option>
                    </optgroup>
                  </select>
                </div>
                <div className="form-group">
                  <label>Monthly Rent</label>
                  <div className="input-with-icon">
                    <DollarSign size={18} />
                    <input name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="0.00" required />
                  </div>
                </div>
              </div>


              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>City</label>
                  <select name="city" value={formData.city} onChange={handleInputChange} required>
                    {Object.keys(ZIM_LOCATIONS).map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Suburbs</label>
                  <select name="suburb" value={formData.suburb} onChange={handleInputChange} required>
                    {ZIM_LOCATIONS[formData.city].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Bedrooms</label>
                  <input name="beds" type="number" min="0" value={formData.beds} onChange={handleInputChange} placeholder="1" required />
                </div>
                <div className="form-group">
                  <label>Bathrooms</label>
                  <input name="baths" type="number" min="0" step="0.5" value={formData.baths} onChange={handleInputChange} placeholder="1" required />
                </div>
                <div className="form-group">
                  <label>Square Feet</label>
                  <input name="sqft" type="number" min="0" value={formData.sqft} onChange={handleInputChange} placeholder="e.g. 1500" required />
                </div>
              </div>

              <div className="form-group">
                <label>Available From</label>
                <input 
                  name="available_from" 
                  type="date" 
                  value={formData.available_from} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows="4" value={formData.description} onChange={handleInputChange} placeholder="Describe the best features of your rental..." required></textarea>
              </div>

              <div className="form-actions right">
                <button type="submit" className="btn btn-primary">Next: Add Photos</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-section animate-fade-in">
              <div className="upload-area" onClick={() => !isAnyUploading && document.getElementById('image-input').click()} style={{ cursor: isAnyUploading ? 'wait' : 'pointer' }}>
                <input 
                  type="file" 
                  id="image-input" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  style={{ display: 'none' }} 
                />
                <Upload size={48} className="upload-icon" />
                <h3>{isAnyUploading ? 'Uploading High-Speed...' : 'Click to upload photos'}</h3>
                <p>Images are automatically compressed for maximum speed.</p>
                <div className="btn btn-outline" style={{marginTop: '1rem'}}>
                  {isAnyUploading ? 'Uploading...' : 'Browse Files'}
                </div>
              </div>

              {images.length > 0 && (
                <div className="image-preview-grid">
                  {images.map((img) => (
                    <div key={img.id} className="image-preview-item">
                      <img src={img.url} alt="Preview" style={{ opacity: img.isPlaceholder ? 0.5 : 1 }} />
                      {img.isPlaceholder && (
                        <div className="upload-progress-overlay">
                          <div className="progress-spinner"></div>
                          <span>{uploadProgress[img.id] || 0}%</span>
                        </div>
                      )}
                      <button type="button" className="remove-image-btn" onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="image-count-indicator">
                {images.length < 3 ? (
                  <span className="text-danger small">{3 - images.length} more images required</span>
                ) : (
                  <span className="text-success small">✓ Minimum requirement met</span>
                )}
              </div>

              <div className="form-group mt-4">
                <label>Amenities & Features</label>
                <div className="amenities-container">
                  {Object.entries(GROUPED_AMENITIES).map(([category, items]) => {
                    // Dynamic filtering for specific categories
                    if (category.startsWith('Specific to ')) {
                      const target = category.replace('Specific to ', '').toLowerCase();
                      const type = formData.type.toLowerCase();
                      const matches = 
                        (target === 'apartments' && type.includes('apartment')) ||
                        (target === 'commercial' && (['office', 'retail', 'warehouse', 'workshop', 'commercial'].some(t => type.includes(t)))) ||
                        (target === 'lodges/hotels' && type.includes('hotel'));
                      
                      if (!matches) return null;
                    }

                    return (
                      <div key={category} className="amenity-group">
                        <h4 className="amenity-group-title">{category}</h4>
                        <div className="amenities-pills">
                          {items.map((amenity) => (
                            <button
                              key={amenity}
                              type="button"
                              className={`amenity-pill ${selectedAmenities.includes(amenity) ? 'active' : ''}`}
                              onClick={() => toggleAmenity(amenity)}
                            >
                              {amenity}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-actions space-between mt-4">
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)} disabled={isFinalizing}>Back</button>
                <button type="submit" className="btn btn-primary" disabled={isFinalizing || images.length < 3 || isAnyUploading}>
                  {isFinalizing ? <><Loader2 className="animate-spin" size={18} /> Finalizing...</> : 'Publish Listing'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ListPropertyPage;
