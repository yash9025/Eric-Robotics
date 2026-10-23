export const ROS_TOPICS = {
  // Teleoperation & Actuation
  CMD_VEL: {
    name: '/cmd_vel',
    messageType: 'geometry_msgs/Twist',
  },
  // Navigation & Localization
  ODOMETRY: {
    name: '/odom',
    messageType: 'nav_msgs/Odometry',
  },
  GOAL_POSE: {
    name: '/goal_pose',
    messageType: 'geometry_msgs/PoseStamped',
  },
  MOVE_BASE_GOAL: {
    name: '/move_base_simple/goal',
    messageType: 'geometry_msgs/PoseStamped',
  },
  // Sensors & Diagnostics
  BATTERY_STATE: {
    name: '/battery_state',
    messageType: 'sensor_msgs/BatteryState',
  },
  LASER_SCAN: {
    name: '/scan',
    messageType: 'sensor_msgs/LaserScan',
  },
  CAMERA_COMPRESSED: {
    name: '/camera/image_raw/compressed',
    messageType: 'sensor_msgs/CompressedImage',
  },
  ESTOP: {
    name: '/emergency_stop',
    messageType: 'std_msgs/Bool',
  },
} as const;

export type RosConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'simulated';
