import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, LogOut, Heart, Home as HomeIcon, List, Edit2, Check, X, Camera, Trash2 } from 'lucide-react';
import { supabase } from '../supabase/config';
import PropertyCard from '../components/PropertyCard';
import SkeletonCard from '../components/SkeletonCard';
import './UserProfile.css';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [savedProperties, setSavedProperties] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('saved');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthLoading(false);
      if (!session) { navigate('/login'); return; }
      setSessionUser(session.user);
      setAvatarUrl(session.user.user_metadata?.avatar_url || null);
      fetchAllData(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthLoading(false);
      if (!session) { navigate('/login'); return; }
      setSessionUser(session.user);
      fetchAllData(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchAllData = async (user) => {
    setDataLoading(true);
    try {
      // Fetch profile and favorites first
      const [profileRes, favoritesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('favorites').select('*, properties(*)').eq('user_id', user.id)
      ]);

      const profile = profileRes.data || {
        full_name: user.user_metadata?.full_name || 'Rentor User',
        email: user.email,
        phone: '',
        role: 'Renter'
      };
      setUserData(profile);
      setEditForm({ full_name: profile.full_name || '', phone: profile.phone || '' });
      if (profile.avatar_url) setAvatarUrl(profile.avatar_url);

      if (favoritesRes.data) {
        setSavedProperties(favoritesRes.data.map(f => ({ id: f.property_id, ...f.properties })));
      }

      // Now fetch listings, including any "orphan" listings that were created before manager_id was strictly saved
      const safeName = profile.full_name ? profile.full_name.trim() : 'Rentor User';
      const safeEmail = user.email ? user.email.trim() : '';

      const { data: userListings, error: listingsErr } = await supabase
        .from('properties')
        .select('*')
        .or(`manager_id.eq.${user.id},and(manager_id.is.null,manager_name.ilike.%${safeName}%)`)
        .order('created_at', { ascending: false });

      if (listingsErr) {
        console.error("Listings fetch error:", listingsErr);
      } else if (userListings) {
        // As a final fallback for "your-email@gmail.com" if needed, but ilike name should catch them.
        setMyListings(userListings);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setDataLoading(false);
    }
  };

  // ── Avatar Upload ──
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !sessionUser) return;
    
    // Create a local preview immediately for "fast" update feel
    const localPreviewUrl = URL.createObjectURL(file);
    setAvatarUrl(localPreviewUrl);
    setAvatarUploading(true);

    try {
      const ext = file.name.split('.').pop();
      // Using a timestamp to avoid potential upsert permission issues and browser caching
      const filePath = `avatars/${sessionUser.id}_${Date.now()}.${ext}`;

      const { data, error: uploadErr } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, { 
          upsert: true, 
          contentType: file.type 
        });

      if (uploadErr) {
        console.error('Supabase Storage Error:', uploadErr);
        throw uploadErr;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      // Save to profiles table
      await supabase.from('profiles').upsert({
        id: sessionUser.id,
        avatar_url: publicUrl,
        email: sessionUser.email,
        updated_at: new Date().toISOString()
      });

      // Update auth metadata
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

      // Update all properties belonging to this user so the change reflects everywhere "fast"
      const { error: propUpdateErr } = await supabase
        .from('properties')
        .update({ manager_avatar: publicUrl })
        .eq('manager_id', sessionUser.id);
      
      if (propUpdateErr) console.warn('Properties avatar update error (non-critical):', propUpdateErr);

      setAvatarUrl(publicUrl);
    } catch (err) {
      console.error('Avatar upload error:', err);
      alert(`Upload failed: ${err.message || 'Unknown error'}. Make sure the "property-images" bucket exists in Supabase and has public upload policies.`);
      // Revert to old avatar if upload fails
      supabase.auth.getSession().then(({ data: { session } }) => {
        setAvatarUrl(session?.user?.user_metadata?.avatar_url || null);
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── Save Profile ──
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: sessionUser.id,
        ...editForm,
        email: sessionUser.email,
        updated_at: new Date().toISOString()
      });
      if (!error) {
        setUserData(prev => ({ ...prev, ...editForm }));
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete Listing ──
  const handleDeleteListing = async (propertyId) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    const { error } = await supabase.from('properties').delete().eq('id', propertyId);
    if (!error) setMyListings(prev => prev.filter(p => p.id !== propertyId));
  };

  // ── Toggle Occupied ──
  const handleToggleOccupied = async (property) => {
    const newStatus = property.status === 'occupied' ? 'available' : 'occupied';
    const { error } = await supabase
      .from('properties')
      .update({ status: newStatus })
      .eq('id', property.id);

    if (!error) {
      setMyListings(prev =>
        prev.map(p => p.id === property.id ? { ...p, status: newStatus } : p)
      );
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // ── Mobile View States ──
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileView, setMobileView] = useState('menu'); // 'menu', 'saved', 'listings'

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const displayAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.full_name || 'User')}&size=128&background=random`;

  if (authLoading) {
    return (
      <div className="profile-page">
        <div className="profile-header-banner hide-mobile" />
        <div className="container">
          <div className="profile-content">
            <div className="profile-sidebar" style={{ width: '100%' }}>
              <div className="user-info-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="avatar-skeleton" />
                <div className="skeleton-line w-60 mx-auto mt-3" />
                <div className="skeleton-line w-40 mx-auto mt-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Native Mobile App Layout ──
  if (isMobile) {
    if (mobileView === 'saved') {
      return (
        <div className="mobile-native-subpage">
          <div className="mobile-subpage-header">
            <button className="mobile-back-btn" onClick={() => setMobileView('menu')}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <h2>Saved Properties</h2>
            <div style={{ width: '36px' }}></div> {/* Spacer for centering */}
          </div>
          <div className="mobile-subpage-content">
            {dataLoading ? (
              <div className="profile-listings-grid">
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : savedProperties.length > 0 ? (
              <div className="profile-listings-grid">
                {savedProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Heart size={44} color="var(--border)" />
                <h3>No saved properties yet</h3>
                <p>Properties you save will appear here.</p>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Start Browsing</Link>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (mobileView === 'listings') {
      return (
        <div className="mobile-native-subpage">
          <div className="mobile-subpage-header">
            <button className="mobile-back-btn" onClick={() => setMobileView('menu')}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <h2>My Listings</h2>
            <Link to="/list-property" className="mobile-add-btn">
              <i className="fa-solid fa-plus"></i>
            </Link>
          </div>
          <div className="mobile-subpage-content">
            {dataLoading ? (
              <div className="profile-listings-grid">
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : myListings.length > 0 ? (
              <div className="profile-listings-grid">
                {myListings.map(property => (
                  <div key={property.id} className="listing-with-actions">
                    <PropertyCard property={property} />
                    <div className="listing-action-bar">
                      <button
                        className={`action-bar-btn ${property.status === 'occupied' ? 'btn-reopen' : 'btn-occupy'}`}
                        onClick={() => handleToggleOccupied(property)}
                      >
                        {property.status === 'occupied' ? (
                          <div className="action-icon-wrapper"><i className="fas fa-check-circle"></i><span>Open</span></div>
                        ) : (
                          <div className="action-icon-wrapper"><i className="fas fa-minus-circle"></i><span>Close</span></div>
                        )}
                      </button>
                      <button className="action-bar-btn btn-delete" onClick={() => handleDeleteListing(property.id)}>
                        <div className="action-icon-wrapper"><i className="fas fa-trash-alt"></i><span>Del</span></div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <List size={44} color="var(--border)" />
                <h3>No listings yet</h3>
                <p>Properties you list will appear here.</p>
                <Link to="/list-property" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>List a Property</Link>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Default Mobile Menu View
    return (
      <div className="mobile-native-menu">
        <div className="mobile-profile-header">
          <div className="mobile-avatar-container">
            {avatarUploading ? (
              <div className="avatar-uploading-overlay" style={{ width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--border)' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ color: 'white', fontSize: '24px' }}></i>
              </div>
            ) : (
              <img src={displayAvatar} alt="Avatar" className="mobile-avatar" loading="lazy" />
            )}
            <button className="mobile-camera-btn" onClick={() => avatarInputRef.current?.click()}>
              <Camera size={14} />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>

          <div className="mobile-user-details">
            <h2>{userData?.full_name || 'Rentor User'}</h2>
            <p>{sessionUser?.email}</p>
            {userData?.phone && <p>{userData.phone}</p>}
            <button className="mobile-edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>
        </div>

        <div className="native-menu-list">
          <button className="native-menu-item" onClick={() => setMobileView('saved')}>
            <div className="native-menu-left">
              <Heart size={20} className="menu-icon" />
              <span>Saved Properties</span>
            </div>
            <div className="native-menu-right">
              <span className="menu-badge">{savedProperties.length}</span>
              <i className="fa-solid fa-chevron-right menu-chevron"></i>
            </div>
          </button>

          <button className="native-menu-item" onClick={() => setMobileView('listings')}>
            <div className="native-menu-left">
              <List size={20} className="menu-icon" />
              <span>My Listings</span>
            </div>
            <div className="native-menu-right">
              <span className="menu-badge">{myListings.length}</span>
              <i className="fa-solid fa-chevron-right menu-chevron"></i>
            </div>
          </button>

          <Link to="/list-property" className="native-menu-item">
            <div className="native-menu-left">
              <HomeIcon size={20} className="menu-icon" />
              <span>List a Property</span>
            </div>
            <div className="native-menu-right">
              <i className="fa-solid fa-chevron-right menu-chevron"></i>
            </div>
          </Link>

          <button className="native-menu-item text-danger" onClick={handleLogout} style={{ marginTop: '2rem' }}>
            <div className="native-menu-left">
              <LogOut size={20} className="menu-icon text-danger" />
              <span>Log Out</span>
            </div>
          </button>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="mobile-edit-modal-overlay" onClick={() => setIsEditing(false)}>
            <div className="mobile-edit-modal" onClick={e => e.stopPropagation()}>
              <h3>Edit Profile</h3>
              <div className="mobile-edit-form">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Full Name</label>
                  <input 
                    className="edit-input" 
                    value={editForm.full_name} 
                    onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} 
                    placeholder="Full name" 
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem' }}
                  />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Phone Number</label>
                  <input 
                    className="edit-input" 
                    value={editForm.phone} 
                    onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} 
                    placeholder="Phone number" 
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem' }}
                  />
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveProfile} 
                  disabled={saving}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', marginBottom: '12px' }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setIsEditing(false)}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Desktop Dashboard Layout ──
  return (
    <div className="profile-page">
      <div className="profile-header-banner" />
      <div className="container">
        <div className="profile-content">

          {/* ── Sidebar ── */}
          <div className="profile-sidebar">
            <div className="user-info-card">

              {/* Avatar with upload */}
              <div className="avatar-upload-wrapper">
                <div className="avatar-wrapper">
                  {avatarUploading ? (
                    <div className="avatar-uploading-overlay">
                      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: 'white' }}></i>
                    </div>
                  ) : (
                    <img src={displayAvatar} alt="Avatar" className="user-avatar" loading="lazy" />
                  )}
                </div>
                <button
                  className="avatar-camera-btn"
                  onClick={() => avatarInputRef.current?.click()}
                  title="Change photo"
                >
                  <Camera size={13} />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </div>

              {isEditing ? (
                <div className="edit-form">
                  <input className="edit-input" value={editForm.full_name}
                    onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="Full name" />
                  <input className="edit-input" value={editForm.phone}
                    onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="Phone number" />
                  <div className="edit-actions">
                    <button className="btn-icon-green" onClick={handleSaveProfile} disabled={saving}>
                      <Check size={15} />
                    </button>
                    <button className="btn-icon-red" onClick={() => setIsEditing(false)}>
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="user-name">{userData?.full_name || 'Rentor User'}</h1>
                  <p className="user-role">{userData?.role || 'Renter'}</p>
                  <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                    <Edit2 size={12} /> Edit Profile
                  </button>
                </>
              )}

              <div className="user-details-list">
                <div className="detail-item">
                  <Mail size={14} />
                  <span>{sessionUser?.email}</span>
                </div>
                {userData?.phone && (
                  <div className="detail-item">
                    <Phone size={14} />
                    <span>{userData.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-nav">
              <button className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
                <Heart size={16} /> Saved
                <span className="nav-count">{savedProperties.length}</span>
              </button>
              <button className={`nav-item ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}>
                <List size={16} /> My Listings
                <span className="nav-count">{myListings.length}</span>
              </button>
              <Link to="/list-property" className="nav-item nav-item-cta">
                <HomeIcon size={16} /> List a Property
              </Link>
              <button className="nav-item text-danger" onClick={handleLogout}>
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </div>

          {/* ── Main Panel ── */}
          <div className="profile-main">

            {/* Saved */}
            {activeTab === 'saved' && (
              <div className="dashboard-card">
                <div className="card-header-flex">
                  <h2>Saved Properties</h2>
                  <span className="count-badge">{savedProperties.length}</span>
                </div>
                {dataLoading ? (
                  <div className="profile-listings-grid">
                    {[1,2,3].map(i => <SkeletonCard key={i} />)}
                  </div>
                ) : savedProperties.length > 0 ? (
                  <div className="profile-listings-grid">
                    {savedProperties.map(property => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Heart size={44} color="var(--border)" />
                    <h3>No saved properties yet</h3>
                    <p>Properties you save will appear here.</p>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Start Browsing</Link>
                  </div>
                )}
              </div>
            )}

            {/* My Listings */}
            {activeTab === 'listings' && (
              <div className="dashboard-card">
                <div className="card-header-flex">
                  <h2>My Listings</h2>
                  <Link to="/list-property" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                    + Add New
                  </Link>
                </div>
                {dataLoading ? (
                  <div className="profile-listings-grid">
                    {[1,2,3].map(i => <SkeletonCard key={i} />)}
                  </div>
                ) : myListings.length > 0 ? (
                    <div className="profile-listings-grid">
                      {myListings.map(property => (
                        <div key={property.id} className="listing-with-actions">
                          <PropertyCard property={property} />
                          <div className="listing-action-bar">
                          <button
                            className={`action-bar-btn ${property.status === 'occupied' ? 'btn-reopen' : 'btn-occupy'}`}
                            onClick={() => handleToggleOccupied(property)}
                            title={property.status === 'occupied' ? 'Mark as available' : 'Mark as occupied'}
                          >
                            {property.status === 'occupied'
                              ? <><i className="fa-solid fa-circle-check" style={{ marginRight: '5px' }}></i>Mark Available</>
                              : <><i className="fa-solid fa-ban" style={{ marginRight: '5px' }}></i>Mark Occupied</>
                            }
                          </button>
                          <button
                            className="action-bar-btn btn-delete"
                            onClick={() => handleDeleteListing(property.id)}
                            title="Delete listing"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <List size={44} color="var(--border)" />
                    <h3>No listings yet</h3>
                    <p>Properties you list will appear here.</p>
                    <Link to="/list-property" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>List a Property</Link>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
