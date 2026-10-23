import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { useRobotState } from '../../context/RobotStateContext';
import './EmergencyHazardOverlay.css';

export const EmergencyHazardOverlay: React.FC = () => {
  const { telemetry, resetEStop } = useRobotState();

  if (!telemetry.isEStopActive) return null;

  return (
    <div className="estop-hazard-overlay" role="alert" aria-live="assertive">
      {/* Flashing Hazard Stripes Border */}
      <div className="hazard-border hazard-border-top" />
      <div className="hazard-border hazard-border-bottom" />
      <div className="hazard-border hazard-border-left" />
      <div className="hazard-border hazard-border-right" />

      {/* Floating Alert Banner */}
      <div className="estop-banner-card glass-panel-dark">
        <div className="estop-banner-content">
          <AlertOctagon size={22} className="estop-warning-icon" />
          <div className="estop-text-block">
            <span className="estop-heading">EMERGENCY STOP ENGAGED</span>
            <span className="estop-detail">HARDWARE SAFETY LATCH TRIPPED • WHEEL MOTORS FROZEN</span>
          </div>
        </div>

        <button 
          className="pill-button pill-button-light reset-estop-btn"
          onClick={resetEStop}
          title="Clear E-Stop Safety Latch"
        >
          <RotateCcw size={14} />
          <span>RELEASE LATCH</span>
        </button>
      </div>
    </div>
  );
};
