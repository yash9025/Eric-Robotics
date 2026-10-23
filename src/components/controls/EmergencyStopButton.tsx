import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useRobotState } from '../../context/RobotStateContext';
import './EmergencyStopButton.css';

export const EmergencyStopButton: React.FC = () => {
  const { telemetry, triggerEStop, resetEStop } = useRobotState();

  const isTriggered = telemetry.isEStopActive;

  const handleClick = () => {
    if (isTriggered) {
      resetEStop();
    } else {
      triggerEStop();
    }
  };

  return (
    <div className={`estop-container ${isTriggered ? 'triggered' : ''}`}>
      <button 
        className="estop-outer-ring"
        onClick={handleClick}
        title={isTriggered ? "Reset Emergency Stop Latch" : "TRIGGER EMERGENCY STOP"}
        aria-label={isTriggered ? "Reset Emergency Stop Latch" : "TRIGGER EMERGENCY STOP"}
      >
        {/* Yellow Bezel Text */}
        <span className="estop-text-top">EMERGENCY</span>
        
        {/* Red Central Button */}
        <div className={`estop-inner-button ${isTriggered ? 'depressed' : ''}`}>
          {isTriggered ? (
            <AlertTriangle size={24} className="estop-icon alert-flash" />
          ) : (
            <RefreshCw size={24} className="estop-icon circular-arrows" />
          )}
        </div>

        <span className="estop-text-bottom">STOP</span>
      </button>
    </div>
  );
};
