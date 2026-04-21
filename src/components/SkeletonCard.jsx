import './SkeletonCard.css';

const SkeletonCard = () => {
  return (
    <div className="property-card skeleton-card">
      <div className="skeleton-image pulse"></div>
      <div className="property-details">
        <div className="skeleton-price pulse"></div>
        
        <div className="skeleton-stats">
          <div className="skeleton-stat pulse"></div>
          <div className="skeleton-stat pulse"></div>
          <div className="skeleton-stat pulse"></div>
        </div>

        <div className="skeleton-address pulse"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
