import { useEffect, useRef, useState } from 'react';

/**
 * Nature – A Living World
 * A fully-animated canvas nature scene with:
 *   • Day / night cycle & sky gradient
 *   • Sun & moon with glow
 *   • Twinkling stars
 *   • Drifting clouds
 *   • Layered mountains
 *   • Waving grass
 *   • Swaying trees (pine + deciduous)
 *   • Birds flying in formation
 *   • Fireflies at night
 *   • Lake with animated reflections & ripples
 *   • Rain toggle
 *   • Wind toggle (3 levels)
 */
export default function NatureCanvas() {
  const canvasRef = useRef(null);
  const stateRef  = useRef({
    rainOn:      false,
    windLevel:   0,
    forcedNight: false,
  });
  const [rainOn,      setRainOn]      = useState(false);
  const [windLevel,   setWindLevel]   = useState(0);
  const [forcedNight, setForcedNight] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    let W, H;
    let time     = 0;
    let dayPhase = 0;

    const WIND_SPEEDS = [0, 1.2, 2.8];

    let stars       = [];
    let clouds      = [];
    let mountains   = [];
    let trees       = [];
    let grassBlades = [];
    let birds       = [];
    let fireflies   = [];
    let raindrops   = [];
    let ripples     = [];
    let lakeY, lakeH;

    let rafId;

    /* ── Utility helpers ─────────────────────────────────── */
    function rand(min, max)    { return min + Math.random() * (max - min); }
    function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
    function lerp(a, b, t)     { return a + (b - a) * t; }

    function lerpColor(c1, c2, t) {
      return [
        Math.round(lerp(c1[0], c2[0], t)),
        Math.round(lerp(c1[1], c2[1], t)),
        Math.round(lerp(c1[2], c2[2], t)),
      ];
    }

    function rgb(c)    { return `rgb(${c[0]},${c[1]},${c[2]})`; }
    function rgba(c, a){ return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

    /* ── Build / rebuild scene objects ──────────────────── */
    function buildScene() {
      lakeY = H * 0.62;
      lakeH = H * 0.18;
      buildStars();
      buildClouds();
      buildMountains();
      buildTrees();
      buildGrass();
      buildBirds();
      buildFireflies();
      if (stateRef.current.rainOn) buildRain();
    }

    function buildStars() {
      stars = [];
      for (let i = 0; i < 220; i++) {
        stars.push({
          x:     rand(0, W),
          y:     rand(0, H * 0.55),
          r:     rand(0.4, 1.6),
          phase: rand(0, Math.PI * 2),
          speed: rand(0.02, 0.06),
        });
      }
    }

    function buildClouds() {
      clouds = [];
      for (let i = 0; i < 7; i++) clouds.push(makeCloud(rand(0, W)));
    }

    function makeCloud(x) {
      return {
        x,
        y:     rand(H * 0.05, H * 0.28),
        scale: rand(0.7, 1.5),
        speed: rand(0.12, 0.45),
        alpha: rand(0.55, 0.9),
        puffs: buildPuffs(),
      };
    }

    function buildPuffs() {
      const puffs = [];
      const count = randInt(4, 7);
      for (let i = 0; i < count; i++) {
        puffs.push({ ox: rand(-60, 60), oy: rand(-18, 18), r: rand(22, 42) });
      }
      return puffs;
    }

    function buildMountains() {
      mountains = [];
      mountains.push(buildMountainRange(8, H * 0.28, H * 0.52, [45, 55, 70],  [35, 45, 60]));
      mountains.push(buildMountainRange(6, H * 0.35, H * 0.58, [60, 90, 75],  [50, 80, 65]));
      mountains.push(buildMountainRange(5, H * 0.42, H * 0.63, [55, 100, 60], [40, 80, 45]));
    }

    function buildMountainRange(count, minPeak, maxBase, colorTop, colorBase) {
      const peaks = [];
      const segW  = W / (count - 1);
      for (let i = 0; i < count; i++) {
        peaks.push({
          x: i * segW + rand(-segW * 0.3, segW * 0.3),
          y: rand(minPeak, maxBase * 0.7),
        });
      }
      return { peaks, colorTop, colorBase, maxBase };
    }

    function buildTrees() {
      trees = [];
      const groundY = lakeY;
      for (let i = 0; i < 9; i++) trees.push(makeTree(rand(0, W * 0.25),       groundY, 'pine'));
      for (let i = 0; i < 9; i++) trees.push(makeTree(rand(W * 0.72, W),        groundY, 'pine'));
      for (let i = 0; i < 5; i++) {
        trees.push(makeTree(rand(W * 0.08, W * 0.35), groundY, 'deciduous'));
        trees.push(makeTree(rand(W * 0.65, W * 0.92), groundY, 'deciduous'));
      }
      trees.sort((a, b) => a.y - b.y);
    }

    function makeTree(x, groundY, type) {
      const h = type === 'pine' ? rand(80, 160) : rand(70, 130);
      return {
        x, y: groundY, h, type,
        trunkW:  type === 'pine' ? rand(6, 10)  : rand(8, 14),
        canopyR: type === 'deciduous' ? rand(28, 48) : 0,
        layers:  type === 'pine' ? randInt(3, 5) : 0,
        phase:   rand(0, Math.PI * 2),
        swayAmp: rand(0.008, 0.02),
      };
    }

    function buildGrass() {
      grassBlades = [];
      const groundY = lakeY;
      for (let i = 0; i < 320; i++) {
        const r = 50 + randInt(0, 20);
        const g = 120 + randInt(0, 30);
        const b = 40 + randInt(0, 20);
        grassBlades.push({
          x:     rand(0, W),
          y:     groundY + rand(-4, 8),
          h:     rand(14, 32),
          phase: rand(0, Math.PI * 2),
          speed: rand(1.2, 2.5),
          amp:   rand(3, 8),
          color: `rgba(${r},${g},${b},0.85)`,
        });
      }
    }

    function buildBirds() {
      birds = [];
      for (let f = 0; f < 2; f++) {
        const fx     = rand(-200, W * 0.5);
        const fy     = rand(H * 0.08, H * 0.3);
        const fspeed = rand(0.6, 1.2);
        for (let i = 0; i < 5; i++) {
          birds.push({
            x:         fx + i * rand(22, 40),
            y:         fy + Math.sin(i * 0.7) * 18,
            speed:     fspeed + rand(-0.15, 0.15),
            phase:     rand(0, Math.PI * 2),
            wingSpeed: rand(0.08, 0.14),
            size:      rand(5, 9),
          });
        }
      }
    }

    function buildFireflies() {
      fireflies = [];
      for (let i = 0; i < 55; i++) {
        fireflies.push({
          x:     rand(W * 0.05, W * 0.95),
          y:     rand(lakeY - H * 0.22, lakeY - 10),
          vx:    rand(-0.35, 0.35),
          vy:    rand(-0.25, 0.25),
          phase: rand(0, Math.PI * 2),
          r:     rand(1.5, 3),
          speed: rand(0.04, 0.09),
        });
      }
    }

    function buildRain() {
      raindrops = [];
      for (let i = 0; i < 350; i++) raindrops.push(makeRaindrop());
    }

    function makeRaindrop() {
      return {
        x:     rand(0, W),
        y:     rand(-H, 0),
        len:   rand(12, 26),
        speed: rand(9, 16),
        alpha: rand(0.3, 0.7),
      };
    }

    /* ── Sky colours ─────────────────────────────────────── */
    const SKY_KEYFRAMES = [
      { t: 0.00, top: [10, 18, 50],   hor: [25, 35, 80]   },
      { t: 0.15, top: [40, 30, 80],   hor: [210, 100, 80] },
      { t: 0.30, top: [100, 170, 230],hor: [255, 220, 150] },
      { t: 0.50, top: [60, 140, 210], hor: [170, 220, 255] },
      { t: 0.70, top: [80, 130, 200], hor: [255, 200, 120] },
      { t: 0.82, top: [55, 40, 90],   hor: [240, 100, 60]  },
      { t: 0.92, top: [18, 22, 60],   hor: [60, 40, 80]   },
      { t: 1.00, top: [10, 18, 50],   hor: [25, 35, 80]   },
    ];

    function getSkyColors(phase) {
      let i = 0;
      while (i < SKY_KEYFRAMES.length - 2 && SKY_KEYFRAMES[i + 1].t <= phase) i++;
      const a  = SKY_KEYFRAMES[i];
      const b  = SKY_KEYFRAMES[i + 1];
      const t2 = (phase - a.t) / (b.t - a.t);
      return { top: lerpColor(a.top, b.top, t2), hor: lerpColor(a.hor, b.hor, t2) };
    }

    function isNight(phase) {
      return stateRef.current.forcedNight || phase < 0.12 || phase > 0.90;
    }

    function nightness(phase) {
      if (stateRef.current.forcedNight) return 1;
      if (phase < 0.12) return lerp(1, 0, phase / 0.12);
      if (phase > 0.90) return lerp(0, 1, (phase - 0.90) / 0.10);
      return 0;
    }

    /* ── Draw helpers ────────────────────────────────────── */
    function drawSky(phase) {
      const { top, hor } = getSkyColors(phase);
      const grad = ctx.createLinearGradient(0, 0, 0, lakeY);
      grad.addColorStop(0, rgb(top));
      grad.addColorStop(1, rgb(hor));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, lakeY);
    }

    function drawStars(phase) {
      const n = nightness(phase);
      if (n <= 0) return;
      stars.forEach(s => {
        const twinkle = 0.5 + 0.5 * Math.sin(time * s.speed + s.phase);
        const alpha   = n * (0.4 + 0.6 * twinkle);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fill();
      });
    }

    function drawSun(phase) {
      const n        = nightness(phase);
      const sunAngle = Math.PI * phase;
      const cx = W * 0.5 + Math.cos(Math.PI - sunAngle) * W * 0.42;
      const cy = lakeY * 0.85 - Math.abs(Math.sin(sunAngle)) * lakeY * 0.75;
      if (n >= 0.99) return;
      const alpha  = 1 - n;
      const glowR  = 60;
      const glow   = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      glow.addColorStop(0, `rgba(255,240,180,${(0.4 * alpha).toFixed(3)})`);
      glow.addColorStop(1, 'rgba(255,200,80,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,235,100,${alpha.toFixed(3)})`;
      ctx.fill();
    }

    function drawMoon(phase) {
      const n = nightness(phase);
      if (n <= 0) return;
      const moonAngle = Math.PI * (1 - phase);
      const cx = W * 0.5 + Math.cos(moonAngle) * W * 0.38;
      const cy = lakeY * 0.85 - Math.abs(Math.sin(moonAngle)) * lakeY * 0.72;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
      glow.addColorStop(0, `rgba(200,220,255,${(0.25 * n).toFixed(3)})`);
      glow.addColorStop(1, 'rgba(200,220,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 50, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,240,255,${n.toFixed(3)})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 6, cy - 3, 14, 0, Math.PI * 2);
      const { top } = getSkyColors(phase);
      ctx.fillStyle = rgba(top, n * 0.85);
      ctx.fill();
    }

    function drawClouds(phase) {
      const n          = nightness(phase);
      const brightness = n > 0.5 ? 0.55 : 1;
      clouds.forEach(cloud => {
        ctx.save();
        ctx.globalAlpha = cloud.alpha * (0.4 + 0.6 * brightness);
        ctx.translate(cloud.x, cloud.y);
        ctx.scale(cloud.scale, cloud.scale);
        cloud.puffs.forEach(p => {
          const c    = n > 0.5 ? '180,190,220' : '255,255,255';
          const grad = ctx.createRadialGradient(p.ox, p.oy - p.r * 0.2, p.r * 0.1, p.ox, p.oy, p.r);
          grad.addColorStop(0, `rgba(${c},0.95)`);
          grad.addColorStop(1, `rgba(${c},0)`);
          ctx.beginPath();
          ctx.arc(p.ox, p.oy, p.r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        });
        ctx.restore();
      });
    }

    function drawMountain(range) {
      const { peaks, colorTop, colorBase, maxBase } = range;
      ctx.beginPath();
      ctx.moveTo(0, maxBase);
      peaks.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(W, maxBase);
      ctx.closePath();
      const minY = peaks.reduce((m, p) => Math.min(m, p.y), H);
      const grad = ctx.createLinearGradient(0, minY, 0, maxBase);
      grad.addColorStop(0, rgb(colorTop));
      grad.addColorStop(1, rgb(colorBase));
      ctx.fillStyle = grad;
      ctx.fill();
    }

    function drawGround() {
      const grad = ctx.createLinearGradient(0, lakeY - H * 0.08, 0, lakeY);
      grad.addColorStop(0, 'rgb(60,110,55)');
      grad.addColorStop(1, 'rgb(40,85,40)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, lakeY - H * 0.08, W, H * 0.08);
    }

    function drawLake(phase) {
      const { top, hor } = getSkyColors(phase);
      const waterTop     = lerpColor(top, [0, 30, 60],  0.45);
      const waterBtm     = lerpColor(hor, [0, 20, 50],  0.5);
      const lakeGrad     = ctx.createLinearGradient(0, lakeY, 0, lakeY + lakeH);
      lakeGrad.addColorStop(0, rgb(waterTop));
      lakeGrad.addColorStop(1, rgb(waterBtm));
      ctx.fillStyle = lakeGrad;
      ctx.fillRect(0, lakeY, W, lakeH);

      const shimmerCount = 18;
      for (let i = 0; i < shimmerCount; i++) {
        const sx = (i / shimmerCount) * W + Math.sin(time * 0.6 + i * 1.3) * 18;
        const sy = lakeY + (i % 3) * (lakeH / 3) + Math.sin(time * 0.9 + i) * 4;
        const sw = rand(20, 70);
        const shimmerGrad = ctx.createLinearGradient(sx, sy, sx + sw, sy);
        shimmerGrad.addColorStop(0,   'rgba(255,255,255,0)');
        shimmerGrad.addColorStop(0.5, 'rgba(255,255,255,0.12)');
        shimmerGrad.addColorStop(1,   'rgba(255,255,255,0)');
        ctx.fillStyle = shimmerGrad;
        ctx.fillRect(sx, sy, sw, 2);
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth   = 1;
      for (let row = 0; row < 5; row++) {
        const wy = lakeY + (row + 1) * (lakeH / 6);
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) {
          const y = wy + Math.sin((x / 60) + time * 1.2 + row * 1.1) * 2.5;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    function drawRipples() {
      ripples = ripples.filter(r => r.life > 0);
      ripples.forEach(r => {
        r.radius += 0.8;
        r.life   -= 1;
        const alpha = (r.life / r.maxLife) * 0.35;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
      });
      if (Math.random() < 0.015) {
        const life = 60;
        ripples.push({
          x: rand(W * 0.1, W * 0.9),
          y: rand(lakeY + 5, lakeY + lakeH - 10),
          radius: 3, life, maxLife: life,
        });
      }
    }

    function drawForegroundGround() {
      ctx.fillStyle = 'rgb(35,72,35)';
      ctx.fillRect(0, lakeY + lakeH, W, H - (lakeY + lakeH));
    }

    function drawGrass(wind) {
      grassBlades.forEach(b => {
        const sway = Math.sin(time * b.speed + b.phase + wind * 0.5) * (b.amp + wind * 2.5);
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.quadraticCurveTo(b.x + sway * 0.5, b.y - b.h * 0.5, b.x + sway, b.y - b.h);
        ctx.strokeStyle = b.color;
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      });
    }

    function drawPineTree(tree, wind) {
      const sway = Math.sin(time * 0.9 + tree.phase) * tree.swayAmp * tree.h * (1 + wind * 0.4);
      ctx.save();
      ctx.translate(tree.x, tree.y);
      ctx.fillStyle = '#5a3e28';
      ctx.fillRect(-tree.trunkW / 2, -tree.h * 0.2, tree.trunkW, tree.h * 0.2);
      for (let l = 0; l < tree.layers; l++) {
        const t      = l / (tree.layers - 1 || 1);
        const layerY = -tree.h * (0.2 + t * 0.75);
        const halfW  = tree.h * 0.18 * (1 - t * 0.4) * (1.2 - l * 0.15);
        const layerH = tree.h * 0.38 * (1 - t * 0.3);
        const swayX  = sway * (t * 0.8 + 0.2);
        ctx.beginPath();
        ctx.moveTo(swayX, layerY - layerH);
        ctx.lineTo(swayX - halfW, layerY);
        ctx.lineTo(swayX + halfW, layerY);
        ctx.closePath();
        ctx.fillStyle = `rgb(${30 + l * 6},${90 + l * 5},${35 + l * 4})`;
        ctx.fill();
      }
      ctx.restore();
    }

    function drawDeciduousTree(tree, wind) {
      const sway = Math.sin(time * 0.7 + tree.phase) * tree.swayAmp * tree.h * (1 + wind * 0.35);
      ctx.save();
      ctx.translate(tree.x, tree.y);
      ctx.strokeStyle = '#5a3e28';
      ctx.lineWidth   = tree.trunkW;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(sway * 0.3, -tree.h * 0.48);
      ctx.stroke();
      const cx = sway;
      const cy = -tree.h * 0.62;
      const r  = tree.canopyR;
      for (let i = 0; i < 5; i++) {
        const ox = Math.cos(i / 5 * Math.PI * 2) * r * 0.55;
        const oy = Math.sin(i / 5 * Math.PI * 2) * r * 0.45;
        ctx.beginPath();
        ctx.arc(cx + ox, cy + oy, r * 0.72, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${45 + i * 4},${105 + i * 5},${35 + i * 3})`;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
      ctx.fillStyle = 'rgb(55,120,45)';
      ctx.fill();
      ctx.restore();
    }

    function drawTrees(wind) {
      trees.forEach(tree => {
        if (tree.type === 'pine') drawPineTree(tree, wind);
        else                      drawDeciduousTree(tree, wind);
      });
    }

    function drawBirds(phase) {
      const n = nightness(phase);
      if (n > 0.8) return;
      const alpha = 1 - n;
      birds.forEach(bird => {
        const wing = Math.sin(time * bird.wingSpeed * 60 + bird.phase);
        ctx.save();
        ctx.translate(bird.x, bird.y + Math.sin(time * 0.5 + bird.phase) * 4);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-bird.size, wing * bird.size * 1.2, -bird.size * 2, 0);
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(bird.size,  wing * bird.size * 1.2,  bird.size * 2, 0);
        ctx.strokeStyle = 'rgba(20,20,20,0.85)';
        ctx.lineWidth   = 1.2;
        ctx.stroke();
        ctx.restore();
      });
    }

    function drawFireflies(phase) {
      const n = nightness(phase);
      if (n < 0.3) return;
      const alpha = Math.min(1, (n - 0.3) / 0.4);
      fireflies.forEach(ff => {
        const glow = 0.4 + 0.6 * Math.sin(time * ff.speed * 60 + ff.phase);
        const a    = alpha * glow;
        const grad = ctx.createRadialGradient(ff.x, ff.y, 0, ff.x, ff.y, ff.r * 5);
        grad.addColorStop(0, `rgba(200,255,150,${a.toFixed(3)})`);
        grad.addColorStop(1, 'rgba(200,255,150,0)');
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, ff.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, ff.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,255,180,${Math.min(1, a * 1.5).toFixed(3)})`;
        ctx.fill();
      });
    }

    function drawRain(wind) {
      if (!stateRef.current.rainOn) return;
      const windAngle = wind * 0.12;
      ctx.save();
      ctx.strokeStyle = 'rgba(180,210,255,0.45)';
      ctx.lineWidth   = 1;
      raindrops.forEach(drop => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + windAngle * drop.len, drop.y + drop.len);
        ctx.stroke();
      });
      ctx.restore();
    }

    /* ── Update logic ────────────────────────────────────── */
    function updateClouds() {
      const baseSpeed = WIND_SPEEDS[stateRef.current.windLevel];
      clouds.forEach(cloud => {
        cloud.x += cloud.speed + baseSpeed * 0.4;
        if (cloud.x - cloud.scale * 120 > W) {
          cloud.x = -cloud.scale * 130;
          cloud.y = rand(H * 0.05, H * 0.28);
        }
      });
    }

    function updateBirds() {
      birds.forEach(bird => {
        bird.x += bird.speed + WIND_SPEEDS[stateRef.current.windLevel] * 0.25;
        if (bird.x > W + 60) bird.x = -60;
      });
    }

    function updateFireflies() {
      fireflies.forEach(ff => {
        ff.x += ff.vx + Math.sin(time * 0.8 + ff.phase) * 0.3;
        ff.y += ff.vy + Math.cos(time * 0.6 + ff.phase) * 0.25;
        if (ff.x < 0) ff.x = W;
        if (ff.x > W) ff.x = 0;
        ff.y = Math.max(lakeY - H * 0.25, Math.min(lakeY - 5, ff.y));
      });
    }

    function updateRain() {
      if (!stateRef.current.rainOn) return;
      const windShift = WIND_SPEEDS[stateRef.current.windLevel] * 0.5;
      raindrops.forEach(drop => {
        drop.y += drop.speed;
        drop.x += windShift;
        if (drop.y > H + 30 || drop.x > W + 40) {
          drop.y = rand(-60, 0);
          drop.x = rand(-50, W);
          if (drop.x > 0 && drop.x < W) {
            const hitY = drop.y + drop.len;
            if (hitY >= lakeY && hitY <= lakeY + lakeH) {
              const life = 50;
              ripples.push({ x: drop.x, y: hitY, radius: 2, life, maxLife: life });
            }
          }
        }
      });
    }

    /* ── Clock ───────────────────────────────────────────── */
    const clockEl = document.getElementById('clock');
    const PHASE_NAMES = [
      { t: 0.00, name: '🌌 Night'     },
      { t: 0.13, name: '🌅 Dawn'      },
      { t: 0.28, name: '☀️ Morning'   },
      { t: 0.48, name: '🌞 Noon'      },
      { t: 0.68, name: '🌤 Afternoon' },
      { t: 0.80, name: '🌇 Dusk'      },
      { t: 0.90, name: '🌆 Evening'   },
      { t: 0.96, name: '🌌 Night'     },
    ];

    function updateClock(phase) {
      if (!clockEl) return;
      if (stateRef.current.forcedNight) { clockEl.textContent = '🌌 Night'; return; }
      let name = PHASE_NAMES[0].name;
      for (let i = 0; i < PHASE_NAMES.length; i++) {
        if (phase >= PHASE_NAMES[i].t) name = PHASE_NAMES[i].name;
      }
      clockEl.textContent = name;
    }

    /* ── Main render loop ────────────────────────────────── */
    const DAY_CYCLE_SPEED = 0.0004;

    function draw() {
      time += 0.016;
      if (!stateRef.current.forcedNight) {
        dayPhase = (dayPhase + DAY_CYCLE_SPEED) % 1;
      }
      const phase = stateRef.current.forcedNight ? 0.02 : dayPhase;
      const wind  = WIND_SPEEDS[stateRef.current.windLevel];

      updateClouds();
      updateBirds();
      updateFireflies();
      updateRain();

      drawSky(phase);
      drawStars(phase);
      drawMoon(phase);
      drawSun(phase);
      drawClouds(phase);
      mountains.forEach(m => drawMountain(m));
      drawGround();
      drawTrees(wind);
      drawGrass(wind);
      drawLake(phase);
      drawRipples();
      drawForegroundGround();
      drawRain(wind);
      drawBirds(phase);
      drawFireflies(phase);
      updateClock(phase);

      rafId = requestAnimationFrame(draw);
    }

    /* ── Resize ──────────────────────────────────────────── */
    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      buildScene();
    }

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  /* ── Sync state changes into the ref ────────────────────── */
  useEffect(() => { stateRef.current.rainOn = rainOn; }, [rainOn]);
  useEffect(() => { stateRef.current.windLevel = windLevel; }, [windLevel]);
  useEffect(() => { stateRef.current.forcedNight = forcedNight; }, [forcedNight]);

  const WIND_LABELS = ['😌 Calm', '💨 Breezy', '🌬 Windy'];

  function toggleRain() {
    setRainOn(prev => !prev);
  }

  function cycleWind() {
    setWindLevel(prev => (prev + 1) % 3);
  }

  function toggleNight() {
    setForcedNight(prev => !prev);
  }

  return (
    <>
      <canvas id="natureCanvas" ref={canvasRef} />
      <div id="ui">
        <div id="controls">
          <button
            id="btnRain"
            title="Toggle Rain"
            className={rainOn ? 'active' : ''}
            onClick={toggleRain}
          >
            🌧 Rain
          </button>
          <button
            id="btnWind"
            title="Cycle Wind Level"
            className={windLevel > 0 ? 'active' : ''}
            onClick={cycleWind}
          >
            {WIND_LABELS[windLevel]}
          </button>
          <button
            id="btnTime"
            title="Toggle Day / Night"
            className={forcedNight ? 'active' : ''}
            onClick={toggleNight}
          >
            {forcedNight ? '☀️ Day' : '🌙 Night'}
          </button>
        </div>
        <div id="clock" />
      </div>
    </>
  );
}
