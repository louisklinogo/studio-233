"use client";

import React, { useEffect, useRef, useState } from "react";

export const AsciiHelix = () => {
    const preRef = useRef<HTMLPreElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 },
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let t = 0;
        let animationFrameId: number;

        const render = () => {
            // Responsive resolution matching other components
            const isMobile = window.innerWidth < 768;
            const width = isMobile ? 50 : 100;
            const height = isMobile ? 24 : 45;

            const buffer: string[] = new Array(width * height).fill(" ");
            const zBuffer: number[] = new Array(width * height).fill(0);

            // Helix parameters
            const strands = 2;
            const twists = 4; // More twists for density
            const radius = isMobile ? 8 : 12;
            const center = { x: width / 2, y: height / 2 };

            // Standard premium char set
            const chars = ".,-~:;=!*#$@";

            // Draw strands with higher density
            // Iterate through Y (vertical)
            for (let y = 0; y < height; y += 0.5) { // 0.5 step for vertical density
                // Map y to angle for twist
                const angleBase = (y / height) * Math.PI * 2 * twists;

                for (let s = 0; s < strands; s++) {
                    const angle = angleBase + (s * Math.PI) + t;

                    // 3D coordinates
                    const x3d = Math.cos(angle) * radius;
                    const z3d = Math.sin(angle) * radius;

                    // Project to 2D
                    const x2d = Math.floor(center.x + x3d * 2); // Scale X for aspect ratio
                    const y2d = Math.floor(y);

                    // Depth shading
                    const depth = z3d + radius; // 0 to 2*radius
                    // Normalize depth for char selection
                    const normalizedDepth = (z3d + radius) / (2 * radius);
                    const charIndex = Math.floor(normalizedDepth * (chars.length - 1));
                    const char = chars[Math.max(0, Math.min(charIndex, chars.length - 1))];

                    if (x2d >= 0 && x2d < width && y2d >= 0 && y2d < height) {
                        const idx = y2d * width + x2d;
                        // Simple z-buffering
                        if (z3d + 20 > zBuffer[idx]) {
                            zBuffer[idx] = z3d + 20;
                            buffer[idx] = char;

                            // Add connectors (base pairs)
                            if (s === 0 && Math.floor(y) % 2 === 0) {
                                const xOther = Math.floor(center.x + Math.cos(angle + Math.PI) * radius * 2);
                                const start = Math.min(x2d, xOther);
                                const end = Math.max(x2d, xOther);

                                // Draw connector
                                for (let k = start + 1; k < end; k++) {
                                    const kIdx = y2d * width + k;
                                    // Only draw if not obscuring front strand too much
                                    if (z3d > zBuffer[kIdx] - 5) {
                                        // Use lighter chars for connectors
                                        buffer[kIdx] = "·";
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (preRef.current) {
                let output = "";
                for (let i = 0; i < height; i++) {
                    output += buffer.slice(i * width, (i + 1) * width).join("") + "\n";
                }
                preRef.current.innerText = output;
            }

            t += 0.05;
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [isVisible]);

    return (
        <div
            ref={containerRef}
            className="flex items-center justify-center w-full h-full overflow-hidden"
            aria-hidden="true"
        >
            <pre
                ref={preRef}
                className="font-mono text-[8px] sm:text-[10px] md:text-xs leading-[1.0] text-neutral-900 dark:text-white whitespace-pre select-none"
                style={{
                    fontFamily: '"Courier New", Courier, monospace',
                    letterSpacing: "0px",
                }}
            />
            <span className="sr-only">
                ASCII art animation of a rotating DNA helix.
            </span>
        </div>
    );
};
