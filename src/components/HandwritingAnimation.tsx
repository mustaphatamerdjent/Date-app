import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

interface HandwritingAnimationProps {
  text?: string;
  durationMs?: number;
  onComplete?: () => void;
  className?: string;
  strokeWidth?: number;
  reducedMotion?: boolean;
  replayKey?: number;
}

type Point = [number, number];
// A CuspPath is a list of smooth point segments joined at sharp reversal cusps within a single continuous pen stroke.
type CuspPath = Point[][];

interface GlyphDef {
  width: number;
  primary: CuspPath[];
  secondary?: CuspPath[];
  connectIn?: boolean;
  connectOut?: boolean;
}

/**
 * Converts a sequence of 2D points into a smooth SVG cubic Bezier path segment ("C ...")
 * using centripetal Catmull-Rom spline interpolation.
 */
function pointsToSmoothBezierCommands(pts: Point[], tension = 0.38): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) {
    return `L ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  }
  if (pts.length === 2) {
    return `L ${pts[1][0].toFixed(1)} ${pts[1][1].toFixed(1)}`;
  }

  let d = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i === 0 ? pts[0] : pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i + 2 < pts.length ? pts[i + 2] : p2;

    const cp1x = p1[0] + (p2[0] - p0[0]) * tension * 0.5;
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension * 0.5;
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension * 0.5;
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension * 0.5;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function compileCuspPath(cuspSegments: CuspPath): string {
  if (cuspSegments.length === 0 || cuspSegments[0].length === 0) return '';
  const firstPt = cuspSegments[0][0];
  let d = `M ${firstPt[0].toFixed(1)} ${firstPt[1].toFixed(1)}`;

  for (let s = 0; s < cuspSegments.length; s++) {
    const seg = cuspSegments[s];
    if (seg.length === 0) continue;
    d += pointsToSmoothBezierCommands(seg);
  }
  return d;
}

/**
 * Bespoke Apple "Hello"-style master calligraphic stroke sequence specifically crafted for "Fatima".
 * Drawn in authentic cursive order:
 * 1. Capital F top sweeping cap
 * 2. Capital F flowing spine & lower loop
 * 3. Capital F center crossbar
 * 4. Connected continuous cursive run "atima" (a -> t -> i -> m -> a + finishing flourish)
 * 5. Crossbar of 't'
 * 6. Dot of 'i'
 */
const BESPOKE_FATIMA_STROKES: CuspPath[] = [
  // Stroke 1: Capital F top calligraphic wave
  [
    [[26, 44], [22, 34], [32, 26], [54, 28], [76, 25], [86, 20]],
  ],
  // Stroke 2: Capital F descending spine & graceful bottom-left curl
  [
    [[54, 28], [47, 62], [39, 98], [30, 118], [19, 120], [16, 110], [25, 102]],
  ],
  // Stroke 3: Capital F center crossbar
  [
    [[31, 71], [48, 69], [64, 65]],
  ],
  // Stroke 4: Continuous connected cursive ribbon "atima"
  [
    // Lead-in to 'a' top-right cusp
    [[66, 98], [76, 82], [90, 75], [97, 81]],
    // Counter-clockwise bowl of 'a' back to top-right cusp
    [[97, 81], [88, 74], [75, 81], [71, 98], [76, 113], [88, 115], [96, 102], [98, 77]],
    // Down 'a' stem and sweeping up into tall 't' ascender cusp
    [[98, 77], [96, 100], [99, 113], [107, 113], [119, 88], [128, 56], [132, 32]],
    // Down 't' stem to baseline and sweeping up to 'i' cusp
    [[132, 32], [127, 74], [126, 106], [131, 115], [141, 111], [151, 94], [156, 76]],
    // Down 'i' stem and sweeping up into first arch of 'm'
    [[156, 76], [154, 101], [157, 113], [165, 114], [174, 96], [182, 78], [190, 76], [193, 90], [190, 115]],
    // Second arch of 'm'
    [[190, 115], [197, 90], [206, 76], [215, 78], [217, 92], [214, 115]],
    // Third arch of 'm' flowing into the second 'a' top-right cusp
    [[214, 115], [221, 90], [230, 76], [238, 79], [239, 96], [240, 112], [247, 114], [258, 96], [270, 80], [282, 75], [289, 81]],
    // Counter-clockwise bowl of final 'a'
    [[289, 81], [280, 74], [267, 81], [263, 98], [268, 113], [280, 115], [288, 102], [290, 77]],
    // Final 'a' stem and sweeping romantic exit flourish tail
    [[290, 77], [288, 101], [291, 113], [300, 115], [314, 104], [328, 86], [338, 72]],
  ],
  // Stroke 5: Crossbar of 't'
  [
    [[116, 58], [132, 55], [146, 52]],
  ],
  // Stroke 6: Dot of 'i'
  [
    [[158, 56], [160, 52]],
  ],
];

const LOWERCASE_GLYPHS: Record<string, GlyphDef> = {
  a: {
    width: 44,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [10, 82], [23, 75], [30, 80]],
        [[30, 80], [21, 74], [9, 80], [5, 97], [10, 113], [21, 115], [29, 102], [31, 77]],
        [[31, 77], [29, 98], [31, 113], [37, 115], [44, 96]],
      ],
    ],
  },
  b: {
    width: 42,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [12, 72], [23, 42], [22, 26], [15, 28], [10, 48], [8, 86], [10, 111], [20, 116], [31, 108], [34, 91], [27, 80], [19, 84], [24, 96], [42, 94]],
      ],
    ],
  },
  c: {
    width: 36,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [10, 82], [22, 75], [27, 80]],
        [[27, 80], [19, 74], [9, 81], [6, 97], [11, 113], [23, 115], [36, 96]],
      ],
    ],
  },
  d: {
    width: 45,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [10, 82], [22, 75], [29, 80]],
        [[29, 80], [20, 74], [8, 81], [5, 97], [10, 113], [21, 115], [29, 101], [34, 58], [36, 28]],
        [[36, 28], [32, 66], [30, 102], [33, 114], [38, 115], [45, 96]],
      ],
    ],
  },
  e: {
    width: 36,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [14, 91], [26, 82], [24, 75], [14, 76], [6, 89], [8, 108], [18, 115], [28, 112], [36, 96]],
      ],
    ],
  },
  f: {
    width: 36,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [12, 72], [24, 42], [23, 26], [16, 28], [12, 52], [9, 102], [6, 144], [12, 158], [20, 150], [21, 126], [14, 106], [24, 99], [36, 96]],
      ],
    ],
  },
  g: {
    width: 44,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [10, 82], [22, 75], [29, 80]],
        [[29, 80], [20, 74], [8, 81], [5, 97], [10, 113], [21, 115], [29, 102], [31, 78]],
        [[31, 78], [29, 112], [26, 145], [19, 158], [11, 154], [10, 140], [22, 122], [44, 96]],
      ],
    ],
  },
  h: {
    width: 46,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [12, 72], [23, 42], [22, 26], [15, 28], [11, 52], [8, 92], [7, 115]],
        [[7, 115], [13, 91], [22, 76], [31, 78], [33, 94], [32, 111], [37, 115], [46, 96]],
      ],
    ],
  },
  i: {
    width: 26,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [9, 86], [13, 76]],
        [[13, 76], [11, 99], [13, 113], [18, 115], [26, 96]],
      ],
    ],
    secondary: [
      [
        [[14, 58], [15, 55]],
      ],
    ],
  },
  j: {
    width: 30,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [10, 86], [16, 76]],
        [[16, 76], [14, 114], [11, 146], [5, 158], [-2, 153], [0, 138], [14, 118], [30, 96]],
      ],
    ],
    secondary: [
      [
        [[17, 58], [18, 55]],
      ],
    ],
  },
  k: {
    width: 44,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [12, 72], [23, 42], [22, 26], [15, 28], [11, 52], [8, 92], [7, 115]],
        [[7, 115], [14, 92], [25, 76], [32, 79], [28, 91], [15, 96]],
        [[15, 96], [24, 102], [31, 113], [37, 115], [44, 96]],
      ],
    ],
  },
  l: {
    width: 30,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [12, 72], [22, 42], [21, 26], [14, 28], [10, 54], [9, 98], [13, 113], [20, 115], [30, 96]],
      ],
    ],
  },
  m: {
    width: 64,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [7, 81], [13, 76], [16, 86], [14, 115]],
        [[14, 115], [20, 88], [28, 76], [35, 80], [34, 115]],
        [[34, 115], [40, 88], [48, 76], [54, 80], [53, 111], [57, 115], [64, 96]],
      ],
    ],
  },
  n: {
    width: 46,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [8, 81], [14, 76], [17, 86], [15, 115]],
        [[15, 115], [21, 88], [30, 76], [36, 80], [35, 111], [39, 115], [46, 96]],
      ],
    ],
  },
  o: {
    width: 40,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [9, 82], [21, 75], [28, 80]],
        [[28, 80], [19, 74], [8, 81], [6, 97], [11, 113], [23, 115], [31, 102], [29, 83], [22, 82], [28, 92], [40, 94]],
      ],
    ],
  },
  p: {
    width: 44,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [9, 84], [14, 76]],
        [[14, 76], [11, 116], [8, 156]],
        [[8, 156], [12, 112], [17, 84], [27, 76], [34, 86], [31, 106], [21, 114], [14, 108], [27, 112], [44, 96]],
      ],
    ],
  },
  q: {
    width: 44,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [10, 82], [22, 75], [29, 80]],
        [[29, 80], [20, 74], [8, 81], [5, 97], [10, 113], [21, 115], [29, 102], [31, 78]],
        [[31, 78], [28, 116], [25, 155]],
        [[25, 155], [32, 142], [34, 122], [44, 96]],
      ],
    ],
  },
  r: {
    width: 35,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [8, 84], [12, 74]],
        [[12, 74], [18, 79], [25, 76]],
        [[25, 76], [22, 98], [24, 112], [28, 115], [35, 96]],
      ],
    ],
  },
  s: {
    width: 36,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [11, 84], [21, 74]],
        [[21, 74], [27, 88], [28, 106], [19, 115], [10, 112], [13, 104], [25, 107], [36, 96]],
      ],
    ],
  },
  t: {
    width: 32,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [11, 74], [17, 42]],
        [[17, 42], [14, 84], [15, 111], [21, 115], [32, 96]],
      ],
    ],
    secondary: [
      [
        [[7, 64], [26, 61]],
      ],
    ],
  },
  u: {
    width: 44,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [8, 85], [12, 76]],
        [[12, 76], [9, 101], [13, 114], [23, 114], [31, 98], [33, 76]],
        [[33, 76], [31, 101], [33, 113], [37, 115], [44, 96]],
      ],
    ],
  },
  v: {
    width: 38,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [7, 83], [12, 76], [15, 105], [21, 115], [29, 98], [31, 78], [25, 82], [38, 94]],
      ],
    ],
  },
  w: {
    width: 56,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [7, 84], [11, 76]],
        [[11, 76], [9, 103], [14, 115], [22, 112], [28, 95], [29, 80]],
        [[29, 80], [28, 103], [33, 115], [42, 112], [47, 94], [46, 78], [41, 82], [56, 94]],
      ],
    ],
  },
  x: {
    width: 40,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [9, 81], [16, 77], [24, 96], [31, 113], [35, 115], [40, 96]],
      ],
    ],
    secondary: [
      [
        [[30, 77], [19, 96], [9, 115]],
      ],
    ],
  },
  y: {
    width: 46,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [8, 85], [12, 76]],
        [[12, 76], [9, 102], [14, 114], [24, 113], [32, 97], [34, 76]],
        [[34, 76], [31, 113], [27, 146], [20, 158], [12, 154], [12, 139], [25, 120], [46, 96]],
      ],
    ],
  },
  z: {
    width: 40,
    connectIn: true,
    connectOut: true,
    primary: [
      [
        [[0, 96], [10, 81], [22, 76], [27, 82], [19, 96], [12, 101]],
        [[12, 101], [23, 108], [27, 128], [21, 154], [13, 158], [8, 148], [18, 126], [40, 96]],
      ],
    ],
  },
};

const UPPERCASE_GLYPHS: Record<string, GlyphDef> = {
  A: {
    width: 58,
    connectOut: true,
    primary: [
      [
        [[6, 114], [16, 96], [29, 58], [38, 28]],
        [[38, 28], [37, 72], [39, 106], [45, 115], [58, 96]],
      ],
    ],
    secondary: [
      [
        [[14, 84], [32, 80], [47, 78]],
      ],
    ],
  },
  B: {
    width: 56,
    connectOut: false,
    primary: [
      [
        [[20, 32], [16, 74], [13, 115]],
      ],
      [
        [[8, 38], [24, 26], [42, 28], [46, 42], [36, 58], [18, 66]],
        [[18, 66], [39, 68], [49, 84], [44, 106], [28, 116], [14, 112], [10, 102]],
      ],
    ],
  },
  C: {
    width: 52,
    connectOut: true,
    primary: [
      [
        [[46, 42], [49, 30], [39, 24], [23, 32], [11, 58], [9, 90], [18, 112], [34, 116], [52, 96]],
      ],
    ],
  },
  D: {
    width: 58,
    connectOut: false,
    primary: [
      [
        [[18, 30], [15, 74], [12, 108], [6, 114], [4, 106], [14, 106], [30, 115], [46, 104], [52, 74], [46, 40], [30, 26], [14, 30], [8, 42]],
      ],
    ],
  },
  E: {
    width: 50,
    connectOut: true,
    primary: [
      [
        [[42, 34], [33, 25], [20, 30], [14, 46], [21, 62], [34, 64]],
        [[34, 64], [19, 67], [10, 84], [14, 108], [28, 116], [41, 111], [50, 96]],
      ],
    ],
  },
  F: {
    width: 52,
    connectOut: false,
    primary: [
      [
        [[12, 36], [28, 28], [48, 26]],
      ],
      [
        [[28, 30], [23, 72], [18, 108], [10, 116], [6, 108]],
      ],
      [
        [[14, 70], [34, 67]],
      ],
    ],
  },
  G: {
    width: 56,
    connectOut: true,
    primary: [
      [
        [[44, 38], [38, 25], [23, 29], [11, 54], [9, 88], [18, 112], [33, 115], [44, 98], [46, 78]],
        [[46, 78], [43, 108], [39, 142], [30, 156], [21, 152], [22, 136], [38, 116], [56, 96]],
      ],
    ],
  },
  H: {
    width: 58,
    connectOut: true,
    primary: [
      [
        [[10, 36], [20, 28], [16, 72], [12, 115]],
      ],
      [
        [[44, 26], [39, 70], [37, 104], [43, 115], [58, 96]],
      ],
      [
        [[12, 74], [28, 70], [44, 66]],
      ],
    ],
  },
  I: {
    width: 42,
    connectOut: true,
    primary: [
      [
        [[12, 38], [26, 26], [33, 30], [27, 72], [22, 108], [13, 116], [7, 109], [18, 108], [31, 112], [42, 96]],
      ],
    ],
  },
  J: {
    width: 44,
    connectOut: true,
    primary: [
      [
        [[14, 38], [28, 26], [35, 32], [30, 86], [25, 138], [17, 156], [8, 152], [9, 136], [25, 116], [44, 96]],
      ],
    ],
  },
  K: {
    width: 58,
    connectOut: true,
    primary: [
      [
        [[12, 34], [20, 28], [16, 72], [12, 115]],
      ],
      [
        [[46, 30], [32, 54], [16, 72]],
        [[16, 72], [30, 86], [40, 109], [47, 115], [58, 96]],
      ],
    ],
  },
  L: {
    width: 52,
    connectOut: true,
    primary: [
      [
        [[18, 36], [28, 26], [32, 34], [24, 68], [15, 104], [9, 112], [6, 104], [14, 102], [31, 114], [42, 114], [52, 96]],
      ],
    ],
  },
  M: {
    width: 72,
    connectOut: true,
    primary: [
      [
        [[8, 114], [15, 72], [22, 28]],
        [[22, 28], [29, 68], [34, 98]],
        [[34, 98], [45, 62], [55, 28]],
        [[55, 28], [53, 76], [55, 109], [61, 115], [72, 96]],
      ],
    ],
  },
  N: {
    width: 58,
    connectOut: true,
    primary: [
      [
        [[8, 114], [15, 70], [22, 28]],
        [[22, 28], [32, 74], [41, 112]],
        [[41, 112], [46, 68], [51, 28]],
      ],
    ],
  },
  O: {
    width: 56,
    connectOut: false,
    primary: [
      [
        [[34, 28], [20, 32], [10, 56], [9, 90], [19, 113], [36, 115], [48, 94], [49, 58], [40, 32], [27, 30], [22, 42], [34, 48], [50, 42]],
      ],
    ],
  },
  P: {
    width: 50,
    connectOut: false,
    primary: [
      [
        [[18, 32], [15, 74], [12, 115]],
      ],
      [
        [[8, 38], [24, 26], [42, 30], [46, 48], [35, 68], [16, 72]],
      ],
    ],
  },
  Q: {
    width: 58,
    connectOut: true,
    primary: [
      [
        [[34, 28], [20, 32], [10, 56], [9, 90], [19, 113], [36, 115], [48, 94], [49, 58], [40, 32], [27, 30]],
      ],
      [
        [[26, 96], [38, 106], [47, 116], [58, 96]],
      ],
    ],
  },
  R: {
    width: 56,
    connectOut: true,
    primary: [
      [
        [[18, 32], [15, 74], [12, 115]],
      ],
      [
        [[8, 38], [24, 26], [41, 29], [45, 45], [34, 64], [16, 68]],
        [[16, 68], [30, 82], [39, 108], [46, 115], [56, 96]],
      ],
    ],
  },
  S: {
    width: 52,
    connectOut: false,
    primary: [
      [
        [[12, 106], [26, 82], [41, 48], [42, 30], [32, 24], [21, 34], [22, 52], [37, 76], [43, 96], [35, 113], [19, 116], [9, 106], [15, 96]],
      ],
    ],
  },
  T: {
    width: 50,
    connectOut: false,
    primary: [
      [
        [[8, 36], [26, 28], [48, 26]],
      ],
      [
        [[28, 29], [23, 72], [18, 108], [10, 116], [6, 108]],
      ],
    ],
  },
  U: {
    width: 56,
    connectOut: true,
    primary: [
      [
        [[10, 36], [18, 28], [15, 76], [16, 106], [26, 115], [39, 104], [44, 68], [46, 28]],
        [[46, 28], [43, 78], [43, 108], [48, 115], [56, 96]],
      ],
    ],
  },
  V: {
    width: 52,
    connectOut: false,
    primary: [
      [
        [[8, 36], [17, 28], [21, 74], [26, 114], [35, 92], [44, 48], [48, 28]],
      ],
    ],
  },
  W: {
    width: 68,
    connectOut: false,
    primary: [
      [
        [[6, 36], [14, 28], [17, 78], [21, 114]],
        [[21, 114], [29, 82], [35, 48]],
        [[35, 48], [40, 84], [46, 114]],
        [[46, 114], [55, 78], [62, 28]],
      ],
    ],
  },
  X: {
    width: 54,
    connectOut: true,
    primary: [
      [
        [[10, 34], [18, 28], [29, 68], [40, 108], [46, 115], [54, 96]],
      ],
      [
        [[46, 28], [28, 70], [10, 115]],
      ],
    ],
  },
  Y: {
    width: 54,
    connectOut: true,
    primary: [
      [
        [[10, 36], [17, 28], [15, 74], [21, 96], [33, 94], [42, 66], [45, 28]],
        [[45, 28], [41, 86], [36, 138], [27, 156], [18, 152], [19, 136], [35, 116], [54, 96]],
      ],
    ],
  },
  Z: {
    width: 52,
    connectOut: true,
    primary: [
      [
        [[12, 34], [29, 26], [44, 30], [30, 68], [12, 108]],
        [[12, 108], [28, 113], [42, 115], [52, 96]],
      ],
    ],
  },
};

function offsetCuspPath(path: CuspPath, dx: number, dy = 0): CuspPath {
  return path.map((seg) => seg.map(([x, y]) => [x + dx, y + dy]));
}

/**
 * Compiles "Fatima" (or any custom string) into an ordered list of
 * continuous SVG path `d` strings following natural cursive handwriting order.
 */
function buildHandwritingPaths(rawText: string): { paths: string[]; viewBoxWidth: number } {
  const text = (rawText || 'Fatima').trim() || 'Fatima';

  if (text.toLowerCase() === 'fatima') {
    return {
      paths: BESPOKE_FATIMA_STROKES.map((s) => compileCuspPath(s)),
      viewBoxWidth: 360,
    };
  }

  const finalStrokes: CuspPath[] = [];
  let cursorX = 22;
  let activeConnectedStroke: CuspPath | null = null;
  let pendingSecondaryStrokes: CuspPath[] = [];

  const flushRun = (addFlourish: boolean) => {
    if (activeConnectedStroke && activeConnectedStroke.length > 0) {
      if (addFlourish) {
        const lastSeg = activeConnectedStroke[activeConnectedStroke.length - 1];
        if (lastSeg && lastSeg.length > 0) {
          const lastPt = lastSeg[lastSeg.length - 1];
          lastSeg.push([lastPt[0] + 12, lastPt[1] - 7], [lastPt[0] + 22, lastPt[1] - 16]);
          cursorX += 18;
        }
      }
      finalStrokes.push(activeConnectedStroke);
      activeConnectedStroke = null;
    }
    if (pendingSecondaryStrokes.length > 0) {
      for (const sec of pendingSecondaryStrokes) {
        finalStrokes.push(sec);
      }
      pendingSecondaryStrokes = [];
    }
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === ' ') {
      flushRun(true);
      cursorX += 32;
      continue;
    }

    if (ch === '-' || ch === "'") {
      flushRun(false);
      if (ch === '-') {
        finalStrokes.push([[[cursorX + 4, 88], [cursorX + 22, 86]]]);
        cursorX += 28;
      } else {
        finalStrokes.push([[[cursorX + 6, 36], [cursorX + 3, 50]]]);
        cursorX += 14;
      }
      continue;
    }

    const isUpper = ch >= 'A' && ch <= 'Z';
    const glyph: GlyphDef | undefined = isUpper
      ? UPPERCASE_GLYPHS[ch]
      : LOWERCASE_GLYPHS[ch.toLowerCase()];

    if (!glyph) continue;

    if (isUpper) {
      flushRun(false);
      const primaries = glyph.primary.map((p) => offsetCuspPath(p, cursorX));
      for (let pIdx = 0; pIdx < primaries.length; pIdx++) {
        if (pIdx === primaries.length - 1 && glyph.connectOut) {
          activeConnectedStroke = primaries[pIdx];
        } else {
          finalStrokes.push(primaries[pIdx]);
        }
      }
      if (glyph.secondary) {
        for (const sec of glyph.secondary) {
          pendingSecondaryStrokes.push(offsetCuspPath(sec, cursorX));
        }
      }
      cursorX += glyph.width;
    } else {
      const primaries = glyph.primary.map((p) => offsetCuspPath(p, cursorX));
      const firstPrimary = primaries[0];

      if (activeConnectedStroke && glyph.connectIn && firstPrimary.length > 0) {
        const prevLastSeg = activeConnectedStroke[activeConnectedStroke.length - 1];
        const nextFirstSeg = firstPrimary[0];
        const trimmedNextFirst = nextFirstSeg.slice(1);
        prevLastSeg.push(...trimmedNextFirst);
        for (let s = 1; s < firstPrimary.length; s++) {
          activeConnectedStroke.push(firstPrimary[s]);
        }
      } else {
        if (activeConnectedStroke) {
          finalStrokes.push(activeConnectedStroke);
        }
        activeConnectedStroke = firstPrimary;
      }

      for (let pIdx = 1; pIdx < primaries.length; pIdx++) {
        finalStrokes.push(activeConnectedStroke!);
        activeConnectedStroke = primaries[pIdx];
      }

      if (!glyph.connectOut && activeConnectedStroke) {
        finalStrokes.push(activeConnectedStroke);
        activeConnectedStroke = null;
      }

      if (glyph.secondary) {
        for (const sec of glyph.secondary) {
          pendingSecondaryStrokes.push(offsetCuspPath(sec, cursorX));
        }
      }

      cursorX += glyph.width;
    }
  }

  flushRun(true);

  const compiledPaths = finalStrokes
    .map((cuspPath) => compileCuspPath(cuspPath))
    .filter((d) => d.length > 0);

  return {
    paths: compiledPaths,
    viewBoxWidth: Math.max(160, cursorX + 26),
  };
}

interface StrokeMetrics {
  totalLength: number;
  lutLength: number[];
  weight: number;
}

/**
 * Samples an SVGPathElement to compute a realistic human handwriting velocity profile:
 * - Slightly faster along straight/gentle sweeping strokes
 * - Slower around tight curves and cusps
 * - Smooth ease-in acceleration at stroke start and ease-out deceleration at stroke end
 */
function computeStrokeMetrics(pathEl: SVGPathElement, lutSteps = 140): StrokeMetrics {
  const totalLength = Math.max(1, pathEl.getTotalLength());
  const sampleCount = Math.max(16, Math.min(260, Math.ceil(totalLength / 2.2)));
  const ds = totalLength / sampleCount;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= sampleCount; i++) {
    const pt = pathEl.getPointAtLength(i * ds);
    points.push({ x: pt.x, y: pt.y });
  }

  const cumulativeTime: number[] = [0];
  let totalCost = 0;

  for (let i = 0; i < sampleCount; i++) {
    const pPrev = points[Math.max(0, i - 1)];
    const pCurr = points[i];
    const pNext = points[i + 1];

    const a1 = Math.atan2(pCurr.y - pPrev.y, pCurr.x - pPrev.x);
    const a2 = Math.atan2(pNext.y - pCurr.y, pNext.x - pCurr.x);
    let dTheta = Math.abs(a2 - a1);
    if (dTheta > Math.PI) dTheta = 2 * Math.PI - dTheta;

    const curvatureSlowdown = 1 + Math.min(2.5, (dTheta / Math.max(1, ds)) * 9.5);
    const progress = (i + 0.5) / sampleCount;
    const edgeEnvelope = 1 + 0.65 * Math.pow(Math.cos(progress * Math.PI), 2);

    const stepCost = ds * curvatureSlowdown * edgeEnvelope;
    totalCost += stepCost;
    cumulativeTime.push(totalCost);
  }

  const lutLength: number[] = [];
  for (let k = 0; k <= lutSteps; k++) {
    const targetTime = (k / lutSteps) * totalCost;
    let lo = 0;
    let hi = sampleCount;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulativeTime[mid] < targetTime) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    const idx = Math.max(1, lo);
    const t0 = cumulativeTime[idx - 1];
    const t1 = cumulativeTime[idx];
    const frac = t1 > t0 ? (targetTime - t0) / (t1 - t0) : 0;
    const arcLen = ((idx - 1 + frac) / sampleCount) * totalLength;
    lutLength.push(arcLen);
  }

  const weight = Math.max(30, totalCost);

  return {
    totalLength,
    lutLength,
    weight,
  };
}

export const HandwritingAnimation: React.FC<HandwritingAnimationProps> = ({
  text = 'Fatima',
  durationMs = 2150,
  onComplete,
  className = '',
  strokeWidth = 6.2,
  reducedMotion = false,
  replayKey = 0,
}) => {
  const gradientId = useId();
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const penTipRef = useRef<SVGCircleElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [isFinished, setIsFinished] = useState(false);

  const { paths, viewBoxWidth } = useMemo(() => buildHandwritingPaths(text), [text]);

  useEffect(() => {
    setIsFinished(false);

    const elements = pathRefs.current.slice(0, paths.length).filter(Boolean) as SVGPathElement[];
    if (elements.length === 0) return;

    if (reducedMotion) {
      elements.forEach((el) => {
        el.style.strokeDasharray = 'none';
        el.style.strokeDashoffset = '0';
        el.style.opacity = '1';
      });
      if (penTipRef.current) {
        penTipRef.current.style.opacity = '0';
      }
      setIsFinished(true);
      const timer = window.setTimeout(() => {
        onCompleteRef.current?.();
      }, 150);
      return () => window.clearTimeout(timer);
    }

    const metrics = elements.map((el) => {
      const m = computeStrokeMetrics(el);
      el.style.strokeDasharray = `${m.totalLength + 2} ${m.totalLength + 20}`;
      el.style.strokeDashoffset = `${m.totalLength + 2}`;
      el.style.opacity = '0';
      return m;
    });

    const penLiftGapWeight = 20;
    const totalWeight =
      metrics.reduce((acc, m) => acc + m.weight, 0) +
      Math.max(0, metrics.length - 1) * penLiftGapWeight;

    let rafId = 0;
    let startTime: number | null = null;
    const startDelayMs = 160;

    const tick = (now: number) => {
      if (startTime === null) {
        startTime = now;
      }

      const elapsed = now - startTime - startDelayMs;
      if (elapsed < 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const globalProgress = Math.min(1, elapsed / durationMs);
      const currentWeightPos = globalProgress * totalWeight;

      let accumulatedWeight = 0;
      let activeTip: { x: number; y: number } | null = null;

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const m = metrics[i];
        const strokeStartW = accumulatedWeight;
        const strokeEndW = strokeStartW + m.weight;

        if (currentWeightPos <= strokeStartW) {
          el.style.strokeDashoffset = `${m.totalLength + 2}`;
          el.style.opacity = '0';
        } else if (currentWeightPos >= strokeEndW) {
          el.style.strokeDashoffset = '0';
          el.style.opacity = '1';
        } else {
          const localU = (currentWeightPos - strokeStartW) / m.weight;
          const lutSteps = m.lutLength.length - 1;
          const exactIdx = localU * lutSteps;
          const idx0 = Math.floor(exactIdx);
          const idx1 = Math.min(lutSteps, idx0 + 1);
          const frac = exactIdx - idx0;
          const drawnLength =
            m.lutLength[idx0] + (m.lutLength[idx1] - m.lutLength[idx0]) * frac;

          const remaining = Math.max(0, m.totalLength - drawnLength);
          el.style.strokeDashoffset = `${remaining.toFixed(2)}`;
          el.style.opacity = '1';

          const pt = el.getPointAtLength(drawnLength);
          activeTip = { x: pt.x, y: pt.y };
        }

        accumulatedWeight = strokeEndW + penLiftGapWeight;
      }

      if (penTipRef.current) {
        if (activeTip && globalProgress < 1) {
          penTipRef.current.setAttribute('cx', activeTip.x.toFixed(1));
          penTipRef.current.setAttribute('cy', activeTip.y.toFixed(1));
          penTipRef.current.style.opacity = '1';
        } else {
          penTipRef.current.style.opacity = '0';
        }
      }

      if (globalProgress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setIsFinished(true);
        onCompleteRef.current?.();
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [paths, durationMs, reducedMotion, replayKey]);

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      role="heading"
      aria-level={1}
      aria-label={text}
    >
      <svg
        viewBox={`0 0 ${viewBoxWidth} 165`}
        className="w-full max-w-[330px] sm:max-w-[430px] md:max-w-[500px] h-auto overflow-visible"
        style={{
          filter: 'drop-shadow(0 8px 22px rgba(42, 26, 48, 0.09))',
        }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="18%">
            <stop offset="0%" stopColor="#1D1D1F" />
            <stop offset="55%" stopColor="#2B2129" />
            <stop offset="100%" stopColor="#3B2735" />
          </linearGradient>
        </defs>

        {paths.map((d, idx) => (
          <path
            key={`${text}-${idx}`}
            ref={(el) => {
              pathRefs.current[idx] = el;
            }}
            d={d}
            pathLength={1000}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: isFinished ? 1 : 0,
              willChange: 'stroke-dashoffset, opacity',
            }}
          />
        ))}

        {/* Subtle invisible-pen ink nib point while actively writing */}
        <circle
          ref={penTipRef}
          r={strokeWidth * 0.56}
          fill="#1D1D1F"
          style={{
            opacity: 0,
            transition: 'opacity 120ms ease-out',
            pointerEvents: 'none',
          }}
        />
      </svg>
    </div>
  );
};
