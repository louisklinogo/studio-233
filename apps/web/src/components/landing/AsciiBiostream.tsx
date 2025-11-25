"use client";

import React, { useEffect, useRef, useState } from "react";

export const AsciiBiostream = () => {
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
            // Resolution
            const isMobile = window.innerWidth < 768;
            const width = isMobile ? 40 : 80;
            const height = isMobile ? 20 : 40;

            const buffer: string[] = new Array(width * height).fill(" ");
            const zBuffer: number[] = new Array(width * height).fill(-100);

            // Thick cable parameters
            const radius = 12;
            const thickness = 6;
            const center = { x: width / 2, y: height / 2 };

            // Dense chars
            const chars = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";

            for (let y = 0; y < height; y++) {
                // Map y to angle for twist
                // A slow twist along the vertical axis
                const twist = (y / height) * Math.PI * 4;
                const phase = t * 2;

                // We render a series of circles (cross sections) to form the tube
                // But to make it solid, we need to fill the volume
                // Raymarching is expensive in JS loop, so we'll use "splatting" of dense points

                // Iterate along the thickness of the cable at this height
                // We simulate a 3D volume by iterating angles around the cable center
                for (let ang = 0; ang < Math.PI * 2; ang += 0.1) {
                    // Cable core position (spiraling)
                    // The cable itself spirals around a central axis
                    const coreX = Math.cos(twist + phase) * (radius * 0.5);
                    const coreZ = Math.sin(twist + phase) * (radius * 0.5);

                    // Surface point on the cable
                    // x = coreX + cos(ang)*thickness
                    // z = coreZ + sin(ang)*thickness
                    const surfX = coreX + Math.cos(ang) * thickness;
                    const surfZ = coreZ + Math.sin(ang) * thickness;

                    // Project
                    const x2d = Math.floor(center.x + surfX);
                    const y2d = y;

                    // Lighting/Depth
                    // Normal vector of the surface point relative to core
                    const nx = Math.cos(ang);
                    const nz = Math.sin(ang);

                    // Light from front-left
                    const light = nx * 0.5 + nz * 0.5 + 0.5; // 0 to 1

                    // Add "cellular" pattern moving up
                    const cell = Math.sin(y * 0.5 - t * 5) > 0.5 ? 0.2 : 0;

                    const val = light + cell;

                    if (x2d >= 0 && x2d < width && y2d >= 0 && y2d < height) {
                        const idx = y2d * width + x2d;
                        if (surfZ > zBuffer[idx]) {
                            zBuffer[idx] = surfZ;
                            const charIdx = Math.floor(val * (chars.length - 1));
                            buffer[idx] = chars[Math.max(0, Math.min(chars.length - 1, chars.length - 1 - charIdx))];
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
                className="font-mono text-[10px] sm:text-[12px] md:text-sm leading-[1.0] text-neutral-900 dark:text-white whitespace-pre select-none font-bold"
                style={{
                    fontFamily: '"Courier New", Courier, monospace',
                    letterSpacing: "-1px",
                }}
            />
            <span className="sr-only">
                ASCII art animation of a bio-digital data stream.
            </span>
        </div>
    );
};
