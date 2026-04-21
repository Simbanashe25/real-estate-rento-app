import React from 'react';
import './FlatFlowPages.css';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
  return (
    <div className="flat-flow-page">
      <SEO title="Privacy Policy - Rentor" description="Learn how Rentor collects, uses, and protects your personal information." />
      <div className="container">
        <header className="page-header">
          <h1>Privacy Policy</h1>
          <p className="lead">Your privacy is our priority.</p>
        </header>

        <section className="flow-section">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, list a property, or contact support. This may include your name, email address, phone number, and property details.</p>
        </section>

        <section className="flow-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to personalize your experience on the platform.</p>
        </section>

        <section className="flow-section">
          <h2>3. Sharing of Information</h2>
          <p>We do not share your personal information with third parties except as necessary to provide our services (e.g., sharing your contact info with a lister) or as required by law.</p>
        </section>

        <section className="flow-section">
          <h2>4. Data Security</h2>
          <p>We implement reasonable security measures to protect your information from unauthorized access, use, or disclosure.</p>
        </section>

        <section className="flow-section">
          <h2>5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information at any time through your account settings or by contacting us.</p>
        </section>

        <section className="flow-section">
          <h2>6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at <strong>privacy@rentor.co.zw</strong>.</p>
        </section>

        <footer className="policy-footer">
          <p>Last Updated: April 19, 2026</p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
