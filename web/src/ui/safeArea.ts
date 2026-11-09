import type Phaser from 'phaser';

/** Insets protect controls only. The scene and its backdrop still fill the viewport. */
export function safeArea(scene: Phaser.Scene) {
  const style = getComputedStyle(document.documentElement);
  const bounds = scene.game.canvas.getBoundingClientRect();
  const horizontal = scene.scale.width / Math.max(1, bounds.width);
  const vertical = scene.scale.height / Math.max(1, bounds.height);
  return {
    left: (parseFloat(style.getPropertyValue('--safe-left')) || 0) * horizontal,
    right: (parseFloat(style.getPropertyValue('--safe-right')) || 0) * horizontal,
    top: (parseFloat(style.getPropertyValue('--safe-top')) || 0) * vertical,
  };
}
