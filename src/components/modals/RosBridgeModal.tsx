import React, { useState, useEffect } from 'react';
import { X, Radio, Activity, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { rosBridge } from '../../ros/RosBridgeClient';
import type { RosConnectionStatus } from '../../ros/rosTopics';
import './Modals.css';

interface RosBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RosBridgeModal: React.FC<RosBridgeModalProps> = ({ isOpen, onClose }) => {
  const [rosUrl, setRosUrl] = useState<string>(rosBridge.getUrl());
  const [status, setStatus] = useState<RosConnectionStatus>(rosBridge.getStatus());
  const [stats, setStats] = useState(rosBridge.stats);

  useEffect(() => {
    const unsub = rosBridge.addListener({
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
      },
    });

    const interval = setInterval(() => {
      setStats({ ...rosBridge.stats });
      setStatus(rosBridge.getStatus());
    }, 400);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  if (!isOpen) return null;

  const handleConnect = () => {
    rosBridge.connect(rosUrl);
  };

  const handleDisconnect = () => {
    rosBridge.disconnect();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card glass-panel-light" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Radio size={20} className="text-accent" />
            <h3>ROS 2 WebSocket Bridge</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Connection State Badge */}
        <div className="ros-status-banner">
          <div className="status-indicator-group">
            {status === 'connected' ? (
              <CheckCircle2 size={18} color="#10B981" />
            ) : status === 'connecting' ? (
              <RefreshCw size={18} className="circular-arrows" color="#F59E0B" />
            ) : status === 'simulated' ? (
              <Activity size={18} color="#3B82F6" />
            ) : (
              <AlertCircle size={18} color="#EF4444" />
            )}
            <div className="status-label-group">
              <span className="status-badge-title">
                {status === 'connected'
                  ? 'Active ROS 2 Bridge Connected'
                  : status === 'connecting'
                  ? 'Connecting to WebSocket...'
                  : status === 'simulated'
                  ? 'Standalone Simulation Engine (Offline)'
                  : 'Disconnected'}
              </span>
              <span className="status-badge-sub font-mono">{rosUrl}</span>
            </div>
          </div>
        </div>

        {/* URL Input */}
        <div className="mission-input-group">
          <label className="input-label">ROSBridge WebSocket Endpoint</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={rosUrl}
              onChange={(e) => setRosUrl(e.target.value)}
              className="mission-input"
              style={{ flex: 1 }}
              placeholder="ws://localhost:9090"
            />
            {status === 'connected' ? (
              <button className="pill-button pill-button-dark" onClick={handleDisconnect}>
                Disconnect
              </button>
            ) : (
              <button className="pill-button pill-button-dark" onClick={handleConnect}>
                Connect
              </button>
            )}
          </div>
        </div>

        {/* Live Topic Diagnostics */}
        <div className="preflight-checklist">
          <span className="checklist-heading">Live Topics & Packet Diagnostics</span>
          
          <div className="check-row">
            <span className="font-mono">/odom (nav_msgs/Odometry)</span>
            <span className="status-ok-text font-mono">{stats.odomCount} pkts</span>
          </div>

          <div className="check-row">
            <span className="font-mono">/cmd_vel (geometry_msgs/Twist)</span>
            <span className="status-ok-text font-mono">{stats.cmdVelCount} pkts</span>
          </div>

          <div className="check-row">
            <span className="font-mono">/battery_state (sensor_msgs/BatteryState)</span>
            <span className="status-ok-text font-mono">{stats.batteryCount} pkts</span>
          </div>
        </div>

        <p className="modal-description" style={{ fontSize: '11px' }}>
          💡 <strong>Offline Evaluation:</strong> If no native ROS 2 core is available, the dashboard runs 100% locally using the internal physics engine. You can also run <code>npm run ros-mock</code> in a separate terminal to test live WebSocket pub/sub!
        </p>

        <div className="modal-footer">
          <button className="pill-button pill-button-light" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
