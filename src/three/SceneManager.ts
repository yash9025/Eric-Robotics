import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface SceneManagerOptions {
  canvas: HTMLCanvasElement;
  onCameraChange?: (zoom: number) => void;
}

export class SceneManager {
  private canvas: HTMLCanvasElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;
  private animationFrameId: number | null = null;
  private onCameraChange?: (zoom: number) => void;
  private isDestroyed = false;

  constructor(options: SceneManagerOptions) {
    this.canvas = options.canvas;
    this.onCameraChange = options.onCameraChange;

    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    // 1. Scene with clean industrial background
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xEAEDF2);
    this.scene.fog = new THREE.FogExp2(0xEAEDF2, 0.008);

    // 2. Perspective Camera angled in isometric tilt matching demo
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Position camera tilted from above and slightly south-east
    this.camera.position.set(0, 36, 26);
    this.camera.lookAt(0, 0, 0);

    // 3. WebGL Renderer with antialiasing and high-DPI support
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Orbit Controls (restricted polar angle to prevent flipping)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.1; // Keep above floor
    this.controls.minDistance = 8;
    this.controls.maxDistance = 85;
    this.controls.target.set(0, 0, 0);

    // Camera change listener for zoom slider synchronization
    this.controls.addEventListener('change', () => {
      if (this.onCameraChange) {
        // Map distance [8, 85] to zoom [100, 0]
        const dist = this.camera.position.distanceTo(this.controls.target);
        const zoom = Math.round(100 - ((dist - 8) / (85 - 8)) * 100);
        this.onCameraChange(Math.max(0, Math.min(100, zoom)));
      }
    });

    // 5. Lighting
    this.setupLighting();

    // 6. Subsurface ground grid
    this.setupGroundGrid();

    // 7. Start render loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.2);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xFFFFFF, 1.4);
    mainLight.position.set(20, 50, 30);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0001;
    this.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x93C5FD, 0.4);
    fillLight.position.set(-20, 30, -30);
    this.scene.add(fillLight);
  }

  private setupGroundGrid(): void {
    // Subtle reference grid below map
    const gridHelper = new THREE.GridHelper(100, 50, 0xCBD5E1, 0xE2E8F0);
    gridHelper.position.y = -0.05;
    this.scene.add(gridHelper);
  }

  public setZoom(zoomPercent: number): void {
    // Map zoomPercent [0, 100] to distance [85, 8]
    const targetDist = 85 - (zoomPercent / 100) * (85 - 8);
    const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize();
    this.camera.position.copy(this.controls.target).addScaledVector(dir, targetDist);
    this.controls.update();
  }

  public resize(): void {
    if (this.isDestroyed) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate(): void {
    if (this.isDestroyed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.controls.dispose();
    this.renderer.dispose();
    this.scene.clear();
  }
}
