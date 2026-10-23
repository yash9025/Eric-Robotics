import React from 'react';
import { Pause, Play, ArrowRight } from 'lucide-react';
import { useRobotState } from '../../context/RobotStateContext';
import './MissionControlOverlay.css';

interface MissionControlOverlayProps {
  onQuickGoalClick?: () => void;
  onInitiateClick?: () => void;
}

export const MissionControlOverlay: React.FC<MissionControlOverlayProps> = ({
  onQuickGoalClick,
  onInitiateClick,
}) => {
  const { telemetry, toggleMissionPause, setControlMode } = useRobotState();

  return (
    <>
      {/* Top Left Mission Status & Quick Goal Pod */}
      <div className="top-left-pod">
        {/* Status Card */}
        <div className="mission-status-capsule glass-panel-light">
          <div className="status-text-group">
            <span className="status-prefix">Status</span>
            <span className="status-name">{telemetry.missionId}</span>
          </div>
          <button 
            className="mission-pause-btn"
            onClick={toggleMissionPause}
            title={telemetry.isMissionPaused ? "Resume Mission" : "Pause Mission"}
            aria-label={telemetry.isMissionPaused ? "Resume Mission" : "Pause Mission"}
          >
            {telemetry.isMissionPaused ? <Play size={12} fill="#FFFFFF" /> : <Pause size={12} fill="#FFFFFF" />}
          </button>
        </div>

        {/* Quick Goal Button */}
        <button 
          className="quick-goal-btn glass-panel-light"
          onClick={onQuickGoalClick}
          title="Dispatch Quick Goal Navigation"
        >
          <span className="quick-goal-label">QUICK GOAL</span>
          <div className="action-circle-icon">
            <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.5} />
          </div>
        </button>
      </div>

      {/* Top Right Mode Toggle & Initiate Pod */}
      <div className="top-right-pod">
        {/* Mode Toggle Switch */}
        <div className="mode-toggle-capsule glass-panel-light">
          <span className="mode-prefix">MODE</span>
          <div className="mode-switch-pill">
            <button
              className={`mode-btn ${telemetry.controlMode === 'AUTO' ? 'active' : ''}`}
              onClick={() => setControlMode('AUTO')}
            >
              AUTO
            </button>
            <button
              className={`mode-btn ${telemetry.controlMode === 'MANUAL' ? 'active' : ''}`}
              onClick={() => setControlMode('MANUAL')}
            >
              MANUAL
            </button>
          </div>
        </div>

        {/* Initiate Action Button */}
        <button 
          className="initiate-btn glass-panel-light"
          onClick={onInitiateClick}
          title="Initiate Mission Checklist"
        >
          <span className="initiate-label">INITIATE</span>
          <div className="action-circle-icon">
            <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.5} />
          </div>
        </button>
      </div>
    </>
  );
};
