import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';
import type { TruckDocksProps } from '../types/docking';
import { DockStatus } from '../types/docking';
import { calculateDockPositions, calculateHallWidth } from '../utils';
import Dock from './Dock';
import Truck from './Truck';

const TruckDocks: React.FC<TruckDocksProps> = ({ docks, trucks = [], removingTrucks = [], onTruckRemovalComplete, onDockStatusChange, onTruckClick }) => {
  const [selectedDockId, setSelectedDockId] = useState<number | null>(null);

  // Berechne die Dock-Positionen und Hallenbreite mit Utility-Funktionen
  const dockPositions = calculateDockPositions(docks);
  const hallWidth = calculateHallWidth(docks.length);

  const handleDockClick = (dockId: number) => {
    // Wenn das gleiche Dock geklickt wird, deselektiere es
    if (selectedDockId === dockId) {
      setSelectedDockId(null);
      // Status zurück zu FREE oder BLOCKED basierend auf vorherigem Status
      const currentDock = docks.find(d => d.id === dockId);
      if (currentDock?.status === DockStatus.SELECTED) {
        onDockStatusChange?.(dockId, DockStatus.FREE);
      }
      return;
    }

    // Deselektiere das vorher ausgewählte Dock
    if (selectedDockId !== null) {
      onDockStatusChange?.(selectedDockId, DockStatus.FREE);
    }

    // Wähle das neue Dock aus
    setSelectedDockId(dockId);
    onDockStatusChange?.(dockId, DockStatus.SELECTED);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{
          position: [0, 20, 30],
          fov: 75,
        }}
        shadows
      >
        {/* Umgebungsbeleuchtung */}
        <ambientLight intensity={0.4} />
        
        {/* Hauptlichtquelle */}
        <directionalLight
          position={[10, 20, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Boden/Asphalt */}
        <Box args={[hallWidth + 20, 0.1, 30]} position={[0, -0.5, 0]} receiveShadow>
          <meshStandardMaterial color="#a9a9a9" />
        </Box>
        
        {/* Halle - Hauptgebäude */}
        <Box args={[hallWidth, 8, 6]} position={[0, 4, -12]} castShadow receiveShadow>
          <meshStandardMaterial color="#7B68EE" />
        </Box>
        
        {/* Halle - Dach */}
        <Box args={[hallWidth + 2, 0.3, 8]} position={[0, 8.5, -12]} castShadow>
          <meshStandardMaterial color="#4B0082" />
        </Box>
        
        {/* Halle - Seitenwände */}
        <Box args={[0.3, 8, 6]} position={[-hallWidth/2 - 0.15, 4, -12]} castShadow>
          <meshStandardMaterial color="#6A5ACD" />
        </Box>
        <Box args={[0.3, 8, 6]} position={[hallWidth/2 + 0.15, 4, -12]} castShadow>
          <meshStandardMaterial color="#6A5ACD" />
        </Box>
        
        {/* Halle - Rückwand */}
        <Box args={[hallWidth, 8, 0.3]} position={[0, 4, -15]} castShadow>
          <meshStandardMaterial color="#6A5ACD" />
        </Box>
        
        {/* Render alle Docks */}
        {docks.map((dock, index) => (
          <Dock
            key={dock.id}
            position={dockPositions[index]}
            dockNumber={dock.id}
            dockData={dock}
            onClick={handleDockClick}
          />
        ))}
        
        {/* Render alle Trucks */}
        {trucks.map((truck) => {
          // Finde die Position des Ziel-Docks basierend auf der Dock-ID
          const targetDockIndex = docks.findIndex(dock => dock.id === truck.targetDock);
          if (targetDockIndex === -1) {
            console.warn(`Dock with ID ${truck.targetDock} not found for truck ${truck.id}`);
            return null;
          }
          
          const targetDockPosition = dockPositions[targetDockIndex];
          const isRemoving = removingTrucks.includes(truck.id);
          
          return (
            <Truck
              key={truck.id}
              truckData={truck}
              dockPosition={targetDockPosition}
              isRemoving={isRemoving}
              onRemovalComplete={() => onTruckRemovalComplete?.(truck.id)}
              onClick={onTruckClick}
            />
          );
        })}
        
        {/* Kamera-Steuerung */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={15}
          maxDistance={120}
          target={[0, -5, 10]}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </div>
  );
};

export default TruckDocks;