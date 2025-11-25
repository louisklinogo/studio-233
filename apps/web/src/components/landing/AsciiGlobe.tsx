"use client";

import React, { useEffect, useRef, useState } from "react";

export const AsciiGlobe = () => {
    const preRef = useRef<HTMLPreElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Intersection Observer
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
            // Responsive resolution
            const isMobile = window.innerWidth < 768;
            const width = isMobile ? 50 : 80;
            const height = isMobile ? 25 : 40;

            const buffer: string[] = new Array(width * height).fill(" ");
            const zBuffer: number[] = new Array(width * height).fill(-100);

            const radius = isMobile ? 10 : 18;
            const center = { x: width / 2, y: height / 2 };

            // Globe parameters
            const latLines = 8;
            const longLines = 12;

            // Rotation
            const rotY = t * 0.5;
            const rotX = Math.PI / 6; // Tilt

            const drawPoint = (x: number, y: number, z: number, char: string) => {
                // Rotate Y
                let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
                let z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
                let y1 = y;

                // Rotate X (Tilt)
                let y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
                let z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);

                // Project
                const x2d = Math.floor(center.x + x1);
                const y2d = Math.floor(center.y + y2 * 0.5); // Aspect ratio correction

                if (x2d >= 0 && x2d < width && y2d >= 0 && y2d < height) {
                    const idx = y2d * width + x2d;
                    if (z2 > zBuffer[idx]) {
                        zBuffer[idx] = z2;
                        buffer[idx] = char;
                    }
                }
            };

            // Draw Latitude Lines
            for (let lat = 0; lat <= latLines; lat++) {
                const phi = (lat / latLines) * Math.PI; // 0 to PI
                const r = radius * Math.sin(phi);
                const y = radius * Math.cos(phi);

                for (let long = 0; long < 60; long++) {
                    const theta = (long / 60) * Math.PI * 2;
                    const x = r * Math.cos(theta);
                    const z = r * Math.sin(theta);
                    drawPoint(x, y, z, ".");
                }
            }

            // Draw Longitude Lines
            for (let long = 0; long < longLines; long++) {
                const theta = (long / longLines) * Math.PI * 2;

                for (let lat = 0; lat < 60; lat++) {
                    const phi = (lat / 60) * Math.PI;
                    const r = radius * Math.sin(phi);
                    const y = radius * Math.cos(phi);
                    const x = r * Math.cos(theta);
                    const z = r * Math.sin(theta);
                    drawPoint(x, y, z, ":");
                }
            }

            if (preRef.current) {
                let output = "";
                for (let i = 0; i < height; i++) {
                    output += buffer.slice(i * width, (i + 1) * width).join("") + "\n";
                }
                preRef.current.innerText = output;
            }

            t += 0.02;
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
                ASCII art animation of a rotating wireframe globe.
            </span>
        </div>
    );
};
