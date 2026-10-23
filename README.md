# 🤖 ERIC Robotics — Insight.IO Mission Control Dashboard

> A high-performance, self-hosted Autonomous Mobile Robot (AMR) mission control dashboard reproducing the **Insight.IO** interface. Built with React 19, TypeScript, Three.js (3D SLAM PCD Point Cloud), and native ROS 2 WebSocket Bridge (`roslibjs`).

[![React](https://img.shields.io/badge/React-19.3.1-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.186.1-black.svg?logo=three.js)](https://threejs.org/)
[![ROS 2](https://img.shields.io/badge/ROS%202-Humble%20%7C%20Iron%20%7C%20Jazzy-orange.svg?logo=ros)](https://docs.ros.org/)
[![Self-Hosted](https://img.shields.io/badge/Self--Hosted-100%25%20Offline-success.svg)](http://localhost:5173)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 🌟 Overview & Objectives

This project is a faithful, production-grade recreation of the **ERIC Robotics Insight.IO** dashboard showcased in `demo.gif`. It meets all assignment specifications:
- **3D SLAM Map View**: Interactive Three.js scene rendering an occupancy grid, extruded walls, pink warehouse zones (*Meeting Room*, *Workshop*, *Lab Cleanroom*, *Rest Area*), billboarded text, and a `.pcd` point cloud with red LiDAR obstacle clusters.
- **Camera Feed View**: High-throughput optical camera stream with crosshair HUD, telemetry overlay, and a codec-agnostic canvas frame streamer ensuring 100% offline playback.
- **Picture-in-Picture (PiP) Swap Engine**: Smooth 450ms cubic-bezier transition between the 3D Map and Camera feed, accessible via the bottom-left thumbnail card or the top mode switcher.
- **Industrial Teleoperation**: Responsive 4-axis D-Pad and full keyboard binding (`W`, `A`, `S`, `D` and arrow keys) publishing `/cmd_vel` velocity twists.
- **Emergency Stop Safety Latch**: Industrial E-Stop button with safety latching, full-viewport flashing hazard border, and hardware de-energization banner.
- **Dual-Mode Data Architecture**: Runs 100% offline out-of-the-box using an internal kinematic physics engine, while supporting live connection to ROS 2 via `ws://localhost:9090`.

---

## 📸 Visual Previews

| **1. 3D SLAM Map & PCD Point Cloud** | **2. Camera View & PiP Swap Engine** |
| :---: | :---: |
| ![3D SLAM Dashboard](docs/screenshots/01_dashboard_3d_map.png) | ![Camera View Primary](docs/screenshots/02_camera_pip_swap.png) |

| **3. Live ROS 2 Bridge WebSocket Diagnostics** | **4. Quick Goal Trajectory Dispatch** |
| :---: | :---: |
| ![ROS 2 Bridge Connected](docs/screenshots/03_ros2_bridge_connected.png) | ![Quick Goal Navigation](docs/screenshots/04_quick_goal_trajectory.png) |

<p align="center">
  <em><strong>5. Industrial Safety Emergency Stop (Hardware Latch & Flashing Hazard Border)</strong></em><br/>
  <img src="docs/screenshots/05_estop_hazard_latch.png" width="85%" alt="E-Stop Hazard Latch" />
</p>

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       INSIGHT.IO DASHBOARD ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────┐    ┌──────────────────────────────────────────────┐
  │   Sidebar (Nav)   │    │            Top Telemetry Capsule             │
  │  - Dashboard Icon │    │  - Battery % | Signal/ROS Link | Failsafe    │
  │  - Maps / Zones   │    │  - System Health | [Map View | Camera View]  │
  │  - Teleoperation  │    └──────────────────────────────────────────────┘
  └───────────────────┘                           │
            │                                     ▼
            │               ┌──────────────────────────────────────────────┐
            ├──────────────►│         ViewportContainer (PiP Engine)       │
            │               │  ┌────────────────────┐ ┌──────────────────┐ │
            │               │  │   Primary Stage    │ │  PiP Thumbnail   │ │
            │               │  │  (3D Map / Camera) │ │  (Bottom-Left)   │ │
            │               │  └────────────────────┘ └──────────────────┘ │
            │               └──────────────────────────────────────────────┘
            │                                     ▲
            │         ┌───────────────────────────┴────────────────────────┐
            ▼         ▼                                                    ▼
  ┌─────────────────────────┐                            ┌────────────────────────┐
  │   Three.js 3D SLAM      │                            │  Camera Feed Canvas    │
  │ - SceneManager (Orbit)  │                            │ - 30 FPS Streamer      │
  │ - GridMapMesh (Zones)   │                            │ - Reticle HUD Overlay  │
  │ - PCDVisualizer (.pcd)  │                            │ - Zero Codec Fallback  │
  │ - RobotMarker (Heading) │                            └────────────────────────┘
  └─────────────────────────┘
            ▲
            │
  ┌────────────────────────────────────────────────────────────────────────────┐
  │                     RobotStateContext (State Bus)                          │
  │  - Pose (x, y, yaw)  - Velocities (v, ω)  - E-Stop Latch  - Goal Tracking  │
  └────────────────────────────────────────────────────────────────────────────┘
            ▲                                     ▲
            │ (Simulated Loop)                    │ (Live Bridge)
  ┌─────────────────────────┐           ┌──────────────────────────────────────┐
  │ Local Kinematic Engine  │           │   RosBridgeClient (roslibjs)         │
  │ - Autonomous Wander     │           │ - Topics: /odom, /cmd_vel, /battery  │
  │ - Waypoint Navigation   │           │ - Endpoint: ws://localhost:9090      │
  └─────────────────────────┘           └──────────────────────────────────────┘
                                                          ▲
                                                          │ WebSocket
                                        ┌──────────────────────────────────────┐
                                        │ Native ROS 2 Core OR npm run ros-mock│
                                        └──────────────────────────────────────┘
```

---

## 🚀 Quick Start (Self-Hosting)

You can launch the dashboard using any of the following 4 self-hosted methods:

### Method 1: Local Development Server (Recommended)
Prerequisites: Node.js 18+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev

# Dashboard opens at: http://localhost:5173
```

### Method 2: Single-Command Docker Compose
Prerequisites: Docker and Docker Compose.

```bash
# Launch both Dashboard (port 3000) and Mock ROS 2 Bridge (port 9090)
docker compose up --build

# Open browser at: http://localhost:3000
```

### Method 3: Production Static Build (Python / Nginx / Node)

```bash
# Build production bundle
npm run build

# Serve statically via Python
python -m http.server 3000 --directory dist

# Or serve via Node npx
npx serve dist -p 3000

# Open browser at: http://localhost:3000
```

### Method 4: Launching with Live ROS 2 Mock Bridge

```bash
# In terminal 1: Start mock ROS 2 WebSocket bridge
npm run ros-mock

# In terminal 2: Start frontend dashboard
npm run dev

# In the dashboard, click the top signal pill to open the ROS Bridge modal and click "Connect".
```

---

## 📡 ROS 2 Integration & Topics

The dashboard integrates with ROS 2 using `roslib` over standard WebSocket (`rosbridge_websocket` on port 9090).

### Supported Topics

| Topic | ROS Message Type | Direction | Description |
| :--- | :--- | :---: | :--- |
| `/odom` | `nav_msgs/Odometry` | Sub | Updates AMR 3D position $(x, y)$ and yaw orientation in Three.js |
| `/battery_state` | `sensor_msgs/BatteryState` | Sub | Live battery percentage and discharge telemetry in top capsule |
| `/camera/image_raw/compressed` | `sensor_msgs/CompressedImage` | Sub | Subscribes to live JPEG/PNG camera stream from robot camera |
| `/cmd_vel` | `geometry_msgs/Twist` | Pub | Linear ($x$) and angular ($z$) velocity commands from Teleop D-Pad |
| `/goal_pose` | `geometry_msgs/PoseStamped` | Pub | Dispatches coordinate goal targets from Quick Goal modal |
| `/emergency_stop` | `std_msgs/Bool` | Pub | Publishes `true`/`false` hardware safety latch command |

### Connecting to a Native ROS 2 Robot

If you have a native ROS 2 distribution (Humble, Iron, or Jazzy) installed:

```bash
# 1. Install rosbridge suite
sudo apt-get install ros-${ROS_DISTRO}-rosbridge-suite

# 2. Launch WebSocket Bridge
ros2 launch rosbridge_server rosbridge_websocket_launch.xml

# 3. (Optional) Play recorded rosbag file
ros2 bag play my_warehouse_run.db3

# 4. In the dashboard, click the Signal pill at top, verify ws://localhost:9090, and click "Connect"
```

---

## 🎮 Key Dashboard Features

### 1. Interactive 3D SLAM Map & PCD Point Cloud
- **Three.js Isometric Scene**: Restricted OrbitControls prevent disorientation while allowing smooth panning, orbiting, and zooming.
- **PCD Point Cloud**: Loaded via `PCDLoader` reading [`public/assets/warehouse_slam.pcd`](file:///c:/Users/YASH/Desktop/Eric%20Robotics/public/assets/warehouse_slam.pcd) with red LiDAR obstacle return points along corridor walls.
- **Extruded 3D Floor Plan**: Perimeter walls, door frames, and translucent pink zones (*Workshop*, *Meeting Room*, *Lab Cleanroom*, *Rest Area*) with billboard text.
- **Dynamic 3D Rover**: Chassis, wheels, rotating LiDAR turret, heading vector, and animated ping beacons.

### 2. Camera Feed & PiP Swap Engine
- **Codec-Resilient Video Pipeline**: Streams offline 30 FPS extracted camera frames with zero external codec requirements.
- **Crosshair Reticle HUD**: Optical targeting frame displaying active sensor pose (yaw, pitch, roll) and frame latency.
- **PiP Swap Transition**: Click the bottom-left thumbnail card or the top `Map View` / `Camera View` pill to smoothly swap primary and thumbnail views in 450ms.

### 3. Industrial Teleoperation & Safety Latch
- **D-Pad Controls**: 4-axis control pad with directional buttons for mouse click/touch.
- **Keyboard Listeners**: `W`/`S` (Forward/Reverse), `A`/`D` (Steer Left/Right), or Arrow keys.
- **Safety E-Stop**: Yellow ring industrial button. Clicking trips the safety latch, flashes a red viewport hazard border, de-energizes motor drive, and notifies hardware over `/emergency_stop`.

### 4. Interactive Mission Controls
- **Quick Goal**: Modal dialog allowing coordinates dispatch (`Workshop`, `Lab`, `Meeting Room`, `Rest Area`, or custom $X, Y$) with 3D cone marker and dashed trajectory line.
- **Initiate Mission**: Preflight safety verification checklist with mission start dispatch.
- **Mode Toggle**: Switch between `AUTO` (autonomous patrol) and `MANUAL` (teleoperation override).

---

## 📁 Repository Structure

```
Eric Robotics/
├── public/
│   └── assets/
│       ├── camera_frames/          # 35 pristine JPEG frames for 100% offline camera
│       ├── robot_feed.mp4          # Extracted warehouse video feed
│       ├── warehouse_slam.pcd      # 3D LiDAR point cloud (.pcd)
│       ├── warehouse_map.png       # 2D SLAM occupancy grid
│       └── robot_logo.svg          # ERIC Robotics vector logo
├── server/
│   └── mock_ros_bridge.js          # Standalone Node.js ROS 2 WebSocket Bridge (port 9090)
├── src/
│   ├── components/
│   │   ├── controls/               # EmergencyStopButton, TeleopDPad, EmergencyHazardOverlay
│   │   ├── layout/                 # Sidebar, TopTelemetryBar, MissionControlOverlay, ZoomSlider
│   │   ├── modals/                 # QuickGoalModal, InitiateMissionModal, RosBridgeModal
│   │   └── viewport/               # ViewportContainer (PiP), Map3DView, CameraFeedView, PiPThumbnail
│   ├── context/
│   │   └── RobotStateContext.tsx   # Global state bus, dead reckoning, and ROS Bridge link
│   ├── ros/
│   │   ├── rosTopics.ts            # ROS 2 message definitions & topic schemas
│   │   └── RosBridgeClient.ts      # Multi-subscriber roslibjs WebSocket client
│   ├── three/
│   │   ├── SceneManager.ts         # Three.js isometric renderer and OrbitControls
│   │   ├── GridMapMesh.ts          # Extruded walls, floor grid, and labeled pink zones
│   │   ├── PCDVisualizer.ts        # Three.js PCDLoader LiDAR point cloud visualizer
│   │   └── RobotMarker.ts          # 3D AMR rover model, LiDAR turret, and heading arrow
│   ├── types/                      # TypeScript telemetry, viewport, and modal definitions
│   ├── App.tsx                     # Main dashboard layout
│   ├── index.css                   # Design tokens, glassmorphism, typography, and animations
│   └── main.tsx                    # React DOM entry point
├── Dockerfile                      # Multi-stage production Docker container
├── docker-compose.yml              # Single-command full ecosystem launcher
├── nginx.conf                      # High-performance Nginx static server configuration
├── package.json                    # Project dependencies and npm scripts
└── README.md                       # Comprehensive project documentation
```

---

## 🧪 Verification & Evaluation Checklist

- [x] **Exact UI/UX Match**: Recreates sidebar, top floating capsule, mission pods, zoom slider, 3D map, and teleop controls from `demo.gif`.
- [x] **3D Map with PCD Point Cloud**: Loads and displays `.pcd` LiDAR points with OrbitControls, extruded walls, and warehouse zone overlays.
- [x] **Camera Stream & PiP Swap**: Real-time video with smooth 450ms swap transition between primary and thumbnail viewports.
- [x] **Teleoperation & Safety**: D-pad and keyboard controls dispatching velocity twists; safety-latched E-Stop with hazard border.
- [x] **ROS 2 WebSocket Bridge**: Full `roslibjs` client supporting `/odom`, `/cmd_vel`, `/battery_state`, `/goal_pose`, and `/emergency_stop`.
- [x] **100% Offline Self-Hosting**: Zero CDN dependencies; self-contained fonts, SVGs, 3D assets, point clouds, and video frames.
- [x] **Multi-Platform Deployment**: Tested and verified on Vite local dev server, Python static server, and Docker container.

---

## 👥 Authors & Acknowledgments

- **Author**: Candidate for ERIC Robotics Software Engineering Assignment.
- **Reference**: ERIC Robotics Insight.IO Dashboard Design Specification.
