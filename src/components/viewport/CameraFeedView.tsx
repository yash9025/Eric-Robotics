import React, { useRef, useEffect } from 'react';
import './CameraFeedView.css';

interface CameraFeedViewProps {
  isThumbnail?: boolean;
}

const TOTAL_FRAMES = 35;
const frameUrls: string[] = Array.from(
  { length: TOTAL_FRAMES },
  (_, i) => `/assets/camera_frames/frame_${i.toString().padStart(2, '0')}.jpg`
);

export const CameraFeedView: React.FC<CameraFeedViewProps> = ({ isThumbnail = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isCancelled = false;
    let currentFrameIndex = 0;
    let forward = true;
    let animationId: number;
    let lastTime = performance.now();
    const frameInterval = 1000 / 12; // 12 FPS playback matching AMR feed

    // Preload image objects
    const images: HTMLImageElement[] = frameUrls.map((url) => {
      const img = new Image();
      img.src = url;
      return img;
    });

    const draw = (now: number) => {
      if (isCancelled) return;

      const delta = now - lastTime;
      if (delta >= frameInterval) {
        lastTime = now - (delta % frameInterval);

        const currentImg = images[currentFrameIndex];
        if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
          // Draw image to fill canvas (cover style)
          const cw = canvas.width;
          const ch = canvas.height;
          const iw = currentImg.naturalWidth;
          const ih = currentImg.naturalHeight;

          const scale = Math.max(cw / iw, ch / ih);
          const nw = iw * scale;
          const nh = ih * scale;
          const nx = (cw - nw) / 2;
          const ny = (ch - nh) / 2;

          ctx.drawImage(currentImg, nx, ny, nw, nh);
        }

        // Ping-pong loop
        if (forward) {
          if (currentFrameIndex >= TOTAL_FRAMES - 1) {
            forward = false;
            currentFrameIndex = TOTAL_FRAMES - 2;
          } else {
            currentFrameIndex++;
          }
        } else {
          if (currentFrameIndex <= 0) {
            forward = true;
            currentFrameIndex = 1;
          } else {
            currentFrameIndex--;
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    // Initialize canvas dimensions
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = canvas.clientWidth || 800;
      canvas.height = canvas.clientHeight || 450;
    };
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
    animationId = requestAnimationFrame(draw);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className={`camera-feed-container ${isThumbnail ? 'thumbnail-mode' : 'fullscreen-mode'}`}>
      <canvas ref={canvasRef} className="camera-canvas-element" />

      {/* Industrial Sensor Telemetry HUD Overlay (Active in Fullscreen) */}
      {!isThumbnail && (
        <div className="camera-hud-overlay">
          {/* Top Left Feed Label */}
          <div className="hud-corner hud-top-left">
            <div className="hud-tag">
              <span className="hud-live-dot" />
              <span>LIVE SENSOR FEED • FRONT_CAM_01</span>
            </div>
            <span className="hud-subtext">OPTICAL SENSOR: 1080p @ 30 FPS • FOV 110°</span>
          </div>

          {/* Top Right Latency & Encoding */}
          <div className="hud-corner hud-top-right">
            <span className="hud-stat-pill">STREAM: H.264 / RTSP</span>
            <span className="hud-stat-pill">LATENCY: 38ms</span>
          </div>

          {/* Center Targeting Reticle */}
          <div className="hud-center-crosshair">
            <div className="reticle-line reticle-horiz" />
            <div className="reticle-line reticle-vert" />
            <div className="reticle-box" />
          </div>

          {/* Bottom Left Sensor Coordinates */}
          <div className="hud-corner hud-bottom-left">
            <span className="hud-coord-text font-mono">POSE: FRONT-MOUNT [+0.45m, 0.00m, +0.35m]</span>
          </div>
        </div>
      )}

      {/* Subtle Scanline Overlay */}
      <div className="camera-scanlines" />
    </div>
  );
};
