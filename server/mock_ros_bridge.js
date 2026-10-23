/**
 * Standalone Mock ROS 2 Bridge Server for ERIC Robotics Insight.IO
 * Protocol: rosbridge_v2.0 JSON over WebSocket
 * Port: 9090 (Default rosbridge_server port)
 *
 * Simulates:
 * - /odom (nav_msgs/Odometry) at 20 Hz
 * - /battery_state (sensor_msgs/BatteryState) at 1 Hz
 * - /cmd_vel (geometry_msgs/Twist) subscriber & physics loop
 * - /goal_pose (geometry_msgs/PoseStamped)
 * - /emergency_stop (std_msgs/Bool)
 */

import { WebSocketServer } from 'ws';

const PORT = 9090;
const wss = new WebSocketServer({ port: PORT });

console.log(`====================================================`);
console.log(`🤖 ERIC Robotics — Mock ROS 2 WebSocket Bridge`);
console.log(`📡 Listening on: ws://localhost:${PORT}`);
console.log(`📋 Emulating ROS 2 nodes & /cmd_vel kinematics`);
console.log(`====================================================\n`);

// Simulated Robot State
const robot = {
  x: 0.0,
  y: 0.0,
  yaw: 0.0,
  linearVel: 0.0,
  angularVel: 0.0,
  battery: 0.99,
  isEStop: false,
};

const subscriptions = new Set(); // topic names that clients subscribed to

wss.on('connection', (ws) => {
  console.log(`[+] Client connected from ${ws._socket.remoteAddress}`);

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      
      if (msg.op === 'subscribe') {
        subscriptions.add(msg.topic);
        console.log(`[SUB] Client subscribed to ${msg.topic}`);
      } else if (msg.op === 'unsubscribe') {
        subscriptions.delete(msg.topic);
        console.log(`[UNSUB] Client unsubscribed from ${msg.topic}`);
      } else if (msg.op === 'publish') {
        if (msg.topic === '/cmd_vel') {
          if (!robot.isEStop) {
            robot.linearVel = msg.msg.linear?.x || 0;
            robot.angularVel = msg.msg.angular?.z || 0;
            console.log(`[CMD_VEL] Linear: ${robot.linearVel.toFixed(2)} m/s, Angular: ${robot.angularVel.toFixed(2)} rad/s`);
          }
        } else if (msg.topic === '/emergency_stop') {
          robot.isEStop = msg.msg.data;
          if (robot.isEStop) {
            robot.linearVel = 0;
            robot.angularVel = 0;
            console.log(`[E-STOP] ⚠️ Hardware Emergency Stop Triggered!`);
          } else {
            console.log(`[E-STOP] 🟢 Safety Interlock Released.`);
          }
        } else if (msg.topic === '/goal_pose') {
          console.log(`[GOAL] New Goal received at [${msg.msg.pose?.position?.x}, ${msg.msg.pose?.position?.y}]`);
        }
      }
    } catch (err) {
      console.error('Error parsing client message:', err);
    }
  });

  ws.on('close', () => {
    console.log(`[-] Client disconnected`);
  });
});

// Broadcast helper
function broadcast(topic, type, msg) {
  const packet = JSON.stringify({
    op: 'publish',
    topic,
    type,
    msg,
  });

  for (const client of wss.clients) {
    if (client.readyState === 1) { // OPEN
      client.send(packet);
    }
  }
}

// 20 Hz Kinematic & Odometry Loop
setInterval(() => {
  const dt = 0.05;

  if (!robot.isEStop && (robot.linearVel !== 0 || robot.angularVel !== 0)) {
    robot.yaw += robot.angularVel * dt;
    robot.x += robot.linearVel * Math.cos(robot.yaw) * dt * 3.5;
    robot.y += robot.linearVel * Math.sin(robot.yaw) * dt * 3.5;
  }

  // Publish /odom
  const qz = Math.sin(robot.yaw / 2);
  const qw = Math.cos(robot.yaw / 2);

  broadcast('/odom', 'nav_msgs/Odometry', {
    header: {
      stamp: { secs: Math.floor(Date.now() / 1000), nsecs: 0 },
      frame_id: 'odom',
    },
    child_frame_id: 'base_link',
    pose: {
      pose: {
        position: { x: robot.x, y: robot.y, z: 0.0 },
        orientation: { x: 0.0, y: 0.0, z: qz, w: qw },
      },
    },
    twist: {
      twist: {
        linear: { x: robot.linearVel, y: 0.0, z: 0.0 },
        angular: { x: 0.0, y: 0.0, z: robot.angularVel },
      },
    },
  });
}, 50);

// 1 Hz Battery State
setInterval(() => {
  if (robot.linearVel !== 0) {
    robot.battery = Math.max(0.1, robot.battery - 0.0005);
  }
  broadcast('/battery_state', 'sensor_msgs/BatteryState', {
    percentage: robot.battery,
    voltage: 24.2,
    present: true,
  });
}, 1000);
