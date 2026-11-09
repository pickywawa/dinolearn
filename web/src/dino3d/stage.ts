import * as THREE from 'three';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Un petit studio 3D hors écran : caméra, lumières douces « jouet », contour
 * léger. On y pose un modèle et on récupère l'image dans un canvas, que
 * Phaser affiche comme n'importe quelle texture.
 */
export class Stage {
  private static idle?: Stage;
  private retiredMaterials = new Set<THREE.Material>();

  static acquire(width: number, height: number, viewHeight: number): Stage {
    const stage = Stage.idle;
    Stage.idle = undefined;
    if (!stage) return new Stage(width, height, viewHeight);
    stage.renderer.setSize(width, height, false);
    stage.viewHeight = viewHeight;
    stage.camera.aspect = width / height;
    const distance = viewHeight / 2 / Math.tan(THREE.MathUtils.degToRad(22 / 2));
    const center = viewHeight / 2 - .12;
    stage.camera.position.set(0, center + distance * .12, distance);
    stage.camera.lookAt(0, center, 0);
    stage.camera.updateProjectionMatrix();
    stage.camera.updateMatrixWorld();
    return stage;
  }

  /** Retain one rendering context, lights and environment across scene transitions. */
  release() {
    for (const child of [...this.scene.children]) {
      if (!(child instanceof THREE.Light)) {
        child.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => this.retiredMaterials.add(material));
          }
        });
        this.scene.remove(child);
      }
    }
    this.renderer.renderLists.dispose();
    if (Stage.idle) this.dispose();
    else Stage.idle = this;
  }

  readonly canvas: HTMLCanvasElement;
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  private outline: OutlineEffect;
  /** Hauteur de monde visible (le dino mesure ~2 unités). */
  viewHeight: number;

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
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
    this.scene.environmentIntensity = 0.35;
    pmrem.dispose();

    this.scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x8a7a6a, 0.95));
    const key = new THREE.DirectionalLight(0xfff4e0, 3.0);
    key.position.set(-2.5, 4, 5);
    // Ombres douces : le dino sur lui-même (sous la tête, les bras) et au sol.
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -1.8, right: 1.8, top: 2.6, bottom: -0.6, near: 1, far: 14 });
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.025;
    key.shadow.radius = 4;
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
    // Release old materials after the replacement has acquired matching shader programs.
    this.retiredMaterials.forEach((material) => material.dispose());
    this.retiredMaterials.clear();
  }

  dispose() {
    this.retiredMaterials.forEach((material) => material.dispose());
    this.retiredMaterials.clear();
    this.scene.environment?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
