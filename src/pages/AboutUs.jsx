import React from 'react';
import './FlatFlowPages.css';
import SEO from '../components/SEO';

const AboutUs = () => {
  return (
    <div className="flat-flow-page">
      <SEO title="About Us - Rentor" description="Learn more about Rentor, your trusted partner in finding the perfect home in Zimbabwe." />
      <div className="container">
        <header className="page-header">
          <h1>About Us</h1>
          <p className="lead">Redefining the rental experience in Zimbabwe.</p>
        </header>

        <section className="flow-section">
          <h2>Our Mission</h2>
          <p>At Rentor, we believe that finding a home should be as exciting as moving into one. Our mission is to simplify the rental process for both tenants and landlords through transparency, technology, and trust.</p>
        </section>

        <section className="flow-section">
          <h2>Why Choose Rentor?</h2>
          <div className="features-flow">
            <div className="feature-item">
              <h3>Verified Listings</h3>
              <p>We work closely with managers to ensure every listing on our platform is legitimate and accurately represented.</p>
            </div>
            <div className="feature-item">
              <h3>Direct Communication</h3>
              <p>Connect directly with property managers via WhatsApp or phone, making inquiries fast and efficient.</p>
            </div>
            <div className="feature-item">
              <h3>Seamless Search</h3>
              <p>Our modern platform is designed to help you find exactly what you're looking for with ease.</p>
            </div>
          </div>
        </section>

        <section className="flow-section">
          <h2>Our Story</h2>
          <p>Founded with the goal of modernizing the Zimbabwean real estate market, Rentor has grown into a community-driven platform. We are dedicated to providing the best tools for property managers to showcase their listings and for seekers to find their next sanctuary.</p>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
