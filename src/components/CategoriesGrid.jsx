import { Link } from 'react-router-dom';
import './CategoriesGrid.css';

const CATEGORIES = [
  { id: 1, title: 'Entire Homes', category: 'residential', count: '420+', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800' },
  { id: 2, title: 'Apartments', category: 'apartments', count: '186+', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800' },
  { id: 3, title: 'Private Rooms', category: 'rooms', count: '142+', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800' },
  { id: 4, title: 'Student Housing', category: 'student-housing', count: '94+', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800' },
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
