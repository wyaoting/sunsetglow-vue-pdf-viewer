<template>
  <div class="navigation-container">
    <img src="../assets/more.svg" @click="handelMore" alt="" />
  </div>
</template>
<script lang="ts" setup>
import { inject } from "vue";
const navigationRef = inject("navigationRef");
const handelMore = () => {
  navigationRef.value = !navigationRef.value;
};
</script>

<style scoped>
/* .navigation-container {
} */
.navigation-container img {
  width: 24px;
}
</style>
