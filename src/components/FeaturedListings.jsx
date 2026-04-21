import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import SkeletonCard from './SkeletonCard';
import './FeaturedListings.css';
import { supabase } from '../supabase/config';

const FeaturedListings = () => {
  const [categories, setCategories] = useState({ homes: [], rooms: [], shared: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .neq('status', 'occupied')
          .order('created_at', { ascending: false })
          .limit(30);

        if (error) throw error;
        
        const properties = data || [];
        setCategories({
          homes: properties.filter(p => !p.type?.toLowerCase().includes('room') && !p.type?.toLowerCase().includes('shared')),
          rooms: properties.filter(p => p.type?.toLowerCase().includes('room')),
          shared: properties.filter(p => p.type?.toLowerCase().includes('shared'))
        });
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const CategorySection = ({ title, properties, categoryKey }) => {
    if (!loading && properties.length === 0) return null;
    
    return (
      <div className="category-carousel-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{title}</h2>
            <Link to={`/search?category=${categoryKey}`} className="view-all">
              View All
            </Link>
          </div>
        </div>
        <div className="listings-grid">
          {loading 
            ? [1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)
            : properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
          }
        </div>
      </div>
    );
  };

  return (
    <section className="featured-listings">
      <CategorySection title="Entire Homes" properties={categories.homes} categoryKey="homes" />
      <CategorySection title="Private Rooms" properties={categories.rooms} categoryKey="rooms" />
      <CategorySection title="Shared Flats" properties={categories.shared} categoryKey="shared" />
    </section>
  );
};

export default FeaturedListings;
