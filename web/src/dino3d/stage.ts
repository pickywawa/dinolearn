import * as THREE from 'three';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Un petit studio 3D hors écran : caméra, lumières douces « jouet », contour
 * léger. On y pose un modèle et on récupère l'image dans un canvas, que
 * Phaser affiche comme n'importe quelle texture.
 */
export class Stage {
  readonly canvas: HTMLCanvasElement;
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  private outline: OutlineEffect;
  /** Hauteur de monde visible (le dino mesure ~2 unités). */
  readonly viewHeight: number;

  constructor(width: number, height: number, viewHeight = 3.1, canvas?: HTMLCanvasElement) {
    this.canvas = canvas ?? document.createElement('canvas');
    this.viewHeight = viewHeight;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, alpha: true, antialias: true, premultipliedAlpha: false, preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(width, height, false);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    // Caméra assez lointaine (peu de déformation), qui cadre le dino de face, un peu en plongée.
    const fov = 22;
    this.camera = new THREE.PerspectiveCamera(fov, width / height, 1, 40);
    const dist = viewHeight / 2 / Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const centerY = viewHeight / 2 - 0.12;
    this.camera.position.set(0, centerY + dist * 0.12, dist);
    this.camera.lookAt(0, centerY, 0);
    this.camera.updateMatrixWorld();

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.55;
    pmrem.dispose();

    this.scene.add(new THREE.HemisphereLight(0xeaf6ff, 0xb39a7a, 1.4));
    const key = new THREE.DirectionalLight(0xfff4e0, 2.4);
    key.position.set(-2.5, 4, 5);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xdff2ff, 1.8);
    rim.position.set(3, 3, -4);
    this.scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffe8f0, 0.6);
    fill.position.set(3, 1, 3);
    this.scene.add(fill);

    this.outline = new OutlineEffect(this.renderer, { defaultThickness: 0.004, defaultColor: [0.15, 0.15, 0.25] });
  }

  /** Projette un point 3D (monde) en pixels du canvas. */
  project(v: THREE.Vector3) {
    const p = v.clone().project(this.camera);
    return { x: (p.x + 1) / 2 * this.canvas.width, y: (1 - p.y) / 2 * this.canvas.height };
  }

  render() {
    this.outline.render(this.scene, this.camera);
  }

  dispose() {
    this.scene.environment?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
