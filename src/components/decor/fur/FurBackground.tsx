import { useEffect, useRef } from 'react';
import { FIELD_FRAG, FUR_FRAG, VERT } from './shaders';
import './fur.css';

/** Cuánto se mueve la alfombra respecto del scroll (parallax). */
const PARALLAX = 0.5;
/** Resolución del campo de peinado respecto de la pantalla. */
const FIELD_SCALE = 1 / 6;
/** Cuánto tarda el pelo en volver a su lugar (por frame a 60 fps). */
const DECAY = 0.955;
/** Segundos que sigue animando después del último gesto. */
const SETTLE_S = 2.5;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) ?? 'shader error');
  }
  return sh;
}

function program(gl: WebGLRenderingContext, frag: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.bindAttribLocation(p, 0, 'aPos');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link error');
  return p;
}

function makeTarget(gl: WebGLRenderingContext, w: number, h: number) {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  // 128 = "sin peinado" (0.5 en [0,1] -> 0 en [-1,1])
  const data = new Uint8Array(w * h * 4).fill(128);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fb = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  return { tex, fb };
}

/**
 * Fondo de alfombra animal print. Los pelitos se peinan al hacer scroll
 * (y al pasar el mouse) y vuelven solos a su lugar.
 * Sin WebGL queda el fondo CSS; con reduced-motion se dibuja quieto.
 */
export function FurBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false });
    if (!gl) return;

    let furProg: WebGLProgram;
    let fieldProg: WebGLProgram;
    try {
      furProg = program(gl, FUR_FRAG);
      fieldProg = program(gl, FIELD_FRAG);
    } catch (err) {
      console.warn('Fondo de pelo desactivado:', err);
      return;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
    const fu = {
      res: U(furProg, 'uRes'),
      dpr: U(furProg, 'uDpr'),
      scroll: U(furProg, 'uScroll'),
      field: U(furProg, 'uField'),
      stat: U(furProg, 'uStatic'),
    };
    const ku = {
      prev: U(fieldProg, 'uPrev'),
      res: U(fieldProg, 'uFieldRes'),
      shift: U(fieldProg, 'uShift'),
      vel: U(fieldProg, 'uScrollVel'),
      ptr: U(fieldProg, 'uPtr'),
      ptrVel: U(fieldProg, 'uPtrVel'),
      aspect: U(fieldProg, 'uAspect'),
      decay: U(fieldProg, 'uDecay'),
    };

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let W = 0, H = 0, dpr = 1, fw = 1, fh = 1;
    let targets: { tex: WebGLTexture; fb: WebGLFramebuffer }[] = [];
    let cur = 0;

    const resize = () => {
      const isSmall = window.innerWidth < 760;
      dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1.25 : 1.5);
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      W = Math.max(1, Math.round(cw * dpr));
      H = Math.max(1, Math.round(ch * dpr));
      canvas.width = W;
      canvas.height = H;
      fw = Math.max(8, Math.round(cw * FIELD_SCALE));
      fh = Math.max(8, Math.round(ch * FIELD_SCALE));
      targets.forEach((t) => { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); });
      targets = [makeTarget(gl, fw, fh), makeTarget(gl, fw, fh)];
      cur = 0;
    };

    // estado de la "mano"
    let lastScroll = window.scrollY;
    let scrollVel = 0;
    let ptr = { x: 0.5, y: 0.5 };
    let ptrVel = { x: 0, y: 0 };
    let lastInput = performance.now();
    let raf = 0;
    let lastT = performance.now();

    const draw = (t: number) => {
      const dt = Math.min(0.05, (t - lastT) / 1000) || 1 / 60;
      lastT = t;
      const frames = dt * 60;

      const sy = window.scrollY;
      const dy = sy - lastScroll;
      lastScroll = sy;
      // velocidad suavizada, como una mano con inercia
      const target = Math.max(-1, Math.min(1, dy / (window.innerHeight * 0.035)));
      scrollVel += (target - scrollVel) * Math.min(1, 0.35 * frames);

      // 1) campo de peinado
      const src = targets[cur];
      const dst = targets[1 - cur];
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb);
      gl.viewport(0, 0, fw, fh);
      gl.useProgram(fieldProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, src.tex);
      gl.uniform1i(ku.prev, 0);
      gl.uniform2f(ku.res, fw, fh);
      gl.uniform1f(ku.shift, (dy * PARALLAX) / window.innerHeight);
      gl.uniform1f(ku.vel, scrollVel * 0.22 * frames);
      gl.uniform2f(ku.ptr, ptr.x, ptr.y);
      gl.uniform2f(ku.ptrVel, ptrVel.x, ptrVel.y);
      gl.uniform1f(ku.aspect, window.innerWidth / window.innerHeight);
      gl.uniform1f(ku.decay, Math.pow(DECAY, frames));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      cur = 1 - cur;
      ptrVel = { x: 0, y: 0 };

      // 2) pelaje
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(furProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, targets[cur].tex);
      gl.uniform1i(fu.field, 0);
      gl.uniform2f(fu.res, W, H);
      gl.uniform1f(fu.dpr, dpr);
      gl.uniform1f(fu.scroll, sy * PARALLAX);
      gl.uniform1f(fu.stat, reduce.matches ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      const idle = (t - lastInput) / 1000 > SETTLE_S;
      raf = idle && !reduce.matches ? 0 : requestAnimationFrame(draw);
      if (reduce.matches) raf = 0;
    };

    const wake = () => {
      lastInput = performance.now();
      if (!raf && !document.hidden) {
        lastT = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || reduce.matches) return;
      const nx = e.clientX / window.innerWidth;
      const ny = 1 - e.clientY / window.innerHeight;
      // la mano peina en la dirección en que se mueve
      ptrVel = {
        x: ptrVel.x + Math.max(-0.5, Math.min(0.5, (nx - ptr.x) * 9)),
        y: ptrVel.y + Math.max(-0.5, Math.min(0.5, (ny - ptr.y) * 9)),
      };
      ptr = { x: nx, y: ny };
      wake();
    };

    const onResize = () => {
      resize();
      wake();
    };

    resize();
    wake();
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', wake);
    canvas.classList.add('is-ready');

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', wake);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', wake);
      targets.forEach((t) => { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); });
      gl.deleteProgram(furProg);
      gl.deleteProgram(fieldProg);
      gl.deleteBuffer(buf);
    };
  }, []);

  return <canvas ref={canvasRef} className="fur-bg" aria-hidden="true" />;
}
