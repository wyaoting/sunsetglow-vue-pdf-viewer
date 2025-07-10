<template>
  <div class="menu-container" :style="{ '--menu-color': selectedColor }">
    <div class="menu-header">
      <h3 class="menu-title">Settings</h3>
      <button class="menu-close" @click="emit('close')">×</button>
    </div>

    <div class="menu-section">
      <h4 class="menu-section-title">Color Theme</h4>
      <div class="color-options">
        <button
          v-for="color in colors"
          :key="color"
          class="color-option"
          :class="{ 'color-option-active': selectedColor === color }"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
        ></button>
      </div>
    </div>

    <div class="menu-section">
      <h4 class="menu-section-title">Danger Zone</h4>
      <button class="delete-button" @click="confirmDelete">Delete Item</button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";

const props = defineProps({
  initialColor: {
    type: String,
    default: "#3b82f6", // 默认蓝色
  },
});

const emit = defineEmits(["color-change", "delete", "close"]);

const colors = ref([
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // yellow
  "#8b5cf6", // purple
]);

const selectedColor = ref(props.initialColor);

const selectColor = (color) => {
  selectedColor.value = color;
  emit("color-change", color);
};

const confirmDelete = () => {
  if (confirm("Are you sure you want to delete this item?")) {
    emit("delete");
  }
};
</script>

<style scoped>
/* 样式保持不变，同之前版本 */
.menu-container {
  --menu-color: #3b82f6;
  width: 240px;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1rem;
  font-family: "Inter", sans-serif;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.menu-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.menu-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
}

.menu-close:hover {
  color: #111827;
}

.menu-section {
  margin-bottom: 1.5rem;
}

.menu-section-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
}

.color-options {
  display: flex;
  gap: 0.5rem;
}

.color-option {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option-active {
  border-color: var(--menu-color);
}

.delete-button {
  width: 100%;
  padding: 0.5rem;
  background-color: #fee2e2;
  color: #b91c1c;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-button:hover {
  background-color: #fecaca;
}
</style>
