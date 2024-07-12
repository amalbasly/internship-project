// src/ModelViewer.js

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

const Model = ({ path }) => {
  const { scene } = useGLTF(path);
  return <primitive object={scene} scale={[10, 10, 10]} />; // Increase scale for a larger model
};

const ModelViewer = () => {
  return (
    <Canvas style={{ height: '100vh', width: '100vw' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 2]} />
      <OrbitControls 
        target={[0, 0, 0]} // Centering the model
        maxPolarAngle={Math.PI / 2} 
        minPolarAngle={0}
        maxDistance={10}
        minDistance={2}
      />
      <Model path="/model/drone.gltf" />
    </Canvas>
  );
};

export default ModelViewer;
