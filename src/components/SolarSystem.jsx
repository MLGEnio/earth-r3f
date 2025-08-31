import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Bounds, useBounds } from "@react-three/drei";
import Earth from "./Earth.jsx";
import Sun from "./Sun.jsx";

function SelectToZoom({ children }) {
    const api = useBounds()

    return (
        <group
            onClick={
            (e) => {
                e.stopPropagation()
                e.delta <= 2 && api.refresh(e.object).fit()}
            }
            onPointerMissed={(e) => e.button === 0 && api.refresh().fit()}
        >
            {children}
        </group>
    )
}
export default function SolarSystem() {
    const sunRef = useRef();
    const earthGroupRef = useRef();

    // simple orbit
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime() * 0.015;
        if (earthGroupRef.current) {
            earthGroupRef.current.position.set(Math.cos(t) * 8, 0, Math.sin(t) * 8);
        }
        // bounds.moveTo([0, 10, 10]).lookAt({ target: [5, 5, 0], up: [0, -1, 0] })
    });

    return (
        <Bounds clip observe margin={1.2}>
            <SelectToZoom>
                <Earth sunRef={sunRef} earthGroupRef={earthGroupRef} />
                <Sun sunRef={sunRef} />
            </SelectToZoom>
        </Bounds>
    );
}
