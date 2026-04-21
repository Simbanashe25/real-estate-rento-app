import Hero from '../components/Hero';
import CategoriesGrid from '../components/CategoriesGrid';
import FeaturedListings from '../components/FeaturedListings';
import SEO from '../components/SEO';

const Home = () => {
  return (
    <>
      <SEO 
        title="Home" 
        description="Discover the best rentals in Zimbabwe. Browse entire homes, private rooms, and shared apartments in Harare, Bulawayo and more."
      />
      <Hero />
      <CategoriesGrid />
      <FeaturedListings />
    </>
  );
};

export default Home;
