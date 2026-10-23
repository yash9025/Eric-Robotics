import React, { useState } from 'react';
import { X, Navigation, CheckCircle } from 'lucide-react';
import { useRobotState } from '../../context/RobotStateContext';
import './Modals.css';

interface QuickGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const predefinedLocations = [
  { id: 'loc-1', name: 'Workshop Loading Bay A', x: -6, y: -14, eta: '45s' },
  { id: 'loc-2', name: 'Meeting Room Inspection', x: -6, y: 6, eta: '1m 20s' },
  { id: 'loc-3', name: 'Lab Cleanroom Entry', x: 6, y: -4, eta: '2m 10s' },
  { id: 'loc-4', name: 'Rest Area Docking Station', x: 4, y: 16, eta: '3m 05s' },
];

export const QuickGoalModal: React.FC<QuickGoalModalProps> = ({ isOpen, onClose }) => {
  const { setGoal } = useRobotState();
  const [selectedLocation, setSelectedLocation] = useState<string>(predefinedLocations[0].id);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDispatch = () => {
    const loc = predefinedLocations.find((l) => l.id === selectedLocation);
    if (loc) {
      setGoal(loc.x, loc.y, loc.name);
    }
    setIsDispatched(true);
    setTimeout(() => {
      setIsDispatched(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card glass-panel-light" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Navigation size={18} className="text-accent" />
            <h3>Dispatch Quick Goal</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <p className="modal-description">
          Select a pre-mapped target point or click directly on the 3D map canvas to set custom coordinates.
        </p>

        <div className="locations-list">
          {predefinedLocations.map((loc) => (
            <div
              key={loc.id}
              className={`location-item ${selectedLocation === loc.id ? 'selected' : ''}`}
              onClick={() => setSelectedLocation(loc.id)}
            >
              <div className="location-info">
                <span className="location-name">{loc.name}</span>
                <span className="location-coords font-mono">[{loc.x.toFixed(1)}, {loc.y.toFixed(1)}]</span>
              </div>
              <span className="location-eta">ETA {loc.eta}</span>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="pill-button pill-button-light" onClick={onClose}>
            Cancel
          </button>
          <button className="pill-button pill-button-dark" onClick={handleDispatch} disabled={isDispatched}>
            {isDispatched ? (
              <>
                <CheckCircle size={14} color="#10B981" /> Dispatched!
              </>
            ) : (
              'Dispatch Rover ➔'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
