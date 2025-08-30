import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import { useTexture } from "@react-three/drei";

import earthVertex from "../shaders/earth/vertex.glsl";
import earthFragment from "../shaders/earth/fragment.glsl";
import atmosphereVertex from "../shaders/atmosphere/vertex.glsl";
import atmosphereFragment from "../shaders/atmosphere/fragment.glsl";

// Optional: swap to Leva if you want live GUI controls
import { useControls } from "leva";

export default function EarthSystem() {
    const earthRef = useRef();
    const earthMatRef = useRef();
    const atmMatRef = useRef();
    const debugSunRef = useRef();

    const { gl } = useThree();

    // Textures (public/earth/...)
    const [day, night, specClouds] = useTexture([
        "/earth/day.jpg",
        "/earth/night.jpg",
        "/earth/specularClouds.jpg",
    ], textures => {
        textures[0].colorSpace = THREE.SRGBColorSpace
        textures[1].colorSpace = THREE.SRGBColorSpace
        textures[2].colorSpace = THREE.NoColorSpace
    });

    // Match original color/anisotropy
    useEffect(() => {
        [day, night].forEach((t) => (t.colorSpace = THREE.SRGBColorSpace));
        [day, night, specClouds].forEach((t) => (t.anisotropy = 8));
    }, [day, night, specClouds]);

    // Parameters (could be controlled with Leva)
    const { atmosphereDayColor, atmosphereTwilightColor, phi, theta } = useControls({
      atmosphereDayColor: '#00aaff',
      atmosphereTwilightColor: '#ff6600',
      phi: { value: Math.PI * 0.5, min: 0, max: Math.PI },
      theta: { value: 0.5, min: -Math.PI, max: Math.PI },
    });


    // Sun direction via spherical (matches original)
    const sunSpherical = useMemo(() => new THREE.Spherical(1, Math.PI * 0.5, 0.5), []);

// 🔗 tie Leva -> spherical
    useEffect(() => {
        sunSpherical.set(1, phi, theta);
    }, [phi, theta, sunSpherical]);
    const sunDirection = useMemo(() => new THREE.Vector3(), []);

    // Earth uniforms
    const earthUniforms = useMemo(
        () => ({
            uDayTexture: { value: day },
            uNightTexture: { value: night },
            uSpecularCloudsTexture: { value: specClouds },
            uSunDirection: { value: sunDirection.clone() },
            uAtmosphereDayColor: { value: new THREE.Color(atmosphereDayColor) },
            uAtmosphereTwilightColor: { value: new THREE.Color(atmosphereTwilightColor) },
        }),
        [day, night, specClouds, sunDirection, atmosphereDayColor, atmosphereTwilightColor]
    );

    // Atmosphere uniforms
    const atmosphereUniforms = useMemo(
        () => ({
            uSunDirection: { value: sunDirection.clone() },
            uAtmosphereDayColor: { value: new THREE.Color(atmosphereDayColor) },
            uAtmosphereTwilightColor: { value: new THREE.Color(atmosphereTwilightColor) },
        }),
        [sunDirection, atmosphereDayColor, atmosphereTwilightColor]
    );

    // Update loop (rotation + sun dir + debug sphere)
    useFrame((_, dt) => {
        // Rotate earth
        if (earthRef.current) {
            earthRef.current.rotation.y += dt * 0.1;
        }

        // Update sun direction & push to uniforms
        sunDirection.setFromSpherical(sunSpherical);

        if (earthMatRef.current) {
            earthMatRef.current.uniforms.uSunDirection.value.copy(sunDirection);
        }
        if (atmMatRef.current) {
            atmMatRef.current.uniforms.uSunDirection.value.copy(sunDirection);
        }

        if (debugSunRef.current) {
            debugSunRef.current.position.copy(sunDirection).multiplyScalar(5);
        }
    });

    // If you later want GUI color changes:
    useEffect(() => {
      if (earthMatRef.current) {
        earthMatRef.current.uniforms.uAtmosphereDayColor.value.set(atmosphereDayColor);
        earthMatRef.current.uniforms.uAtmosphereTwilightColor.value.set(atmosphereTwilightColor);
      }
      if (atmMatRef.current) {
        atmMatRef.current.uniforms.uAtmosphereDayColor.value.set(atmosphereDayColor);
        atmMatRef.current.uniforms.uAtmosphereTwilightColor.value.set(atmosphereTwilightColor);
      }
    }, [atmosphereDayColor, atmosphereTwilightColor]);

    return (
        <group>
            {/* Earth */}
            <mesh ref={earthRef}>
                <sphereGeometry args={[2, 64, 64]} />
                <shaderMaterial
                    ref={earthMatRef}
                    vertexShader={earthVertex}
                    fragmentShader={earthFragment}
                    uniforms={earthUniforms}
                    transparent={false}
                />
            </mesh>

            {/* Atmosphere */}
            <mesh scale={[1.04, 1.04, 1.04]}>
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

            {/* Debug Sun */}
            <mesh ref={debugSunRef}>
                <icosahedronGeometry args={[0.1, 2]} />
                <meshBasicMaterial />
            </mesh>
        </group>
    );
}
