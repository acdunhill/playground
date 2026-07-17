/* Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

import * as d3 from 'd3';

/**
 * A two dimensional example: x and y coordinates with the label.
 */
export type Example2D = {
  x: number,
  y: number,
  label: number
};

type Point = {
  x: number,
  y: number
};

/**
 * Shuffles the array using Fisher-Yates algorithm. Uses the seedrandom
 * library as the random generator.
 */
export function shuffle(array: any[]): void {
  let counter = array.length;
  let temp = 0;
  let index = 0;
  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    index = Math.floor(Math.random() * counter);
    // Decrease counter by 1
    counter--;
    // And swap the last element with it
    temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
}

export type DataGenerator = (numSamples: number, noise: number) => Example2D[];

export function classifyTwoGaussData(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];

  let varianceScale = d3.scale.linear().domain([0, .5]).range([0.5, 4]);
  let variance = varianceScale(noise);

  function genGauss(cx: number, cy: number, label: number) {
    for (let i = 0; i < numSamples / 2; i++) {
      let x = normalRandom(cx, variance);
      let y = normalRandom(cy, variance);
      points.push({x, y, label});
    }
  }

  genGauss(2, 2, 1); // Gaussian with positive examples.
  genGauss(-2, -2, -1); // Gaussian with negative examples.
  return points;
}

export function regressPlane(numSamples: number, noise: number):
  Example2D[] {
  let radius = 6;
  let labelScale = d3.scale.linear()
    .domain([-10, 10])
    .range([-1, 1]);
  let getLabel = (x, y) => labelScale(x + y);

  let points: Example2D[] = [];
  for (let i = 0; i < numSamples; i++) {
    let x = randUniform(-radius, radius);
    let y = randUniform(-radius, radius);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getLabel(x + noiseX, y + noiseY);
    points.push({x, y, label});
  }
  return points;
}

export function regressGaussian(numSamples: number, noise: number):
  Example2D[] {
  let points: Example2D[] = [];

  let labelScale = d3.scale.linear()
    .domain([0, 2])
    .range([1, 0])
    .clamp(true);

  let gaussians = [
    [-4, 2.5, 1],
    [0, 2.5, -1],
    [4, 2.5, 1],
    [-4, -2.5, -1],
    [0, -2.5, 1],
    [4, -2.5, -1]
  ];

  function getLabel(x, y) {
    // Choose the one that is maximum in abs value.
    let label = 0;
    gaussians.forEach(([cx, cy, sign]) => {
      let newLabel = sign * labelScale(dist({x, y}, {x: cx, y: cy}));
      if (Math.abs(newLabel) > Math.abs(label)) {
        label = newLabel;
      }
    });
    return label;
  }
  let radius = 6;
  for (let i = 0; i < numSamples; i++) {
    let x = randUniform(-radius, radius);
    let y = randUniform(-radius, radius);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getLabel(x + noiseX, y + noiseY);
    points.push({x, y, label});
  };
  return points;
}

export function classifySpiralData(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];
  let n = numSamples / 2;

  function genSpiral(deltaT: number, label: number) {
    for (let i = 0; i < n; i++) {
      let r = i / n * 5;
      let t = 1.75 * i / n * 2 * Math.PI + deltaT;
      let x = r * Math.sin(t) + randUniform(-1, 1) * noise;
      let y = r * Math.cos(t) + randUniform(-1, 1) * noise;
      points.push({x, y, label});
    }
  }

  genSpiral(0, 1); // Positive examples.
  genSpiral(Math.PI, -1); // Negative examples.
  return points;
}

export function classifyCircleData(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];
  let radius = 5;
  function getCircleLabel(p: Point, center: Point) {
    return (dist(p, center) < (radius * 0.5)) ? 1 : -1;
  }

  // Generate positive points inside the circle.
  for (let i = 0; i < numSamples / 2; i++) {
    let r = randUniform(0, radius * 0.5);
    let angle = randUniform(0, 2 * Math.PI);
    let x = r * Math.sin(angle);
    let y = r * Math.cos(angle);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getCircleLabel({x: x + noiseX, y: y + noiseY}, {x: 0, y: 0});
    points.push({x, y, label});
  }

  // Generate negative points outside the circle.
  for (let i = 0; i < numSamples / 2; i++) {
    let r = randUniform(radius * 0.7, radius);
    let angle = randUniform(0, 2 * Math.PI);
    let x = r * Math.sin(angle);
    let y = r * Math.cos(angle);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getCircleLabel({x: x + noiseX, y: y + noiseY}, {x: 0, y: 0});
    points.push({x, y, label});
  }
  return points;
}

export function classifyXORData(numSamples: number, noise: number):
    Example2D[] {
  function getXORLabel(p: Point) { return p.x * p.y >= 0 ? 1 : -1; }

  let points: Example2D[] = [];
  for (let i = 0; i < numSamples; i++) {
    let x = randUniform(-5, 5);
    let padding = 0.3;
    x += x > 0 ? padding : -padding;  // Padding.
    let y = randUniform(-5, 5);
    y += y > 0 ? padding : -padding;
    let noiseX = randUniform(-5, 5) * noise;
    let noiseY = randUniform(-5, 5) * noise;
    let label = getXORLabel({x: x + noiseX, y: y + noiseY});
    points.push({x, y, label});
  }
  return points;
}

/**
 * Generates a point cloud shaped like the AQA logo: the letters "AQA" (both
 * A-glyphs and the Q ring) drawn in the positive (purple) class, with only the
 * Q's swoosh/tail drawn in the negative (cherry-red) class. Points use the
 * standard math orientation (positive y up), so it renders upright.
 */
export function classifyAqaLogo(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];
  // Per-point jitter: a thin base thickness plus a noise-controlled spread.
  let jitter = (base: number) => randUniform(-1, 1) * (base + noise * 1.5);

  // Sample a point along a straight stroke from (x0,y0) to (x1,y1).
  function seg(x0: number, y0: number, x1: number, y1: number,
      label: number, base = 0.12) {
    let t = Math.random();
    points.push({
      x: x0 + (x1 - x0) * t + jitter(base),
      y: y0 + (y1 - y0) * t + jitter(base),
      label
    });
  }

  // Sample a point on a circle (the body of the "Q").
  function arc(cx: number, cy: number, r: number, label: number) {
    let a = Math.random() * 2 * Math.PI;
    points.push({
      x: cx + r * Math.cos(a) + jitter(0.12),
      y: cy + r * Math.sin(a) + jitter(0.12),
      label
    });
  }

  // Draw one upright "A" glyph centered at cx: two legs and a low crossbar.
  function drawA(cx: number, count: number, label: number) {
    let w = 1.5, top = 3.2, bot = -3.2, barY = -0.6;
    for (let i = 0; i < count; i++) {
      let p = Math.random();
      if (p < 0.4) {
        seg(cx - w, bot, cx, top, label);            // left leg
      } else if (p < 0.8) {
        seg(cx + w, bot, cx, top, label);            // right leg
      } else {
        seg(cx - w * 0.55, barY, cx + w * 0.55, barY, label);  // crossbar
      }
    }
  }

  // Draw the "Q" ring centered at the origin (purple).
  function drawQring(count: number, label: number) {
    for (let i = 0; i < count; i++) {
      arc(0, 0, 2.7, label);
    }
  }

  // Draw the red swoosh: the Q's tail sweeping out to the lower right.
  function drawSwoosh(count: number, label: number) {
    for (let i = 0; i < count; i++) {
      seg(1.3, -1.3, 3.2, -3.4, label, 0.22);
    }
  }

  let nRed = Math.floor(numSamples * 0.16);
  let nPurple = numSamples - nRed;
  let nA = Math.floor(nPurple * 0.29);
  let nQ = nPurple - 2 * nA;
  drawA(-4.2, nA, 1);        // first "A"  (purple)
  drawQring(nQ, 1);          // "Q" ring   (purple)
  drawA(4.2, nA, 1);         // second "A" (purple)
  drawSwoosh(nRed, -1);      // Q swoosh   (cherry red)
  return points;
}

/** A line segment, used to describe letter strokes. */
type Seg = {x0: number, y0: number, x1: number, y1: number};

/** Euclidean distance from point (px,py) to a line segment. */
function distToSeg(px: number, py: number, s: Seg): number {
  let dx = s.x1 - s.x0, dy = s.y1 - s.y0;
  let l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - s.x0) * dx + (py - s.y0) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  let qx = s.x0 + t * dx, qy = s.y0 + t * dy;
  return Math.sqrt((px - qx) * (px - qx) + (py - qy) * (py - qy));
}

/**
 * Returns the stroke segments for a single character, drawn in a box centered
 * at (cx,cy) with half-width w and half-height h. Local coords are in [-1,1].
 */
function letterStrokes(ch: string, cx: number, cy: number,
    w: number, h: number): Seg[] {
  let s = (x0: number, y0: number, x1: number, y1: number): Seg =>
      ({x0: cx + x0 * w, y0: cy + y0 * h, x1: cx + x1 * w, y1: cy + y1 * h});
  switch (ch) {
    case "A": return [s(-1, -1, 0, 1), s(1, -1, 0, 1), s(-0.5, -0.1, 0.5, -0.1)];
    case "B": return [s(-1, -1, -1, 1), s(-1, 1, 0.4, 1), s(-1, 0, 0.5, 0),
        s(-1, -1, 0.4, -1), s(0.4, 1, 0.9, 0.5), s(0.9, 0.5, 0.5, 0),
        s(0.4, -1, 0.9, -0.5), s(0.9, -0.5, 0.5, 0)];
    case "C": return [s(0.7, 1, -0.5, 1), s(-0.5, 1, -1, 0.4),
        s(-1, 0.4, -1, -0.4), s(-1, -0.4, -0.5, -1), s(-0.5, -1, 0.7, -1)];
    case "X": return [s(-1, -1, 1, 1), s(-1, 1, 1, -1)];
    case "Y": return [s(-1, 1, 0, 0), s(1, 1, 0, 0), s(0, 0, 0, -1)];
    case "Z": return [s(-1, 1, 1, 1), s(1, 1, -1, -1), s(-1, -1, 1, -1)];
    default: return [];
  }
}

/**
 * Generates a purple (positive class) background filling the plane, with the
 * letters "A B C" / "X Y Z" drawn on top in red (negative class). Purple
 * background points are kept clear of the letters so they stay legible.
 */
export function classifyAbcXyz(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];
  let cols = [-3.6, 0, 3.6], w = 1.1, h = 1.5;
  let layout: [string[], number][] = [
    [["A", "B", "C"], 2.9],
    [["X", "Y", "Z"], -2.9]
  ];

  // Collect all letter stroke segments.
  let segs: Seg[] = [];
  layout.forEach(([chars, cy]) => {
    chars.forEach((ch, i) => {
      segs = segs.concat(letterStrokes(ch, cols[i], cy, w, h));
    });
  });

  // Red letter points, distributed along the strokes by length.
  let lens = segs.map(s =>
      Math.sqrt((s.x1 - s.x0) * (s.x1 - s.x0) + (s.y1 - s.y0) * (s.y1 - s.y0)));
  let total = lens.reduce((a, b) => a + b, 0);
  let jitter = () => randUniform(-1, 1) * (0.09 + noise * 1.2);
  let nRed = Math.floor(numSamples * 0.5);
  for (let i = 0; i < nRed; i++) {
    let r = Math.random() * total, k = 0;
    while (r > lens[k] && k < segs.length - 1) { r -= lens[k]; k++; }
    let s = segs[k], t = Math.random();
    points.push({
      x: s.x0 + (s.x1 - s.x0) * t + jitter(),
      y: s.y0 + (s.y1 - s.y0) * t + jitter(),
      label: -1
    });
  }

  // Purple background points, rejection-sampled away from the letters.
  let nPurple = numSamples - nRed, placed = 0, guard = 0;
  let margin = 0.55;
  while (placed < nPurple && guard < nPurple * 40) {
    guard++;
    let x = randUniform(-6, 6), y = randUniform(-6, 6);
    let near = segs.some(s => distToSeg(x, y, s) < margin);
    if (near) { continue; }
    points.push({x, y, label: 1});
    placed++;
  }
  return points;
}

/**
 * A "square with a triangular hole": the red (negative) class is the region
 * inside the square but outside the triangle; everything else is purple
 * (positive). Built as a hierarchical-features demo - a small network learns
 * line detectors (layer 1), which combine into a "square" detector and a
 * "triangle" detector (layer 2), which the output combines into "square
 * AND-NOT triangle".
 */
export function classifySquareTriangle(numSamples: number,
    noise: number): Example2D[] {
  let points: Example2D[] = [];
  let sq = 3.9;                                   // square half-size
  let v = [[0, 2.8], [-2.8, -2.2], [2.8, -2.2]];  // triangle vertices

  let edgeSign = (px: number, py: number, ax: number, ay: number,
      bx: number, by: number) => (px - bx) * (ay - by) - (ax - bx) * (py - by);
  let inTriangle = (x: number, y: number) => {
    let d1 = edgeSign(x, y, v[0][0], v[0][1], v[1][0], v[1][1]);
    let d2 = edgeSign(x, y, v[1][0], v[1][1], v[2][0], v[2][1]);
    let d3 = edgeSign(x, y, v[2][0], v[2][1], v[0][0], v[0][1]);
    let hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    let hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  };
  let inSquare = (x: number, y: number) =>
      Math.abs(x) < sq && Math.abs(y) < sq;

  // Use a denser fill than other datasets so the two shapes read clearly.
  let n = numSamples * 2;
  for (let i = 0; i < n; i++) {
    let x = randUniform(-6, 6), y = randUniform(-6, 6);
    // Noise perturbs the point used for labeling, fuzzing the boundary.
    let nx = x + randUniform(-5, 5) * noise, ny = y + randUniform(-5, 5) * noise;
    let label = (inSquare(nx, ny) && !inTriangle(nx, ny)) ? -1 : 1;
    points.push({x, y, label});
  }
  return points;
}

/**
 * Returns a sample from a uniform [a, b] distribution.
 * Uses the seedrandom library as the random generator.
 */
function randUniform(a: number, b: number) {
  return Math.random() * (b - a) + a;
}

/**
 * Samples from a normal distribution. Uses the seedrandom library as the
 * random generator.
 *
 * @param mean The mean. Default is 0.
 * @param variance The variance. Default is 1.
 */
function normalRandom(mean = 0, variance = 1): number {
  let v1: number, v2: number, s: number;
  do {
    v1 = 2 * Math.random() - 1;
    v2 = 2 * Math.random() - 1;
    s = v1 * v1 + v2 * v2;
  } while (s > 1);

  let result = Math.sqrt(-2 * Math.log(s) / s) * v1;
  return mean + Math.sqrt(variance) * result;
}

/** Returns the eucledian distance between two points in space. */
function dist(a: Point, b: Point): number {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
