<template>
  <a-spin :spinning="loading">
    <!-- 主表 -->
    <FieldAuthTable :desformRecord="desformRecord" :dataSource="dataSource" showTableSetting v-bind="tableProps" />
    <!-- 子表 -->
    <a-tabs v-if="subTableList.length > 0" style="margin-top: 20px">
      <template v-for="subItem of subTableList" :key="subItem.key">
        <a-tab-pane :tab="subItem.title">
          <FieldAuthTable :desformRecord="desformRecord" :dataSource="subItem.list" v-bind="tableProps" />
        </a-tab-pane>
      </template>
    </a-tabs>
  </a-spin>
  <FieldAuthSettingModal @register="registerAuthSettingModal" @ok="() => doReload()"/>
</template>

<script lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { computed, defineComponent, ref, watch } from 'vue';
  import { propTypes } from '/@/utils/propTypes';
  import { useModal } from '/@/components/Modal';
  import { fieldAuthApi } from '../../auth.api';
  import DataAuthModal from '../data/DataAuthModal.vue';
  import FieldAuthTable from './FieldAuthTable.vue';
  import FieldAuthSettingModal from './FieldAuthSettingModal.vue';

  export default defineComponent({
    name: 'FieldAuthTab',
    components: {
      FieldAuthSettingModal,
      BasicTable,
      TableAction,
      DataAuthModal,
      FieldAuthTable,
    },
    props: {
      visible: propTypes.bool.def(false),
      desformRecord: propTypes.any.isRequired,
    },
    setup(props) {
      const loading = ref(false);
      // 主表格数据
      const dataSource = ref<Recordable[]>([]);
      // 子表表格数据
      const subTableList = ref<Recordable[]>([]);
      // 注册弹窗
      const [registerAuthSettingModal, authSettingModal] = useModal();

      const tableProps = computed(() => {
        return {
          onAuth: doAuth,
          onReload: doReload,
          onDelete: (args: any[]) => doDelete.apply(null, args),
        };
      });

      watch(
        () => props.visible,
        () => {
          if (props.visible && props.desformRecord) {
            doReload();
          }
        },
        { immediate: true }
      );

      /**
       * 重新加载数据
       * @param params
       */
      async function doReload(params = {}) {
        loading.value = true;
        try {
          let result = await fieldAuthApi.query(
            {
              ...params,
              group: true,
            },
            props.desformRecord?.desformCode
          );
          // 分出子表、主表
          let mainList: Recordable[] = [],
            subMaps: Recordable = {};
          for (let item of result) {
            if (item.subTable) {
              let subInfo = subMaps[item.subKey] || {
                title: item.subTitle,
                key: item.subKey,
                list: [],
                selectedRowKeys: [],
                selectionRows: [],
              };
              subInfo.list.push(item);
              subMaps[item.subKey] = subInfo;
            } else {
              mainList.push(item);
            }
          }
          // 将子表封装成数组
          let subList: Recordable[] = [];
          for (let key in subMaps) {
            if (subMaps.hasOwnProperty(key)) {
              subList.push(subMaps[key]);
            }
          }
          dataSource.value = mainList;
          subTableList.value = subList;
        } finally {
          loading.value = false;
        }
      }

      /**
       * 删除数据
       */
      async function doDelete(authComKey, callback) {
        let code = props.desformRecord?.desformCode;
        try {
          let res = await fieldAuthApi.deleteByAuthComKey(code, authComKey);
          doReload();
          callback && callback(res);
        } finally {
        }
      }

      /**
       * 打开授权弹窗
       * @param record
       */
      function doAuth(record) {
        authSettingModal.openModal(true, { record });
      }

      return {
        loading,
        doReload,
        dataSource,
        subTableList,
        tableProps,
        registerAuthSettingModal,
      };
    },
  });
</script>

<style scoped></style>
