"use client";

import { Image } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, {
	MutableRefObject,
	Suspense,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import * as THREE from "three";

// UI Slices - Static Fallbacks
const UI_ASSETS = {
	toolbar: "/ui-slices/canvas_toolbar.png",
	panel: "/ui-slices/canvas_panel.png",
	context: "/ui-slices/canvas_context.png",
};

/* Neural Pulse Shader Material */
const NeuralMaterial = {
	uniforms: {
		time: { value: 0 },
		color1: { value: new THREE.Color("#0a0a0a") },
		color2: { value: new THREE.Color("#1a1a1a") }, // Darker contrast
		accent: { value: new THREE.Color("#FF4D00") },
	},
	vertexShader: `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,
	fragmentShader: `
		uniform float time;
		uniform vec3 color1;
		uniform vec3 color2;
		uniform vec3 accent;
		varying vec2 vUv;

		// Simplex Noise (simplified)
		vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
		float snoise(vec2 v){
			const vec4 C = vec4(0.211324865405187, 0.366025403784439,
					-0.577350269189626, 0.024390243902439);
			vec2 i  = floor(v + dot(v, C.yy) );
			vec2 x0 = v -   i + dot(i, C.xx);
			vec2 i1;
			i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
			vec4 x12 = x0.xyxy + C.xxzz;
			x12.xy -= i1;
			i = mod(i, 289.0);
			vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
				+ i.x + vec3(0.0, i1.x, 1.0 ));
			vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
			m = m*m ;
			m = m*m ;
			vec3 x = 2.0 * fract(p * C.www) - 1.0;
			vec3 h = abs(x) - 0.5;
			vec3 ox = floor(x + 0.5);
			vec3 a0 = x - ox;
			m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
			vec3 g;
			g.x  = a0.x  * x0.x  + h.x  * x0.y;
			g.yz = a0.yz * x12.xz + h.yz * x12.yw;
			return 130.0 * dot(m, g);
		}

		void main() {
			vec2 uv = vUv;
			
			// Grid Pattern
			float gridX = step(0.98, fract(uv.x * 32.0));
			float gridY = step(0.98, fract(uv.y * 18.0));
			float grid = max(gridX, gridY);
			
			// Moving Noise Zones
			float noise = snoise(uv * 2.0 + time * 0.1);
			
			// Digital Pulse
			float pulse = step(0.9, sin(uv.y * 50.0 + time * 5.0)) * step(0.5, snoise(uv * 5.0 + time));
			
			// UI Box Elements
			float uiBox = step(0.8, snoise(uv * 8.0 + floor(time * 2.0))); 
			
			// Color Mixing
			vec3 finalColor = mix(color1, color2, grid * 0.2); // Base grid
			finalColor += accent * pulse * 0.5; // Pulse scanlines
			finalColor += accent * uiBox * 0.1; // UI flicker
			finalColor += accent * step(0.6, noise) * 0.05; // Ambient noise glow
			
			// Vignette
			float vig = 1.0 - length(uv - 0.5) * 1.2;
			finalColor *= vig;

			gl_FragColor = vec4(finalColor, 0.9);
		}
	`,
};

function ScreenContent({ scale }: { scale: [number, number] }) {
	const materialRef = useRef<THREE.ShaderMaterial>(null);

	useFrame((state) => {
		if (materialRef.current) {
			materialRef.current.uniforms.time.value = state.clock.elapsedTime;
		}
	});

	return (
		<mesh scale={[scale[0], scale[1], 1]}>
			<planeGeometry />
			<shaderMaterial
				ref={materialRef}
				args={[NeuralMaterial]}
				transparent
				side={THREE.DoubleSide}
			/>
		</mesh>
	);
}

function FloatingPanel({
	url,
	isScreen = false,
	initialPos,
	finalPos,
	initialRot,
	finalRot,
	scale,
	scrollProgress,
	delay = 0,
}: {
	url?: string;
	isScreen?: boolean;
	initialPos: [number, number, number];
	finalPos: [number, number, number];
	initialRot: [number, number, number];
	finalRot: [number, number, number];
	scale: [number, number];
	scrollProgress: MutableRefObject<number>;
	delay?: number;
}) {
	const groupRef = useRef<THREE.Group>(null);
	const { width } = useThree((state) => state.viewport);

	// Responsive scaling
	const responsiveScale = Math.min(width / 15, 1);

	useFrame((state) => {
		if (!groupRef.current) return;

		// Use the ref value instead of drei scroll
		const progress = THREE.MathUtils.smoothstep(scrollProgress.current, 0, 1);

		// Interpolate Position
		groupRef.current.position.x = THREE.MathUtils.lerp(
			initialPos[0] * responsiveScale,
			finalPos[0] * responsiveScale,
			progress,
		);
		groupRef.current.position.y = THREE.MathUtils.lerp(
			initialPos[1] * responsiveScale,
			finalPos[1] * responsiveScale,
			progress,
		);
		groupRef.current.position.z = THREE.MathUtils.lerp(
			initialPos[2],
			finalPos[2],
			progress,
		);

		// Interpolate Rotation
		groupRef.current.rotation.x = THREE.MathUtils.lerp(
			initialRot[0],
			finalRot[0],
			progress,
		);
		groupRef.current.rotation.y = THREE.MathUtils.lerp(
			initialRot[1],
			finalRot[1],
			progress,
		);
		groupRef.current.rotation.z = THREE.MathUtils.lerp(
			initialRot[2],
			finalRot[2],
			progress,
		);

		// Floating hover effect when assembled
		if (progress > 0.9) {
			groupRef.current.position.y +=
				Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.05;
		}
	});

	return (
		<group ref={groupRef}>
			{isScreen ? (
				<ScreenContent
					scale={[scale[0] * responsiveScale, scale[1] * responsiveScale]}
				/>
			) : (
				<Image
					url={url!}
					transparent
					scale={[scale[0] * responsiveScale, scale[1] * responsiveScale]}
					side={THREE.DoubleSide}
				/>
			)}
		</group>
	);
}

function Scene({
	scrollProgress,
}: {
	scrollProgress: MutableRefObject<number>;
}) {
	return (
		<group>
			{/* Main Viewport (Center) - GENERATIVE SCREEN */}
			<FloatingPanel
				isScreen={true}
				initialPos={[0, 0, -10]}
				finalPos={[0, 0.5, 0]}
				initialRot={[0.5, 0.5, 0]}
				finalRot={[0, 0, 0]}
				scale={[10, 6]}
				scrollProgress={scrollProgress}
			/>

			{/* Toolbar (Left) */}
			<FloatingPanel
				url={UI_ASSETS.toolbar}
				initialPos={[-15, 0, -2]}
				finalPos={[-5.5, 0.5, 0.2]}
				initialRot={[0, -0.5, 0]}
				finalRot={[0, 0.1, 0]}
				scale={[1, 5]}
				delay={1}
				scrollProgress={scrollProgress}
			/>

			{/* Panel (Right) */}
			<FloatingPanel
				url={UI_ASSETS.panel}
				initialPos={[15, 2, -2]}
				finalPos={[5.5, 0.5, 0.1]}
				initialRot={[0, 0.5, 0]}
				finalRot={[0, -0.1, 0]}
				scale={[2.5, 5]}
				delay={2}
				scrollProgress={scrollProgress}
			/>

			{/* Context (Bottom) */}
			<FloatingPanel
				url={UI_ASSETS.context}
				initialPos={[0, -10, 2]}
				finalPos={[0, -2, 1.5]}
				initialRot={[0.5, 0, 0]}
				finalRot={[-0.1, 0, 0]}
				scale={[4, 1]}
				delay={3}
				scrollProgress={scrollProgress}
			/>
		</group>
	);
}

export const DeconstructedUI = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const scrollProgress = useRef(0);
	const [unlocked, setUnlocked] = useState(false);

	// Setup GSAP ScrollTrigger
	useLayoutEffect(() => {
		if (!containerRef.current) return;

		gsap.registerPlugin(ScrollTrigger);

		const trigger = ScrollTrigger.create({
			trigger: containerRef.current,
			start: "top top", // Lock when it hits the top
			end: "+=150%", // Scroll distance (1.5x screen height)
			pin: true, // Pin the section in place
			scrub: 1, // Smooth scrubbing
			onUpdate: (self) => {
				scrollProgress.current = self.progress;
				// Trigger unlock at 50% scroll
				if (self.progress > 0.5 && !unlocked) {
					window.dispatchEvent(new Event("unlockModes"));
					setUnlocked(true);
				}
			},
		});

		return () => {
			trigger.kill();
		};
	}, [unlocked]);

	return (
		<section
			ref={containerRef}
			className="relative w-full h-[200vh] -mt-[50vh] z-20 bg-transparent pointer-events-none"
		>
			<div className="sticky top-0 h-screen w-full overflow-hidden">
				{/* Background Gradient */}
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a] to-[#0a0a0a] -z-10" />

				<Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
					<ambientLight intensity={0.5} />
					<spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
					<Suspense fallback={null}>
						<Scene scrollProgress={scrollProgress} />
					</Suspense>
				</Canvas>

				{/* Overlay UI Text */}
				<div className="absolute top-10 left-6 md:left-12 pointer-events-none mix-blend-difference z-30">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, delay: 0.5 }}
					>
						<h3 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
							SYSTEM_CORE
						</h3>
						<p className="text-xs font-mono text-neutral-400 mt-2">
							// WORKBENCH_INITIALIZED
						</p>
					</motion.div>
				</div>
			</div>
		</section>
	);
};
