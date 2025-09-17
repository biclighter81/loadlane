import React from 'react';
import { Box, Text } from '@react-three/drei';
import type { DockProps } from '../types/docking';
import { getStatusColor } from '../utils';

const Dock: React.FC<DockProps> = ({ position, dockNumber, dockData, onClick }) => {
  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick(dockData.id);
  };

  return (
    <group position={position} onClick={handleClick}>
      {/* Hauptdock-Plattform */}
      <Box args={[4, 0.2, 8]} position={[0, 0, 0]}>
        <meshStandardMaterial color={getStatusColor(dockData.status)} />
      </Box>
      
      {/* Ladeplattform */}
      <Box args={[3.5, 1, 1]} position={[0, 0.6, -3.5]}>
        <meshStandardMaterial color="#5A5A5A" />
      </Box>
      
      {/* Sicherheitsgeländer links */}
      <Box args={[0.1, 1.2, 8]} position={[-2, 1.2, 0]}>
        <meshStandardMaterial color={getStatusColor(dockData.status)} />
      </Box>
      
      {/* Sicherheitsgeländer rechts */}
      <Box args={[0.1, 1.2, 8]} position={[2, 1.2, 0]}>
        <meshStandardMaterial color={getStatusColor(dockData.status)} />
      </Box>
      
      {/* Dock-Nummer Text */}
      <Text
        position={[0, 6.75, -4.9]}
        fontSize={0.8}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {`DOCK ${dockNumber}`}
      </Text>
      
      {/* Tor-Rahmen */}
      <Box args={[4.5, 6, 0.2]} position={[0, 3, -5]} castShadow>
        <meshStandardMaterial color={getStatusColor(dockData.status)} />
      </Box>
      {/* Tor-Öffnung (dunkler Bereich) */}
      <Box args={[3.8, 5, 0.1]} position={[0, 2.5, -4.9]}>
        <meshStandardMaterial color="#6E6E6E" />
      </Box>
      
      {/* Beleuchtung für das Dock */}
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#75cae1ff" />
    </group>
  );
};

export default Dock;