import { useEffect, useRef } from 'react';
import {
  PATTERN_FRAG,
  PATTERN_SCALE,
  PATTERN_TEX,
  QUAD_VERT,
  STRAND_FRAG,
  STRAND_VERT,
  UNDER_FRAG,
} from './shaders';
import './fur.css';

/** Cuánto se mueve la alfombra respecto del scroll (parallax). */
const PARALLAX = 0.5;
/** px CSS² por pelo (más chico = más denso). */
const AREA_PER_HAIR = 8.5;
const MAX_HAIRS = 160_000;
/** Margen fuera de pantalla para que los pelos entren y salgan sin cortes. */
const MARGIN = 40;
/** Segmentos por pelo (más = curvas más suaves). */
const SEGMENTS = 5;
const HIST = 24;

type GL = WebGLRenderingContext;

function compile(gl: GL, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? 'shader');
  return sh;
}

function program(gl: GL, vert: string, frag: string, attribs: string[]) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  attribs.forEach((name, i) => gl.bindAttribLocation(p, i, name));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link');
  return p;
}

/**
 * Fondo de alfombra animal print hecha de pelos individuales.
 * Al hacer scroll los pelos se doblan (a favor del pelo brillan, a contrapelo
 * se levantan) y vuelven solos a su lugar. En compu también reaccionan al mouse.
 * Sin WebGL queda el fondo CSS; con reduced-motion los pelos no se doblan.
 */
export function FurBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false, premultipliedAlpha: false });
    if (!gl) return;
    const inst = gl.getExtension('ANGLE_instanced_arrays');
    if (!inst) return;

    let patProg: WebGLProgram, underProg: WebGLProgram, hairProg: WebGLProgram;
    try {
      patProg = program(gl, QUAD_VERT, PATTERN_FRAG, ['aPos']);
      underProg = program(gl, QUAD_VERT, UNDER_FRAG, ['aPos']);
      hairProg = program(gl, STRAND_VERT, STRAND_FRAG, ['aVert', 'aRoot', 'aRnd']);
    } catch (err) {
      console.warn('Fondo de pelo desactivado:', err);
      return;
    }

    // --- geometría -----------------------------------------------------
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const strandVerts: number[] = [];
    for (let i = 0; i <= SEGMENTS; i++) strandVerts.push(i / SEGMENTS, -1, i / SEGMENTS, 1);
    const strandBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, strandBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(strandVerts), gl.STATIC_DRAW);
    const instBuf = gl.createBuffer();

    // --- dibujo del leopardo, horneado una vez ---------------------------
    const patSize = PATTERN_TEX * PATTERN_SCALE;
    const patTex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, patTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, PATTERN_TEX, PATTERN_TEX, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, patTex, 0);
    gl.viewport(0, 0, PATTERN_TEX, PATTERN_TEX);
    gl.useProgram(patProg);
    gl.uniform1f(gl.getUniformLocation(patProg, 'uSize'), patSize);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fb);

    const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
    const uu = { pat: U(underProg, 'uPattern'), view: U(underProg, 'uView'), scroll: U(underProg, 'uScroll'), inv: U(underProg, 'uPatInv') };
    const hu = {
      pat: U(hairProg, 'uPattern'),
      inv: U(hairProg, 'uPatInv'),
      view: U(hairProg, 'uView'),
      scroll: U(hairProg, 'uScroll'),
      coverH: U(hairProg, 'uCoverH'),
      margin: U(hairProg, 'uMargin'),
      hist: U(hairProg, 'uHist'),
      ptr: U(hairProg, 'uPtr'),
      ptrBend: U(hairProg, 'uPtrBend'),
      stat: U(hairProg, 'uStatic'),
    };

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let vw = 0, vh = 0, dpr = 1, coverH = 0, hairCount = 0;

    // --- pelos: posiciones y rasgos al azar ------------------------------
    const buildHairs = () => {
      const coverW = vw + MARGIN * 2;
      coverH = vh + MARGIN * 2;
      hairCount = Math.min(MAX_HAIRS, Math.round((coverW * coverH) / AREA_PER_HAIR));
      const data = new Float32Array(hairCount * 6);
      for (let i = 0; i < hairCount; i++) {
        const o = i * 6;
        data[o] = Math.random() * coverW;
        data[o + 1] = Math.random() * coverH;
        data[o + 2] = 8 + Math.random() * 9; // largo
        data[o + 3] = 1.0 + Math.random() * 1.0; // ancho en la raíz
        data[o + 4] = (Math.random() - 0.5) * 0.55; // desvío de ángulo
        data[o + 5] = Math.random(); // tono
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    };

    const resize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      buildHairs();
    };

    // --- física de la caricia --------------------------------------------
    const hist = new Float32Array(HIST);
    let spring = 0;
    let springVel = 0;
    let lastScroll = window.scrollY;
    let ptr = { x: -9999, y: -9999 };
    let ptrBend = { x: 0, y: 0 };
    let ptrTarget = { x: 0, y: 0 };
    let raf = 0;
    let lastT = performance.now();
    let lastInput = performance.now();
    // calidad adaptativa: si el equipo no llega a ~45 fps, dibuja menos pelos
    let quality = 1;
    let frameMs = 16;

    const render = (scrollY: number) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.disable(gl.BLEND);

      // subpelo
      gl.useProgram(underProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, patTex);
      gl.uniform1i(uu.pat, 0);
      gl.uniform2f(uu.view, vw, vh);
      gl.uniform1f(uu.scroll, scrollY * PARALLAX);
      gl.uniform1f(uu.inv, 1 / patSize);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      inst.vertexAttribDivisorANGLE(0, 0);
      gl.disableVertexAttribArray(1);
      gl.disableVertexAttribArray(2);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // pelos
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(hairProg);
      gl.uniform1i(hu.pat, 0);
      gl.uniform1f(hu.inv, 1 / patSize);
      gl.uniform2f(hu.view, vw, vh);
      gl.uniform1f(hu.scroll, scrollY * PARALLAX);
      gl.uniform1f(hu.coverH, coverH);
      gl.uniform1f(hu.margin, MARGIN);
      gl.uniform1fv(hu.hist, hist);
      gl.uniform2f(hu.ptr, ptr.x, ptr.y);
      gl.uniform2f(hu.ptrBend, ptrBend.x, ptrBend.y);
      gl.uniform1f(hu.stat, reduce.matches ? 1 : 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, strandBuf);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      inst.vertexAttribDivisorANGLE(0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 24, 0);
      inst.vertexAttribDivisorANGLE(1, 1);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 24, 8);
      inst.vertexAttribDivisorANGLE(2, 1);
      inst.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, (SEGMENTS + 1) * 2, Math.round(hairCount * quality));
      inst.vertexAttribDivisorANGLE(1, 0);
      inst.vertexAttribDivisorANGLE(2, 0);
    };

    const frame = (t: number) => {
      const elapsed = t - lastT;
      const frames = Math.min(3, elapsed / (1000 / 60)) || 1;
      lastT = t;
      if (elapsed > 0 && elapsed < 200) {
        frameMs += (elapsed - frameMs) * 0.1;
        if (frameMs > 22 && quality > 0.3) quality = Math.max(0.3, quality * 0.9);
        else if (frameMs < 15 && quality < 1) quality = Math.min(1, quality * 1.02);
      }
      const sy = window.scrollY;
      const dy = sy - lastScroll;
      lastScroll = sy;

      // resorte: la velocidad del scroll empuja, el pelo vuelve con un rebote suave
      const target = reduce.matches ? 0 : Math.max(-1, Math.min(1, dy / frames / (vh * 0.022)));
      for (let k = 0; k < Math.round(frames); k++) {
        springVel += (target - spring) * 0.16 - springVel * 0.28;
        spring += springVel;
        // el pelo de la mano: suaviza hacia el movimiento del mouse y lo suelta
        ptrBend.x += (ptrTarget.x - ptrBend.x) * 0.25;
        ptrBend.y += (ptrTarget.y - ptrBend.y) * 0.25;
        ptrTarget.x *= 0.7;
        ptrTarget.y *= 0.7;
        hist.copyWithin(1, 0);
        hist[0] = spring;
      }
      spring = Math.max(-1.2, Math.min(1.2, spring));

      render(sy);

      const settled =
        Math.abs(spring) < 0.002 &&
        Math.abs(springVel) < 0.002 &&
        Math.abs(hist[HIST - 1]) < 0.002 &&
        Math.abs(ptrBend.x) + Math.abs(ptrBend.y) < 0.004 &&
        t - lastInput > 250;
      raf = settled ? 0 : requestAnimationFrame(frame);
    };

    const wake = () => {
      lastInput = performance.now();
      if (!raf && !document.hidden) {
        lastT = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || reduce.matches) return;
      if (ptr.x > -999) {
        const dx = e.clientX - ptr.x;
        const dy = e.clientY - ptr.y;
        ptrTarget = {
          x: Math.max(-1, Math.min(1, ptrTarget.x + dx / 40)),
          y: Math.max(-1, Math.min(1, ptrTarget.y + dy / 40)),
        };
      }
      ptr = { x: e.clientX, y: e.clientY };
      wake();
    };
    const onLeave = () => {
      ptr = { x: -9999, y: -9999 };
    };
    const onResize = () => {
      resize();
      wake();
    };

    resize();
    render(window.scrollY);
    canvas.classList.add('is-ready');
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', wake);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', wake);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', wake);
      gl.deleteTexture(patTex);
      [quad, strandBuf, instBuf].forEach((b) => gl.deleteBuffer(b));
      [patProg, underProg, hairProg].forEach((p) => gl.deleteProgram(p));
    };
  }, []);

  return <canvas ref={canvasRef} className="fur-bg" aria-hidden="true" />;
}
