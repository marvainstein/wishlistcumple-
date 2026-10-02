/*
 * Alfombra de leopardo procedural (WebGL1).
 *
 * Dos pasadas:
 *  1. FIELD: textura chica (1/6 de la pantalla) que guarda hacia dónde están
 *     "peinados" los pelos (vec2 en rg). Se mueve con la alfombra al hacer
 *     scroll, se peina con la velocidad del scroll y del mouse, y vuelve
 *     de a poco a su lugar (decay).
 *  2. FUR: dibuja el pelaje: manchas tipo roseta (voronoi deformado),
 *     hebras anisotrópicas en la dirección del pelo, y brillo "terciopelo":
 *     a favor del pelo se aclara, a contrapelo se oscurece.
 */

export const VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const NOISE = /* glsl */ `
float hash1(vec2 p) {
  p = mod(p, 289.0);  // evita perder precisión con coordenadas grandes
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
  float a = hash1(i);
  float b = hash1(i + vec2(1.0, 0.0));
  float c = hash1(i + vec2(0.0, 1.0));
  float d = hash1(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
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
`;

export const FIELD_FRAG = /* glsl */ `
precision mediump float;
uniform sampler2D uPrev;
uniform vec2 uFieldRes;
uniform float uShift;      // cuánto se movió la alfombra (en uv) desde el último frame
uniform float uScrollVel;  // velocidad del scroll, normalizada
uniform vec2 uPtr;         // posición del mouse (uv)
uniform vec2 uPtrVel;      // velocidad del mouse (uv / frame, ya escalada)
uniform float uAspect;
uniform float uDecay;
${NOISE}
void main() {
  vec2 uv = gl_FragCoord.xy / uFieldRes;
  // advección: el peinado viaja con la alfombra
  vec2 src = uv - vec2(0.0, uShift);
  vec2 v = texture2D(uPrev, src).rg * 2.0 - 1.0;
  if (src.y < 0.0 || src.y > 1.0) v = vec2(0.0);
  v *= uDecay;

  // la "mano" del scroll: peina en sentido contrario al movimiento de la alfombra
  float grain = 0.55 + 0.45 * vnoise(uv * vec2(7.0, 4.0) + vec2(0.0, uShift * 40.0));
  v += vec2(0.18 * (vnoise(uv * 5.0) - 0.5), -1.0) * uScrollVel * grain;

  // la mano del mouse
  vec2 d = (uv - uPtr) * vec2(uAspect, 1.0);
  float fall = exp(-dot(d, d) / 0.0035);
  v += uPtrVel * fall;

  float len = length(v);
  if (len > 1.0) v /= len;
  gl_FragColor = vec4(v * 0.5 + 0.5, 0.0, 1.0);
}
`;

export const FUR_FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;        // px de dispositivo
uniform float uDpr;
uniform float uScroll;    // px CSS (ya con parallax)
uniform sampler2D uField;
uniform float uStatic;    // 1 = sin peinado (reduced motion)
${NOISE}

const vec3 C_DEEP   = vec3(0.26, 0.12, 0.04);
const vec3 C_TAWNY  = vec3(0.72, 0.43, 0.18);
const vec3 C_GOLD   = vec3(0.90, 0.62, 0.32);
const vec3 C_SPOT   = vec3(0.07, 0.035, 0.02);
const vec3 C_CORE   = vec3(0.50, 0.27, 0.10);

// rosetas de leopardo: anillos rotos + algunas manchas sólidas
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
  float rad = 0.30 + 0.13 * h;
  // contorno irregular
  float ang = atan(bestOff.y, bestOff.x);
  rad *= 0.82 + 0.3 * vnoise(vec2(ang * 1.6 + h * 20.0, h * 7.0));
  float spot = 0.0;
  float core = 0.0;
  if (h > 0.78) {
    // mancha sólida chica
    spot = smoothstep(rad * 0.62, rad * 0.5, d);
  } else {
    float ring = smoothstep(rad, rad - 0.07, d) * smoothstep(rad * 0.48, rad * 0.62, d);
    float gaps = smoothstep(0.28, 0.42, vnoise(vec2(ang * 1.9 + h * 31.0, h * 13.0)));
    spot = ring * gaps;
    core = smoothstep(rad * 0.62, rad * 0.4, d);
  }
  return vec2(spot, core);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 css = vec2(frag.x, uRes.y - frag.y) / uDpr;     // px CSS, y hacia abajo
  vec2 P = css + vec2(0.0, uScroll);                    // coordenadas en la alfombra

  // peinado (en coords y-hacia-abajo)
  vec2 f = texture2D(uField, frag / uRes).rg * 2.0 - 1.0;
  vec2 bend = vec2(f.x, -f.y) * (1.0 - uStatic);
  float bendLen = length(bend);

  // dirección natural del pelo: hacia abajo, con remolinos suaves
  float a0 = 1.32 + 0.6 * (fbm(P * 0.0014) - 0.5);
  vec2 dir0 = vec2(cos(a0), sin(a0));
  vec2 dir = normalize(dir0 + bend * 2.4);
  vec2 perp = vec2(-dir.y, dir.x);

  // a contrapelo los pelos se levantan
  float against = bendLen > 0.001 ? max(0.0, -dot(dir0, bend / bendLen)) * bendLen : 0.0;
  float withGrain = bendLen > 0.001 ? max(0.0, dot(dir0, bend / bendLen)) * bendLen : 0.0;

  // hebras: ruido estirado en la dirección del pelo, se "inclinan" con el peinado
  vec2 Pb = P - bend * 14.0;
  vec2 q = vec2(dot(Pb, perp), dot(Pb, dir));
  float s1 = vnoise(vec2(q.x * 0.8, q.y * 0.11));
  float s2 = vnoise(vec2(q.x * 1.7 + 40.0, q.y * 0.2));
  float s3 = vnoise(vec2(q.x * 0.3 + 9.0, q.y * 0.05));
  // mechones: zonas donde el pelo se agrupa
  float tuft = smoothstep(0.25, 0.8, vnoise(q * vec2(0.09, 0.03) + 5.0));
  float strand = s1 * 0.45 + s2 * 0.35 + s3 * 0.2;
  strand = mix(strand, strand * strand * 1.6, 0.5) * (0.75 + 0.35 * tuft);

  // manchas, con bordes peludos (se corren a lo largo del pelo)
  vec2 Pd = P + 22.0 * (vec2(fbm(P * 0.008), fbm(P * 0.008 + 7.3)) - 0.5);
  Pd += dir * (strand - 0.5) * 16.0 + bend * 6.0;
  vec2 rs = rosette(Pd / 86.0);

  // base: tonos de piel que varían
  float tone = fbm(P * 0.0035 + 3.0);
  vec3 col = mix(C_TAWNY, C_GOLD, smoothstep(0.35, 0.75, tone));
  col = mix(col, C_DEEP, smoothstep(0.62, 0.95, fbm(P * 0.0016 + 21.0)) * 0.55);
  col = mix(col, C_CORE, rs.y * 0.75);
  col = mix(col, C_SPOT, rs.x);

  // luz de pelo + terciopelo
  float sheen = 0.5 + 0.75 * strand;
  sheen += withGrain * 0.22 * strand;
  sheen -= against * 0.35;
  col *= sheen;
  // raíces oscuras donde el pelo se levanta
  col = mix(col, C_DEEP * 0.4, against * (1.0 - strand) * 0.6);
  // puntas brillantes
  col += vec3(1.0, 0.85, 0.6) * pow(max(s2, 0.0), 6.0) * (0.25 + withGrain * 0.5) * (1.0 - rs.x);

  // viñeta suave para que la UI respire
  vec2 uv = frag / uRes;
  float vig = smoothstep(1.15, 0.35, length((uv - 0.5) * vec2(1.25, 1.0)));
  col *= 0.72 + 0.28 * vig;

  gl_FragColor = vec4(col, 1.0);
}
`;
