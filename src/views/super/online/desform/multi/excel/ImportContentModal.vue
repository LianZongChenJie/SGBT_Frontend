<template>
  <BasicModal
    :height="500"
    title="导入数据 - 选择内容（2/3）"
    @register="registerModal"
    :width="960"
    :canFullscreen="false"
    destroyOnClose
    closable
    okText="下一步"
    :okButtonProps="{ disabled: activeSheets.length == 0 }"
    :maskClosable="false"
    @ok="next()"
  >
    <a-row>
      <a-col :span="8">
        <div style="display: flex; flex-direction: column">
          <div style="font-size: 15px; font-weight: bold" class="ellipsis">
            {{ fileName }}
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; margin-top: 5px">
            <a-checkbox-group :value="activeSheets" @change="onCheckSheet" style="width: 100%">
              <template v-for="sheet in sheetListObj.same">
                <div class="sheet-name-item" :class="sheet.sheetName == activeSheet ? 'active' : ''">
                  <a-checkbox :value="sheet.sheetName">
                    <span>{{ sheet.sheetName }}</span>
                  </a-checkbox>
                </div>
              </template>
              <a-divider v-if="sheetListObj.diff.length" plain orientation="left">
                <span>以下Sheet无法选择</span>
                <span>&nbsp;</span>
                <a-tooltip placement="bottom">
                  <template #title>
                    <p>以下Sheet的表头与当前选择的Sheet的表头不完全一致，故无法选择。</p>
                    <p>若要导入子表，可在下一步中单独配置映射关系。</p>
                  </template>
                  <a-icon type="question-circle" />
                </a-tooltip>
              </a-divider>
              <template v-for="sheet in sheetListObj.diff">
                <div class="sheet-name-item" :class="sheet.sheetName == activeSheet ? 'active' : ''">
                  <a-checkbox :value="sheet.sheetName" :disabled="true">
                    <span>{{ sheet.sheetName }}</span>
                  </a-checkbox>
                </div>
              </template>
            </a-checkbox-group>
          </div>
        </div>
      </a-col>
      <a-col v-if="activeSheets.length == 0" :span="16">
        <a-empty description="请至少选择一个Sheet" style="margin-top: 50px" />
      </a-col>
      <a-col v-else :span="16">
        <div>
          <span style="color: #9e9e9e; margin-right: 10px">选择表头:</span>
          <span>第</span><span>{{ activeSheetTitleRow }}</span
          ><span>行</span>
          <span style="color: #1e88e5; margin-left: 8px">{{ activeSheetColumn }}</span>
        </div>
        <div class="excel-data">
          <div>
          </div>

          <table cellspacing="0" cellpadding="0" :style="{ 'border-collapse': 'collapse', 'margin-top': '5px', width: tableWidth + 'px' }">
            <tbody>
              <template v-for="(rowdata, index) in activeSheetData">
                <tr :class="[{ 'is-sub': rowdata.isSub }]">
                  <td style="width: 70px !important">
                    <span class="index" :style="notShowTagStyle(index)"> {{ index + 1 }}</span>
                    <div class="tag" :style="showTagStyle(index)" @click="onChangeActiveTitle(index, rowdata.isSub)">
                      <HeaderTag v-if="!rowdata.isSub" show :active="activeSheetTitleRow == index + 1" />
                      <span v-else style="margin-left: -10px">{{ index + 1 }}</span>
                    </div>
                  </td>
                  <td v-for="cellText in rowdata">
                    <span class="content">
                      {{ cellText }}
                    </span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </a-col>
    </a-row>
  </BasicModal>
</template>

<script lang="ts">
  import { CloudUploadOutlined } from '@ant-design/icons-vue';
  import { computed, defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { sheetInfo } from './useExcelAction';
  import HeaderTag from './HeaderTag.vue';
  import { isEqual, cloneDeep } from 'lodash-es';

  export default defineComponent({
    name: 'ImportContentModal',
    components: {
      BasicModal,
      CloudUploadOutlined,
      HeaderTag,
    },
    emits: ['register', 'success', 'next'],
    setup(_p, { emit }) {
      const fileKey = ref('');
      const sheetList = ref<sheetInfo[]>([]);
      const fileName = ref('');
      const activeSheets = ref<string[]>([]);

      const [registerModal, { closeModal }] = useModalInner(async (data) => {
        console.log('data', data);
        fileKey.value = data.fileKey;
        sheetList.value = data.sheetList;
        fileName.value = data.fileName;
        activeSheets.value = [data.sheetList[0].sheetName];
      });

      // 将sheetList分类成可选和不可选
      const sheetListObj = computed(()=>{
        const obj: {
          // 表头相同的sheet
          same: sheetInfo[],
          // 表头不同的sheet
          diff: sheetInfo[],
        } = {same: [], diff: []};
        if (!sheetList.value || sheetList.value.length == 0) {
          return obj;
        }
        for (const sheet of sheetList.value) {
          const flag = isDisableSheet(sheet)
          flag ? obj.diff.push(sheet) : obj.same.push(sheet);
        }
        return obj;
      })

      const activeSheet = computed(() => {
        return activeSheets.value[0];
      });

      const activeSheetTitleRow = computed(() => {
        let sheet = activeSheets.value[0];
        let arr = sheetList.value.filter((item) => item.sheetName == sheet);
        if (arr && arr.length > 0) {
          let index = arr[0].titleRow;
          if (!index) {
            index = 1;
          }
          return index;
        }
        return '';
      });

      const activeSheetColumn = computed(() => {
        let sheet = activeSheets.value[0];
        let arr = sheetList.value.filter((item) => item.sheetName == sheet);
        if (arr && arr.length > 0) {
          let map = arr[0].sheetData;
          if (map['0']) {
            let len = map['0'].length;
            return `共${len}列有效`;
          }
        }
        return '';
      });

      const tableWidth = ref(0);
      const activeSheetData = computed(() => {
        if (activeSheets.value.length == 0) {
          return [];
        }
        // 合并多sheet的data
        const dataList: Recordable[] = activeSheets.value.flatMap((sheet, index) => {
          const arr = sheetList.value.filter((item) => item.sheetName == sheet);
          if (arr && arr.length > 0) {
            return (Object.values(cloneDeep(arr[0].sheetData ?? {})) as Recordable[]).filter((d, i) => {
              if (index > 0) {
                if (i === 0) {
                  return false;
                }
                d.isSub = true;
              }
              return true;
            });
          }
          return [];
        });
        if (dataList && dataList.length > 0) {
          let arr: any[] = [];
          for (let i = 0; i < 10; i++) {
            let item = dataList[i];
            if (!item) {
              item = dataList[i + ''];
            }
            if (!item) {
              continue;
            }
            tableWidth.value = item.length * 130 + 70;
            arr.push(item);
          }
          return arr;
        }
        return [];
      });

      function onChangeActiveTitle(index: number, isSub: boolean) {
        if (isSub) {
          return;
        }
        let sheet = activeSheets.value[0];
        let arr = sheetList.value.filter((item) => item.sheetName == sheet);
        if (arr && arr.length > 0) {
          arr[0].titleRow = index + 1;
        }
        activeSheets.value = [sheet];
        console.log('onChangeActiveTitle', index);
      }

      function showTagStyle(index) {
        if (activeSheetTitleRow.value == index + 1) {
          return {
            display: 'block !important',
          };
        } else {
          return {};
        }
      }

      function notShowTagStyle(index) {
        if (activeSheetTitleRow.value == index + 1) {
          return {
            display: 'none !important',
          };
        } else {
          return {};
        }
      }

      function onCheckSheet(val: string[]) {
        activeSheets.value = val;
      }

      /**
       * 判断是否禁用
       * @param sheet
       */
      function isDisableSheet(sheet: sheetInfo) {
        const firstSheet = sheetList.value.find((item) => activeSheet.value == item.sheetName);
        if (!firstSheet) {
          return false;
        }
        const titleRow = firstSheet.titleRow ?? 1;
        const firstColumns = firstSheet.sheetData[titleRow - 1];
        const currentColumns = sheet.sheetData[titleRow - 1];
        return !isEqual(firstColumns, currentColumns);
      }

      function next() {
        let sheet = activeSheets.value[0];
        let arr = sheetList.value.filter((item) => item.sheetName == sheet);
        if (arr && arr.length > 0) {
          let titleRow = arr[0].titleRow;
          if (!titleRow) {
            // 找第一行
            titleRow = 1;
          }
          let list = arr[0].sheetData[titleRow - 1];
          console.log('标题行', list);
          emit('next', list, activeSheets.value.join(':'));
        }
      }

      return {
        registerModal,
        closeModal,
        next,
        fileKey,
        sheetList,
        sheetListObj,
        fileName,
        activeSheet,
        activeSheets,
        activeSheetTitleRow,
        activeSheetColumn,
        activeSheetData,
        onCheckSheet,
        onChangeActiveTitle,
        isDisableSheet,
        showTagStyle,
        notShowTagStyle,
        tableWidth,
      };
    },
  });
</script>

<style scoped lang="less">
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
    white-space: nowrap;
  }

  .sheet-name-item {
    height: 36px;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 24px;
    &:hover {
      background-color: #f6f6f6;
    }
    &.active {
      background-color: #bbdefb !important;
    }

    .ant-checkbox-wrapper {
      width: 100%;
      height: 100%;
      line-height: 36px;
    }
  }

  .excel-data {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 3px;
    max-height: 100%;
    //update-begin---author:wangshuai---date:2024-06-03---for:【TV360X-642】解决火狐浏览器表格没显示全---
    height: 100%;
    //update-end---author:wangshuai---date:2024-06-03---for:【TV360X-642】解决火狐浏览器表格没有显示全---
    overflow-x: auto;
    width: 100%;
    tr:nth-of-type(2n) {
      background: #fafcfd;
    }
    tr {
      cursor: pointer;
      td {
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        border-right: 1px solid rgba(0, 0, 0, 0.06);
        box-sizing: border-box;
        cursor: pointer;
        height: 32px;
        line-height: 32px;
        text-align: center;
        width: 150px;
        .tag {
          display: none;
          position: relative;
          padding-left: 10px;
        }
      }

      &:hover {
        background: #f0f0f0;
        .index {
          display: none;
        }
        .tag {
          display: block;
        }
      }

      &.is-sub {
        cursor: not-allowed !important;
        td {
          cursor: not-allowed !important;
          background: #f5f5f5;
          color: #9e9e9e;
        }
      }
    }
    .content {
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: top;
      white-space: nowrap;
      width: 130px;
    }
  }
</style>
