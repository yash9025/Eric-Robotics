export type ViewMode = 'MAP' | 'CAMERA';
export type ControlMode = 'AUTO' | 'MANUAL';
export type SystemStatus = 'Okay' | 'Warning' | 'Error' | 'E-STOP';

export interface RobotPose {
  x: number;
  y: number;
  z: number;
  yaw: number; // in radians
}

export interface RobotTelemetry {
  batteryPercent: number;
  signalStrength: 'Strong' | 'Good' | 'Weak' | 'Offline';
  failsafeStatus: SystemStatus;
  systemStatus: SystemStatus;
  missionId: string;
  isMissionPaused: boolean;
  controlMode: ControlMode;
  isEStopActive: boolean;
  pose: RobotPose;
  linearVelocity: number;
  angularVelocity: number;
}

export interface MapZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface GoalTarget {
  x: number;
  y: number;
  name?: string;
}

