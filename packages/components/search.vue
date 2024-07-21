<template>
  <div class="search-box">
    <a-popover placement="bottomRight">
      <template #content>
        <div style="padding: 8px">
          <a-input-search
            v-model:value="searchText"
            placeholder="input search text"
            @search="onSearch"
          />
        </div>
      </template>
      <SearchOutlined />
    </a-popover>
    <!-- <a-Tooltip
      placement="bottom"
      trigger="click"
      v-model:open="open"
      color="#fff"
    >
      <template #title>
        <div style="padding: 8px">
          <a-input-search
            v-model:value="searchText"
            placeholder="input search text"
            @search="onSearch"
          />
        </div>
      </template>
      <img
        class="search"
        @click="handelOpen"
        src="../assets/search.svg"
        alt=""
      />
    </a-Tooltip> -->
  </div>
</template>
<script lang="ts" setup>
import "ant-design-vue/lib/Tooltip/style";
import "ant-design-vue/lib/Input/style";
import "ant-design-vue/lib/Button/style";
import { SearchOutlined } from "@ant-design/icons-vue";
import { Tooltip as ATooltip, Popover as APopover } from "ant-design-vue";
import { InputSearch as AInputSearch } from "ant-design-vue";
import { ref, inject, Ref } from "vue";
const searchText = ref<string>("");
const searchValue = inject("searchValue") as Ref;
const open = ref<boolean>(false);

const onSearch = () => {
  searchValue.value = searchText.value;
};
const handelOpen = () => {
  open.value = true;
};
</script>

<style scoped>
.search-box {
  font-size: 20px;
}
</style>
