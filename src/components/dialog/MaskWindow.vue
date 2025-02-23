<template>
  <Teleport v-if="visible" :to="toElem">
    <div
      class="mask-root-window"
      :style="rootStyle"
    >
      <transition name="fade" mode="out-in" appear>
        <div class="mask-window-wrapper">
          <slot v-if="showToolbar" name="toolbar">
            <div style="box-sizing: border-box; padding: 6px;  background-color: var(--toolbar-bg-color);">
              <el-button @click="emits('cancel')" v-text="cancelText" ></el-button>
              <el-button @click="emits('confirm')" type="primary" plain v-text="confirmText"></el-button>
            </div>
          </slot>
          <slot></slot>
        </div>
      </transition>


      <div
        title="关闭蒙版"
        class="close-mask"
        :style="{ 'z-index': zIndex + 1 }"
        @click.stop="visible = false"
      >
        <s-v-g-icon class="close-icon" name="close"></s-v-g-icon>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { mainHeightKey, mainWidthKey, maskContainerKey } from "@/config/app.keys";
import { computed, inject, RendererElement } from "vue";
import { incMaskZIndex } from "./mask";
import SVGIcon from "@/components/common/SVGIcon.vue";
import { ElButton } from 'element-plus'

interface Props {
  modelValue: boolean
  teleportTo?: string | RendererElement | null | undefined
  showToolbar?: boolean
  confirmText?: string
  confirmButtonProps?: Record<string, any>
  cancelText?: string
  cancelButtonProps?: Record<string, any>
}

interface Emits {
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  showToolbar: false,
  confirmText: '确定',
  cancelText: '取消',
  confirmButtonProps: null,
  cancelButtonProps: null,
})
const emits = defineEmits<Emits>()

const maskContainer = inject(maskContainerKey)
const mainWidth = inject(mainWidthKey)
const mainHeight = inject(mainHeightKey)
const zIndex = incMaskZIndex()

const rootStyle = computed(() => {
  const width = mainWidth.value
  const height = mainHeight.value
  if (!props.teleportTo) {
    return {
      width,
      height,
      'z-index': zIndex,
    }
  }
  return {
    width: '100%',
    height: '100%',
    'z-index': zIndex,
  }
})

const toElem = computed(() => {
  const defaultContainer = maskContainer.value
  const inputContainer = props.teleportTo
  if (!props.teleportTo) {
    return defaultContainer
  }
  return inputContainer
})

const visible = computed({
  get: () => props.modelValue,
  set: v => {
    emits('update:modelValue', v)
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.mask-root-window {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.mask-window-wrapper {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: var(--el-main-padding);
  background-color: var(--el-bg-color);
}

.close-mask {
  position: absolute;
  left: -1px;
  top: 0;
  width: 30px;
  height: 30px;
  border-bottom-right-radius: 100%;
  background-color: #FFFFFF;
  cursor: pointer;
  border: 1px solid var(--el-border-color);
}

.close-mask:hover, .close-mask:hover .close-icon {
  background-color: #ecf5ff;
}

.close-icon {
  position: absolute;
  top: 4px;
  right: 10px;
  width: 16px;
  height: 16px;
}

</style>