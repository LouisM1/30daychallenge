import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import { Vector3, PerspectiveCamera as ThreePerspectiveCamera, Mesh } from 'three';
import { PerspectiveCamera } from '@react-three/drei';

interface CameraControllerProps {
  focusedPlanet: string | null;
  planetsData: Array<{
    name: string;
    size: number;
  }>;
  planetRefs: Record<string, React.RefObject<Mesh>>;
}

const CameraController: React.FC<CameraControllerProps> = ({ focusedPlanet, planetsData, planetRefs }) => {
  const cameraRef = useRef<ThreePerspectiveCamera>(null);
  const targetPosition = useRef(new Vector3());
  const currentPosition = useRef(new Vector3());

  useEffect(() => {
    if (focusedPlanet) {
      const planet = planetsData.find(p => p.name === focusedPlanet);
      const planetMesh = planetRefs[focusedPlanet]?.current;
      if (planet && planetMesh) {
        const distance = planet.size * 5; // Adjust this multiplier as needed
        planetMesh.getWorldPosition(targetPosition.current);
        targetPosition.current.add(new Vector3(distance, distance / 2, distance));
      }
    }
  }, [focusedPlanet, planetsData, planetRefs]);

  useFrame(() => {
    if (focusedPlanet && cameraRef.current) {
      currentPosition.current.lerp(targetPosition.current, 0.05);
      cameraRef.current.position.copy(currentPosition.current);
      cameraRef.current.lookAt(targetPosition.current.x - 5, targetPosition.current.y - 2.5, targetPosition.current.z - 5);
    }
  });

  return focusedPlanet ? <PerspectiveCamera ref={cameraRef} makeDefault position={[-10, 3, 10]} fov={50} /> : null;
};

CameraController.displayName = 'CameraController';

export default CameraController;