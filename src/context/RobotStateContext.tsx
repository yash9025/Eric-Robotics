import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { RobotTelemetry, ViewMode, ControlMode, RobotPose, GoalTarget } from '../types';
import { rosBridge } from '../ros/RosBridgeClient';
import type { RosConnectionStatus } from '../ros/rosTopics';

interface RobotStateContextType {
  telemetry: RobotTelemetry;
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  toggleView: () => void;
  setControlMode: (mode: ControlMode) => void;
  toggleMissionPause: () => void;
  triggerEStop: () => void;
  resetEStop: () => void;
  sendVelocityCommand: (linear: number, angular: number) => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number | ((prev: number) => number)) => void;
  activeGoal: GoalTarget | null;
  setGoal: (x: number, y: number, name?: string) => void;
  cancelGoal: () => void;
  rosStatus: RosConnectionStatus;
  connectRos: (url?: string) => void;
  disconnectRos: () => void;
}

const initialPose: RobotPose = {
  x: 0,
  y: 0,
  z: 0.1,
  yaw: 0,
};

const initialTelemetry: RobotTelemetry = {
  batteryPercent: 100,
  signalStrength: 'Strong',
  failsafeStatus: 'Okay',
  systemStatus: 'Okay',
  missionId: 'On Mission 1234',
  isMissionPaused: false,
  controlMode: 'AUTO',
  isEStopActive: false,
  pose: initialPose,
  linearVelocity: 0,
  angularVelocity: 0,
};

// Default autonomous patrol loop (visiting each room sequentially)
const patrolWaypoints: GoalTarget[] = [
  { x: -6, y: -14, name: 'Workshop' },
  { x: -6, y: 6, name: 'Meeting Room' },
  { x: 4, y: 16, name: 'Rest Area' },
  { x: 6, y: -4, name: 'Lab Cleanroom' },
  { x: 0, y: 0, name: 'Central Depot' },
];

const RobotStateContext = createContext<RobotStateContextType | null>(null);

export const RobotStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [telemetry, setTelemetry] = useState<RobotTelemetry>(initialTelemetry);
  const [activeView, setActiveView] = useState<ViewMode>('MAP');
  const [zoomLevel, setZoomLevel] = useState<number>(50); // 0 to 100 slider scale
  const [activeGoal, setActiveGoal] = useState<GoalTarget | null>(null);

  const patrolIndexRef = useRef<number>(0);

  // Toggle between 3D Map View and Camera View
  const toggleView = useCallback(() => {
    setActiveView((prev) => (prev === 'MAP' ? 'CAMERA' : 'MAP'));
  }, []);

  // Toggle Auto / Manual mode
  const setControlMode = useCallback((mode: ControlMode) => {
    setTelemetry((prev) => ({ ...prev, controlMode: mode }));
  }, []);

  // Toggle mission pause/resume
  const toggleMissionPause = useCallback(() => {
    setTelemetry((prev) => ({
      ...prev,
      isMissionPaused: !prev.isMissionPaused,
    }));
  }, []);

  const [rosStatus, setRosStatus] = useState<RosConnectionStatus>(rosBridge.getStatus());

  // ROS Bridge Listeners setup
  useEffect(() => {
    const unsub = rosBridge.addListener({
      onStatusChange: (status) => {
        setRosStatus(status);
      },
      onOdometry: (pose, vLinear, vAngular) => {
        setTelemetry((prev) => ({
          ...prev,
          pose: { ...prev.pose, x: pose.x, y: pose.y, yaw: pose.yaw },
          linearVelocity: vLinear,
          angularVelocity: vAngular,
        }));
      },
      onBattery: (percent) => {
        setTelemetry((prev) => ({ ...prev, batteryPercent: percent }));
      },
    });

    return () => unsub();
  }, []);

  const connectRos = useCallback((url?: string) => {
    rosBridge.connect(url);
  }, []);

  const disconnectRos = useCallback(() => {
    rosBridge.disconnect();
  }, []);

  // Emergency Stop Latch
  const triggerEStop = useCallback(() => {
    rosBridge.publishEStop(true);
    setTelemetry((prev) => ({
      ...prev,
      isEStopActive: true,
      failsafeStatus: 'E-STOP',
      linearVelocity: 0,
      angularVelocity: 0,
    }));
  }, []);

  const resetEStop = useCallback(() => {
    rosBridge.publishEStop(false);
    setTelemetry((prev) => ({
      ...prev,
      isEStopActive: false,
      failsafeStatus: 'Okay',
    }));
  }, []);

  // Set explicit goal target
  const setGoal = useCallback((x: number, y: number, name?: string) => {
    rosBridge.publishGoal(x, y);
    setActiveGoal({ x, y, name });
    setTelemetry((prev) => ({
      ...prev,
      controlMode: 'AUTO',
      isMissionPaused: false,
    }));
  }, []);

  const cancelGoal = useCallback(() => {
    setActiveGoal(null);
  }, []);

  // Teleoperation velocity command (manual steering)
  const sendVelocityCommand = useCallback((linear: number, angular: number) => {
    rosBridge.publishCmdVel(linear, angular);

    setTelemetry((prev) => {
      if (prev.isEStopActive) return prev; // Cannot move when E-Stop is active

      if (rosStatus === 'connected') {
        // When ROS is active, /odom updates position directly from robot kinematics
        return {
          ...prev,
          linearVelocity: linear,
          angularVelocity: angular,
        };
      }

      const dt = 0.1;
      const newYaw = prev.pose.yaw + angular * dt;
      const newX = prev.pose.x + linear * Math.cos(newYaw) * dt * 4;
      const newY = prev.pose.y + linear * Math.sin(newYaw) * dt * 4;

      return {
        ...prev,
        linearVelocity: linear,
        angularVelocity: angular,
        pose: {
          ...prev.pose,
          x: newX,
          y: newY,
          yaw: newYaw,
        },
      };
    });
  }, [rosStatus]);

  // Autonomous Navigation Physics Engine (Runs when in AUTO mode, not paused, and standalone mode)
  useEffect(() => {
    const loopInterval = setInterval(() => {
      setTelemetry((prev) => {
        // If ROS is connected, robot motion is driven by ROS /odom topics
        if (rosStatus === 'connected') {
          return prev;
        }

        // If E-Stop is active or mission is paused or in manual mode, no autonomous steering
        if (prev.isEStopActive || prev.isMissionPaused || prev.controlMode !== 'AUTO') {
          return prev;
        }

        // Determine current target (either user set goal or patrol waypoint)
        const target = activeGoal || patrolWaypoints[patrolIndexRef.current];
        if (!target) return prev;

        const dx = target.x - prev.pose.x;
        const dy = target.y - prev.pose.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Waypoint reached condition
        if (dist < 0.6) {
          if (activeGoal) {
            setActiveGoal(null); // Explicit goal achieved!
          } else {
            // Cycle to next patrol point
            patrolIndexRef.current = (patrolIndexRef.current + 1) % patrolWaypoints.length;
          }
          return {
            ...prev,
            linearVelocity: 0,
            angularVelocity: 0,
          };
        }

        // Compute heading angle to target
        const targetAngle = Math.atan2(dy, dx);
        let angleDiff = targetAngle - prev.pose.yaw;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        const maxAngular = 1.2;
        const angular = Math.max(-maxAngular, Math.min(maxAngular, angleDiff * 2.0));
        
        // Slow down when turning sharply
        const linear = Math.abs(angleDiff) > 0.6 ? 0.2 : 0.8;

        const dt = 0.05; // 50ms timestep
        const newYaw = prev.pose.yaw + angular * dt;
        const newX = prev.pose.x + linear * Math.cos(newYaw) * dt * 3.2;
        const newY = prev.pose.y + linear * Math.sin(newYaw) * dt * 3.2;

        return {
          ...prev,
          linearVelocity: Math.round(linear * 100) / 100,
          angularVelocity: Math.round(angular * 100) / 100,
          pose: {
            ...prev.pose,
            x: newX,
            y: newY,
            yaw: newYaw,
          },
        };
      });
    }, 50);

    return () => clearInterval(loopInterval);
  }, [activeGoal, rosStatus]);

  // Ambient telemetry discharge
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const nextBattery = Math.max(12, prev.batteryPercent - (prev.linearVelocity !== 0 ? 0.04 : 0.005));
        return {
          ...prev,
          batteryPercent: Math.round(nextBattery * 10) / 10,
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <RobotStateContext.Provider
      value={{
        telemetry,
        activeView,
        setActiveView,
        toggleView,
        setControlMode,
        toggleMissionPause,
        triggerEStop,
        resetEStop,
        sendVelocityCommand,
        zoomLevel,
        setZoomLevel,
        activeGoal,
        setGoal,
        cancelGoal,
        rosStatus,
        connectRos,
        disconnectRos,
      }}
    >
      {children}
    </RobotStateContext.Provider>
  );
};

export const useRobotState = (): RobotStateContextType => {
  const context = useContext(RobotStateContext);
  if (!context) {
    throw new Error('useRobotState must be used within a RobotStateProvider');
  }
  return context;
};
