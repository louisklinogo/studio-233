"use client";

import React, { useEffect, useRef, useState } from "react";

export const AsciiCube = () => {
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

        let A = 0;
        let B = 0;
        let C = 0;
        let animationFrameId: number;

        const render = () => {
            const isMobile = window.innerWidth < 768;
            const width = isMobile ? 50 : 100;
            const height = isMobile ? 24 : 45;

            const buffer: string[] = new Array(width * height).fill(" ");
            const zBuffer: number[] = new Array(width * height).fill(0);

            const cubeWidth = 15; // Slightly smaller to fit better
            const horizontalOffset = width / 2;
            const verticalOffset = height / 2;

            const chars = ".,-~:;=!*#$@";

            const calculateX = (i: number, j: number, k: number) => {
                return j * Math.sin(A) * Math.sin(B) * Math.cos(C) - k * Math.cos(A) * Math.sin(B) * Math.cos(C) +
                    j * Math.cos(A) * Math.sin(C) + k * Math.sin(A) * Math.sin(C) + i * Math.cos(B) * Math.cos(C);
            };

            const calculateY = (i: number, j: number, k: number) => {
                return j * Math.cos(A) * Math.cos(C) + k * Math.sin(A) * Math.cos(C) -
                    j * Math.sin(A) * Math.sin(B) * Math.sin(C) + k * Math.cos(A) * Math.sin(B) * Math.sin(C) - i * Math.cos(B) * Math.sin(C);
            };

            const calculateZ = (i: number, j: number, k: number) => {
                return k * Math.cos(A) * Math.cos(B) - j * Math.sin(A) * Math.cos(B) + i * Math.sin(B);
            };

            // Improved rotation matrix
            const rotate = (x: number, y: number, z: number) => {
                // Rotate X
                let y1 = y * Math.cos(A) - z * Math.sin(A);
                let z1 = y * Math.sin(A) + z * Math.cos(A);
                let x1 = x;

                // Rotate Y
                let x2 = x1 * Math.cos(B) - z1 * Math.sin(B);
                let z2 = x1 * Math.sin(B) + z1 * Math.cos(B);
                let y2 = y1;

                // Rotate Z
                let x3 = x2 * Math.cos(C) - y2 * Math.sin(C);
                let y3 = x2 * Math.sin(C) + y2 * Math.cos(C);
                let z3 = z2;

                return [x3, y3, z3];
            };

            // Denser sampling for solid look
            const step = 0.4;

            for (let x = -cubeWidth; x <= cubeWidth; x += step) {
                for (let y = -cubeWidth; y <= cubeWidth; y += step) {
                    const points = [
                        [x, y, -cubeWidth],
                        [x, y, cubeWidth],
                        [x, -cubeWidth, y],
                        [x, cubeWidth, y],
                        [-cubeWidth, x, y],
                        [cubeWidth, x, y]
                    ];

                    // Normals
                    const normals = [
                        [0, 0, -1],
                        [0, 0, 1],
                        [0, -1, 0],
                        [0, 1, 0],
                        [-1, 0, 0],
                        [1, 0, 0]
                    ];

                    points.forEach((p, idx) => {
                        const [rx, ry, rz] = rotate(p[0], p[1], p[2]);
                        const [nx, ny, nz] = rotate(normals[idx][0], normals[idx][1], normals[idx][2]);

                        const z = rz + 100;
                        const ooz = 1 / z;

                        const xp = Math.floor(width / 2 + rx * ooz * 60 * 2);
                        const yp = Math.floor(height / 2 + ry * ooz * 60);

                        const idxBuffer = xp + yp * width;

                        if (idxBuffer >= 0 && idxBuffer < width * height) {
                            if (ooz > zBuffer[idxBuffer]) {
                                zBuffer[idxBuffer] = ooz;

                                // Dynamic lighting
                                const lightX = 0;
                                const lightY = 1;
                                const lightZ = -1;

                                let luminance = nx * lightX + ny * lightY + nz * lightZ;
                                if (luminance < 0) luminance = 0;

                                const charIdx = Math.floor(luminance * 8);
                                buffer[idxBuffer] = chars[Math.min(charIdx, chars.length - 1)];
                            }
                        }
                    });
                }
            }

            if (preRef.current) {
                let output = "";
                for (let i = 0; i < height; i++) {
                    output += buffer.slice(i * width, (i + 1) * width).join("") + "\n";
                }
                preRef.current.innerText = output;
            }

            A += 0.02;
            B += 0.02;
            C += 0.01; // Added Z rotation for more complex movement
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
                ASCII art animation of a rotating solid cube.
            </span>
        </div>
    );
};
