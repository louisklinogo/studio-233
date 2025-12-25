"use client";

import {
	MeshDistortMaterial,
	PerspectiveCamera,
	Sphere,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

function Core() {
	const meshRef = useRef<THREE.Mesh>(null);
	const wireframeRef = useRef<THREE.Mesh>(null);

	useFrame((state) => {
		const t = state.clock.getElapsedTime();
		if (meshRef.current) {
			meshRef.current.rotation.y = t * 0.2;
			meshRef.current.rotation.z = t * 0.1;
		}
		if (wireframeRef.current) {
			wireframeRef.current.rotation.y = -t * 0.15;
			wireframeRef.current.rotation.z = -t * 0.05;
		}
	});

	return (
		<group>
			{/* Inner Living Core - The "Engine" */}
			<Sphere ref={meshRef} args={[1, 64, 64]}>
				<MeshDistortMaterial
					color="#050505"
					emissive="#FF4D00"
					emissiveIntensity={0.5}
					roughness={0.2}
					metalness={0.9}
					distort={0.3}
					speed={1.5}
				/>
			</Sphere>

			{/* Outer Technical Cage - Precision Milled */}
			<mesh ref={wireframeRef}>
				<icosahedronGeometry args={[1.4, 1]} />
				<meshBasicMaterial
					color="#ffffff"
					wireframe
					transparent
					opacity={0.08}
				/>
			</mesh>

			{/* Second Cage - High Density Mesh */}
			<mesh>
				<icosahedronGeometry args={[1.41, 4]} />
				<meshBasicMaterial
					color="#666666"
					wireframe
					transparent
					opacity={0.03}
				/>
			</mesh>
		</group>
	);
}

function Rig() {
	return useFrame((state) => {
		state.camera.position.lerp(
			new THREE.Vector3(state.mouse.x * 0.3, state.mouse.y * 0.3, 5),
			0.05,
		);
		state.camera.lookAt(0, 0, 0);
	});
}

export const NeuralCore3D = () => {
	return (
		<div className="relative w-full h-full min-h-[400px] bg-transparent cursor-none">
			{/* Technical HUD Overlays */}
			<div className="absolute inset-0 pointer-events-none z-10">
				{/* Top-Left: Link Status */}
				<div className="absolute top-12 left-12 flex flex-col gap-1.5">
					<div className="flex items-center gap-2">
						<div className="w-1.5 h-1.5 bg-[#FF4D00] animate-pulse" />
						<span className="font-mono text-[8px] text-neutral-400 tracking-[0.3em] uppercase">
							CORE_STABILIZED
						</span>
					</div>
					<span className="font-mono text-[8px] text-neutral-600 tracking-[0.2em]">
						LATENCY: 1.2MS // SYNAPSE_v2
					</span>
				</div>

				{/* Bottom-Right: Buffer Data */}
				<div className="absolute bottom-12 right-12 flex flex-col gap-1 items-end">
					<span className="font-mono text-[8px] text-neutral-600 tracking-[0.2em] uppercase">
						NEURAL_SYNC_0x233
					</span>
					<div className="flex gap-1 h-1.5 mt-1">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="w-4 h-[1px] bg-neutral-800" />
						))}
					</div>
				</div>

				{/* Center Crosshair */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-neutral-500/5 rounded-full" />
			</div>

			<Canvas dpr={[1, 2]}>
				<Suspense fallback={null}>
					<PerspectiveCamera makeDefault position={[0, 0, 5]} fov={35} />
					<ambientLight intensity={0.4} />
					<spotLight position={[10, 10, 10]} intensity={1} />
					<Core />
					<Rig />
				</Suspense>
			</Canvas>
		</div>
	);
};
