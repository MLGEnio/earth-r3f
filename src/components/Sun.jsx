import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import {useMemo, useRef, useEffect, useState} from "react";
import {useCursor, useTexture} from "@react-three/drei";

import sunVertex from "../shaders/sun/vertex.glsl";
import sunFragment from "../shaders/sun/fragment.glsl";
import atmosphereVertex from "../shaders/atmosphereOneColor/vertex.glsl";
import atmosphereFragment from "../shaders/atmosphereOneColor/fragment.glsl";

// Optional: swap to Leva if you want live GUI controls
import { useControls } from "leva";

export default function Sun({sunRef}) {

    // Textures (public/sun/...)
    const sun = useTexture("/sun/8k_sun.jpg")
    sun.colorSpace = THREE.SRGBColorSpace

    const [hovered, set] = useState()
    useCursor(hovered, /*'pointer', 'auto', document.body*/)
    const sunUniforms = {
        uSunTexture: { value: sun },
        uTime: {value: 0}
    }

    useFrame((state, delta)=>{
        sunRef.current.rotation.y += delta * 0.05
        sunUniforms.uTime.value += delta
    })


    const atmosphereUniforms = useMemo(() => ({
        uAtmosphereColor: { value: new THREE.Color('#880808') },
    }), []);



    return (
        <group onPointerOver={() => set(true)} onPointerOut={() => set(false)}>
            {/* Earth */}
            <mesh ref={sunRef}>
                <sphereGeometry args={[2, 64, 64]} />
                <shaderMaterial
                    vertexShader={sunVertex}
                    fragmentShader={sunFragment}
                    uniforms={sunUniforms}
                    transparent={false}
                />
            </mesh>

            {/* Atmosphere */}
            <mesh scale={[1.04, 1.04, 1.04]}>
                <sphereGeometry args={[2, 64, 64]} />
                <shaderMaterial
                    side={THREE.BackSide}
                    transparent
                    vertexShader={atmosphereVertex}
                    fragmentShader={atmosphereFragment}
                    uniforms={atmosphereUniforms}
                />
            </mesh>
        </group>
    );
}
