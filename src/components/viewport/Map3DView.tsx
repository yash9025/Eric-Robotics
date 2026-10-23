import React, { useEffect, useRef } from 'react';
import { SceneManager } from '../../three/SceneManager';
import { GridMapMesh } from '../../three/GridMapMesh';
import { PCDVisualizer } from '../../three/PCDVisualizer';
import { RobotMarker } from '../../three/RobotMarker';
import { useRobotState } from '../../context/RobotStateContext';
import './Map3DView.css';

export const Map3DView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const robotMarkerRef = useRef<RobotMarker | null>(null);
  const { telemetry, zoomLevel, setZoomLevel, activeGoal } = useRobotState();

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Create Scene Manager
    const sceneManager = new SceneManager({
      canvas: canvasRef.current,
      onCameraChange: (zoom) => {
        setZoomLevel(zoom);
      },
    });
    sceneManagerRef.current = sceneManager;

    // 2. Add 3D SLAM Grid Floor & Walls & Labeled Zones
    const gridMap = new GridMapMesh();
    sceneManager.scene.add(gridMap.group);

    // 3. Add Point Cloud Layer (.PCD)
    const pcdVisualizer = new PCDVisualizer();
    pcdVisualizer.loadPCD('/assets/pcd/warehouse_slam.pcd').then(() => {
      sceneManager.scene.add(pcdVisualizer.group);
    });

    // 4. Add Dynamic Robot Marker & Waypoints
    const robotMarker = new RobotMarker();
    robotMarkerRef.current = robotMarker;
    sceneManager.scene.add(robotMarker.group);

    // 5. Beacon Animation Loop
    let animationId: number;
    const animateLoop = () => {
      const time = performance.now() * 0.001;
      robotMarker.animateBeacons(time);
      animationId = requestAnimationFrame(animateLoop);
    };
    animateLoop();

    // 6. Resize Observer for dynamic responsiveness
    const resizeObserver = new ResizeObserver(() => {
      sceneManager.resize();
    });
    if (canvasRef.current.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      sceneManager.destroy();
      sceneManagerRef.current = null;
      robotMarkerRef.current = null;
    };
  }, [setZoomLevel]);

  // Synchronize Camera Zoom with Slider
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setZoom(zoomLevel);
    }
  }, [zoomLevel]);

  // Synchronize Dynamic Robot Pose (teleoperation & odometry)
  useEffect(() => {
    if (robotMarkerRef.current) {
      robotMarkerRef.current.updatePose(
        telemetry.pose.x,
        telemetry.pose.y,
        telemetry.pose.yaw
      );
      robotMarkerRef.current.updateGoal(activeGoal, telemetry.pose);
    }
  }, [telemetry.pose, activeGoal]);

  return (
    <div className="map-3d-container">
      <canvas ref={canvasRef} className="map-3d-canvas" />
      {/* Subtle Coordinate / Orbit HUD Tag */}
      <div className="orbit-hint-tag">
        <span>Orbit: Left Click Drag</span>
        <span>•</span>
        <span>Pan: Right Click Drag</span>
      </div>
    </div>
  );
};
