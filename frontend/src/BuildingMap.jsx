import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Line, 
  Html,
  Edges,
  OrthographicCamera,
  Environment,
  ContactShadows
} from '@react-three/drei';
import * as THREE from 'three';

// 1. THE THICK GREEN EVACUATION PATH (No Glow)
const SafePath = ({ startPos, endPos, active }) => {
  const lineRef = useRef();
  
  useFrame(() => {
    if (lineRef.current && active) {
      lineRef.current.material.dashOffset -= 0.02; // Flow animation
    }
  });

  if (!active) return null;

  const points = [
    new THREE.Vector3(startPos[0], startPos[1] + 0.15, startPos[2]),
    new THREE.Vector3(endPos[0], endPos[1] + 0.15, endPos[2]),
  ];

  return (
    <Line
      ref={lineRef}
      points={points}
      color="#16a34a" // A deeper, solid green instead of neon
      lineWidth={8}   
      dashed
      dashScale={6}
      dashSize={0.8}
      dashGap={0.4}
    />
  );
};

// 2. INDIVIDUAL FLOOR ARCHITECTURE
const Floor = ({ position, floorName, isOnFire, isHighRisk, routeInstruction }) => {
  const showStairA = routeInstruction?.includes("STAIRCASE A");
  const showStairB = routeInstruction?.includes("STAIRCASE B");

  // Sensor node positions mimicking the scattered blue dots
  const sensorPositions = [
    [-4, 0.2, -3], [5, 0.2, 2], [2, 0.2, -4], [-5, 0.2, 3]
  ];

  return (
    <group position={position}>
      
      {/* SOLID FLOOR SLAB */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[16, 0.2, 12]} />
        <meshStandardMaterial color={isOnFire ? "#7f1d1d" : "#f1f5f9"} roughness={0.7} />
      </mesh>

      {/* INTERNAL OFFICE WALLS (For structural realism) */}
      <mesh position={[-2, 1.4, 0]}>
        <boxGeometry args={[0.2, 2.8, 6]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[4, 1.4, -2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.2, 2.8, 4]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      {/* EXTERIOR ARCHITECTURAL GLASS WITH FRAMES */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[16.05, 3, 12.05]} />
        <meshPhysicalMaterial 
          color={isOnFire ? "#ef4444" : "#bae6fd"} 
          transparent 
          opacity={isOnFire ? 0.4 : 0.15} 
          transmission={0.9} 
          roughness={0.1}
        />
        {/* Dark blue structural lines */}
        <Edges scale={1} threshold={15} color="#334155" />
      </mesh>

      {/* FIRE ZONE (Solid flat red instead of glowing) */}
      {isOnFire && (
        <mesh position={[-3, 1.5, 2]}>
          <sphereGeometry args={[3, 32, 32]} />
          <meshBasicMaterial color="#dc2626" transparent opacity={0.4} />
        </mesh>
      )}

      {/* SOLID BLUE SENSOR NODES */}
      {sensorPositions.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.25]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
      ))}

      {/* SAFE PATH ROUTING */}
      <SafePath startPos={[0, 0, 0]} endPos={[-7, 0, 0]} active={showStairA} />
      <SafePath startPos={[0, 0, 0]} endPos={[7, 0, 0]} active={showStairB} />

      {/* FLOATING WHITE LABELS */}
      <Html position={[-9, 1.5, 0]} center zIndexRange={[100, 0]}>
        <div className="bg-white text-slate-800 px-4 py-1.5 rounded shadow-lg text-sm font-bold flex items-center gap-2 border border-slate-200" style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          {floorName}
          {/* Small tail for the speech bubble effect */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-white"></div>
        </div>
      </Html>

    </group>
  );
};

const BuildingMap = ({ fireActive, fireLocation, evacuationRoutes }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100%' }}>
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <color attach="background" args={["#0f172a"]} />
          
          {/* ORTHOGRAPHIC CAMERA: Perfect Isometric look */}
          <OrthographicCamera 
            makeDefault 
            position={[40, 30, 40]} 
            zoom={22} 
            near={-100} 
            far={100} 
          />
          
          {/* Clean, shadow-casting light setup */}
          <ambientLight intensity={1.5} /> 
          <directionalLight position={[20, 30, 20]} intensity={1.5} castShadow shadow-bias={-0.0001} />
          
          <Environment preset="city" />

          <OrbitControls 
            makeDefault 
            autoRotate={!fireActive} 
            autoRotateSpeed={0.5}
            enableZoom={true}
            maxPolarAngle={Math.PI / 2.2}
          />

          {/* Render the 4 Floors */}
          {['floor_1', 'floor_2', 'floor_3', 'floor_4'].map((f, i) => {
            const route = evacuationRoutes ? evacuationRoutes[f] : "";
            return (
              <Floor 
                key={f} 
                position={[0, i * 4, 0]} 
                floorName={f.toUpperCase().replace('_', ' ')}
                isOnFire={fireActive && fireLocation === f}
                isHighRisk={fireActive && route?.includes("HIGH RISK")}
                routeInstruction={route}
              />
            );
          })}

          <ContactShadows position={[0, -0.4, 0]} opacity={0.6} scale={40} blur={2} far={10} />

          {/* Removed EffectComposer and Bloom to eliminate the neon effect */}
          
        </Suspense>
      </Canvas>
    </div>
  );
};

export default BuildingMap;