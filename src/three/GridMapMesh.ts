import * as THREE from 'three';

export interface ZoneConfig {
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
}

const defaultZones: ZoneConfig[] = [
  { name: 'Workshop', x: -6, z: -14, width: 8, depth: 10 },
  { name: 'Meeting Room', x: -6, z: 6, width: 7, depth: 8 },
  { name: 'Lab Cleanroom', x: 6, z: -4, width: 8, depth: 16 },
  { name: 'Rest Area', x: 4, z: 16, width: 6, depth: 7 },
];

export class GridMapMesh {
  public group: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.createFloorPlan();
    this.create3DWalls();
    this.createZones();
  }

  private createFloorPlan(): void {
    // 1. Base White Floor Plane
    const floorGeo = new THREE.PlaneGeometry(30, 52);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.4,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Subtle edge boundary
    const edges = new THREE.EdgesGeometry(floorGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x94A3B8, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    wireframe.rotation.x = -Math.PI / 2;
    wireframe.position.y = 0.01;
    this.group.add(wireframe);
  }

  private create3DWalls(): void {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.6,
      metalness: 0.2,
    });

    const createWall = (x: number, z: number, w: number, d: number, h = 1.4) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const wall = new THREE.Mesh(geo, wallMaterial);
      wall.position.set(x, h / 2, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.group.add(wall);
    };

    const wallThickness = 0.45;

    // Outer perimeter walls
    createWall(-15, 0, wallThickness, 52); // West wall
    createWall(15, 0, wallThickness, 52);  // East wall
    createWall(0, -26, 30, wallThickness); // North wall
    createWall(0, 26, 30, wallThickness);  // South wall

    // Interior partitions matching demo SLAM layout
    // Partition dividing left rooms
    createWall(-6, -8, 8, wallThickness);
    createWall(-6, 11, 8, wallThickness);
    createWall(-2, -8, wallThickness, 8);
    createWall(-2, 11, wallThickness, 6);

    // Right side lab partitions
    createWall(6, -13, 8, wallThickness);
    createWall(10, 5, wallThickness, 14);
    createWall(2, -4, wallThickness, 12);
  }

  private createZones(): void {
    defaultZones.forEach((zone) => {
      // 1. Translucent Pink Surface
      const zoneGeo = new THREE.PlaneGeometry(zone.width, zone.depth);
      const zoneMat = new THREE.MeshBasicMaterial({
        color: 0xFB7185,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const zoneMesh = new THREE.Mesh(zoneGeo, zoneMat);
      zoneMesh.rotation.x = -Math.PI / 2;
      zoneMesh.position.set(zone.x, 0.02, zone.z);
      this.group.add(zoneMesh);

      // Zone Border Line
      const edges = new THREE.EdgesGeometry(zoneGeo);
      const borderMat = new THREE.LineBasicMaterial({ color: 0xF43F5E, linewidth: 2 });
      const border = new THREE.LineSegments(edges, borderMat);
      border.rotation.x = -Math.PI / 2;
      border.position.set(zone.x, 0.03, zone.z);
      this.group.add(border);

      // 2. Zone Text Label Billboard Sprite
      const sprite = this.createTextSprite(zone.name);
      sprite.position.set(zone.x, 0.1, zone.z);
      this.group.add(sprite);
    });
  }

  private createTextSprite(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 96;
    const ctx = canvas.getContext('2d')!;

    // Clean text styling
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 36px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#E11D48'; // Rich rose text
    ctx.fillText(text, 192, 48);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(6, 1.5, 1);
    return sprite;
  }
}
