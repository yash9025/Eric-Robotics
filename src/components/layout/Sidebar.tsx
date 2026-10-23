import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Map, 
  MapPin, 
  Scan, 
  Crosshair, 
  TrendingUp, 
  User 
} from 'lucide-react';
import './Sidebar.css';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'map', label: '2D/3D Map', icon: Map },
  { id: 'waypoints', label: 'Waypoints', icon: MapPin },
  { id: 'geofence', label: 'Geofences', icon: Scan },
  { id: 'missions', label: 'Missions', icon: Crosshair },
  { id: 'analytics', label: 'Telemetry', icon: TrendingUp },
];

export const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <aside className="eric-sidebar" aria-label="Main Navigation">
      {/* Brand Logo Header */}
      <div className="sidebar-brand">
        <span className="brand-title">ERIC</span>
        <span className="brand-subtitle">ROBOTICS</span>
      </div>

      {/* Navigation Rail */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-button ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              aria-label={item.label}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              {isActive && <div className="active-pill-indicator" />}
            </button>
          );
        })}
      </nav>

      {/* User / Settings Profile Footer */}
      <div className="sidebar-footer">
        <button className="nav-button profile-button" title="Operator Profile" aria-label="Operator Profile">
          <User size={20} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
};
