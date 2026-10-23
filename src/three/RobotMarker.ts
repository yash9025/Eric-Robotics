import * as THREE from 'three';

export interface WaypointCoord {
  id: string;
  x: number;
  z: number;
}

const sampleWaypoints: WaypointCoord[] = [
  { id: 'wp-1', x: -8, z: -18 },
  { id: 'wp-2', x: 0, z: -12 },
  { id: 'wp-3', x: 6, z: -20 },
  { id: 'wp-4', x: -5, z: 2 },
  { id: 'wp-5', x: 7, z: 2 },
  { id: 'wp-6', x: 5, z: 12 },
  { id: 'wp-7', x: -7, z: 18 },
];

export class RobotMarker {
  public group: THREE.Group;
  private robotMeshGroup: THREE.Group;
  private lidarRays: THREE.LineSegments | null = null;
  private waypointGroup: THREE.Group;
  private pulseRings: THREE.Mesh[] = [];
  private goalGroup: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.robotMeshGroup = new THREE.Group();
    this.waypointGroup = new THREE.Group();
    this.goalGroup = new THREE.Group();

    this.buildRobotMesh();
    this.buildWaypoints();

    this.group.add(this.robotMeshGroup);
    this.group.add(this.waypointGroup);
    this.group.add(this.goalGroup);
  }

  private buildRobotMesh(): void {
    // 1. Chassis Base
    const chassisGeo = new THREE.BoxGeometry(1.6, 0.45, 2.2);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      roughness: 0.3,
      metalness: 0.8,
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.45;
    chassis.castShadow = true;
    this.robotMeshGroup.add(chassis);

    // Front Bumper Highlight
    const bumperGeo = new THREE.BoxGeometry(1.64, 0.15, 0.3);
    const bumperMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      emissive: 0x0284C7,
      emissiveIntensity: 0.6,
    });
    const bumper = new THREE.Mesh(bumperGeo, bumperMat);
    bumper.position.set(0, 0.45, -1.05);
    this.robotMeshGroup.add(bumper);

    // 2. 4 Heavy Duty Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.8 });
    
    const wheelPositions = [
      [-0.9, 0.35, -0.75],
      [0.9, 0.35, -0.75],
      [-0.9, 0.35, 0.75],
      [0.9, 0.35, 0.75],
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      this.robotMeshGroup.add(wheel);
    });

    // 3. Central LiDAR Puck
    const lidarGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.35, 24);
    const lidarMat = new THREE.MeshStandardMaterial({
      color: 0x0A0F1D,
      metalness: 0.9,
      roughness: 0.1,
    });
    const lidar = new THREE.Mesh(lidarGeo, lidarMat);
    lidar.position.set(0, 0.85, 0);
    this.robotMeshGroup.add(lidar);

    // Active LiDAR Scan Ray Cone
    const rayGeo = new THREE.BufferGeometry();
    const rayPoints: number[] = [];
    const numRays = 16;
    for (let i = 0; i < numRays; i++) {
      const ang = (i / numRays) * Math.PI * 2;
      rayPoints.push(0, 0.85, 0);
      rayPoints.push(Math.cos(ang) * 4, 0.85, Math.sin(ang) * 4);
    }
    rayGeo.setAttribute('position', new THREE.Float32BufferAttribute(rayPoints, 3));
    const rayMat = new THREE.LineBasicMaterial({
      color: 0xEF4444,
      transparent: true,
      opacity: 0.35,
    });
    this.lidarRays = new THREE.LineSegments(rayGeo, rayMat);
    this.robotMeshGroup.add(this.lidarRays);

    // 4. Wi-Fi Antenna & 2D Icon Billboard (identical to demo)
    const billboard = this.createRobotBillboard();
    billboard.position.set(0, 2.2, 0);
    this.robotMeshGroup.add(billboard);

    // 5. Directional Heading Arrow on ground
    const dirArrowGeo = new THREE.ConeGeometry(0.4, 0.9, 3);
    const dirArrowMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });
    const dirArrow = new THREE.Mesh(dirArrowGeo, dirArrowMat);
    dirArrow.rotation.x = -Math.PI / 2;
    dirArrow.position.set(0, 0.04, -1.8);
    this.robotMeshGroup.add(dirArrow);
  }

  private createRobotBillboard(): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 128, 128);

    // Draw Wi-Fi Waves
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(64, 30, 14, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(64, 30, 24, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();

    // Antenna Pole
    ctx.beginPath();
    ctx.moveTo(64, 36);
    ctx.lineTo(64, 52);
    ctx.stroke();

    // Rover Silhouette
    ctx.fillStyle = '#0F172A';
    // Chassis
    ctx.roundRect(32, 52, 64, 36, 6);
    ctx.fill();

    // Wheels
    ctx.beginPath();
    ctx.arc(42, 92, 10, 0, Math.PI * 2);
    ctx.arc(86, 92, 10, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(2.2, 2.2, 1);
    return sprite;
  }

  private buildWaypoints(): void {
    const ringGeo = new THREE.RingGeometry(0.5, 0.7, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });

    sampleWaypoints.forEach((wp) => {
      const pinGroup = new THREE.Group();
      pinGroup.position.set(wp.x, 0.03, wp.z);

      // Floor Pulsing Ring
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      pinGroup.add(ring);
      this.pulseRings.push(ring);

      // Waypoint Beacon Icon
      const beaconGeo = new THREE.CylinderGeometry(0.12, 0.25, 0.8, 16);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x3B82F6,
        roughness: 0.2,
        metalness: 0.6,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 0.4;
      pinGroup.add(beacon);

      this.waypointGroup.add(pinGroup);
    });
  }

  public updatePose(x: number, y: number, yaw: number): void {
    // In Three.js: X is horizontal, Z is depth, Y is up
    this.robotMeshGroup.position.set(x, 0, y);
    // Rotate around vertical Y axis
    this.robotMeshGroup.rotation.y = -yaw;

    // Slowly spin LiDAR rays
    if (this.lidarRays) {
      this.lidarRays.rotation.y += 0.08;
    }
  }

  public animateBeacons(time: number): void {
    // Animate subtle pulsing on waypoint rings
    const scale = 1 + Math.sin(time * 3) * 0.15;
    this.pulseRings.forEach((ring) => {
      ring.scale.set(scale, scale, 1);
    });
  }

  public updateGoal(goal: { x: number; y: number } | null, robotPos: { x: number; y: number }): void {
    this.goalGroup.clear();
    if (!goal) return;

    // 1. Goal Beacon Target Ring
    const goalRingGeo = new THREE.RingGeometry(0.8, 1.1, 32);
    const goalRingMat = new THREE.MeshBasicMaterial({
      color: 0x10B981,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const goalRing = new THREE.Mesh(goalRingGeo, goalRingMat);
    goalRing.rotation.x = -Math.PI / 2;
    goalRing.position.set(goal.x, 0.04, goal.y);
    this.goalGroup.add(goalRing);

    // Goal Target Cone
    const coneGeo = new THREE.ConeGeometry(0.4, 1.2, 16);
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0x10B981,
      roughness: 0.2,
      emissive: 0x059669,
      emissiveIntensity: 0.5,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(goal.x, 0.6, goal.y);
    this.goalGroup.add(cone);

    // 2. Navigation Trajectory Line
    const points = [
      new THREE.Vector3(robotPos.x, 0.05, robotPos.y),
      new THREE.Vector3(goal.x, 0.05, goal.y),
    ];
    const pathGeo = new THREE.BufferGeometry().setFromPoints(points);
    const pathMat = new THREE.LineDashedMaterial({
      color: 0x10B981,
      dashSize: 0.8,
      gapSize: 0.4,
      linewidth: 3,
    });
    const pathLine = new THREE.Line(pathGeo, pathMat);
    pathLine.computeLineDistances();
    this.goalGroup.add(pathLine);
  }
}
