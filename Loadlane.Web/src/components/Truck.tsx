import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text, Cylinder } from '@react-three/drei';
import { Group } from 'three';
import type { TruckProps } from '../types/docking';

const Truck: React.FC<TruckProps> = ({ truckData, dockPosition, isRemoving = false, onRemovalComplete, onClick }) => {
  const truckRef = useRef<Group>(null);
  const [progress, setProgress] = useState(0);
  const [removalProgress, setRemovalProgress] = useState(0);
  
  // Startposition (von außerhalb des Bildes)
  const startPosition: [number, number, number] = [dockPosition[0], 0, 20];
  const targetPosition: [number, number, number] = [dockPosition[0], 0, dockPosition[2] + 4];
  const exitPosition: [number, number, number] = [dockPosition[0], 0, 30]; // Wegfahrposition
  
  // Click-Handler für den LKW
  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onClick) {
      onClick(truckData, truckData.targetDock);
    }
  };
  
  useFrame((_, delta) => {
    if (truckRef.current) {
      if (isRemoving) {
        // Wegfahranimation
        if (removalProgress < 1) {
          const newRemovalProgress = Math.min(removalProgress + delta * 0.3, 1);
          setRemovalProgress(newRemovalProgress);
          
          // Interpolation von aktueller Position zur Ausfahrt
          const currentX = targetPosition[0] + (exitPosition[0] - targetPosition[0]) * newRemovalProgress;
          const currentY = targetPosition[1] + (exitPosition[1] - targetPosition[1]) * newRemovalProgress;
          const currentZ = targetPosition[2] + (exitPosition[2] - targetPosition[2]) * newRemovalProgress;
          
          truckRef.current.position.set(currentX, currentY, currentZ);
          
          if (newRemovalProgress >= 1 && onRemovalComplete) {
            onRemovalComplete();
          }
        }
      } else if (progress < 1) {
        // Normale Anfahranimation
        const newProgress = Math.min(progress + delta * 0.2, 1);
        setProgress(newProgress);
        
        // Interpolation zwischen Start- und Zielposition
        const currentX = startPosition[0] + (targetPosition[0] - startPosition[0]) * newProgress;
        const currentY = startPosition[1] + (targetPosition[1] - startPosition[1]) * newProgress;
        const currentZ = startPosition[2] + (targetPosition[2] - startPosition[2]) * newProgress;
        
        truckRef.current.position.set(currentX, currentY, currentZ);
      }
    }
  });
  
  useEffect(() => {
    // Animation nur beim ersten Mount starten, nicht bei Dock-Position-Änderungen
    if (!isRemoving && progress === 0) {
      // Animation ist bereits initial auf 0 gesetzt, keine weitere Aktion nötig
    }
  }, [isRemoving]); // dockPosition aus Dependencies entfernt

  return (
    <group ref={truckRef} position={startPosition} onClick={handleClick}>
      {/* Truck Kabine */}
      <Box args={[2.2, 2.5, 3]} position={[0, 1.5, 1.5]} castShadow>
        <meshStandardMaterial color="#00469B" />
      </Box>
      
      {/* Frontscheibe */}
      <Box args={[2.1, 1.2, 0.1]} position={[0, 1.8, 3]} castShadow>
        <meshStandardMaterial color="#87CEEB" transparent={true} opacity={0.7} />
      </Box>
      
      {/* Seitenscheibe links */}
      <Box args={[0.1, 1.2, 2.5]} position={[-1.06, 1.8, 1.5]} castShadow>
        <meshStandardMaterial color="#87CEEB" transparent={true} opacity={0.7} />
      </Box>
      
      {/* Seitenscheibe rechts */}
      <Box args={[0.1, 1.2, 2.5]} position={[1.06, 2, 1.5]} castShadow>
        <meshStandardMaterial color="#87CEEB" transparent={true} opacity={0.7} />
      </Box>
      
      {/* Truck Anhänger */}
      <Box args={[2.4, 2.8, 8]} position={[0, 1.7, -4]} castShadow>
        <meshStandardMaterial color="#CFCFD1" />
      </Box>
      
      {/* Runde Reifen vorne links */}
      <group position={[-1.2, 0.5, 1.75]}>
        <Cylinder args={[0.5, 0.5, 0.3, 16]} rotation={[0, 0, Math.PI/2]} castShadow>
          <meshStandardMaterial color="#222222" />
        </Cylinder>
        {/* Felge */}
        <Cylinder args={[0.3, 0.3, 0.32, 16]} rotation={[0, 0, Math.PI/2]}>
          <meshStandardMaterial color="#C0C0C0" />
        </Cylinder>
      </group>
      
      {/* Runde Reifen vorne rechts 1.75 */}
      <group position={[1.2, 0.5, 1.75]}>
        <Cylinder args={[0.5, 0.5, 0.3, 16]} rotation={[0, 0, Math.PI/2]} castShadow>
          <meshStandardMaterial color="#222222" />
        </Cylinder>
        {/* Felge */}
        <Cylinder args={[0.3, 0.3, 0.32, 16]} rotation={[0, 0, Math.PI/2]}>
          <meshStandardMaterial color="#C0C0C0" />
        </Cylinder>
      </group>
       
      {/* Runde Reifen hinten links */}
      <group position={[-1.2, 0.5, -6]}>
        <Cylinder args={[0.5, 0.5, 0.3, 16]} rotation={[0, 0, Math.PI/2]} castShadow>
          <meshStandardMaterial color="#222222" />
        </Cylinder>
        {/* Felge */}
        <Cylinder args={[0.3, 0.3, 0.32, 16]} rotation={[0, 0, Math.PI/2]}>
          <meshStandardMaterial color="#C0C0C0" />
        </Cylinder>
      </group>
      
      {/* Runde Reifen hinten rechts */}
      <group position={[1.2, 0.5, -6]}>
        <Cylinder args={[0.5, 0.5, 0.3, 16]} rotation={[0, 0, Math.PI/2]} castShadow>
          <meshStandardMaterial color="#222222" />
        </Cylinder>
        {/* Felge */}
        <Cylinder args={[0.3, 0.3, 0.32, 16]} rotation={[0, 0, Math.PI/2]}>
          <meshStandardMaterial color="#C0C0C0" />
        </Cylinder>
      </group>
      
      {/* Zusätzliche Doppelreifen hinten links (LKW-typisch) */}
      <group position={[-1.2, 0.5, -7]}>
        <Cylinder args={[0.5, 0.5, 0.3, 16]} rotation={[0, 0, Math.PI/2]} castShadow>
          <meshStandardMaterial color="#222222" />
        </Cylinder>
        {/* Felge */}
        <Cylinder args={[0.3, 0.3, 0.32, 16]} rotation={[0, 0, Math.PI/2]}>
          <meshStandardMaterial color="#C0C0C0" />
        </Cylinder>
      </group>
      
      {/* Zusätzliche Doppelreifen hinten rechts (LKW-typisch) */}
      <group position={[1.2, 0.5, -7]}>
        <Cylinder args={[0.5, 0.5, 0.3, 16]} rotation={[0, 0, Math.PI/2]} castShadow>
          <meshStandardMaterial color="#222222" />
        </Cylinder>
        {/* Felge */}
        <Cylinder args={[0.3, 0.3, 0.32, 16]} rotation={[0, 0, Math.PI/2]}>
          <meshStandardMaterial color="#C0C0C0" />
        </Cylinder>
      </group>
      
      {/* Kennzeichen vorne */}
      <Text
        position={[0, 0.8, 3.2]}
        fontSize={0.4}
        color="#f1f1f1ff"
        anchorX="center"
        anchorY="middle"
      >
        {truckData.text}
      </Text>

    {/* Kennzeichen oben */}
      <Text
        position={[0, 3.15, -5]}
        fontSize={0.9} 
        color="#2b1919"
        anchorX="center"
        rotation={[Math.PI / 2, Math.PI , Math.PI /2]}
        anchorY="middle"
      >
        {truckData.numberPlate}
      </Text>
      
      {/* Truck Text/Firma */}
      <Text
        position={[0, 2.5, -4]}
        fontSize={0.6}
        color="#2563eb"
        anchorX="center"
        anchorY="middle"
      >
        {truckData.text}
      </Text>
      
      {/* Kennzeichen hinten */}
      <Text
        position={[0, 0.8, -8.2]}
        fontSize={0.4}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI, 0]}
      >
        {truckData.numberPlate}
      </Text>
    </group>
  );
};

export default Truck;