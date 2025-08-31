import {Canvas} from "@react-three/fiber";
import {OrbitControls} from "@react-three/drei";
import {useRef} from "react";
import SolarSystem from "./components/SolarSystem.jsx";
import BackgroundEquirect from "./components/BackgroundEquirect.jsx";

export default function App() {

    const controlsRef = useRef(null);

    return (
        <Canvas camera={{ position: [0, -10, 30], fov: 50 }} dpr={[1, 2]}>
            <color attach="background" args={['#000011']} />
            <ambientLight intensity={0.25} />
            <SolarSystem controlsRef={controlsRef}/>
            <OrbitControls makeDefault ref={controlsRef} enableDamping />
            <BackgroundEquirect url="/8k_stars_milky_way.jpg" setEnv={false} />
        </Canvas>
    );
}
