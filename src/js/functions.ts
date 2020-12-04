/*
 *
 *  * This file is subject to the terms and conditions defined in
 *  * file 'LICENSE.txt', which is part of this source code package.
 *
 */

import {turtle} from "./client";

type Point = {
    x: number;
    y: number;
};

/*
 * Generates a random color.
 */
export function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function segmentMiddle(start: Point, end: Point): Point {
    return {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2
    }
}

function createSegment(start: Point, end: Point, targetLen: number, gp: SVGPathElement, step: number, res: number): Point[] {
    const middlePointSegment = segmentMiddle(start, end);
    const distance = calculateLength(gp.getPointAtLength(targetLen), middlePointSegment);
    // The threshold.
    if (distance > res) {
        const division1Pos = targetLen - step / 2 + (1 / 4) * step;
        const division2Pos = targetLen - step / 2 + (3 / 4) * step;
        // call the function recursively.
        return [
            ...createSegment(start, gp.getPointAtLength(targetLen), division1Pos, gp, step / 2, res),
            ...createSegment(gp.getPointAtLength(targetLen), end, division2Pos, gp, step / 2, res)
        ];
    }
    // A direct path.
    return [end];
}

function optimizedPathWalker(path: SVGPathElement, resolution: number) {
    const step = path.getTotalLength();
    const points: DOMPoint[] = [];

    // In this loop, the current location of the cursor is the current variable.
    for (let current = 0; current <= path.getTotalLength(); current += step) {
        const supposedEnd = path.getPointAtLength(current);
        // This is the current point.
        if (points[points.length - 1]) {
            const segment = createSegment(points[points.length - 1], supposedEnd, current - (step / 2), path, step, resolution);
            points.push(...segment as any);
        } else {
            console.log('Skiping generation of upgrades for [%s]', current);
            points.push(supposedEnd);
        }
    }

    return points;
}

/*
 * Generates a points list for a given path with the given resolution.
 */
export function processPath(path: SVGPathElement, resolution: number) {
    const res = optimizedPathWalker(path, resolution);
    console.log('Generated %s points', res.length);
    return res;
}

/*
 * Creates and maintain an iframe in the document.
 */
export function getIframe(): HTMLIFrameElement {
    if (!document.getElementById("svg_renderIframe")) {
        const iframe = document.createElement("iframe");
        iframe.id = "svg_renderIframe";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        return iframe;
    }
    return document.getElementById('svg_renderIframe') as HTMLIFrameElement;
}

/*
 * Draws the list of points from the processor.
 */
export function drawPointsToCanvas(instructions: Instruction[]) {
    turtle.reset();
    for (let i = 0; i < instructions.length; i += 1) {
        turtle.penStyle = getRandomColor();
        let inst = instructions[i]
        turtle.forward(inst.val);
        turtle.right(inst.rot);
    }
}

export function calculateLength(point1: Point, point2: Point) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

// a = position du point avant
// b = position du point
// c = position du point après
// gamma = l'angle en radian
// retour = l'angle en degrés.
export function findAngle(pA: Point, pB: Point, pC: Point) {
    const la = calculateLength(pC, pB);
    const lb = calculateLength(pA, pC);
    const lc = calculateLength(pA, pB);

    const gamma = Math.acos((
        Math.pow(la, 2) + Math.pow(lb, 2) - Math.pow(lc, 2)
    ) / (2 * la * lb));

    return gamma * 180 / Math.PI;
}

type Instruction = {
    val: number;
    rot: number;
}

/*
 * Generates the instructions
 */
export function toInstructions(points: Point[]) {
    const instructions: Instruction[] = [];
    for (const pointIndex in points) {
        const index = Number(pointIndex);
        if (points[index + 1] && points[index - 1]) {
            instructions.push({
                val: calculateLength(points[index], points[index - 1]),
                rot: (180 - findAngle(
                    points[index + 1],
                    points[index - 1],
                    points[index],
                )),
            });
        } else {
            console.log('Start or end point at [%s] cannot be processed. %s', pointIndex, 'color: red;');
        }
    }
    return instructions;
}
