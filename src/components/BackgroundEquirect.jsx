import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function BackgroundEquirect({ url, setEnv = false }) {
    const { scene, gl } = useThree();
    const tex = useTexture(url);

    useEffect(() => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.mapping = THREE.EquirectangularReflectionMapping;

        // Quality knobs
        tex.anisotropy = gl.capabilities.getMaxAnisotropy();
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        tex.needsUpdate = true;

        const prevBg = scene.background;
        const prevEnv = scene.environment;

        scene.background = tex;          // high-res pano
        if (setEnv) scene.environment = tex; // careful: env will be PMREM'd (lower res)

        return () => {
            scene.background = prevBg;
            scene.environment = prevEnv;
        };
    }, [scene, gl, tex, setEnv]);

    return null;
}
