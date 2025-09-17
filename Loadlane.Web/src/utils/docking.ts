import type { DockStatusType, DockData } from '../types/docking';
import { DockStatus } from '../types/docking';

/**
 * Gibt die Farbe basierend auf dem Dock-Status zurück
 */
export const getStatusColor = (status: DockStatusType): string => {
  switch (status) {
    case DockStatus.FREE:
      return "#CCE0EE"; // Hellblau
    case DockStatus.BLOCKED:
      return "#EF4444"; // Rot
    case DockStatus.SELECTED:
      return "#3B82F6"; // Blau
    default:
      return "#8B7355"; // Standard braun
  }
};

/**
 * Berechnet die Dock-Positionen basierend auf der Anzahl der Docks
 */
export const calculateDockPositions = (docks: DockData[]): [number, number, number][] => {
  const dockSpacing = 8; // Abstand zwischen den Docks
  const startPosition = -(docks.length - 1) * dockSpacing / 2; // Zentriere die Docks
  
  const dockPositions: [number, number, number][] = [];
  for (let i = 0; i < docks.length; i++) {
    dockPositions.push([startPosition + i * dockSpacing, 0, -4]); // Direkt am Gebäude (z=-4)
  }
  
  return dockPositions;
};

/**
 * Berechnet die Hallenbreite basierend auf der Anzahl der Docks
 */
export const calculateHallWidth = (dockCount: number): number => {
  const dockSpacing = 8;
  return Math.max(dockCount * dockSpacing + 2, 20);
};

/**
 * Interpoliert zwischen zwei 3D-Positionen
 */
export const interpolatePosition = (
  start: [number, number, number],
  end: [number, number, number],
  progress: number
): [number, number, number] => {
  return [
    start[0] + (end[0] - start[0]) * progress,
    start[1] + (end[1] - start[1]) * progress,
    start[2] + (end[2] - start[2]) * progress
  ];
};