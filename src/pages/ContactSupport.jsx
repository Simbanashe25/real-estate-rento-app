import React from 'react';
import './FlatFlowPages.css';
import SEO from '../components/SEO';

const ContactSupport = () => {
  return (
    <div className="flat-flow-page">
      <SEO title="Contact Support - Rentor" description="Need help? Contact our support team for any inquiries or issues regarding the Rentor platform." />
      <div className="container">
        <header className="page-header">
          <h1>Contact Support</h1>
          <p className="lead">We're here to help you every step of the way.</p>
        </header>

        <section className="flow-section">
          <h2>Get in Touch</h2>
          <p>Whether you're a tenant looking for a home or a property manager with questions about your listings, our team is ready to assist.</p>
          
          <div className="contact-methods">
            <div className="contact-method">
              <h3>Email Us</h3>
              <p>For general inquiries and support: <strong>support@rentor.co.zw</strong></p>
            </div>
            <div className="contact-method">
              <h3>WhatsApp Support</h3>
              <p>Chat with us for quick assistance: <strong>+263 77 123 4567</strong></p>
            </div>
          </div>
        </section>

        <section className="flow-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-flow">
            <div className="faq-item">
              <h4>How do I list my property?</h4>
              <p>Click on "List Property" in the menu and follow the simple steps to upload your details and images.</p>
            </div>
            <div className="faq-item">
              <h4>Is Rentor free to use?</h4>
              <p>Searching for properties is completely free for tenants. Property managers can check our pricing page for listing details.</p>
            </div>
          </div>
        </section>

        <section className="flow-section">
          <h2>Our Office</h2>
          <p>123 Innovation Drive, Harare, Zimbabwe</p>
          <p>Open Monday - Friday, 8:00 AM - 5:00 PM</p>
        </section>
      </div>
    </div>
  );
};

export default ContactSupport;
