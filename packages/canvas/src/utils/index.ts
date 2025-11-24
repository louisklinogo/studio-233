/**
 * Canvas utility functions for Studio+233
 * 
 * This is a placeholder for canvas-related utilities.
 * Utilities will be migrated from src/lib and src/utils during app migration.
 */

import type { PlacedImage, PlacedVideo, CanvasElement } from '../types';

/**
 * Get bounding box for multiple elements
 */
export function getBoundingBox(
    elements: (PlacedImage | PlacedVideo | CanvasElement)[]
): { x: number; y: number; width: number; height: number } | null {
    if (elements.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const el of elements) {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + el.width);
        maxY = Math.max(maxY, el.y + el.height);
    }

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Snap value to grid
 */
export function snapToGrid(value: number, gridSize: number = 10): number {
    return Math.round(value / gridSize) * gridSize;
}

/**
 * Check if a point is inside a rectangle
 */
export function isPointInRect(
    px: number,
    py: number,
    rect: { x: number; y: number; width: number; height: number }
): boolean {
    return (
        px >= rect.x &&
        px <= rect.x + rect.width &&
        py >= rect.y &&
        py <= rect.y + rect.height
    );
}
