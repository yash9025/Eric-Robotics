import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useRobotState } from '../../context/RobotStateContext';
import './ZoomSlider.css';

export const ZoomSlider: React.FC = () => {
  const { zoomLevel, setZoomLevel } = useRobotState();

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(100, prev + 10));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0, prev - 10));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomLevel(Number(e.target.value));
  };

  return (
    <div className="zoom-slider-container">
      {/* Zoom In Button */}
      <button 
        className="zoom-btn"
        onClick={handleZoomIn}
        title="Zoom In"
        aria-label="Zoom In"
      >
        <Plus size={14} strokeWidth={3} />
      </button>

      {/* Vertical Range Track */}
      <div className="zoom-track-wrapper">
        <input
          type="range"
          min="0"
          max="100"
          value={zoomLevel}
          onChange={handleSliderChange}
          className="zoom-range-input"
          aria-label="Zoom Level"
        />
      </div>

      {/* Zoom Out Button */}
      <button 
        className="zoom-btn"
        onClick={handleZoomOut}
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <Minus size={14} strokeWidth={3} />
      </button>
    </div>
  );
};
