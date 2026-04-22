import { Link } from 'react-router-dom';
import './CategoriesGrid.css';

const CATEGORIES = [
  { id: 1, title: 'Residential', category: 'residential', count: '420+', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800' },
  { id: 2, title: 'Commercial', category: 'commercial', count: '86+', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800' },
  { id: 3, title: 'Industrial', category: 'industrial', count: '42+', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800' },
  { id: 4, title: 'Land / Stands', category: 'land', category: 'land', count: '156+', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800' },
  { id: 5, title: 'Agricultural', category: 'agricultural', count: '94+', image: 'https://images.unsplash.com/photo-1500311421090-a38263e58f02?auto=format&fit=crop&q=80&w=800' },
];

const CategoriesGrid = () => {
  return (
    <section className="categories-section container">
      <div className="categories-grid">
        {CATEGORIES.map(category => (
          <Link key={category.id} to={`/search?category=${category.category}`} className="category-card" style={{ textDecoration: 'none' }}>
            <img src={category.image} alt={category.title} className="category-bg" />
            <div className="category-overlay"></div>
            <div className="category-header">
              <h3 className="category-title">{category.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoriesGrid;
