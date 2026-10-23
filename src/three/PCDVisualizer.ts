import * as THREE from 'three';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';

export class PCDVisualizer {
  public pointsMesh: THREE.Points | null = null;
  public group: THREE.Group;
  private loader: PCDLoader;

  constructor() {
    this.group = new THREE.Group();
    this.loader = new PCDLoader();
  }

  public async loadPCD(url: string): Promise<THREE.Points> {
    return new Promise((resolve) => {
      this.loader.load(
        url,
        (points) => {
          // Configure points material for high-contrast LiDAR visualization
          points.material = new THREE.PointsMaterial({
            size: 0.18,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
          });

          // Adjust position so it sits cleanly on top of the floor
          points.position.set(0, 0.05, 0);
          this.pointsMesh = points;
          this.group.clear();
          this.group.add(points);
          resolve(points);
        },
        undefined,
        (error) => {
          console.warn('PCDLoader fallback to procedural LiDAR points:', error);
          const fallbackPoints = this.createFallbackPoints();
          this.pointsMesh = fallbackPoints;
          this.group.clear();
          this.group.add(fallbackPoints);
          resolve(fallbackPoints);
        }
      );
    });
  }

  public createFallbackPoints(): THREE.Points {
    const positions: number[] = [];
    const colors: number[] = [];

    const addPoint = (x: number, y: number, z: number, r: number, g: number, b: number) => {
      positions.push(x, y, z);
      colors.push(r, g, b);
    };

    // Red LiDAR clusters along walls and obstacle borders (matching the demo)
    for (let i = 0; i < 900; i++) {
      const z = (Math.random() - 0.5) * 50;
      const x = (Math.random() > 0.5 ? 14.5 : -14.5) + (Math.random() - 0.5) * 0.4;
      const y = Math.random() * 1.5;
      // Red scan points
      addPoint(x, y, z, 0.95, 0.15, 0.15);
    }

    // Interior obstacle return clusters
    const obstacleCenters = [
      [-6, -14], [-6, 6], [6, -4], [4, 16], [0, -10], [0, 8]
    ];

    obstacleCenters.forEach(([cx, cz]) => {
      for (let i = 0; i < 120; i++) {
        const rad = 0.5 + Math.random() * 1.5;
        const ang = Math.random() * Math.PI * 2;
        const px = cx + rad * Math.cos(ang);
        const pz = cz + rad * Math.sin(ang);
        const py = Math.random() * 1.2;
        const isRed = Math.random() > 0.35;
        if (isRed) {
          addPoint(px, py, pz, 0.92, 0.2, 0.2);
        } else {
          addPoint(px, py, pz, 0.2, 0.3, 0.4);
        }
      }
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
    });

    const points = new THREE.Points(geometry, material);
    points.position.set(0, 0.05, 0);
    this.group.add(points);
    return points;
  }
}
