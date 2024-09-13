import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import ReactGA from 'react-ga';

// Initialize Google Analytics
ReactGA.initialize('YOUR_GA_TRACKING_ID');  // Replace with your GA tracking ID

function Model({ onSelect, highlightedPart }) {
  const modelRef = useRef();
  const { scene } = useGLTF('/model/cB.gltf', undefined, (error) => {
    console.error('Error loading GLTF model:', error);
  });
  const { raycaster, mouse, camera } = useThree();

  useEffect(() => {
    if (modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      modelRef.current.position.x = -center.x;
      modelRef.current.position.y = -center.y;
      modelRef.current.position.z = -center.z;

      const maxSize = Math.max(size.x, size.y, size.z);
      const scaleFactor = 2 / maxSize;
      modelRef.current.scale.setScalar(scaleFactor);
    }
  }, [scene]);

  useFrame(() => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(scene, true);
    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      document.body.style.cursor = 'pointer';
      if (intersectedObject.name) {
        onSelect(intersectedObject.name);
        ReactGA.event({
          category: '3D Model Viewer',
          action: 'Part Selected',
          label: intersectedObject.name
        });
      }
    } else {
      document.body.style.cursor = 'default';
      onSelect(null);
    }
  });

  // Highlight logic
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.emissive.setHex(0x000000); // Reset all parts
        if (child.name === highlightedPart) {
          child.material.emissive.setHex(0xff0000); // Highlight the selected part
        }
      }
    });
  }, [highlightedPart, scene]);

  return <primitive ref={modelRef} object={scene} />;
}

function App() {
  const [selectedPart, setSelectedPart] = useState(null);
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);

  const steps = [
    { part: 'GSM Module', instruction: 'This is the GSM module. Click to learn more about its function.' },
    { part: 'GPS Module', instruction: 'This is the GPS module. Click to explore its features.' },
    // Add more steps as needed
  ];

  const description = 'This is a 3D model of a Printed Circuit Board (PCB). The PCB appears to be a part of an electronic device that incorporates several connectors and components, including sections labeled GSM and GPS. The board includes various connectors for inputs and outputs, as well as areas for ICs (Integrated Circuits) and other electronic components. This board is likely part of a communication device, given the presence of GSM and GPS modules.';

  const handleNextStep = () => {
    setStep((prevStep) => (prevStep + 1) % steps.length);
  };

  const handlePreviousStep = () => {
    setStep((prevStep) => (prevStep - 1 + steps.length) % steps.length);
  };

  const handleFeedbackSubmit = () => {
    // Here you could send the feedback and rating to a backend service
    console.log('Feedback submitted:', feedback);
    console.log('Rating submitted:', rating);
    setSubmitted(true);
    setFeedback('');
    setRating(0);
    ReactGA.event({
      category: 'User Feedback',
      action: 'Submit Feedback',
      label: feedback
    });
    ReactGA.event({
      category: 'User Rating',
      action: 'Submit Rating',
      value: rating
    });
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh', margin: 0 }}>
      <header
        style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#343a40',
          color: '#ffffff',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1 style={{ margin: 0 }}>3D PCB Model Viewer</h1>
      </header>

      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Canvas
          style={{
            height: '70vh',
            width: '80%',
            borderRadius: '12px',
            border: '1px solid #ddd',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
          camera={{ position: [0, 2, 3], fov: 75 }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.7} />
          <Model onSelect={setSelectedPart} highlightedPart={steps[step]?.part} />
          <OrbitControls
            enableDamping
            dampingFactor={0.1}
            rotateSpeed={1}
            enablePan={true}
            panSpeed={1}
            minDistance={1}
            maxDistance={20}
            maxPolarAngle={Math.PI}
            minPolarAngle={0}
            target={[0, 0, 0]}
          />
        </Canvas>

        <section
          style={{
            marginTop: '20px',
            padding: '20px',
            width: '80%',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 style={{ margin: '0 0 10px 0' }}>Description</h2>
          <p style={{ lineHeight: '1.6', margin: 0 }}>{description}</p>
        </section>

        <section
          style={{
            marginTop: '20px',
            padding: '20px',
            width: '80%',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h3>Interactive Instructions</h3>
          <p style={{ lineHeight: '1.6' }}>{steps[step]?.instruction}</p>
          <div style={{ marginTop: '10px' }}>
            <button onClick={handlePreviousStep} style={{ marginRight: '10px' }}>Previous</button>
            <button onClick={handleNextStep}>Next</button>
          </div>
        </section>

        <section
          style={{
            marginTop: '20px',
            padding: '20px',
            width: '80%',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h3>Feedback and Rating</h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback here..."
            rows="4"
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <div style={{ marginTop: '10px' }}>
            <label>Rate your experience: </label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ marginLeft: '10px' }}>
              <option value={0}>Select Rating</option>
              <option value={1}>1 - Poor</option>
              <option value={2}>2 - Fair</option>
              <option value={3}>3 - Good</option>
              <option value={4}>4 - Very Good</option>
              <option value={5}>5 - Excellent</option>
            </select>
          </div>
          <button onClick={handleFeedbackSubmit} style={{ marginTop: '10px' }}>
            Submit Feedback
          </button>
          {submitted && <p style={{ color: 'green', marginTop: '10px' }}>Thank you for your feedback!</p>}
        </section>
      </main>

      <aside
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h4 style={{ margin: '0 0 10px 0' }}>How to interact:</h4>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, lineHeight: '1.8' }}>
          <li>🔄 Rotate: Left-click and drag</li>
          <li>🔍 Zoom: Scroll up/down</li>
          <li>✋ Pan: Right-click and drag</li>
        </ul>
      </aside>

      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          fontWeight: 'lighter',
          fontSize: '14px',
        }}
      >
        {selectedPart ? (
          <h4 style={{ margin: 0 }}>Selected Part: {selectedPart}</h4>
        ) : (
          <h4 style={{ margin: 0 }}>No part selected</h4>
        )}
      </div>
    </div>
  );
}

export default App;
