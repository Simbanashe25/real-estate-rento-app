import React from 'react';
import './FlatFlowPages.css';
import SEO from '../components/SEO';

const Careers = () => {
  return (
    <div className="flat-flow-page">
      <SEO title="Careers - Join the Rentor Team" description="Explore career opportunities at Rentor and help us build the future of real estate in Zimbabwe." />
      <div className="container">
        <header className="page-header">
          <h1>Careers</h1>
          <p className="lead">Join us in building the future of real estate.</p>
        </header>

        <section className="flow-section">
          <h2>Why Work at Rentor?</h2>
          <p>We're a fast-growing team of innovators, designers, and problem solvers. At Rentor, you'll have the opportunity to make a real impact on how people find homes across the country.</p>
        </section>

        <section className="flow-section">
          <h2>Open Positions</h2>
          <div className="jobs-list">
            <div className="job-item">
              <div className="job-info">
                <h3>Senior Frontend Developer</h3>
                <p>Remote / Full-time</p>
              </div>
              <button className="btn btn-outline">Learn More</button>
            </div>
            <div className="job-item">
              <div className="job-info">
                <h3>UI/UX Designer</h3>
                <p>Harare / Full-time</p>
              </div>
              <button className="btn btn-outline">Learn More</button>
            </div>
            <div className="job-item">
              <div className="job-info">
                <h3>Operations Manager</h3>
                <p>Harare / Hybrid</p>
              </div>
              <button className="btn btn-outline">Learn More</button>
            </div>
          </div>
        </section>

        <section className="flow-section">
          <h2>Don't see a fit?</h2>
          <p>We're always looking for talented individuals to join our journey. Send your CV and a brief intro to <strong>careers@rentor.co.zw</strong> and we'll be in touch.</p>
        </section>
      </div>
    </div>
  );
};

export default Careers;
