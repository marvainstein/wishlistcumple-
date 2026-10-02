/*
 * Alfombra de leopardo hecha de pelos individuales (WebGL1 + instancing).
 *
 *  1. PATTERN (una sola vez): hornea el dibujo del leopardo (rosetas) en una
 *     textura grande. Cada pelo toma su color del punto donde nace, así los
 *     bordes de las manchas quedan peludos de verdad.
 *  2. UNDER: capa de "subpelo" oscuro para que no se vea vacío entre pelos.
 *  3. STRANDS: decenas de miles de pelos (tiras afinadas). Se doblan con un
 *     resorte que sigue la velocidad del scroll; la deformación viaja de arriba
 *     hacia abajo de la pantalla como una mano que acaricia.
 */

export const QUAD_VERT = /* glsl */ `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/** Tamaño del dibujo horneado. */
export const PATTERN_TEX = 2048;
export const PATTERN_SCALE = 1.5; // 1 texel = 1.5 px CSS -> cubre 3072 px (y se espeja)

export const PATTERN_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uSize; // px CSS que cubre la textura

float hash1(vec2 p) {
  p = mod(p, 289.0);
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
vec2 hash2(vec2 p) {
  float n = hash1(p);
  return vec2(n, hash1(p + n + 17.17));
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash1(i), hash1(i + vec2(1.0, 0.0)), u.x),
             mix(hash1(i + vec2(0.0, 1.0)), hash1(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + 11.7;
    a *= 0.5;
  }
  return s;
}

// rosetas: anillos rotos con centro más oscuro + algunas manchas sólidas
vec2 rosette(vec2 p) {
  vec2 id = floor(p);
  vec2 f = fract(p);
  float best = 9.0;
  vec2 bestOff = vec2(0.0);
  vec2 bestId = vec2(0.0);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = 0.18 + 0.64 * hash2(id + g);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < best) { best = d; bestOff = r; bestId = id + g; }
    }
  }
  float d = sqrt(best);
  float h = hash1(bestId + 3.1);
  float ang = atan(bestOff.y, bestOff.x);
  float rad = (0.29 + 0.13 * h) * (0.8 + 0.34 * vnoise(vec2(ang * 1.6 + h * 20.0, h * 7.0)));
  if (h > 0.8) {
    return vec2(smoothstep(rad * 0.62, rad * 0.54, d), 0.0);
  }
  float ring = smoothstep(rad, rad - 0.06, d) * smoothstep(rad * 0.5, rad * 0.6, d);
  float gaps = smoothstep(0.3, 0.42, vnoise(vec2(ang * 1.9 + h * 31.0, h * 13.0)));
  return vec2(ring * gaps, smoothstep(rad * 0.6, rad * 0.42, d));
}

void main() {
  vec2 P = vUv * uSize;
  vec2 Pd = P + 26.0 * (vec2(fbm(P * 0.007), fbm(P * 0.007 + 7.3)) - 0.5);
  vec2 rs = rosette(Pd / 88.0);

  float tone = fbm(P * 0.003 + 3.0);
  vec3 tawny = vec3(0.70, 0.42, 0.18);
  vec3 gold = vec3(0.88, 0.60, 0.30);
  vec3 deep = vec3(0.36, 0.18, 0.06);
  vec3 col = mix(tawny, gold, smoothstep(0.35, 0.75, tone));
  col = mix(col, deep, smoothstep(0.6, 0.95, fbm(P * 0.0014 + 21.0)) * 0.5);
  col = mix(col, vec3(0.46, 0.25, 0.09), rs.y * 0.7);
  col = mix(col, vec3(0.07, 0.035, 0.02), rs.x);
  gl_FragColor = vec4(col, rs.x);
}
`;

export const UNDER_FRAG = /* glsl */ `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uPattern;
uniform vec2 uView;     // px CSS
uniform float uScroll;  // px CSS de alfombra
uniform float uPatInv;  // 1 / (px CSS cubiertos por la textura)
void main() {
  vec2 css = vec2(vUv.x, 1.0 - vUv.y) * uView;
  vec2 rug = css + vec2(0.0, uScroll);
  vec3 c = texture2D(uPattern, rug * uPatInv).rgb;
  gl_FragColor = vec4(c * 0.42, 1.0);
}
`;

export const STRAND_VERT = /* glsl */ `
precision highp float;
attribute vec2 aVert;   // x: t (0 raíz -> 1 punta), y: lado (-1 | 1)
attribute vec2 aRoot;   // raíz en el área cubierta (px CSS)
attribute vec4 aRnd;    // largo, ancho, desvío de ángulo, tono
uniform vec2 uView;
uniform float uScroll;
uniform float uCoverH;
uniform float uMargin;
uniform float uHist[24]; // historial del resorte (0 = ahora)
uniform vec2 uPtr;
uniform vec2 uPtrBend;
uniform float uStatic;
uniform float uPatInv;
varying float vT;
varying float vSide;
varying vec2 vPat;
varying float vShade;
varying float vLift;
varying float vSheen;

void main() {
  float y = mod(aRoot.y - uScroll, uCoverH) - uMargin;
  vec2 root = vec2(aRoot.x - uMargin, y);
  vec2 rug = vec2(root.x, y + uScroll);

  // el pelo cae hacia abajo con remolinos suaves
  float flow = sin(rug.x * 0.0042 + rug.y * 0.0023) * 0.22 + sin(rug.y * 0.0061 - rug.x * 0.0019) * 0.14;
  float ang = 1.62 + flow + aRnd.z;
  vec2 dir = vec2(cos(ang), sin(ang));

  // la caricia viaja de arriba hacia abajo de la pantalla
  float hi = clamp(root.y / uView.y, 0.0, 1.0) * 22.0;
  int i0 = int(floor(hi));
  int i1 = i0 + 1;
  float b = mix(uHist[i0], uHist[i1], fract(hi));
  vec2 bend = vec2(0.06 * sin(rug.x * 0.05), 1.0) * b * (0.75 + 0.5 * aRnd.w);

  vec2 dp = root - uPtr;
  bend += uPtrBend * exp(-dot(dp, dp) / 12100.0);
  bend *= 1.0 - uStatic;

  float against = clamp(-dot(dir, bend), 0.0, 1.0);
  float withG = clamp(dot(dir, bend), 0.0, 1.0);
  float len = aRnd.x * (1.0 - 0.4 * against) * (1.0 + 0.08 * withG);

  float t = aVert.x;
  vec2 tipBend = bend * len * 0.8;
  vec2 p = root + dir * len * t + tipBend * t * t;
  vec2 tangent = normalize(dir * len + tipBend * 2.0 * t + vec2(1e-4));
  vec2 n = vec2(-tangent.y, tangent.x);
  float w = aRnd.y * (1.0 - 0.78 * t) + 0.6; // +0.6 px para el antialias
  p += n * aVert.y * w * 0.5;

  gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);
  vT = t;
  vSide = aVert.y;
  vPat = rug * uPatInv;
  vShade = aRnd.w;
  vLift = against;
  vSheen = withG;
}
`;

export const STRAND_FRAG = /* glsl */ `
precision mediump float;
uniform sampler2D uPattern;
varying float vT;
varying float vSide;
varying vec2 vPat;
varying float vShade;
varying float vLift;
varying float vSheen;
void main() {
  vec4 pat = texture2D(uPattern, vPat);
  vec3 c = pat.rgb * (0.78 + 0.42 * vShade);
  c *= mix(0.5, 1.18, smoothstep(0.0, 0.85, vT));      // raíz oscura, punta clara
  c *= 1.0 - 0.4 * vLift * (1.0 - vT);                 // a contrapelo se ven las raíces
  float tip = smoothstep(0.55, 1.0, vT);
  c += vec3(1.0, 0.85, 0.6) * tip * (0.05 + 0.2 * vSheen) * (1.0 - pat.a); // brillo
  float a = smoothstep(1.0, 0.25, abs(vSide)) * smoothstep(1.0, 0.82, vT);
  gl_FragColor = vec4(c, a);
}
`;
