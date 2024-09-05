<template>
  <div
    class="navigation-container"
    :class="{ 'action-nav': navigationRef }"
    @click="handelMore"
  >
    <img src="../assets/more.svg" />
  </div>
</template>
<script lang="ts" setup>
import { inject, Ref } from "vue";
const navigationRef = inject("navigationRef") as Ref<boolean>;
const handelMore = () => {
  navigationRef.value = !navigationRef.value as boolean;
};
</script>

<style scoped>
.navigation-container {
  padding: 5px 10px;
  transition: all 300ms;
  background-color: transparent;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.pdf-tool-container .navigation-container > img {
  width: 18px;
  height: 18px;
}
/* .navigation-container:hover {
  background-color: rgba(0, 0, 0, 0.06);
} */
.action-nav {
  background-color: rgba(0, 0, 0, 0.06);
}
</style>
