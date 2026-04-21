import { Link } from 'react-router-dom';
import './CategoriesGrid.css';

const CATEGORIES = [
  { id: 1, title: 'Entire Homes', category: 'homes', count: 124, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800' },
  { id: 2, title: 'Private Rooms', category: 'rooms', count: 86, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800' },
  { id: 3, title: 'Shared Flats', category: 'shared', count: 42, image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800' },
  { id: 4, title: 'Student Housing', category: 'student', count: 156, image: 'https://images.unsplash.com/photo-1555854817-40e098ee7af5?auto=format&fit=crop&q=80&w=800' },
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
              <span className="category-count">{category.count}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoriesGrid;
