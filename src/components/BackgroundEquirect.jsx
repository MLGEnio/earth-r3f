// BackgroundEquirect.jsx
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function BackgroundEquirect({ url, setEnv = false }) {
    const { scene } = useThree();
    const tex = useTexture(url);

    useEffect(() => {
        tex.mapping = THREE.EquirectangularReflectionMapping;
        tex.colorSpace = THREE.SRGBColorSpace;

        const prevBg = scene.background;
        const prevEnv = scene.environment;

        scene.background = tex;      // panoramic sky that rotates with camera
        if (setEnv) scene.environment = tex; // optional PBR reflections

        return () => {
            scene.background = prevBg;
            scene.environment = prevEnv;
            tex.dispose?.();
        };
    }, [scene, tex, setEnv]);

    return null;
}
