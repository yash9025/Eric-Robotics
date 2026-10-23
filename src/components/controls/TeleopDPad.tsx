import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRobotState } from '../../context/RobotStateContext';
import './TeleopDPad.css';

export const TeleopDPad: React.FC = () => {
  const { telemetry, sendVelocityCommand } = useRobotState();
  const [activeDirection, setActiveDirection] = useState<string | null>(null);

  const moveForward = useCallback(() => {
    sendVelocityCommand(0.5, 0);
    setActiveDirection('w');
  }, [sendVelocityCommand]);

  const moveBackward = useCallback(() => {
    sendVelocityCommand(-0.5, 0);
    setActiveDirection('s');
  }, [sendVelocityCommand]);

  const turnLeft = useCallback(() => {
    sendVelocityCommand(0, 0.4);
    setActiveDirection('a');
  }, [sendVelocityCommand]);

  const turnRight = useCallback(() => {
    sendVelocityCommand(0, -0.4);
    setActiveDirection('d');
  }, [sendVelocityCommand]);

  const stopRobot = useCallback(() => {
    sendVelocityCommand(0, 0);
    setActiveDirection(null);
  }, [sendVelocityCommand]);

  // Global Keyboard Navigation Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (telemetry.isEStopActive) return;

      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        moveForward();
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        moveBackward();
      } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        turnLeft();
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        turnRight();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = ['w', 'W', 's', 'S', 'a', 'A', 'd', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (keys.includes(e.key)) {
        stopRobot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [telemetry.isEStopActive, moveForward, moveBackward, turnLeft, turnRight, stopRobot]);

  return (
    <div className="teleop-dpad-container" title="Teleoperation D-Pad (WASD or Arrow keys)">
      <div className="dpad-disc">
        {/* Up / Forward Button */}
        <button
          className={`dpad-sector dpad-up ${activeDirection === 'w' ? 'pressed' : ''}`}
          onMouseDown={moveForward}
          onMouseUp={stopRobot}
          onTouchStart={moveForward}
          onTouchEnd={stopRobot}
          aria-label="Move Forward (W)"
        >
          <ChevronUp size={14} className="dpad-arrow" />
          <span className="dpad-key-label">W</span>
        </button>

        {/* Left / Turn Left Button */}
        <button
          className={`dpad-sector dpad-left ${activeDirection === 'a' ? 'pressed' : ''}`}
          onMouseDown={turnLeft}
          onMouseUp={stopRobot}
          onTouchStart={turnLeft}
          onTouchEnd={stopRobot}
          aria-label="Turn Left (A)"
        >
          <ChevronLeft size={14} className="dpad-arrow" />
          <span className="dpad-key-label">A</span>
        </button>

        {/* Center Keycap */}
        <div className="dpad-center-hub">
          <span className="hub-symbol">⌘ + key</span>
        </div>

        {/* Right / Turn Right Button */}
        <button
          className={`dpad-sector dpad-right ${activeDirection === 'd' ? 'pressed' : ''}`}
          onMouseDown={turnRight}
          onMouseUp={stopRobot}
          onTouchStart={turnRight}
          onTouchEnd={stopRobot}
          aria-label="Turn Right (D)"
        >
          <span className="dpad-key-label">D</span>
          <ChevronRight size={14} className="dpad-arrow" />
        </button>

        {/* Down / Backward Button */}
        <button
          className={`dpad-sector dpad-down ${activeDirection === 's' ? 'pressed' : ''}`}
          onMouseDown={moveBackward}
          onMouseUp={stopRobot}
          onTouchStart={moveBackward}
          onTouchEnd={stopRobot}
          aria-label="Move Backward (S)"
        >
          <span className="dpad-key-label">S</span>
          <ChevronDown size={14} className="dpad-arrow" />
        </button>
      </div>
    </div>
  );
};
