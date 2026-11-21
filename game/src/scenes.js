// The pictures: three original scenes, each drawn twice — once whole (the left panel) and
// once with seven small changes (the right panel). Every difference is one discrete element:
// present in the left picture and missing or changed in the right one, so a click on it is
// always fair. Scenes are drawn in a 560x420 local space; the renderer translates to the panel.
//
// A difference is { x, y, r, label }: the click target in scene coordinates and the radius
// the world accepts as a hit. Level 3 uses smaller radii, so it plays harder.

function circle(g, x, y, r, color) {
  g.fillStyle = color;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

function ellipse(g, x, y, rx, ry, color) {
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}

function rect(g, x, y, w, h, color) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function poly(g, points, color) {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) g.lineTo(points[i][0], points[i][1]);
  g.closePath();
  g.fill();
}

function line(g, x1, y1, x2, y2, color, width) {
  g.strokeStyle = color;
  g.lineWidth = width;
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
}

function cloud(g, x, y, scale, color) {
  g.fillStyle = color;
  g.beginPath();
  g.arc(x, y, 18 * scale, 0, Math.PI * 2);
  g.arc(x + 20 * scale, y - 6 * scale, 14 * scale, 0, Math.PI * 2);
  g.arc(x + 38 * scale, y, 16 * scale, 0, Math.PI * 2);
  g.fill();
}

function gull(g, x, y, color) {
  g.strokeStyle = color;
  g.lineWidth = 2.5;
  g.beginPath();
  g.moveTo(x - 12, y);
  g.quadraticCurveTo(x - 5, y - 9, x, y);
  g.quadraticCurveTo(x + 5, y - 9, x + 12, y);
  g.stroke();
}

function flower(g, x, y, petal, center) {
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2;
    circle(g, x + Math.cos(a) * 8, y + Math.sin(a) * 8, 6, petal);
  }
  circle(g, x, y, 5, center);
}

// ---------------------------------------------------------------------------
// Level 1 — Sunset Harbor
// ---------------------------------------------------------------------------
const harbor = {
  name: 'Sunset Harbor',
  diffs: [
    { x: 140, y: 70, r: 30, label: 'the gull' },
    { x: 495, y: 128, r: 26, label: 'the lighthouse lamp' },
    { x: 150, y: 208, r: 26, label: 'the sailboat flag' },
    { x: 210, y: 368, r: 28, label: 'the buoy' },
    { x: 85, y: 162, r: 28, label: 'the chimney smoke' },
    { x: 400, y: 358, r: 28, label: 'the jumping fish' },
    { x: 520, y: 330, r: 26, label: 'the rope coil' },
  ],
  draw(g, v) {
    // Sky.
    const sky = g.createLinearGradient(0, 0, 0, 260);
    sky.addColorStop(0, '#ff9a5c');
    sky.addColorStop(0.6, '#e86a8a');
    sky.addColorStop(1, '#7a5aa8');
    g.fillStyle = sky;
    g.fillRect(0, 0, 560, 260);
    // Sun with rays.
    circle(g, 440, 88, 34, '#ffd76a');
    g.strokeStyle = '#ffd76a';
    g.lineWidth = 4;
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      line(g, 440 + Math.cos(a) * 42, 88 + Math.sin(a) * 42, 440 + Math.cos(a) * 54, 88 + Math.sin(a) * 54, '#ffd76a', 4);
    }
    cloud(g, 90, 60, 1, 'rgba(255,235,220,0.9)');
    cloud(g, 300, 40, 0.8, 'rgba(255,235,220,0.8)');
    // Diff 1: the gull.
    if (v === 0) gull(g, 140, 70, '#3a2b3f');
    gull(g, 210, 110, '#3a2b3f');
    gull(g, 330, 60, '#3a2b3f');
    // Distant hills.
    g.fillStyle = '#6a4a7a';
    g.beginPath();
    g.moveTo(0, 260);
    g.quadraticCurveTo(140, 190, 280, 250);
    g.quadraticCurveTo(420, 300, 560, 230);
    g.lineTo(560, 260);
    g.closePath();
    g.fill();
    // Houses on the left hill.
    rect(g, 48, 196, 52, 44, '#f2e3c9');
    poly(g, [[44, 196], [74, 172], [104, 196]], '#c65b4e');
    rect(g, 66, 214, 14, 26, '#5a4632');
    // Diff 5: chimney smoke.
    rect(g, 88, 176, 8, 22, '#8a7a6a');
    if (v === 0) {
      circle(g, 92, 168, 7, 'rgba(240,235,225,0.9)');
      circle(g, 98, 156, 9, 'rgba(240,235,225,0.8)');
      circle(g, 92, 142, 6, 'rgba(240,235,225,0.7)');
    }
    rect(g, 116, 208, 44, 32, '#e8d5a8');
    poly(g, [[112, 208], [138, 188], [164, 208]], '#7a5a3a');
    // Sea.
    const sea = g.createLinearGradient(0, 260, 0, 420);
    sea.addColorStop(0, '#3a6a9a');
    sea.addColorStop(1, '#22486e');
    g.fillStyle = sea;
    g.fillRect(0, 260, 560, 160);
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.lineWidth = 2;
    for (const [wx, wy, wl] of [[60, 290, 70], [300, 310, 90], [470, 295, 60], [140, 350, 80], [350, 385, 70], [60, 400, 60]]) {
      g.beginPath();
      g.moveTo(wx, wy);
      g.lineTo(wx + wl, wy);
      g.stroke();
    }
    // Sailboat.
    poly(g, [[120, 300], [120, 220], [178, 300]], '#f6f1e3');
    line(g, 120, 300, 120, 212, '#5a4632', 4);
    // Diff 3: the sailboat flag.
    poly(g, [[120, 212], [120, 196], [v === 0 ? 146 : 138, 204]], v === 0 ? '#d94f3d' : '#2e8b8b');
    poly(g, [[96, 300], [196, 300], [186, 316], [106, 316]], '#8a4a3a');
    // Rowboat.
    ellipse(g, 380, 318, 42, 10, '#6a4a2a');
    line(g, 352, 306, 336, 292, '#c9a86a', 3);
    line(g, 408, 306, 424, 292, '#c9a86a', 3);
    // Diff 4: the buoy.
    if (v === 0) {
      circle(g, 210, 368, 12, '#e86a2a');
      rect(g, 204, 348, 12, 8, '#e86a2a');
      circle(g, 210, 346, 4, '#ffd76a');
    }
    // Diff 6: the jumping fish.
    if (v === 0) {
      g.strokeStyle = '#cfe8f2';
      g.lineWidth = 3;
      g.beginPath();
      g.arc(400, 368, 14, Math.PI * 1.1, Math.PI * 1.9);
      g.stroke();
      ellipse(g, 400, 352, 10, 5, '#9fc6d8');
    }
    // Pier.
    rect(g, 440, 318, 120, 14, '#7a5a3a');
    rect(g, 440, 332, 120, 6, '#6a4a2a');
    rect(g, 452, 338, 8, 52, '#5a3a22');
    rect(g, 540, 338, 8, 52, '#5a3a22');
    // Diff 7: the rope coil.
    if (v === 0) {
      g.strokeStyle = '#d9c08a';
      g.lineWidth = 4;
      g.beginPath();
      g.arc(520, 322, 10, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.arc(520, 322, 5, 0, Math.PI * 2);
      g.stroke();
    }
    // Lighthouse.
    rect(g, 478, 120, 34, 150, '#f6f1e3');
    rect(g, 478, 160, 34, 18, '#d94f3d');
    rect(g, 478, 210, 34, 18, '#d94f3d');
    rect(g, 474, 100, 42, 22, '#3a2b3f');
    // Diff 2: the lighthouse lamp.
    circle(g, 495, 112, 9, v === 0 ? '#ffe98a' : '#4a4a55');
    if (v === 0) {
      g.fillStyle = 'rgba(255,233,138,0.25)';
      poly(g, [[516, 106], [560, 92], [560, 128], [516, 118]], 'rgba(255,233,138,0.25)');
    }
  },
};

// ---------------------------------------------------------------------------
// Level 2 — Garden Tea Party
// ---------------------------------------------------------------------------
const garden = {
  name: 'Garden Tea Party',
  diffs: [
    { x: 430, y: 88, r: 30, label: 'the butterfly' },
    { x: 352, y: 292, r: 26, label: 'the third cup' },
    { x: 120, y: 352, r: 26, label: 'the red flower' },
    { x: 462, y: 52, r: 28, label: 'the cloud' },
    { x: 88, y: 382, r: 26, label: 'the mushroom' },
    { x: 500, y: 178, r: 28, label: 'the cat on the fence' },
    { x: 200, y: 402, r: 26, label: 'the stepping stone' },
  ],
  draw(g, v) {
    // Sky and lawn.
    const sky = g.createLinearGradient(0, 0, 0, 200);
    sky.addColorStop(0, '#8ec8ee');
    sky.addColorStop(1, '#d8f0c8');
    g.fillStyle = sky;
    g.fillRect(0, 0, 560, 200);
    circle(g, 70, 60, 30, '#ffd76a');
    // Diff 4: the cloud.
    if (v === 0) cloud(g, 440, 52, 1, 'rgba(255,255,255,0.95)');
    cloud(g, 220, 40, 0.7, 'rgba(255,255,255,0.85)');
    g.fillStyle = '#6aa84f';
    g.fillRect(0, 200, 560, 220);
    g.fillStyle = '#5a9847';
    for (let i = 0; i < 12; i += 1) {
      const bx = (i * 47 + 20) % 560;
      const by = 220 + ((i * 37) % 180);
      ellipse(g, bx, by, 26, 8, '#5a9847');
    }
    // Fence.
    rect(g, 0, 168, 560, 10, '#c9a86a');
    for (let x = 10; x < 560; x += 46) rect(g, x, 150, 10, 44, '#b08a4a');
    // Diff 6: the cat on the fence.
    if (v === 0) {
      ellipse(g, 500, 162, 20, 12, '#e8a34a');
      circle(g, 516, 148, 9, '#e8a34a');
      poly(g, [[510, 142], [514, 132], [518, 142]], '#e8a34a');
      line(g, 482, 160, 466, 150, '#e8a34a', 4);
    }
    // Big tree.
    rect(g, 52, 120, 26, 120, '#7a5230');
    circle(g, 65, 100, 52, '#4e8a3f');
    circle(g, 30, 130, 34, '#5a9a48');
    circle(g, 104, 128, 36, '#5a9a48');
    circle(g, 65, 66, 30, '#6aa84f');
    circle(g, 40, 92, 8, '#d94f3d');
    circle(g, 92, 84, 8, '#d94f3d');
    circle(g, 66, 118, 8, '#d94f3d');
    // Diff 1: the butterfly.
    if (v === 0) {
      ellipse(g, 422, 88, 10, 14, '#b678e8');
      ellipse(g, 440, 88, 10, 14, '#b678e8');
      circle(g, 431, 90, 4, '#3a2b3f');
    }
    // Table with cloth.
    ellipse(g, 300, 300, 110, 16, '#8a5a3a');
    poly(g, [[196, 300], [404, 300], [386, 372], [214, 372]], '#e86a8a');
    circle(g, 300, 306, 8, '#ffd76a');
    // Teapot.
    ellipse(g, 282, 272, 30, 20, '#7ec8f2');
    circle(g, 282, 250, 12, '#7ec8f2');
    circle(g, 282, 244, 5, '#f2c94c');
    poly(g, [[254, 266], [238, 252], [254, 258]], '#7ec8f2');
    line(g, 310, 262, 322, 276, '#7ec8f2', 5);
    // Cups: two always, third only on the left.
    ellipse(g, 330, 288, 12, 8, '#f6f1e3');
    ellipse(g, 240, 290, 12, 8, '#f6f1e3');
    // Diff 2: the third cup.
    if (v === 0) ellipse(g, 352, 292, 12, 8, '#f6f1e3');
    // Flowers.
    flower(g, 120, 352, v === 0 ? '#d94f3d' : '#f2c94c', '#ffd76a');
    flower(g, 180, 330, '#e8a34a', '#7a4a2a');
    flower(g, 470, 360, '#b678e8', '#ffd76a');
    flower(g, 420, 330, '#e86a8a', '#ffd76a');
    flower(g, 60, 320, '#f6f1e3', '#f2c94c');
    // Diff 5: the mushroom.
    if (v === 0) {
      rect(g, 84, 382, 8, 14, '#f6f1e3');
      poly(g, [[74, 384], [88, 366], [102, 384]], '#d94f3d');
      circle(g, 82, 376, 3, '#f6f1e3');
      circle(g, 94, 372, 3, '#f6f1e3');
    }
    // Stepping stones.
    ellipse(g, 150, 402, 24, 8, '#b8b0a0');
    // Diff 7: the stepping stone.
    if (v === 0) ellipse(g, 200, 402, 24, 8, '#b8b0a0');
    ellipse(g, 250, 402, 24, 8, '#b8b0a0');
    ellipse(g, 300, 402, 24, 8, '#b8b0a0');
  },
};

// ---------------------------------------------------------------------------
// Level 3 — Night Market (harder: smaller targets, subtler changes)
// ---------------------------------------------------------------------------
const market = {
  name: 'Night Market',
  diffs: [
    { x: 100, y: 48, r: 22, label: 'the little star' },
    { x: 300, y: 118, r: 22, label: 'the paper lantern' },
    { x: 390, y: 238, r: 22, label: 'the fourth jar' },
    { x: 150, y: 362, r: 22, label: 'the crate' },
    { x: 280, y: 196, r: 24, label: "the vendor's hat" },
    { x: 464, y: 82, r: 22, label: 'the dark bulb' },
    { x: 520, y: 250, r: 22, label: 'the hanging sign' },
  ],
  draw(g, v) {
    // Night sky.
    const sky = g.createLinearGradient(0, 0, 0, 240);
    sky.addColorStop(0, '#141a33');
    sky.addColorStop(1, '#2a3560');
    g.fillStyle = sky;
    g.fillRect(0, 0, 560, 240);
    // Stars.
    for (const [sx, sy, sr] of [[40, 40, 3], [160, 30, 2], [240, 70, 3], [360, 36, 2], [440, 60, 3], [510, 30, 2], [200, 110, 2], [60, 110, 3]]) {
      circle(g, sx, sy, sr, '#f2ede3');
    }
    // Diff 1: the little star.
    if (v === 0) circle(g, 100, 48, 3, '#f2ede3');
    // Moon.
    circle(g, 480, 90, 30, '#f6efc9');
    circle(g, 470, 82, 6, '#ddd2a0');
    circle(g, 492, 100, 4, '#ddd2a0');
    // String lights.
    g.strokeStyle = '#3a2b3f';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, 60);
    g.quadraticCurveTo(280, 110, 560, 55);
    g.stroke();
    for (let i = 0; i < 9; i += 1) {
      const bx = 30 + i * 62;
      const by = 60 + Math.sin((i / 8) * Math.PI) * 38;
      circle(g, bx, by + 8, 6, i === 7 && v === 1 ? '#3a3a44' : (i % 2 ? '#ffd76a' : '#e86a8a'));
    }
    // Ground.
    g.fillStyle = '#3a2e22';
    g.fillRect(0, 240, 560, 180);
    g.fillStyle = '#4a3e2e';
    for (let i = 0; i < 8; i += 1) ellipse(g, 40 + i * 70, 400, 30, 6, '#4a3e2e');
    // Stalls.
    function stall(x, awning, body) {
      poly(g, [[x, 150], [x + 140, 150], [x + 150, 190], [x - 10, 190]], awning);
      rect(g, x, 190, 140, 110, body);
      rect(g, x + 8, 250, 124, 8, '#2a2118');
    }
    stall(30, '#d94f3d', '#7a4a30');
    stall(210, '#2e8b8b', '#5a3a4a');
    stall(390, '#e8a34a', '#4a5a3a');
    // Diff 2: the paper lantern (middle stall).
    circle(g, 300, 118, 14, v === 0 ? '#e84f3d' : '#58c96b');
    rect(g, 294, 100, 12, 6, '#f2c94c');
    rect(g, 294, 130, 12, 6, '#f2c94c');
    circle(g, 90, 118, 14, '#e8a34a');
    circle(g, 480, 118, 14, '#e86a8a');
    // Jars on the middle stall counter.
    for (const jx of [250, 290, 330]) {
      rect(g, jx, 226, 20, 24, '#7ec8f2');
      circle(g, jx + 10, 224, 6, '#f2c94c');
    }
    // Diff 3: the fourth jar.
    if (v === 0) {
      rect(g, 370 - 40 + 50, 226, 20, 24, '#7ec8f2');
      circle(g, 370 - 40 + 60, 224, 6, '#f2c94c');
    }
    // Fruit on the first stall.
    for (const [fx, fy, fc] of [[50, 240, '#d94f3d'], [80, 240, '#e8a34a'], [110, 240, '#58c96b'], [140, 240, '#d94f3d']]) {
      circle(g, fx, fy, 8, fc);
    }
    // Vendor behind the middle stall.
    circle(g, 280, 196, 16, '#e8b88a');
    // Diff 5: the vendor's hat.
    if (v === 0) {
      ellipse(g, 280, 184, 26, 8, '#e8d5a8');
      circle(g, 280, 178, 10, '#e8d5a8');
    } else {
      ellipse(g, 280, 184, 20, 6, '#2e5a8b');
      rect(g, 266, 178, 28, 6, '#2e5a8b');
    }
    rect(g, 258, 212, 44, 40, '#5a7a9a');
    // Diff 4: the crate.
    if (v === 0) {
      rect(g, 126, 340, 48, 44, '#8a6a3a');
      line(g, 126, 340, 174, 384, '#6a4a22', 3);
      line(g, 174, 340, 126, 384, '#6a4a22', 3);
    }
    rect(g, 200, 350, 44, 34, '#7a5a3a');
    // Diff 6: the dark bulb is handled in the string lights above (index 7).
    // Diff 7: the hanging sign on the third stall.
    if (v === 0) {
      rect(g, 508, 232, 26, 36, '#f6f1e3');
      g.fillStyle = '#3a2b3f';
      g.font = 'bold 20px system-ui, sans-serif';
      g.textAlign = 'center';
      g.fillText('5', 521, 258);
    } else {
      rect(g, 508, 232, 26, 36, '#f6f1e3');
      g.fillStyle = '#3a2b3f';
      g.font = 'bold 20px system-ui, sans-serif';
      g.textAlign = 'center';
      g.fillText('8', 521, 258);
    }
    // Bunting flags on the third stall.
    for (let i = 0; i < 5; i += 1) {
      poly(g, [[400 + i * 28, 196], [414 + i * 28, 196], [407 + i * 28, 212]], i % 2 ? '#e86a8a' : '#7ec8f2');
    }
  },
};

export const LEVELS = [harbor, garden, market];
