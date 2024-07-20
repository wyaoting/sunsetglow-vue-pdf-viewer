var A = {
  a: 7,
  c: 6,
  h: 1,
  l: 2,
  m: 2,
  q: 4,
  s: 4,
  t: 2,
  v: 1,
  z: 0
}, V = /([astvzqmhlc])([^astvzqmhlc]*)/gi, Z = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;
function _(o) {
  const n = o.match(Z);
  return n ? n.map(Number) : [];
}
function U(o) {
  const n = [], t = String(o).trim();
  return t[0] !== "M" && t[0] !== "m" || t.replace(V, (l, r, a) => {
    const s = _(a);
    let i = r.toLowerCase(), c = r;
    if (i === "m" && s.length > 2 && (n.push([c, ...s.splice(0, 2)]), i = "l", c = c === "m" ? "l" : "L"), s.length < A[i])
      return "";
    for (n.push([c, ...s.splice(0, A[i])]); s.length >= A[i] && s.length && A[i]; )
      n.push([c, ...s.splice(0, A[i])]);
    return "";
  }), n;
}
function B(o, n) {
  const t = o.x * Math.cos(n) - o.y * Math.sin(n), l = o.y * Math.cos(n) + o.x * Math.sin(n);
  o.x = t, o.y = l;
}
function j(o, n, t) {
  o.x += n, o.y += t;
}
function C(o, n) {
  o.x *= n, o.y *= n;
}
var N = class S {
  constructor(n) {
    this.commands = [], n && n instanceof S ? this.commands.push(...n.commands) : n && (this.commands = U(n));
  }
  addPath(n) {
    n && n instanceof S && this.commands.push(...n.commands);
  }
  moveTo(n, t) {
    this.commands.push(["M", n, t]);
  }
  lineTo(n, t) {
    this.commands.push(["L", n, t]);
  }
  arc(n, t, l, r, a, s) {
    this.commands.push(["AC", n, t, l, r, a, !!s]);
  }
  arcTo(n, t, l, r, a) {
    this.commands.push(["AT", n, t, l, r, a]);
  }
  ellipse(n, t, l, r, a, s, i, c) {
    this.commands.push(["E", n, t, l, r, a, s, i, !!c]);
  }
  closePath() {
    this.commands.push(["Z"]);
  }
  bezierCurveTo(n, t, l, r, a, s) {
    this.commands.push(["C", n, t, l, r, a, s]);
  }
  quadraticCurveTo(n, t, l, r) {
    this.commands.push(["Q", n, t, l, r]);
  }
  rect(n, t, l, r) {
    this.commands.push(["R", n, t, l, r]);
  }
  roundRect(n, t, l, r, a) {
    typeof a > "u" ? this.commands.push(["RR", n, t, l, r, 0]) : this.commands.push(["RR", n, t, l, r, a]);
  }
};
function F(o, n) {
  let t = 0, l = 0, r, a, s, i, c, u, P, q, L, z, $, G, E, p, f, w, I, b, R, d, Q, m = null, k = null, y = null, T = null, v = null, M = null;
  o.beginPath();
  for (let h = 0; h < n.length; ++h) {
    b = n[h][0], b !== "S" && b !== "s" && b !== "C" && b !== "c" && (m = null, k = null), b !== "T" && b !== "t" && b !== "Q" && b !== "q" && (y = null, T = null);
    let e;
    switch (b) {
      case "m":
      case "M":
        e = n[h], b === "m" ? (t += e[1], l += e[2]) : (t = e[1], l = e[2]), (b === "M" || !v) && (v = { x: t, y: l }), o.moveTo(t, l);
        break;
      case "l":
        e = n[h], t += e[1], l += e[2], o.lineTo(t, l);
        break;
      case "L":
        e = n[h], t = e[1], l = e[2], o.lineTo(t, l);
        break;
      case "H":
        e = n[h], t = e[1], o.lineTo(t, l);
        break;
      case "h":
        e = n[h], t += e[1], o.lineTo(t, l);
        break;
      case "V":
        e = n[h], l = e[1], o.lineTo(t, l);
        break;
      case "v":
        e = n[h], l += e[1], o.lineTo(t, l);
        break;
      case "a":
      case "A":
        if (e = n[h], M === null)
          throw new Error("This should never happen");
        b === "a" ? (t += e[6], l += e[7]) : (t = e[6], l = e[7]), p = e[1], f = e[2], P = e[3] * Math.PI / 180, s = !!e[4], i = !!e[5], c = { x: t, y: l }, u = {
          x: (M.x - c.x) / 2,
          y: (M.y - c.y) / 2
        }, B(u, -P), q = u.x * u.x / (p * p) + u.y * u.y / (f * f), q > 1 && (q = Math.sqrt(q), p *= q, f *= q), R = {
          x: p * u.y / f,
          y: -(f * u.x) / p
        }, L = p * p * f * f, z = p * p * u.y * u.y + f * f * u.x * u.x, i !== s ? C(R, Math.sqrt((L - z) / z) || 0) : C(R, -Math.sqrt((L - z) / z) || 0), a = Math.atan2((u.y - R.y) / f, (u.x - R.x) / p), r = Math.atan2(-(u.y + R.y) / f, -(u.x + R.x) / p), B(R, P), j(R, (c.x + M.x) / 2, (c.y + M.y) / 2), o.save(), o.translate(R.x, R.y), o.rotate(P), o.scale(p, f), o.arc(0, 0, 1, a, r, !i), o.restore();
        break;
      case "C":
        e = n[h], m = e[3], k = e[4], t = e[5], l = e[6], o.bezierCurveTo(e[1], e[2], m, k, t, l);
        break;
      case "c":
        e = n[h], o.bezierCurveTo(e[1] + t, e[2] + l, e[3] + t, e[4] + l, e[5] + t, e[6] + l), m = e[3] + t, k = e[4] + l, t += e[5], l += e[6];
        break;
      case "S":
        e = n[h], (m === null || k === null) && (m = t, k = l), o.bezierCurveTo(2 * t - m, 2 * l - k, e[1], e[2], e[3], e[4]), m = e[1], k = e[2], t = e[3], l = e[4];
        break;
      case "s":
        e = n[h], (m === null || k === null) && (m = t, k = l), o.bezierCurveTo(2 * t - m, 2 * l - k, e[1] + t, e[2] + l, e[3] + t, e[4] + l), m = e[1] + t, k = e[2] + l, t += e[3], l += e[4];
        break;
      case "Q":
        e = n[h], y = e[1], T = e[2], t = e[3], l = e[4], o.quadraticCurveTo(y, T, t, l);
        break;
      case "q":
        e = n[h], y = e[1] + t, T = e[2] + l, t += e[3], l += e[4], o.quadraticCurveTo(y, T, t, l);
        break;
      case "T":
        e = n[h], (y === null || T === null) && (y = t, T = l), y = 2 * t - y, T = 2 * l - T, t = e[1], l = e[2], o.quadraticCurveTo(y, T, t, l);
        break;
      case "t":
        e = n[h], (y === null || T === null) && (y = t, T = l), y = 2 * t - y, T = 2 * l - T, t += e[1], l += e[2], o.quadraticCurveTo(y, T, t, l);
        break;
      case "z":
      case "Z":
        v && (t = v.x, l = v.y), v = null, o.closePath();
        break;
      case "AC":
        e = n[h], t = e[1], l = e[2], E = e[3], a = e[4], r = e[5], d = e[6], o.arc(t, l, E, a, r, d);
        break;
      case "AT":
        e = n[h], $ = e[1], G = e[2], t = e[3], l = e[4], E = e[5], o.arcTo($, G, t, l, E);
        break;
      case "E":
        e = n[h], t = e[1], l = e[2], p = e[3], f = e[4], P = e[5], a = e[6], r = e[7], d = e[8], o.save(), o.translate(t, l), o.rotate(P), o.scale(p, f), o.arc(0, 0, 1, a, r, d), o.restore();
        break;
      case "R":
        e = n[h], t = e[1], l = e[2], w = e[3], I = e[4], v = { x: t, y: l }, o.rect(t, l, w, I);
        break;
      case "RR":
        e = n[h], t = e[1], l = e[2], w = e[3], I = e[4], Q = e[5], v = { x: t, y: l }, o.roundRect(t, l, w, I, Q);
        break;
      default:
        throw new Error(`Invalid path command: ${b}`);
    }
    M ? (M.x = t, M.y = l) : M = { x: t, y: l };
  }
}
function H(o, n, t, l, r = 0) {
  if (typeof r == "number" && (r = [r]), Array.isArray(r)) {
    if (r.length === 0 || r.length > 4)
      throw new RangeError(
        `Failed to execute 'roundRect' on '${this.constructor.name}': ${r.length} radii provided. Between one and four radii are necessary.`
      );
    r.forEach((P) => {
      if (P < 0)
        throw new RangeError(
          `Failed to execute 'roundRect' on '${this.constructor.name}': Radius value ${P} is negative.`
        );
    });
  } else
    return;
  if (r.length === 1 && r[0] === 0) {
    this.rect(o, n, t, l);
    return;
  }
  const a = Math.min(t, l) / 2, s = Math.min(a, r[0]);
  let i = s, c = s, u = s;
  r.length === 2 && (i = Math.min(a, r[1]), u = i), r.length === 3 && (i = Math.min(a, r[1]), u = i, c = Math.min(a, r[2])), r.length === 4 && (i = Math.min(a, r[1]), c = Math.min(a, r[2]), u = Math.min(a, r[3])), this.moveTo(o, n + l - u), this.arcTo(o, n, o + s, n, s), this.arcTo(o + t, n, o + t, n + i, i), this.arcTo(o + t, n + l, o + t - c, n + l, c), this.arcTo(o, n + l, o, n + l - u, u), this.moveTo(o, n);
}
function J(o) {
  if (!o)
    return;
  const n = o.prototype.clip, t = o.prototype.fill, l = o.prototype.stroke, r = o.prototype.isPointInPath;
  o.prototype.clip = function(...s) {
    if (s[0] instanceof N) {
      const c = s[0], u = s[1] || "nonzero";
      return F(this, c.commands), n.apply(this, [u]);
    }
    const i = s[0] || "nonzero";
    return n.apply(this, [i]);
  }, o.prototype.fill = function(...s) {
    if (s[0] instanceof N) {
      const c = s[0], u = s[1] || "nonzero";
      return F(this, c.commands), t.apply(this, [u]);
    }
    const i = s[0] || "nonzero";
    return t.apply(this, [i]);
  }, o.prototype.stroke = function(s) {
    s && F(this, s.commands), l.apply(this);
  }, o.prototype.isPointInPath = function(...s) {
    if (s[0] instanceof N) {
      const i = s[0], c = s[1], u = s[2], P = s[3] || "nonzero";
      return F(this, i.commands), r.apply(this, [c, u, P]);
    }
    return r.apply(this, s);
  };
}
function K(o) {
  o && !o.prototype.roundRect && (o.prototype.roundRect = H);
}
function O(o) {
  o && !o.prototype.roundRect && (o.prototype.roundRect = H);
}
export {
  N as Path2D,
  J as applyPath2DToCanvasRenderingContext,
  K as applyRoundRectToCanvasRenderingContext2D,
  O as applyRoundRectToPath2D,
  F as buildPath,
  U as parsePath,
  H as roundRect
};
