import React from 'react';
import { useRobotState } from '../../context/RobotStateContext';
import { Map3DView } from './Map3DView';
import { CameraFeedView } from './CameraFeedView';
import { PiPThumbnail } from './PiPThumbnail';
import './ViewportContainer.css';

export const ViewportContainer: React.FC = () => {
  const { activeView } = useRobotState();

  return (
    <div className="viewport-container-stage">
      {/* Primary Fullscreen Layer with Smooth Transition */}
      <div className={`primary-layer map-layer ${activeView === 'MAP' ? 'active-primary' : 'inactive-primary'}`}>
        <Map3DView />
      </div>

      <div className={`primary-layer camera-layer ${activeView === 'CAMERA' ? 'active-primary' : 'inactive-primary'}`}>
        <CameraFeedView />
      </div>

      {/* Picture-in-Picture Thumbnail Card */}
      <PiPThumbnail />
    </div>
  );
};
