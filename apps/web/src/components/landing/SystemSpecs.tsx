"use client";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

const SPECS = [
    {
        id: "01",
        label: "GENERATIVE_ENGINE",
        status: "ONLINE",
        description: "High-fidelity parametric rendering",
        color: "bg-emerald-500"
    },
    {
        id: "02",
        label: "BATCH_PROCESSOR",
        status: "PROCESSING",
        description: "Parallel asset generation queue",
        color: "bg-amber-500"
    },
    {
        id: "03",
        label: "NEURAL_ORCHESTRATION",
        status: "ACTIVE",
        description: "Multi-agent workflow execution",
        color: "bg-blue-500"
    }
];

const LoadBar = ({ color }: { color: string }) => {
    const [width, setWidth] = useState(Math.random() * 100);

    useEffect(() => {
        const interval = setInterval(() => {
            setWidth(Math.random() * 100);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-1.5 w-24 bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative">
            {/* Grid lines inside the bar for more density */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_2px,#000_1px)] dark:bg-[linear-gradient(90deg,transparent_2px,#000_1px)] bg-[size:4px_100%] opacity-10 z-10" />
            <motion.div
                className={`h-full ${color}`}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            />
        </div>
    );
};

const NeuralMatrix = () => {
    // 8x8 Grid
    const cells = Array.from({ length: 64 });

    return (
        <div className="grid grid-cols-8 gap-1.5 opacity-30">
            {cells.map((_, i) => (
                <MatrixCell key={i} />
            ))}
        </div>
    );
};

const MatrixCell = () => {
    const [active, setActive] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setActive(Math.random() > 0.7);
        }, 100 + Math.random() * 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            className={`w-1 h-1 rounded-full ${active ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-400 dark:bg-neutral-600'}`}
            animate={{ opacity: active ? 1 : 0.2 }}
            transition={{ duration: 0.2 }}
        />
    );
};

export const SystemSpecs = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="w-full h-full flex flex-col justify-center px-8 py-12 border-l border-neutral-200 dark:border-neutral-800 relative overflow-hidden">
            {/* Decorative Corner Brackets for HUD feel */}
            <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-neutral-300 dark:border-neutral-700" />
            <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-neutral-300 dark:border-neutral-700" />

            {/* Technical Header */}
            <div className="absolute top-8 left-8 font-mono text-[10px] text-neutral-400 tracking-widest opacity-50">
                :: SYSTEM_DIAGNOSTICS_V2.4 ::
            </div>

            {/* Neural Matrix - Positioned Absolute Right */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden lg:block">
                <NeuralMatrix />
            </div>

            <div className="flex flex-col gap-10 max-w-lg mt-4 relative z-10">
                {SPECS.map((spec, index) => (
                    <motion.div
                        key={spec.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.5, ease: "easeOut" }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className="group cursor-default relative pl-8"
                    >
                        {/* Extended Connector Line */}
                        <div className="absolute left-0 top-3 w-6 h-px bg-neutral-200 dark:bg-neutral-800 group-hover:bg-neutral-400 dark:group-hover:bg-neutral-600 transition-colors duration-300" />

                        {/* Vertical Spine Segment (connects items visually) */}
                        {index !== SPECS.length - 1 && (
                            <div className="absolute left-0 top-3 w-px h-[calc(100%+2.5rem)] bg-neutral-100 dark:bg-neutral-900" />
                        )}

                        {/* Active Indicator Square */}
                        <motion.div
                            className={`absolute -left-[3px] top-[9px] w-1.5 h-1.5 ${spec.color}`}
                            initial={{ opacity: 0.5 }}
                            animate={{
                                opacity: hoveredIndex === index ? 1 : 0.5,
                                scale: hoveredIndex === index ? 1.2 : 1
                            }}
                        />

                        {/* Header Row */}
                        <div className="flex items-center gap-4 mb-2">
                            <span className="font-mono text-xs text-neutral-400 dark:text-neutral-600">
                                {spec.id}
                            </span>

                            <h3 className={`font-mono text-sm tracking-widest transition-colors duration-300 ${hoveredIndex === index
                                ? "text-neutral-900 dark:text-white"
                                : "text-neutral-500 dark:text-neutral-500"
                                }`}>
                                {spec.label}
                            </h3>

                            {/* Dynamic Load Bar */}
                            <div className="flex-1 flex items-center justify-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="font-mono text-[10px] text-neutral-400">
                                    LOAD
                                </span>
                                <LoadBar color={spec.color} />
                            </div>
                        </div>

                        {/* Description & Status */}
                        <div className="flex items-center justify-between pl-8 border-l border-neutral-100 dark:border-neutral-900 ml-2 py-1">
                            <p className="font-mono text-[10px] text-neutral-400 pl-2">
                                {spec.description}
                            </p>
                            <span className={`font-mono text-[10px] ${spec.status === "ONLINE" || spec.status === "ACTIVE" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                [{spec.status}]
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* System Status Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-16 flex items-center gap-4 pl-[4rem]"
            >
                <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`w-1 h-2 ${i === 1 ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-800'} animate-pulse`} style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
                <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                    System Operational
                </span>
                <span className="font-mono text-[10px] text-neutral-600 dark:text-neutral-600 ml-auto mr-8">
                    LAT: 34.0522° N
                </span>
            </motion.div>
        </div>
    );
};
