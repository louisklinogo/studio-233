"use client";

import { Image } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
	Bloom,
	ChromaticAberration,
	EffectComposer,
	Noise,
	Scanline,
	Vignette,
} from "@react-three/postprocessing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
	Component,
	type MutableRefObject,
	type ReactNode,
	Suspense,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import * as THREE from "three";

const IMAGES = [
	"/samples/077b8fd4-b483-4032-b4bb-16e97300d431.jpg",
	"/samples/0d26b6ad9803b55c02649b269411db07.jpg",
	"/samples/15bd5e486b8711c761ed385eafa4948c.jpg",
	"/samples/1a9ffc22a6bc418fd161578ca525a769.jpg",
	"/samples/329597df4e8b308c85ec490a0a2567be.jpg",
	"/samples/510da59cd8a63f4690f8868787df87ff.jpg",
	"/samples/5950210e5984e10fdc5842bfae90ae0c.jpg",
	"/samples/5b298b19195d804a1589d6c5ab49a464.jpg",
	"/samples/5f23f01a-cf87-4d96-9aa3-08ecee07f68a.jpeg",
	"/samples/69086693c2ad1c14c7a7dbeb660aa851.jpg",
	"/samples/8208979666545e33e1bf36ba3e5b34ca.jpg",
	"/samples/8ea7a5cb-15b4-4419-be46-a629eb9684cc.jpeg",
	"/samples/91383fb3-dc5e-482e-a316-618d0c5d71a3.jpeg",
	"/samples/954ee70551d6bcd4901fadae147334da.jpg",
	"/samples/a4d921edefea493e28135d0d46ce558f.jpg",
	"/samples/a5372041-e052-4295-a3cf-86d70d27bcac.jpeg",
	"/samples/b29388d1-8c3d-4a91-b987-2aadaab26bc5.jpeg",
	"/samples/c7a94ae9247a38e70f6c2bf207cbe670.jpg",
	"/samples/d424fd48c9207051860086816822712c.jpg",
	"/samples/dfde730b8f85a5ed6a558a6d216008a3.jpg",
	"/samples/fc741681ad65e98b83228197c3d44f97.jpg",
];

class ArchiveErrorBoundary extends Component<
	{ children: ReactNode },
	{ hasError: boolean }
> {
	state = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) return null;
		return this.props.children;
	}
}

function TunnelItem({
	url,
	index,
	z,
	scale,
	scrollProgress,
}: {
	url: string;
	index: number;
	z: number;
	scale: number;
	scrollProgress: MutableRefObject<number>;
}) {
	const ref = useRef<any>(null);
	const radius = 4;

	useFrame((state) => {
		if (!ref.current) return;

		// Move forward based on scroll + constant auto-flight
		// We want infinite loop, so we modulo the Z position
		const autoFlight = state.clock.elapsedTime * 2; // Constant speed
		const scrollOffset = scrollProgress.current * 75; // Speed multiplier
		const zPos = (z + scrollOffset + autoFlight) % 30; // 30 is tunnel length

		// Map Z to opacity (fade out when close to camera, fade in far away)
		const dist = zPos;
		ref.current.position.z = 5 - dist; // Move towards camera (+Z is forward in this setup)

		// Spiral effect
		const theta =
			index * 0.5 + scrollProgress.current * 2 + state.clock.elapsedTime * 0.1;
		const r = radius + Math.sin(index + state.clock.elapsedTime * 0.5) * 1; // Variation in radius

		ref.current.position.x = Math.cos(theta) * r;
		ref.current.position.y = Math.sin(theta) * r;

		// Look at center (slightly ahead)
		ref.current.lookAt(0, 0, ref.current.position.z - 10);

		// Opacity Fade
		const opacity = Math.max(0, Math.min(1, (dist - 2) / 5));
		ref.current.material.opacity = opacity;
		ref.current.material.transparent = true;
	});

	return (
		<Image
			ref={ref}
			url={url}
			transparent
			side={THREE.DoubleSide}
			scale={[scale * 1.5, scale * 2]} // Aspect ratio
		/>
	);
}

function TunnelGroup({
	scrollProgress,
}: {
	scrollProgress: MutableRefObject<number>;
}) {
	// Generate items
	const items = useMemo(() => {
		return Array.from({ length: 40 }, (_, i) => ({
			url: IMAGES[i % IMAGES.length],
			z: i * 0.8, // Dense spacing
			scale: 0.5 + Math.random() * 0.5,
		}));
	}, []);

	return (
		<group>
			{items.map((item, i) => (
				<TunnelItem
					key={i}
					index={i}
					scrollProgress={scrollProgress}
					{...item}
				/>
			))}
		</group>
	);
}

// Stable Effects Wrapper - Prevents context loss crashes on navigation
function StableEffects() {
	const { gl, scene, camera } = useThree();
	const [ready, setReady] = useState(false);

	useEffect(() => {
		// Small delay to ensure GL context is fully stabilized
		const timeout = setTimeout(() => setReady(true), 100);
		return () => {
			clearTimeout(timeout);
			setReady(false);
		};
	}, []);

	// Only render EffectComposer when context is guaranteed
	if (!ready || !gl) return null;

	return (
		<EffectComposer
			enableNormalPass={false}
			multisampling={0} // Disable MSAA for performance
			autoClear={false}
		>
			<Bloom
				luminanceThreshold={0.2}
				mipmapBlur={false}
				intensity={0.4}
				radius={0.6}
			/>
			<Noise opacity={0.15} />
			<Vignette eskil={false} offset={0.1} darkness={1.1} />
			<Scanline density={1.5} opacity={0.15} />
			<ChromaticAberration offset={[0.001, 0.001]} radialModulation={false} />
		</EffectComposer>
	);
}

export const InfiniteArchive = () => {
	const [mounted, setMounted] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const scrollProgress = useRef(0);

	useEffect(() => {
		setMounted(true);
	}, []);

	useLayoutEffect(() => {
		if (!mounted) return;
		if (!containerRef.current) return;

		gsap.registerPlugin(ScrollTrigger);

		const trigger = ScrollTrigger.create({
			trigger: containerRef.current,
			start: "top top",
			end: "bottom bottom",
			onUpdate: (self) => {
				scrollProgress.current = self.progress;
			},
			invalidateOnRefresh: true,
		});

		ScrollTrigger.refresh();

		return () => {
			trigger.kill();
		};
	}, [mounted]);

	return (
		<div ref={containerRef} className="relative h-[150vh] w-full bg-black">
			<div className="sticky top-0 h-screen w-full overflow-hidden">
				{mounted ? (
					<ArchiveErrorBoundary>
						<Canvas gl={{ antialias: false }} dpr={[1, 1.5]}>
							<fog attach="fog" args={["#000000", 3, 12]} />
							<Suspense fallback={null}>
								<TunnelGroup scrollProgress={scrollProgress} />
								<StableEffects />
							</Suspense>
						</Canvas>
					</ArchiveErrorBoundary>
				) : null}

				{/* Overlay Text */}
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-difference z-10">
					<h2 className="text-[12vw] font-black text-white leading-none tracking-tighter text-center opacity-80 blur-[2px] hover:blur-none transition-all duration-300">
						UNLIMITED
						<br />
						SCALE
					</h2>
				</div>
			</div>
		</div>
	);
};
