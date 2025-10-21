<template>
  <div
    class="search-box"
    :class="{ 'action-search': open }"
    v-show="configOption.searchToolVisible"
  >
    <SearchOutlined @click.stop="handleOpen" />
    <div style="padding: 8px" class="popover-container" v-show="open">
      <a-input-group
        v-if="configOption.isScopeSearch"
        compact
        style="
          width: 400px;
          flex-shrink: 0;
          display: grid;
          grid-template-columns: 0px auto 1fr auto 1fr;
          align-items: center;
          margin-bottom: 8px;
        "
      >
        <span style="white-space: nowrap; font-size: 14px; padding-right: 6px">
          {{ t("searchScope", configOption?.lang || "en") }}
        </span>
        <a-input
          @input="(v:InputEvent ) => onInput('min', v)"
          type="number"
          class="site-input-right"
          v-model:value="startIndex"
          min="1"
          :max="pdfExamplePages"
          style="text-align: center; border-radius: 6px 0px 0px 6px"
          :placeholder="t('startPage', configOption?.lang || 'en')"
        />
        <a-input
          class="site-input-split"
          style="width: 30px; border-left: 0; pointer-events: none"
          placeholder="~"
          disabled
        />
        <a-input
          @change="(v:InputEvent ) => onInput('max', v)"
          type="number"
          min="1"
          :max="pdfExamplePages"
          v-model:value="endIndex"
          class="site-input-right"
          style="text-align: center"
          :placeholder="t('endPage', configOption?.lang || 'en')"
        />
      </a-input-group>
      <div style="display: flex; align-items: center">
        <div class="popover-input-search" style="width: fit-content">
          <a-input-search
            style="width: 200px"
            :loading="loading"
            :placeholder="t('searchEnter', configOption?.lang || 'en')"
            v-model:value="searchText"
            @pressEnter="onSearch"
            @search="onSearch"
          />

          <div class="popover-total">
            {{ searchTotal ? searchIndex : 0 }} /
            {{ searchTotal }}
          </div>
        </div>
        <span class="side"> </span>
        <span class="popover-icon" @click.stop="handleSearchAction('superior')">
          <UpOutlined />
        </span>
        <span class="popover-icon" @click.stop="handleSearchAction('Down')">
          <DownOutlined />
        </span>
        <span class="popover-icon" @click.stop="handleClose">
          <CloseOutlined />
        </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import "ant-design-vue/lib/Input/style";
import "ant-design-vue/lib/Button/style";
import { t } from "../Lang";
import {
  SearchOutlined,
  CloseOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons-vue";
import {
  InputSearch as AInputSearch,
  InputGroup as AInputGroup,
  Input as AInput,
} from "ant-design-vue";
import { ref, computed, inject, Ref, onMounted, onUnmounted } from "vue";
import { usePdfConfigState } from "../config";
import {
  pdfRenderClass,
  handlePdfLocateView,
  removeNodesButKeepText,
} from "../utils/index";
const props = defineProps<{
  pdfContainer: any; //
  pdfJsViewer: any;
}>();
const { configOption } = usePdfConfigState();

const searchTotal = computed({
  set(v: number) {
    if (!!configOption.value?.searchOption)
      configOption.value.searchOption.searchTotal = v;
  },
  get() {
    return configOption.value.searchOption?.searchTotal || 0;
  },
});
const searchIndex = computed({
  set(v: number) {
    if (configOption.value?.searchOption)
      configOption.value.searchOption.searchIndex = v;
  },
  get() {
    return configOption.value.searchOption?.searchIndex || 0;
  },
});
const searchTotalData = ref<
  {
    textTotal: number;
    currentIndex: number;
    searchTotal: number;
    beforeTotal: number;
  }[]
>([]);
const pdfExamplePages = inject("pdfExamplePages") as any;
const startIndex = ref<number | undefined>(undefined);
const endIndex = ref<number | undefined>(undefined);
const isSearchNext = ref(true);
const searchDomList = ref();
const searchText = ref<string>("");
const searchValue = inject("searchValue") as Ref;
const open = ref<boolean>(false);
// const searchIndex = ref(0);
const loading = ref(false);
// search 当前page 的信息
const targetSearchPageItem = inject("targetSearchPageItem") as any;
const handleOpen = () => {
  open.value = true;
};
const handleClose = () => {
  open.value = false;
};

// 搜索符合条件总数
const handleSearchTotal = (
  list: { container: HTMLElement; pdfCanvas: any }[]
) => {
  searchTotalData.value = [];
  searchTotal.value = 0;
  let total = list.length;
  for (let i = 0; i < total; i++) {
    if (!list[i]) return;
    const { container, pdfCanvas } = list[i];
    // 计算总数不渲染
    const { textTotal } = pdfCanvas.handleSearch(
      container,
      searchText.value,
      false
    );
    if (textTotal) {
      searchTotal.value += textTotal;
      searchTotalData.value?.push({
        textTotal,
        searchTotal: searchTotal.value,
        beforeTotal: searchTotal.value - textTotal,
        currentIndex: pdfCanvas.page._pageIndex + 1,
      });
    }
  }
  if (isSearchNext.value) {
    handleSearchAction("Down");
  } else {
    isSearchNext.value = true;
  }
  loading.value = false;
};
const onTextSearch = async () => {
  loading.value = true;
  if (searchDomList.value?.length && !configOption.value.isScopeSearch) {
    return handleSearchTotal(searchDomList.value);
  }
  let searchList = [] as any;
  const parentContainer = document.querySelectorAll(
    "#search-sunsetglow-pdf-container"
  )[configOption.value?.appIndex as number] as HTMLElement;
  parentContainer.innerHTML = "";
  const { TextLayerBuilder } = props.pdfJsViewer;
  const num = pdfExamplePages.value + 1;
  let total = endIndex.value || num;
  let start = startIndex.value || 1;
  for (let i = start; i < total; i++) {
    searchList.push(
      new Promise(async (resolve) => {
        const divDom = document.createElement("div");
        const canvas = document.createElement("canvas");
        parentContainer.appendChild(divDom);
        props.pdfContainer.getPage(i).then(async (page: never) => {
          const pdfCanvas = new pdfRenderClass(canvas, page, 0.05);
          const { container } = await pdfCanvas.onSearchRender(
            TextLayerBuilder,
            divDom as HTMLElement,
            configOption.value.currentRotate
          );
          resolve({ container, pdfCanvas });
        });
      })
    );
  }
  await Promise.all(searchList).then((list) => {
    searchDomList.value = list;
    handleSearchTotal(list);
    loading.value = false;
  });
};
const handleSearchAction = (type: "superior" | "Down") => {
  let total = 0;
  const isSuperior = type === "superior";
  if (isSuperior && searchIndex.value === 1) {
    searchIndex.value = searchTotal.value;
  } else if (!isSuperior && searchIndex.value === searchTotal.value) {
    searchIndex.value = 1;
  } else {
    isSuperior ? searchIndex.value-- : searchIndex.value++;
  }
  let isAction = false;
  for (let i = 0; i < searchTotalData.value.length; i++) {
    const { textTotal, currentIndex } = searchTotalData.value[i];
    total += textTotal;
    if (searchIndex.value <= total && !isAction) {
      handlePdfLocateView(
        currentIndex as number,
        `#scrollIntIndex-${configOption.value.appIndex}`,
        configOption.value.appIndex as number
      );
      targetSearchPageItem.value = {
        ...searchTotalData.value[i],
        searchIndex: searchIndex.value,
      };
      searchValue.value = searchText.value;
      isAction = true;
    }
  }
};
// 设置最大最小值，清除外部搜索关联值
const onInput = (type: "min" | "max", event: InputEvent) => {
  function setValue(v: number) {
    let num = Math.max(1, Math.min(+v, pdfExamplePages.value));
    //@ts-ignore
    if (event?.target?.value) event.target.value = num;
    // 修改范围搜索的最大最小值时修改清除外部 searchValue
    searchValue.value = "";
    return num;
  }
  if (type === "min" && startIndex.value) {
    startIndex.value = setValue(startIndex.value);
  } else if (type === "max" && endIndex.value) {
    endIndex.value = setValue(endIndex.value);
  }
};
const onSearch = async () => {
  if (searchValue.value === searchText.value) return;
  searchIndex.value = 0;
  removeNodesButKeepText(
    "pdf-highlight",
    document.querySelectorAll(".pdf-list-container")[
      configOption.value?.appIndex as number
    ] as HTMLElement
  );
  //@ts-ignore
  if (!searchText.value?.length && searchValue.value.length) {
    searchValue.value = searchText.value;
    searchTotal.value = 0;
    // 确保下次跳转
    if (!isSearchNext.value) isSearchNext.value = true;
    return;
  }

  await onTextSearch();
};
const onKeydown = (e: any) => {
  if (e.ctrlKey && e.keyCode === 70) {
    handleOpen();
    e.preventDefault();
  }
};
onMounted(() => {
  const container = document.querySelectorAll(".pdf-view-container")[
    configOption.value?.appIndex as number
  ];
  container && container.addEventListener("keydown", onKeydown);
});
onUnmounted(() => {
  const container = document.querySelectorAll(".pdf-view-container")[
    configOption.value?.appIndex as number
  ];
  container && container.removeEventListener("keydown", onKeydown);
});
defineExpose({
  onSearch,
  searchText,
  open,
  searchTotal,
  searchIndex,
  isSearchNext,
  handleSearchAction,
});
</script>

<style scoped>
.search-box {
  position: relative;
  font-size: 20px;
  width: 40px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 300ms;
}
.search-box:hover {
  background-color: #0000000f;
}
.action-search {
  background-color: #0000000f;
}
.popover-container {
  /* display: flex;
  align-items: center; */
  width: fit-content;
  position: absolute;
  right: 0px;
  top: 36px;
  border-radius: 4px;
  padding: 8px;
  background-color: #fff;
  z-index: 200;

  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0);
}
.popover-container .side {
  height: 30px;
  background-color: #0000000f;
  width: 1px;
  margin: 0px 10px;
}
.popover-container .popover-icon {
  font-size: 14px;
  color: #0000008f;
  margin: 0px 4px;
  background-color: transparent;
  border-radius: 50%;
  /* padding: 5px 8px; */
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 200ms;
}
.popover-container .popover-icon:hover {
  background-color: #0000000f;
}
.popover-container .popover-input-search {
  display: flex;
  align-items: center;
}
.popover-container .popover-input-search .popover-total {
  font-size: 14px;
  color: #0000008f;
  white-space: nowrap;
  margin-left: 50px;
}
@media screen and (max-width: 450px) {
  .pdf-view-container .pdf-tool-container .popover-input-search {
    /* display: none; */
    width: 190px;
  }
  .pdf-view-container .pdf-tool-container .popover-input-search .popover-total {
    /* display: none; */
    margin-left: 10px;
  }
}
</style>
