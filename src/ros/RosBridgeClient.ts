import { Ros, Topic } from 'roslib';
import { ROS_TOPICS, type RosConnectionStatus } from './rosTopics';

export interface RosBridgeListeners {
  onStatusChange?: (status: RosConnectionStatus, url: string) => void;
  onOdometry?: (pose: { x: number; y: number; yaw: number }, vLinear: number, vAngular: number) => void;
  onBattery?: (percent: number) => void;
  onCameraFrame?: (base64Image: string) => void;
}

export class RosBridgeClient {
  private ros: Ros | null = null;
  private currentUrl: string = 'ws://localhost:9090';
  private status: RosConnectionStatus = 'simulated';
  private listeners: Set<RosBridgeListeners> = new Set();

  // Topics
  private cmdVelTopic: Topic | null = null;
  private goalTopic: Topic | null = null;
  private estopTopic: Topic | null = null;
  private odomTopic: Topic | null = null;
  private batteryTopic: Topic | null = null;
  private cameraTopic: Topic | null = null;

  // Topic message counters for telemetry diagnostics
  public stats = {
    cmdVelCount: 0,
    odomCount: 0,
    batteryCount: 0,
    cameraCount: 0,
  };

  constructor(initialListeners: RosBridgeListeners = {}) {
    if (Object.keys(initialListeners).length > 0) {
      this.listeners.add(initialListeners);
    }
  }

  public addListener(listener: RosBridgeListeners): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public setListeners(listener: RosBridgeListeners): void {
    this.listeners.add(listener);
  }

  public getStatus(): RosConnectionStatus {
    return this.status;
  }

  public getUrl(): string {
    return this.currentUrl;
  }

  public connect(url: string = 'ws://localhost:9090'): void {
    this.currentUrl = url;
    this.setStatus('connecting');

    try {
      if (this.ros) {
        this.disconnect();
      }

      this.ros = new Ros({
        url: this.currentUrl,
      });

      this.ros.on('connection', () => {
        console.log(`[ROSLib] Connected to ROS Bridge at ${this.currentUrl}`);
        this.setStatus('connected');
        this.initTopics();
      });

      this.ros.on('error', (error: unknown) => {
        console.warn(`[ROSLib] Connection error to ${this.currentUrl}:`, error);
        this.setStatus('simulated');
      });

      this.ros.on('close', () => {
        console.log('[ROSLib] Connection closed');
        if (this.status !== 'simulated') {
          this.setStatus('disconnected');
        }
      });
    } catch (err) {
      console.warn('[ROSLib] Bridge init failure, running in standalone mode:', err);
      this.setStatus('simulated');
    }
  }

  public disconnect(): void {
    if (this.ros) {
      try {
        this.ros.close();
      } catch (e) {
        console.error('Error closing ros connection:', e);
      }
      this.ros = null;
    }
    this.setStatus('simulated');
  }

  private setStatus(status: RosConnectionStatus): void {
    this.status = status;
    for (const listener of this.listeners) {
      listener.onStatusChange?.(status, this.currentUrl);
    }
  }

  private initTopics(): void {
    if (!this.ros) return;

    // 1. Publisher: /cmd_vel
    this.cmdVelTopic = new Topic({
      ros: this.ros,
      name: ROS_TOPICS.CMD_VEL.name,
      messageType: ROS_TOPICS.CMD_VEL.messageType,
    });

    // 2. Publisher: /goal_pose
    this.goalTopic = new Topic({
      ros: this.ros,
      name: ROS_TOPICS.GOAL_POSE.name,
      messageType: ROS_TOPICS.GOAL_POSE.messageType,
    });

    // 3. Publisher: /emergency_stop
    this.estopTopic = new Topic({
      ros: this.ros,
      name: ROS_TOPICS.ESTOP.name,
      messageType: ROS_TOPICS.ESTOP.messageType,
    });

    // 4. Subscriber: /odom
    this.odomTopic = new Topic({
      ros: this.ros,
      name: ROS_TOPICS.ODOMETRY.name,
      messageType: ROS_TOPICS.ODOMETRY.messageType,
    });
    this.odomTopic.subscribe((message: unknown) => {
      this.stats.odomCount++;
      const msg = message as {
        pose?: {
          pose?: {
            position?: { x?: number; y?: number };
            orientation?: { x?: number; y?: number; z?: number; w?: number };
          };
        };
        twist?: {
          twist?: {
            linear?: { x?: number };
            angular?: { z?: number };
          };
        };
      };

      if (msg.pose?.pose) {
        const x = msg.pose.pose.position?.x ?? 0;
        const y = msg.pose.pose.position?.y ?? 0;

        const qz = msg.pose.pose.orientation?.z ?? 0;
        const qw = msg.pose.pose.orientation?.w ?? 1;
        const yaw = 2 * Math.atan2(qz, qw);

        const vLinear = msg.twist?.twist?.linear?.x ?? 0;
        const vAngular = msg.twist?.twist?.angular?.z ?? 0;

        for (const listener of this.listeners) {
          listener.onOdometry?.({ x, y, yaw }, vLinear, vAngular);
        }
      }
    });

    // 5. Subscriber: /battery_state
    this.batteryTopic = new Topic({
      ros: this.ros,
      name: ROS_TOPICS.BATTERY_STATE.name,
      messageType: ROS_TOPICS.BATTERY_STATE.messageType,
    });
    this.batteryTopic.subscribe((message: unknown) => {
      this.stats.batteryCount++;
      const msg = message as { percentage?: number };
      if (typeof msg.percentage === 'number') {
        const pct = msg.percentage <= 1.0 ? Math.round(msg.percentage * 100) : Math.round(msg.percentage);
        for (const listener of this.listeners) {
          listener.onBattery?.(pct);
        }
      }
    });

    // 6. Subscriber: /camera/image_raw/compressed
    this.cameraTopic = new Topic({
      ros: this.ros,
      name: ROS_TOPICS.CAMERA_COMPRESSED.name,
      messageType: ROS_TOPICS.CAMERA_COMPRESSED.messageType,
    });
    this.cameraTopic.subscribe((message: unknown) => {
      this.stats.cameraCount++;
      const msg = message as { data?: string };
      if (msg.data) {
        for (const listener of this.listeners) {
          listener.onCameraFrame?.(msg.data);
        }
      }
    });
  }

  // Publish /cmd_vel
  public publishCmdVel(linear: number, angular: number): void {
    if (this.status !== 'connected' || !this.cmdVelTopic) return;
    this.stats.cmdVelCount++;
    this.cmdVelTopic.publish({
      linear: { x: linear, y: 0.0, z: 0.0 },
      angular: { x: 0.0, y: 0.0, z: angular },
    });
  }

  // Publish /goal_pose
  public publishGoal(x: number, y: number): void {
    if (this.status !== 'connected' || !this.goalTopic) return;
    this.goalTopic.publish({
      header: {
        frame_id: 'map',
        stamp: { secs: Math.floor(Date.now() / 1000), nsecs: 0 },
      },
      pose: {
        position: { x, y, z: 0.0 },
        orientation: { x: 0.0, y: 0.0, z: 0.0, w: 1.0 },
      },
    });
  }

  // Publish /emergency_stop
  public publishEStop(isActive: boolean): void {
    if (this.status !== 'connected' || !this.estopTopic) return;
    this.estopTopic.publish({ data: isActive });
  }
}

// Global Singleton Instance
export const rosBridge = new RosBridgeClient();
