// src/App.js
import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Model Component
function Model() {
  const modelRef = useRef();
  const { scene } = useGLTF('/model/cB.gltf', undefined, (error) => {
    console.error('Error loading GLTF model:', error);
  });

  useEffect(() => {
    if (modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Center the model
      modelRef.current.position.x = -center.x;
      modelRef.current.position.y = -center.y;
      modelRef.current.position.z = -center.z;

      // Increase the scale to make the model appear larger
      const maxSize = Math.max(size.x, size.y, size.z);
      const scaleFactor = 2 / maxSize; // Increase this factor to make the model bigger
      modelRef.current.scale.setScalar(scaleFactor);
    }
  }, [scene]);

  return <primitive ref={modelRef} object={scene} />;
}

// Main App Component
function App() {
  return (
    <Canvas
      style={{ height: '100vh', width: '100vw' }}
      camera={{ position: [0, 2, 3], fov: 75 }} // Move the camera closer to the model
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <Model />
      <OrbitControls
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={1}
        enablePan={true}
        panSpeed={1}
        minDistance={1}
        maxDistance={20}
        maxPolarAngle={Math.PI}  // Full rotation
        minPolarAngle={0}        // Full rotation
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}

export default App;
