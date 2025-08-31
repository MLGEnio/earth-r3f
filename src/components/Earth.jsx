import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import React, {useMemo, useRef, useEffect, useState} from "react";
import {Html, useCursor, useTexture} from "@react-three/drei";

import earthVertex from "../shaders/earth/vertex.glsl";
import earthFragment from "../shaders/earth/fragment.glsl";
import atmosphereVertex from "../shaders/atmosphere/vertex.glsl";
import atmosphereFragment from "../shaders/atmosphere/fragment.glsl";

// Optional: swap to Leva if you want live GUI controls
import { useControls } from "leva";

export default function EarthSystem({ sunRef, earthGroupRef, onClick = () => {} }) {
    const earthMatRef = useRef();
    const atmMatRef = useRef();
    const earthRef = useRef();

    const [hovered, set] = useState()
    useCursor(hovered, /*'pointer', 'auto', document.body*/)

    const [day, night, specClouds] = useTexture([
        "/earth/day.jpg",
        "/earth/night.jpg",
        "/earth/specularClouds.jpg",
    ], (textures) => {
        textures[0].colorSpace = THREE.SRGBColorSpace;
        textures[1].colorSpace = THREE.SRGBColorSpace;
        textures[2].colorSpace = THREE.NoColorSpace;
    });

    // seed uniforms with something; we’ll update per-frame
    const earthUniforms = useMemo(() => ({
        uDayTexture: { value: day },
        uNightTexture: { value: night },
        uSpecularCloudsTexture: { value: specClouds },
        uSunDirection: { value: new THREE.Vector3(1,0,0) },
        uAtmosphereDayColor: { value: new THREE.Color('#00aaff') },
        uAtmosphereTwilightColor: { value: new THREE.Color('#ff6600') },
    }), [day, night, specClouds]);

    const atmosphereUniforms = useMemo(() => ({
        uSunDirection: { value: new THREE.Vector3(1,0,0) },
        uAtmosphereDayColor: { value: new THREE.Color('#00aaff') },
        uAtmosphereTwilightColor: { value: new THREE.Color('#ff6600') },
    }), []);

    // reuse vectors to avoid GC
    const _sunPos = useMemo(() => new THREE.Vector3(), []);
    const _earthPos = useMemo(() => new THREE.Vector3(), []);
    const _sunDir = useMemo(() => new THREE.Vector3(), []);

    useFrame((_, dt) => {
        // self-rotation
        if (earthRef.current) earthRef.current.rotation.y += dt * 0.1;

        // light direction = (Sun - Earth).normalized
        if (sunRef?.current && earthGroupRef?.current) {
            sunRef.current.getWorldPosition(_sunPos);
            earthGroupRef.current.getWorldPosition(_earthPos);
            _sunDir.subVectors(_sunPos, _earthPos).normalize();

            if (earthMatRef.current)
                earthMatRef.current.uniforms.uSunDirection.value.copy(_sunDir);
            if (atmMatRef.current)
                atmMatRef.current.uniforms.uSunDirection.value.copy(_sunDir);
        }
    });

    return (
        <group onClick={onClick} name="Earth"  ref={earthGroupRef} onPointerOver={() => set(true)} onPointerOut={() => set(false)}>
            <mesh ref={earthRef} scale={0.3}>
                <sphereGeometry args={[2, 64, 64]} />
                <shaderMaterial
                    ref={earthMatRef}
                    vertexShader={earthVertex}
                    fragmentShader={earthFragment}
                    uniforms={earthUniforms}
                    transparent={false}
                />
            </mesh>

            <mesh scale={0.32}>
                <sphereGeometry args={[2, 64, 64]} />
                <shaderMaterial
                    ref={atmMatRef}
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
