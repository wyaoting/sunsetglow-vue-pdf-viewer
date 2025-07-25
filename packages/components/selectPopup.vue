<template>
  <div class="selection-container">
    <div
      v-show="popupVisible"
      v-if="configOption?.selectConfig?.length"
      class="selection-popup"
      :style="{ left: popupPosition.x + 'px', top: popupPosition.y + 'px' }"
    >
      <button
        v-if="configOption?.selectConfig"
        :style="item?.style"
        class="btn"
        v-for="item in configOption?.selectConfig"
        @click.stop.prevent="() => item.onClick(selectedText, handleCopy)"
      >
        <component
          class="icon-component"
          @click.stop
          :is="item.icon"
          v-if="item?.icon"
        />
        {{ item.text }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePdfConfigState } from "../config";
import { t } from "../Lang";
import { message } from "ant-design-vue";
import { ref, onMounted, onBeforeUnmount } from "vue";
const { configOption } = usePdfConfigState();

// 新增 props 接收外部传入的元素
const props = defineProps<{
  target: HTMLElement;
}>();

const popupVisible = ref(false);
const popupPosition = ref({ x: 0, y: 0 });
const selectedText = ref("");

const handleSelection = (event: Event) => {
  const target = event.target as HTMLElement;
  if (target.closest(".selection-popup")) return;
  //@ts-ignore
  // if (event?.target?.classList?.contains("btn")) return;
  const selection = window.getSelection();
  const text = selection?.toString()?.trim();

  // 判断选中的文本是否在目标元素内
  if (
    text &&
    selection?.anchorNode &&
    props.target?.contains(selection?.anchorNode)
  ) {
    const range = selection?.getRangeAt(0);
    const rect = range?.getBoundingClientRect() as any;

    selectedText.value = text;
    popupPosition.value = {
      x: rect?.left + rect?.width / 2,
      y: rect?.top - 10,
    };
    popupVisible.value = true;
  }
};
const hidePopup = (event: Event) => {
  //@ts-ignore
  if (event?.target?.classList?.contains("btn")) return;

  popupVisible.value = false;
};
function fallbackCopyText(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed"; // 防止滚动
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const successful = document.execCommand("copy");
    message.success(t("copySuccess", configOption?.value?.lang || "en"));
    if (!successful) throw new Error("复制失败");
  } catch (err) {
    console.error("无法复制文本:", err);
  } finally {
    document.body.removeChild(textarea);
  }
}
const handleCopy = async (text: string) => {
  popupVisible.value = false;
  try {
    await navigator.clipboard.writeText(text);
    message.success(t("copySuccess", configOption?.value?.lang || "en"));
  } catch (err) {
    console.error("avigator.clipboard zai", err);
    // 降级方案
    fallbackCopyText(text);
  }
};

onMounted(() => {
  if (!configOption?.value?.selectConfig?.length) return;
  document.addEventListener("mouseup", handleSelection);
  document.addEventListener("mousedown", hidePopup);
});

onBeforeUnmount(() => {
  if (!configOption?.value?.selectConfig?.length) return;
  document.removeEventListener("mouseup", handleSelection);
  document.removeEventListener("mousedown", hidePopup);
});
</script>
<style scoped>
.selection-container {
  position: relative;
}

.content-wrapper {
  width: 100%;
  height: 100%;
}

.selection-popup {
  position: fixed;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 4px 10px;
  z-index: 9999;
}
.icon-component {
  pointer-events: none;
  display: inline-flex;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  color: rgb(30, 29, 29);
  border: none;
  margin: 0px 4px;
  padding: 2px 10px;
  border-radius: 3px;
  cursor: pointer;
}

.btn:hover {
  background: #f4f4f5;
}
</style>
