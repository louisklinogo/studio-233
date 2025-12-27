import {
	KineticTrack,
	type KineticTrackHandle,
} from "@/components/landing/KineticTrack";
import { SystemHUD } from "@/components/landing/SystemHUD";
import { VortexContainer } from "@/components/landing/VortexContainer";
import {
	VortexHero,
	type VortexHeroHandle,
} from "@/components/landing/VortexHero";
import { VortexLenis } from "@/components/landing/VortexLenis";
import { CustomCursor } from "@/components/ui/CustomCursor";

export default function VortexPage() {
	const [mounted, setMounted] = useState(false);
	const heroRef = useRef<VortexHeroHandle>(null);
	const trackRef = useRef<KineticTrackHandle>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<VortexLenis>
			<CustomCursor />

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1.5 }}
				className="min-h-dvh bg-[#f4f4f0] text-neutral-50 font-sans selection:bg-[#D81E05] selection:text-white relative"
			>
				{/* The Unified Kinetic Stream Container */}
				<VortexContainer heroRef={heroRef} trackRef={trackRef}>
					<VortexHero ref={heroRef} />
					<KineticTrack ref={trackRef} />
				</VortexContainer>

				{/* Persistent System HUD */}
				<SystemHUD />
			</motion.div>
		</VortexLenis>
	);
}
