import React, { useState } from 'react';
import { X, PlayCircle, ShieldCheck, Cpu, Wifi, CheckCircle2 } from 'lucide-react';
import { useRobotState } from '../../context/RobotStateContext';
import './Modals.css';

interface InitiateMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InitiateMissionModal: React.FC<InitiateMissionModalProps> = ({ isOpen, onClose }) => {
  const { telemetry } = useRobotState();
  const [missionName, setMissionName] = useState<string>('Autonomous Inspection Route #1235');
  const [isStarting, setIsStarting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
      setIsStarting(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card glass-panel-light" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <PlayCircle size={18} className="text-accent" />
            <h3>Initiate Mission Sequence</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="mission-input-group">
          <label className="input-label">Mission Designation</label>
          <input
            type="text"
            value={missionName}
            onChange={(e) => setMissionName(e.target.value)}
            className="mission-input"
          />
        </div>

        {/* Pre-flight Diagnostics Checklist */}
        <div className="preflight-checklist">
          <span className="checklist-heading">Pre-Flight Safety Verifications</span>
          
          <div className="check-row">
            <div className="check-title">
              <ShieldCheck size={16} className="text-ok" />
              <span>Failsafe Heartbeat</span>
            </div>
            <span className="check-status status-ok-text">{telemetry.failsafeStatus}</span>
          </div>

          <div className="check-row">
            <div className="check-title">
              <Cpu size={16} className="text-ok" />
              <span>Embedded SLAM Core</span>
            </div>
            <span className="check-status status-ok-text">Calibrated</span>
          </div>

          <div className="check-row">
            <div className="check-title">
              <Wifi size={16} className="text-ok" />
              <span>Telemetry Uplink</span>
            </div>
            <span className="check-status status-ok-text">{telemetry.signalStrength}</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="pill-button pill-button-light" onClick={onClose}>
            Abort
          </button>
          <button className="pill-button pill-button-dark" onClick={handleStart} disabled={isStarting}>
            {isStarting ? (
              <>
                <CheckCircle2 size={14} color="#10B981" /> Launching...
              </>
            ) : (
              'Confirm & Launch ➔'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
