import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, User, Star, Shield, Clock, Phone, Mail } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import SkeletonCard from '../components/SkeletonCard';
import { supabase } from '../supabase/config';
import { formatWhatsAppNumber } from '../utils/phoneUtils';
import SEO from '../components/SEO';
import './ListerProfilePage.css';

const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884h.001c2.64 0 5.122 1.029 6.989 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.63 1.432h.006c6.551 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ListerProfilePage = () => {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);

  const [listerAvatar, setListerAvatar] = useState(`https://ui-avatars.com/api/?name=${encodeURIComponent(decodedName)}&background=d92228&color=fff&size=200`);
  const [listerProfile, setListerProfile] = useState(null);
  const [listerListings, setListerListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('hide-nav-mobile');
    const fetchListerProperties = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching properties for lister:', decodedName);
        const { data: listings, error: listError } = await supabase
          .from('properties')
          .select('*')
          .ilike('manager_name', decodedName);

        if (listError) throw listError;
        setListerListings(listings || []);
        console.log(`Found ${listings?.length || 0} listings`);
        
        let fetchedAvatar = null;
        let profileData = null;

        // Try to find profile by manager_id from listings
        const managerId = listings?.find(p => p.manager_id)?.manager_id;
        if (managerId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', managerId)
            .maybeSingle();
          if (profile) profileData = profile;
        }

        // Fallback: Try searching profiles by full_name (case insensitive)
        if (!profileData) {
          const { data: profileByName } = await supabase
            .from('profiles')
            .select('*')
            .ilike('full_name', decodedName)
            .maybeSingle();
          if (profileByName) profileData = profileByName;
        }

        if (profileData) {
          setListerProfile(profileData);
          if (profileData.avatar_url) fetchedAvatar = profileData.avatar_url;
        }
        
        // Final fallback: Use manager_avatar from properties
        if (!fetchedAvatar && listings?.[0]?.manager_avatar) {
          fetchedAvatar = listings[0].manager_avatar;
        }

        if (fetchedAvatar) {
          console.log('Final Avatar URL:', fetchedAvatar);
          setListerAvatar(fetchedAvatar);
        } else {
          // Match the "other cards" look with random background
          setListerAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(decodedName)}&background=random&color=fff&size=200`);
        }
      } catch (err) {
        console.error('Error fetching lister properties:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListerProperties();
    return () => {
      document.body.classList.remove('hide-nav-mobile');
    };
  }, [decodedName]);

  const lister = {
    name: listerProfile?.full_name || decodedName,
    title: 'Property Consultant',
    avatar: listerAvatar,
    verified: true,
    location: listerProfile?.city || listerListings[0]?.city || 'Zimbabwe',
    bio: listerProfile?.bio || `Hi, I'm ${listerProfile?.full_name || decodedName}. I list properties on Rentor to help people find their perfect rental home. Contact me to arrange viewings or for more details on any of my listings.`,
    joined: listerProfile?.created_at ? `Member since ${new Date(listerProfile.created_at).getFullYear()}` : 'Rentor Member',
  };

  return (
    <div className="lister-profile-page minimal">
      <SEO 
        title={`${lister.name} Profile`} 
        description={`View property listings from ${lister.name} in ${lister.location}. Discover entire homes and rooms on Rentor.`} 
      />
      <div className="container">
        <div className="profile-header-minimal">
    <div className="profile-hero">
            <div className={`profile-avatar-simple ${isLoading ? 'skeleton' : ''}`}>
              {!isLoading && (
                <img 
                  src={lister.avatar} 
                  alt={lister.name} 
                  loading="lazy" 
                  onLoad={(e) => e.target.classList.add('loaded')}
                />
              )}
            </div>
            <div className="profile-intro">
              <div className="name-line">
                <h1>{lister.name}</h1>
              </div>
              <div className="quick-stats">
                <div className="q-stat">
                  <strong>{listerListings.length}</strong>
                  <span>listings</span>
                </div>
                <div className="q-stat">
                  <i className="fa-solid fa-location-dot" style={{ color: '#717171', fontSize: '14px' }}></i>
                  <span>{lister.location}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions-minimal">
            <a 
              href={`https://wa.me/${formatWhatsAppNumber(listerListings[0]?.phone)}?text=${encodeURIComponent(`Hi, I saw your listings on Rentor and I'm interested in finding out more. Are they still available?`)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary whatsapp-cta-large"
            >
              <WhatsAppIcon size={18} /> WhatsApp Manager
            </a>
          </div>
        </div>

        <div className="profile-grid-clean">
          <div className="main-content-flow">
            <section className="clean-section">
              <p className="bio-minimal">{lister.bio}</p>
            </section>

            <section className="clean-section">
              <div className="section-title-row">
                <h2>Active Listings</h2>
                {!isLoading && (
                  <div className="tab-pill">{listerListings.length} units</div>
                )}
              </div>
              <div className="listings-minimal-grid">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={`skel-lister-${i}`} />
                  ))
                ) : listerListings.length > 0 ? (
                  listerListings.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))
                ) : (
                  <p className="no-data">No active listings from this member yet.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListerProfilePage;
