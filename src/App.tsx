import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopTelemetryBar } from './components/layout/TopTelemetryBar';
import { MissionControlOverlay } from './components/layout/MissionControlOverlay';
import { ZoomSlider } from './components/layout/ZoomSlider';
import { EmergencyStopButton } from './components/controls/EmergencyStopButton';
import { EmergencyHazardOverlay } from './components/controls/EmergencyHazardOverlay';
import { TeleopDPad } from './components/controls/TeleopDPad';
import { QuickGoalModal } from './components/modals/QuickGoalModal';
import { InitiateMissionModal } from './components/modals/InitiateMissionModal';
import { RosBridgeModal } from './components/modals/RosBridgeModal';
import { ViewportContainer } from './components/viewport/ViewportContainer';
import './App.css';

function DashboardApp() {
  const [isQuickGoalOpen, setIsQuickGoalOpen] = useState<boolean>(false);
  const [isInitiateOpen, setIsInitiateOpen] = useState<boolean>(false);
  const [isRosOpen, setIsRosOpen] = useState<boolean>(false);

  return (
    <div className="dashboard-root">
      {/* 1. Left Navigation Rail */}
      <Sidebar />

      {/* 2. Main Viewport Stage */}
      <main className="dashboard-viewport-stage">
        {/* Top Floating Telemetry Capsule */}
        <TopTelemetryBar onRosConfigClick={() => setIsRosOpen(true)} />

        {/* Top Left Mission Status & Top Right Controls */}
        <MissionControlOverlay
          onQuickGoalClick={() => setIsQuickGoalOpen(true)}
          onInitiateClick={() => setIsInitiateOpen(true)}
        />

        {/* Viewport Core Layer (Dual 3D Map / Camera with PiP Swap Engine) */}
        <ViewportContainer />

        {/* Left Floating Zoom Slider */}
        <ZoomSlider />

        {/* Bottom Right Emergency Stop Button */}
        <EmergencyStopButton />

        {/* Bottom Right Teleop D-Pad */}
        <TeleopDPad />

        {/* Emergency Hazard Safety Flashing Border & Reset Latch */}
        <EmergencyHazardOverlay />

        {/* Interactive Modals */}
        <QuickGoalModal
          isOpen={isQuickGoalOpen}
          onClose={() => setIsQuickGoalOpen(false)}
        />
        <InitiateMissionModal
          isOpen={isInitiateOpen}
          onClose={() => setIsInitiateOpen(false)}
        />
        <RosBridgeModal
          isOpen={isRosOpen}
          onClose={() => setIsRosOpen(false)}
        />
      </main>
    </div>
  );
}

export default DashboardApp;
