<template>
  <div class="navigation-container">
    <img src="../assets/more.svg" @click="handelMore" alt="" />
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
/* .navigation-container {
} */
.navigation-container img {
  width: 24px;
}
</style>
