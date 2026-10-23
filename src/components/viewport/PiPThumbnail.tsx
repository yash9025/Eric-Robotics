import React, { useState } from 'react';
import { useRobotState } from '../../context/RobotStateContext';
import { CameraFeedView } from './CameraFeedView';
import './PiPThumbnail.css';

export const PiPThumbnail: React.FC = () => {
  const { activeView, toggleView } = useRobotState();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const tooltipText = activeView === 'MAP' 
    ? 'Click to enter camera view' 
    : 'Click to enter map view';

  return (
    <div
      className="pip-thumbnail-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={toggleView}
      title={tooltipText}
      role="button"
      tabIndex={0}
      aria-label={tooltipText}
    >
      {/* Content depending on active mode */}
      <div className="pip-content-wrapper">
        {activeView === 'MAP' ? (
          // Camera feed preview when map is full
          <CameraFeedView isThumbnail />
        ) : (
          // Map preview when camera is full
          <div className="pip-map-preview">
            <img
              src="/assets/maps/warehouse_map.png"
              alt="Map Preview"
              className="pip-map-image"
            />
          </div>
        )}
      </div>

      {/* Hover Overlay Tooltip (Exact match to demo GIF) */}
      <div className={`pip-hover-overlay ${isHovered ? 'visible' : ''}`}>
        <div className="pip-hover-pill">
          <span>{tooltipText}</span>
        </div>
      </div>
    </div>
  );
};
