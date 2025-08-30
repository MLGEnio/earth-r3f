import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Earth from "./components/Earth";

export default function App() {
    return (
        <Canvas
            camera={{ fov: 25, near: 0.1, far: 100, position: [12, 5, 4] }}
            dpr={[1, 2]}
            gl={{ antialias: true }}
            className="w-full h-full"
        >
            <color attach="background" args={['#000011']} />
            <ambientLight intensity={0.25} />
            <Earth />
            <OrbitControls enableDamping />
        </Canvas>
    );
}
