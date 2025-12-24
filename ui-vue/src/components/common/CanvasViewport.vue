<template>
  <div
    ref="viewportEl"
    class="canvas-viewport"
    :class="{ panning: isPanning }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @wheel.passive="onWheel"
  >
    <!-- separate background layer so panning feels like a real canvas -->
    <div class="canvas-background" />

    <div class="canvas-stage" :style="stageStyle">
      <slot />
    </div>

    <div v-if="showHud" class="canvas-hud">
      <span>缩放: {{ Math.round(scale * 100) }}%</span>
      <button type="button" class="hud-btn" @click.stop="reset">重置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

type Props = {
  /** initial scale */
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  /** when true, show a small HUD (scale + reset) */
  showHud?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  initialScale: 1,
  minScale: 0.5,
  maxScale: 2,
  showHud: true,
});

const viewportEl = ref<HTMLDivElement | null>(null);

const scale = ref(props.initialScale);
const offsetX = ref(0);
const offsetY = ref(0);

const isPanning = ref(false);
const last = ref<{ x: number; y: number } | null>(null);

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const stageStyle = computed(() => {
  return {
    transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`,
  } as Record<string, string>;
});

/**
 * Contract:
 * - Pan: hold Space + drag OR middle mouse drag OR right mouse drag.
 * - Zoom: Ctrl/Meta + wheel (or trackpad pinch -> many browsers emit ctrlKey+wheel).
 *
 * We intentionally don't pan on a normal left click so inner inputs/selects remain usable.
 */
const shouldStartPan = (e: PointerEvent) => {
  // middle button
  if (e.button === 1) return true;
  // right button
  if (e.button === 2) return true;
  // space + left
  if (e.button === 0 && spacePressed.value) return true;
  return false;
};

const onPointerDown = (e: PointerEvent) => {
  if (!shouldStartPan(e)) return;

  // prevent context menu style interactions + text selection
  e.preventDefault();

  isPanning.value = true;
  last.value = { x: e.clientX, y: e.clientY };
  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
};

const onPointerMove = (e: PointerEvent) => {
  if (!isPanning.value || !last.value) return;
  e.preventDefault();

  const dx = e.clientX - last.value.x;
  const dy = e.clientY - last.value.y;
  last.value = { x: e.clientX, y: e.clientY };

  offsetX.value += dx;
  offsetY.value += dy;
};

const onPointerUp = (e: PointerEvent) => {
  if (!isPanning.value) return;
  e.preventDefault();

  isPanning.value = false;
  last.value = null;
  (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
};

const onWheel = (e: WheelEvent) => {
  // Zoom requires ctrl/meta so normal scroll can still scroll the page.
  if (!(e.ctrlKey || e.metaKey)) return;

  // We must prevent default zoom/scroll behavior.
  e.preventDefault();

  const dir = e.deltaY > 0 ? -1 : 1;
  const next = clamp(scale.value + dir * 0.08, props.minScale, props.maxScale);

  // Zoom around cursor
  const el = viewportEl.value;
  if (!el) {
    scale.value = next;
    return;
  }

  const rect = el.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;

  // Convert cursor point into stage coordinate before zoom
  const sx = (cx - offsetX.value) / scale.value;
  const sy = (cy - offsetY.value) / scale.value;

  scale.value = next;

  // Keep cursor anchored
  offsetX.value = cx - sx * scale.value;
  offsetY.value = cy - sy * scale.value;
};

const reset = () => {
  scale.value = props.initialScale;
  offsetX.value = 0;
  offsetY.value = 0;
};

const spacePressed = ref(false);
const onKeyDown = (e: KeyboardEvent) => {
  if (e.code === 'Space') spacePressed.value = true;
};
const onKeyUp = (e: KeyboardEvent) => {
  if (e.code === 'Space') spacePressed.value = false;
};

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
});
</script>

<style scoped>
.canvas-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  user-select: none;
}

.canvas-background {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(17, 24, 39, 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(17, 24, 39, 0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}

.canvas-stage {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  /* keep stage above background */
  z-index: 1;
  /* allow form controls */
  pointer-events: auto;
}

.canvas-viewport.panning {
  cursor: grab;
}

.canvas-hud {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(17, 24, 39, 0.65);
  color: #fff;
  border-radius: 999px;
  font-size: 12px;
  z-index: 2;
}

.hud-btn {
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: transparent;
  color: #fff;
  padding: 2px 8px;
  border-radius: 999px;
  cursor: pointer;
}

.hud-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}
</style>
