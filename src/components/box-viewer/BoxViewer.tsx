"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FLUTES, type FinishId, type FluteId, type MaterialGradeId, type PrintMethodId } from "@/lib/boxes";
import {
  faceTextures,
  fluteTexture,
  innerTexture,
  WINDOW_RECT,
  type FaceTextures,
  type Paper,
  type Spec,
} from "./textures";

export type BoxViewerProps = {
  type: string;
  l: number;
  w: number;
  h: number;
  flute: FluteId;
  grade: MaterialGradeId;
  print: PrintMethodId;
  finish: FinishId;
  label: string;
};

/* ------------------------------------------------------------ helpers */

const FLUTE_PITCH_MM: Record<string, number> = { A: 8.5, B: 6.5, C: 7.5, E: 3.4, F: 2.4, DW: 7.5, TW: 8 };
const FLUTE_LAYERS: Record<string, number> = { DW: 2, TW: 3 };
const EDGE_WAVES = 48;

function fluteMm(id: string) {
  const f = FLUTES.find((x) => x.id === id);
  return f ? parseFloat(f.mm) : 3;
}

const isRigid = (t: string) => t === "rigid-gift";

function paperFor(type: string, grade: MaterialGradeId, print: PrintMethodId): Paper {
  if (isRigid(type)) return print === "flexo" ? "kraft" : "charcoal";
  if (print === "offset" || grade === "white-top") return "white";
  if (grade === "recycled") return "recycled";
  if (type === "heavy-duty-crate" || grade === "kraft-7ply") return "kraft-dark";
  return "kraft";
}

function finishParams(finish: FinishId, rigid: boolean) {
  const base = { roughness: rigid ? 0.62 : 0.86, clearcoat: 0, clearcoatRoughness: 0.5, metalness: 0 };
  switch (finish) {
    case "matte-lam":
      return { ...base, roughness: 0.6, clearcoat: 0.25, clearcoatRoughness: 0.7 };
    case "gloss-lam":
      return { ...base, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 };
    case "spot-uv":
      return { ...base, roughness: 0.85 };
    case "foil":
      return { ...base, roughness: 0.8, metalness: 1 };
    default:
      return base;
  }
}

type Mats = {
  outerFront: THREE.Material[]; // [outer, inner]
  outerSide: THREE.Material[];
  outerPlain: THREE.Material[];
  outerTop: THREE.Material[]; // lid art, laid out for L x W
  edgeU: THREE.Texture;
  edgeV: THREE.Texture;
  edgeMat: (lenMm: number, alongU: boolean) => THREE.MeshStandardMaterial;
  film: THREE.Material | null;
  tape: THREE.Material;
  strap: THREE.Material;
  dispose: () => void;
};

function buildMaterials(p: BoxViewerProps, L: number, W: number, H: number): Mats {
  const rigid = isRigid(p.type);
  const paper = paperFor(p.type, p.grade, p.print);
  const fmm = rigid ? 2 : fluteMm(p.flute);
  const spec: Spec = {
    print: p.print,
    finish: p.finish,
    grade: p.grade,
    paper,
    corrugated: !rigid,
    fluteMm: fmm,
    seed: Math.round(L * 3 + W * 7 + H * 11),
  };
  const specLine = `${Math.round(L)} × ${Math.round(W)} × ${Math.round(H)} MM\n${
    rigid ? "RIGID BOARD" : `${p.flute === "DW" ? "BC DOUBLE WALL" : p.flute === "TW" ? "TRIPLE WALL" : `${p.flute} FLUTE`}`
  } · ${p.grade.replace("kraft-", "").toUpperCase()}`;

  const disposables: { dispose: () => void }[] = [];
  const fp = finishParams(p.finish, rigid);
  const innerPaper: Paper = rigid ? "white" : paper === "kraft-dark" ? "kraft-dark" : "kraft";
  const innerMap = innerTexture(innerPaper, !rigid, spec.seed + 99);
  disposables.push(innerMap);

  const make = (t: FaceTextures, isFront: boolean) => {
    const outer = new THREE.MeshPhysicalMaterial({
      map: t.map,
      roughness: fp.roughness,
      roughnessMap: t.rough ?? null,
      metalness: t.metal ? 1 : 0,
      metalnessMap: t.metal ?? null,
      clearcoat: fp.clearcoat,
      clearcoatRoughness: fp.clearcoatRoughness,
      bumpMap: t.bump ?? null,
      bumpScale: t.bump ? 2.5 : 0,
      alphaMap: t.alpha ?? null,
      alphaTest: t.alpha ? 0.5 : 0,
      side: THREE.FrontSide,
    });
    const inner = new THREE.MeshStandardMaterial({
      map: innerMap,
      roughness: 0.92,
      alphaMap: isFront ? (t.alpha ?? null) : null,
      alphaTest: isFront && t.alpha ? 0.5 : 0,
    });
    disposables.push(outer, inner, t.map);
    if (t.rough) disposables.push(t.rough);
    if (t.metal) disposables.push(t.metal);
    if (t.bump) disposables.push(t.bump);
    if (t.alpha) disposables.push(t.alpha);
    return [outer, inner];
  };

  const outerFront = make(faceTextures(L, H, spec, "front", specLine), true);
  const outerSide = make(faceTextures(W, H, spec, rigid ? "plain" : "side", specLine), false);
  const outerTop = make(faceTextures(L, W, { ...spec, finish: p.finish === "window" ? "matte-lam" : p.finish }, "front", specLine), false);
  const plainTex = faceTextures(L, W, { ...spec, finish: p.finish === "window" ? "matte-lam" : p.finish }, "plain", "");
  const outerPlain = make(plainTex, false);

  const layers = rigid ? 1 : (FLUTE_LAYERS[p.flute] ?? 1);
  const edgeU = fluteTexture(paper, EDGE_WAVES, true, layers, rigid);
  const edgeV = fluteTexture(paper, EDGE_WAVES, false, layers, rigid);
  edgeU.wrapS = edgeU.wrapT = THREE.RepeatWrapping;
  edgeV.wrapS = edgeV.wrapT = THREE.RepeatWrapping;
  disposables.push(edgeU, edgeV);
  const pitch = rigid ? 20 : (FLUTE_PITCH_MM[p.flute] ?? 6);

  const edgeCache = new Map<string, THREE.MeshStandardMaterial>();
  const edgeMat = (lenMm: number, alongU: boolean) => {
    const reps = Math.max(0.2, Math.round((lenMm / (pitch * EDGE_WAVES)) * 10) / 10);
    const key = `${alongU}-${reps.toFixed(1)}`;
    const hit = edgeCache.get(key);
    if (hit) return hit;
    const t = (alongU ? edgeU : edgeV).clone();
    t.needsUpdate = true;
    if (alongU) t.repeat.set(reps, 1);
    else t.repeat.set(1, reps);
    const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 });
    edgeCache.set(key, m);
    disposables.push(m, t);
    return m;
  };

  const film =
    p.finish === "window"
      ? new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.05,
          transmission: 0.92,
          transparent: true,
          opacity: 0.25,
          clearcoat: 1,
          side: THREE.DoubleSide,
        })
      : null;
  if (film) disposables.push(film);
  const tape = new THREE.MeshPhysicalMaterial({
    color: 0xc9a36a,
    roughness: 0.25,
    clearcoat: 0.8,
    transparent: true,
    opacity: 0.88,
  });
  const strap = new THREE.MeshStandardMaterial({ color: 0x1c2430, roughness: 0.55 });
  disposables.push(tape, strap);

  return {
    outerFront,
    outerSide,
    outerPlain,
    outerTop,
    edgeU,
    edgeV,
    edgeMat,
    film,
    tape,
    strap,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

/* --------------------------------------------------------- geometry */

/**
 * A board panel `a` x `b` (mm), thickness t, in its local XY plane.
 * +z face = outside, -z face = inside, the four edges show the flutes.
 */
function slab(a: number, b: number, t: number, faceMats: THREE.Material[], mats: Mats, s: number) {
  const g = new THREE.BoxGeometry(a * s, b * s, t * s);
  const sideV = mats.edgeMat(b, false); // px / nx: thickness x b
  const sideU = mats.edgeMat(a, true); // py / ny: a x thickness
  const mesh = new THREE.Mesh(g, [sideV, sideV, sideU, sideU, faceMats[0], faceMats[1]]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

type Hinge = { group: THREE.Group; closed: number; open: number; axis: "x" };
type Lift = { group: THREE.Group; closedY: number; openY: number; closedRot: number; openRot: number; openZ: number };

type Model = {
  root: THREE.Group;
  hinges: Hinge[];
  lifts: Lift[];
  fades: THREE.Object3D[]; // tape: visible only when closed
};

/** Open tray: bottom + 4 walls, wall heights per side. */
function tray(
  L: number,
  W: number,
  walls: { front: number; back: number; side: number },
  t: number,
  m: Mats,
  s: number,
  frontMats = m.outerFront,
  window = false,
  opts: { bottomMats?: THREE.Material[]; backFacesIn?: boolean; sideMats?: THREE.Material[] } = {}
) {
  const g = new THREE.Group();
  const bottom = slab(L, W, t, opts.bottomMats ?? m.outerPlain, m, s);
  bottom.rotation.x = Math.PI / 2;
  bottom.position.y = (t / 2) * s;
  g.add(bottom);

  const front = slab(L, walls.front, t, frontMats, m, s);
  front.position.set(0, (walls.front / 2) * s, (W / 2 - t / 2) * s);
  g.add(front);
  if (window && m.film) {
    const R = WINDOW_RECT;
    const film = new THREE.Mesh(new THREE.PlaneGeometry(R.w * L * s, R.h * walls.front * s), m.film);
    film.position.set(
      (R.x + R.w / 2 - 0.5) * L * s,
      (R.y + R.h / 2) * walls.front * s,
      (W / 2 - t * 0.9) * s
    );
    g.add(film);
  }

  const back = slab(L, walls.back, t, frontMats, m, s);
  // a display header shows its print to the shopper, i.e. inward
  if (!opts.backFacesIn) back.rotation.y = Math.PI;
  back.position.set(0, (walls.back / 2) * s, -(W / 2 - t / 2) * s);
  g.add(back);

  for (const dir of [-1, 1]) {
    const side = slab(W - 2 * t, walls.side, t, opts.sideMats ?? m.outerSide, m, s);
    side.rotation.y = (dir * Math.PI) / 2;
    side.position.set(dir * (L / 2 - t / 2) * s, (walls.side / 2) * s, 0);
    g.add(side);
  }
  return g;
}

/**
 * A flap hinged on a straight edge. `yaw` turns the frame so the flap's
 * closed direction (local -z) points inward; rotation.x opens it.
 */
function flap(
  pos: THREE.Vector3,
  yaw: number,
  width: number,
  len: number,
  t: number,
  m: Mats,
  s: number,
  mats = m.outerPlain,
  spin = false
) {
  const yawG = new THREE.Group();
  yawG.position.copy(pos);
  yawG.rotation.y = yaw;
  const hinge = new THREE.Group();
  yawG.add(hinge);
  const mesh = slab(width, len, t, mats, m, s);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, (t / 2) * s, (-len / 2) * s);
  // a flap hinged at the back would show its print upside down from the front
  if (spin) mesh.rotateZ(Math.PI);
  hinge.add(mesh);
  return { yawG, hinge };
}

function buildModel(p: BoxViewerProps, L: number, W: number, H: number, m: Mats, s: number): Model {
  const root = new THREE.Group();
  const hinges: Hinge[] = [];
  const lifts: Lift[] = [];
  const fades: THREE.Object3D[] = [];
  const rigid = isRigid(p.type);
  const t = rigid ? 2.2 : Math.max(1, fluteMm(p.flute));
  const win = p.finish === "window";

  const rscTop = () => {
    // minor flaps first (side walls), majors over them
    for (const dir of [-1, 1]) {
      const { yawG, hinge } = flap(
        new THREE.Vector3(dir * (L / 2 - t) * s, H * s, 0),
        (dir * Math.PI) / 2,
        W - 2 * t,
        Math.min(W, L) / 2 - t,
        t,
        m,
        s
      );
      root.add(yawG);
      hinges.push({ group: hinge, closed: 0, open: THREE.MathUtils.degToRad(105), axis: "x" });
    }
    for (const dir of [-1, 1]) {
      const { yawG, hinge } = flap(
        new THREE.Vector3(0, (H + t) * s, dir * (W / 2 - t) * s),
        dir > 0 ? 0 : Math.PI,
        L,
        W / 2 - t * 0.5,
        t,
        m,
        s
      );
      root.add(yawG);
      hinges.push({ group: hinge, closed: 0, open: THREE.MathUtils.degToRad(118), axis: "x" });
    }
    // tape over the seam
    const tw = Math.min(48, W * 0.3);
    const drop = Math.min(H * 0.3, 70);
    const tapeG = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry((L + 1) * s, 0.4 * s, tw * s), m.tape);
    top.position.y = (H + 2 * t + 0.3) * s;
    tapeG.add(top);
    for (const dir of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.4 * s, drop * s, tw * s), m.tape);
      leg.position.set(dir * (L / 2 + 0.3) * s, (H + 2 * t - drop / 2) * s, 0);
      tapeG.add(leg);
    }
    root.add(tapeG);
    fades.push(tapeG);
  };

  switch (p.type) {
    case "die-cut-mailer": {
      root.add(tray(L, W, { front: H, back: H, side: H }, t, m, s, m.outerFront, win));
      // lid hinged on the back edge, printed side up
      const { yawG, hinge } = flap(
        new THREE.Vector3(0, H * s, -(W / 2) * s),
        Math.PI,
        L,
        W - 1.5 * t,
        t,
        m,
        s,
        m.outerTop,
        true
      );
      // tuck flap at the lid's front edge, folds down inside the front wall
      const tuckYaw = new THREE.Group();
      tuckYaw.position.set(0, 0, -(W - 1.5 * t) * s);
      const tuck = new THREE.Group();
      tuckYaw.add(tuck);
      const tm = slab(L - 2 * t, H * 0.4, t, m.outerPlain, m, s);
      tm.rotation.x = -Math.PI / 2;
      tm.position.set(0, (t / 2) * s, -(H * 0.2) * s);
      tuck.add(tm);
      hinge.add(tuckYaw);
      root.add(yawG);
      hinges.push({ group: hinge, closed: 0, open: THREE.MathUtils.degToRad(112), axis: "x" });
      hinges.push({ group: tuck, closed: THREE.MathUtils.degToRad(-88), open: THREE.MathUtils.degToRad(-25), axis: "x" });
      break;
    }
    case "telescopic":
    case "rigid-gift": {
      const lidH = rigid ? H * 0.32 : H * 0.45;
      root.add(
        tray(L, W, { front: H, back: H, side: H }, t, m, s, rigid ? m.outerPlain : m.outerSide, false, {
          sideMats: rigid ? m.outerPlain : m.outerSide,
        })
      );
      const gap = t * 2 + 1;
      const lid = tray(L + gap, W + gap, { front: lidH, back: lidH, side: lidH }, t, m, s, m.outerPlain, false, {
        bottomMats: m.outerTop,
        sideMats: m.outerPlain,
      });
      const lidG = new THREE.Group();
      lid.rotation.x = Math.PI;
      lidG.add(lid);
      root.add(lidG);
      // front of the lid tray is now on the back after the flip: turn it round
      lid.rotation.y = Math.PI;
      const closedY = (H + t) * s;
      lifts.push({
        group: lidG,
        closedY,
        openY: closedY + H * 0.75 * s,
        closedRot: 0,
        openRot: THREE.MathUtils.degToRad(-14),
        openZ: -W * 0.18 * s,
      });
      break;
    }
    case "display-tray": {
      root.add(
        tray(L, W, { front: H * 0.42, back: H * 1.9, side: H }, t, m, s, m.outerFront, false, {
          backFacesIn: true,
        })
      );
      break;
    }
    case "heavy-duty-crate": {
      root.add(tray(L, W, { front: H, back: H, side: H }, t, m, s, m.outerFront, win));
      rscTop();
      // two polyester straps round the crate
      for (const dx of [-0.28, 0.28]) {
        const band = new THREE.Group();
        const bw = 16 * s;
        const pad = (t * 2 + 1.5) * s;
        const top = new THREE.Mesh(new THREE.BoxGeometry(bw, 1 * s, W * s + pad), m.strap);
        top.position.y = (H + 2 * t + 1.2) * s;
        const bot = top.clone();
        bot.position.y = -0.5 * s;
        const f = new THREE.Mesh(new THREE.BoxGeometry(bw, (H + 2 * t + 2) * s, 1 * s), m.strap);
        f.position.set(0, ((H + 2 * t) / 2) * s, (W / 2 + 0.6) * s + pad / 4);
        const b = f.clone();
        b.position.z = -f.position.z;
        band.add(top, bot, f, b);
        band.position.x = dx * L * s;
        band.traverse((o) => ((o as THREE.Mesh).castShadow = true));
        root.add(band);
      }
      break;
    }
    default: {
      // rsc, food carton, wardrobe: regular slotted container
      root.add(tray(L, W, { front: H, back: H, side: H }, t, m, s, m.outerFront, win));
      rscTop();
    }
  }
  return { root, hinges, lifts, fades };
}

function disposeGeometry(o: THREE.Object3D) {
  o.traverse((c) => {
    const mesh = c as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
  });
}

/* ------------------------------------------------------------ viewer */

export default function BoxViewer(props: BoxViewerProps) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{
    update: (p: BoxViewerProps) => void;
    setOpen: (o: boolean) => void;
    reset: () => void;
  } | null>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.55;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
    camera.position.set(2.15, 1.45, 2.6);

    const key = new THREE.DirectionalLight(0xfff1dc, 2.4);
    key.position.set(2.5, 4.2, 2.2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 12;
    const sc = key.shadow.camera as THREE.OrthographicCamera;
    sc.left = sc.bottom = -2;
    sc.right = sc.top = 2;
    key.shadow.radius = 6;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.01;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xbcd6ff, 0.7);
    rim.position.set(-3, 2, -2.5);
    scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xfaf3e8, 0x2a2622, 0.35));

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ opacity: 0.42 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.8;
    controls.maxDistance = 7;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 0.45, 0);
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 0.6;
    const stopAuto = () => (controls.autoRotate = false);
    controls.addEventListener("start", stopAuto);

    /* ---------------- model state ---------------- */
    let props0 = props;
    let mats: Mats | null = null;
    let model: Model | null = null;
    const cur = { L: props.l, W: props.w, H: props.h };
    const tgt = { L: props.l, W: props.w, H: props.h };
    let openCur = 0;
    let openTgt = 0;
    let built = { L: 0, W: 0, H: 0 };
    let matKey = "";
    let matDims = { L: 0, W: 0, H: 0 };
    let settleTimer = 0;
    const UNIT = 1.25; // largest dimension, in scene units

    const scaleFor = (L: number, W: number, H: number) => UNIT / Math.max(L, W, H * (props0.type === "display-tray" ? 1.9 : 1));

    const rebuild = (forceMats = false) => {
      const key = `${props0.type}|${props0.flute}|${props0.grade}|${props0.print}|${props0.finish}`;
      if (!mats || forceMats || key !== matKey) {
        mats?.dispose();
        mats = buildMaterials(props0, cur.L, cur.W, cur.H);
        matKey = key;
        matDims = { ...cur };
      }
      if (model) {
        scene.remove(model.root);
        disposeGeometry(model.root);
      }
      const s = scaleFor(cur.L, cur.W, cur.H);
      model = buildModel(props0, cur.L, cur.W, cur.H, mats, s);
      scene.add(model.root);
      built = { ...cur };
      applyOpen();
    };

    const applyOpen = () => {
      if (!model) return;
      const e = openCur * openCur * (3 - 2 * openCur);
      for (const hg of model.hinges) hg.group.rotation.x = THREE.MathUtils.lerp(hg.closed, hg.open, e);
      for (const lf of model.lifts) {
        lf.group.position.y = THREE.MathUtils.lerp(lf.closedY, lf.openY, e);
        lf.group.position.z = THREE.MathUtils.lerp(0, lf.openZ, e);
        lf.group.rotation.x = THREE.MathUtils.lerp(lf.closedRot, lf.openRot, e);
      }
      for (const f of model.fades) f.visible = openCur < 0.08;
    };

    const fit = () => {
      const r = el.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = r.width / Math.max(1, r.height);
      camera.updateProjectionMatrix();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    rebuild(true);
    setReady(true);

    api.current = {
      update: (p) => {
        const typeChanged = p.type !== props0.type;
        props0 = p;
        tgt.L = p.l;
        tgt.W = p.w;
        tgt.H = p.h;
        if (typeChanged) {
          openTgt = 0;
          openCur = Math.min(openCur, 0);
        }
        rebuild(false);
      },
      setOpen: (o) => (openTgt = o ? 1 : 0),
      reset: () => {
        camera.position.set(2.15, 1.45, 2.6);
        controls.target.set(0, 0.45, 0);
        controls.autoRotate = !reduced;
      },
    };

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(64, now - last);
      last = now;
      const k = reduced ? 1 : 1 - Math.pow(1 - 0.14, dt / 16.667);

      // dimensions glide to their new values
      let moving = false;
      for (const d of ["L", "W", "H"] as const) {
        const diff = tgt[d] - cur[d];
        if (Math.abs(diff) > 0.25) {
          cur[d] += diff * k;
          moving = true;
        } else cur[d] = tgt[d];
      }
      if (moving || cur.L !== built.L || cur.W !== built.W || cur.H !== built.H) {
        rebuild(false);
        clearTimeout(settleTimer);
        // print is laid out for the final face proportions once motion settles
        settleTimer = window.setTimeout(() => {
          if (cur.L !== matDims.L || cur.W !== matDims.W || cur.H !== matDims.H) rebuild(true);
        }, 160);
      }

      const od = openTgt - openCur;
      if (Math.abs(od) > 0.001) {
        openCur += od * (reduced ? 1 : 1 - Math.pow(1 - 0.09, dt / 16.667));
        applyOpen();
      }

      // keep the camera aimed at the middle of the box
      const s = scaleFor(cur.L, cur.W, cur.H);
      const ty = (cur.H * s) / 2;
      controls.target.y += (ty - controls.target.y) * 0.1;

      controls.update();
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settleTimer);
      ro.disconnect();
      controls.dispose();
      if (model) disposeGeometry(model.root);
      mats?.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
    };
    // mount once; prop changes go through api.update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.current?.update(props);
    setOpen(false);
  }, [props.type, props.l, props.w, props.h, props.flute, props.grade, props.print, props.finish]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    api.current?.setOpen(open);
  }, [open]);

  const canOpen = props.type !== "display-tray";

  return (
    <div className="bv" role="img" aria-label={props.label}>
      <div ref={host} className="bv__canvas" />
      {!ready && <div className="bv__loading">Loading 3D preview…</div>}
      <div className="bv__controls">
        {canOpen && (
          <button type="button" className="bv__btn" onClick={() => setOpen((o) => !o)} aria-pressed={open}>
            {open ? "Close box" : props.type === "telescopic" || props.type === "rigid-gift" ? "Lift lid" : "Open flaps"}
          </button>
        )}
        <button type="button" className="bv__btn" onClick={() => api.current?.reset()}>
          Reset view
        </button>
      </div>
      <p className="bv__hint">Drag to rotate · scroll to zoom</p>
    </div>
  );
}
