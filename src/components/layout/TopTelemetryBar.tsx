import React from 'react';
import { Battery, Signal } from 'lucide-react';
import { useRobotState } from '../../context/RobotStateContext';
import './TopTelemetryBar.css';

interface TopTelemetryBarProps {
  onRosConfigClick?: () => void;
}

export const TopTelemetryBar: React.FC<TopTelemetryBarProps> = ({ onRosConfigClick }) => {
  const { telemetry, activeView, toggleView, rosStatus } = useRobotState();

  const isFailsafeOk = telemetry.failsafeStatus === 'Okay';
  const isSystemOk = telemetry.systemStatus === 'Okay';

  return (
    <div className="top-telemetry-container">
      {/* Primary Floating Dark Capsule */}
      <div className="telemetry-capsule glass-panel-dark">
        {/* Battery Indicator */}
        <div className="telemetry-item">
          <span className="telemetry-value font-mono">{telemetry.batteryPercent}%</span>
          <div className="battery-icon-wrapper">
            <Battery size={18} className="battery-svg" fill={telemetry.batteryPercent > 20 ? "#10B981" : "#EF4444"} />
          </div>
        </div>

        <div className="telemetry-separator" />

        {/* Signal Strength / ROS Link */}
        <div 
          className="telemetry-item clickable-ros-item" 
          onClick={onRosConfigClick}
          title={`ROS Status: ${rosStatus}. Click to configure ROS 2 Bridge`}
          role="button"
          tabIndex={0}
        >
          <Signal size={16} className={`signal-icon ${rosStatus === 'connected' ? 'ros-connected-icon' : ''}`} />
          <span className="telemetry-label">
            {rosStatus === 'connected' ? 'ROS 2 Live' : telemetry.signalStrength}
          </span>
        </div>

        <div className="telemetry-separator" />

        {/* Failsafe Health */}
        <div className="telemetry-item">
          <span className="telemetry-text">Failsafe</span>
          <span className={`telemetry-status ${!isFailsafeOk ? 'status-danger-text' : ''}`}>
            {telemetry.failsafeStatus}
          </span>
          <span className={`status-dot ${!isFailsafeOk ? 'danger' : ''}`} />
        </div>

        <div className="telemetry-separator" />

        {/* System Health */}
        <div className="telemetry-item">
          <span className="telemetry-text">System</span>
          <span className={`telemetry-status ${!isSystemOk ? 'status-danger-text' : ''}`}>
            {telemetry.systemStatus}
          </span>
          <span className={`status-dot ${!isSystemOk ? 'danger' : ''}`} />
        </div>
      </div>

      {/* Sub-Pill View Mode Switcher */}
      <button 
        className="view-selector-pill glass-panel-dark" 
        onClick={toggleView}
        title="Switch primary viewport mode"
        aria-label="Switch primary viewport mode"
      >
        <span>{activeView === 'MAP' ? 'Map View' : 'Camera View'}</span>
      </button>
    </div>
  );
};
