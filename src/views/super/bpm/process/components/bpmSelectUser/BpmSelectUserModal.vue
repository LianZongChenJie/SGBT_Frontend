<template>
  <BasicModal title="选择用户" @register="registerModal" width="100%" @ok="handleSelectSuccess" :canFullscreen="false" keyboard defaultFullscreen>
    <a-row>
      <!-- 左侧树-选择部门 -->
      <a-col :xs="24" :sm="6">
        <a-card title="组织机构" :bordered="true">
          <a-alert type="info" :showIcon="true">
            <template #message>
              当前选择：
              <span v-if="departInfo.currentSelectRow.title">{{ departInfo.currentSelectRow.title }}</span>
              <a v-if="departInfo.currentSelectRow.title" style="margin-left: 10px" @click="onClearSelectedDepart">取消选择</a>
            </template>
          </a-alert>
          <!--组织机构-->
          <a-directory-tree
            selectable
            :selectedKeys="departInfo.selectedKeys"
            :checkStrictly="true"
            @select="onSelectDepart"
            :dropdownStyle="{ maxHeight: '200px', overflow: 'auto' }"
            :load-data="onLoadTreeData"
            :treeData="departInfo.treeData"
          />
        </a-card>
      </a-col>

      <!-- 中间列表-展示用户信息 -->
      <a-col :xs="24" :sm="10">
        <a-card title="选择人员" :bordered="true" :bodyStyle="{ paddingTop: '1px' }">
          <BasicTable @register="registerTable" :rowSelection="rowSelection" />
        </a-card>
      </a-col>

      <!-- 右侧显示已经选中用户，支持调整顺序 -->
      <a-col :xs="24" :sm="8">
        <a-card title="已选用户" :bordered="true">
          <BasicTable @register="registerSelectedUserTable">
            <!--操作栏-->
            <template #action="{ record }">
              <a-button type="primary" size="small" @click="handleDelete(record)" preIcon="ant-design:delete">删除</a-button>
            </template>
          </BasicTable>
        </a-card>
      </a-col>
    </a-row>
  </BasicModal>
</template>

<script>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, nextTick, unref, reactive, toRaw, watch } from 'vue';
  import { getDepartTreeData, getDepartUserList, getUserList, columns, selectedUserColumns, searchFormSchema } from './useSelectUser';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';

  export default {
    name: 'BpmSelectUserModal',
    components: {
      BasicModal,
      BasicTable,
    },
    props: {
      multi: {
        type: Boolean,
        default: true,
      },
    },
    emits: ['selected', 'register'],
    setup(props, { emit }) {
      const selectedList = ref([]);
      const [registerModal, { closeModal }] = useModalInner((data) => {
        showSelectedValue(data);
      });

      /*-----------------部门---begin----------------*/
      const departInfo = reactive({
        treeData: [],
        selectedKeys: [],
        currentSelectRow: {
          title: '',
        },
      });
      function onSelectDepart(data, { node }) {
        departInfo.selectedKeys[0] = data[0];
        departInfo.currentSelectRow = toRaw(node.dataRef);
        console.log(departInfo);
        reload();
      }
      function onClearSelectedDepart() {
        departInfo.selectedKeys = [];
        departInfo.currentSelectRow = { title: '' };
        reload();
      }

      async function loadRootDepart() {
        const result = await getDepartTreeData();
        if (Array.isArray(result)) {
          departInfo.treeData = result;
        }
      }
      async function onLoadTreeData(treeNode) {
        try {
          const result = await getDepartTreeData({
            pid: treeNode.dataRef.id,
          });
          if (result.length == 0) {
            treeNode.dataRef.isLeaf = true;
          } else {
            treeNode.dataRef.children = result;
          }
          // departInfo.treeData = [...departInfo.treeData]
        } catch (e) {
          console.error('部门树子节点加载失败', e);
        }
        return Promise.resolve();
      }
      /*-----------------部门---end----------------*/

      /*-----------------用户列表---begin----------------*/
      async function queryUserList(params) {
        let arr = departInfo.selectedKeys;
        if (arr.length > 0) {
          //根据部门查询
          params['id'] = arr[0];
          let result = await getDepartUserList(params);
          if (params.username) {
            result.records = result.records.filter((item) => {
              return item.username.indexOf(params.username) != -1;
            });
          }
          return Promise.resolve(result);
        } else {
          return getUserList(params);
        }
      }
      const { tableContext } = useListPage({
        designScope: 'bpm-select-user',
        pagination: true,
        tableProps: {
          title: '',
          api: queryUserList,
          columns: columns,
          showActionColumn: false,
          showTableSetting: false,
          canResize: false,
          clickToRowSelect: true,
          formConfig: {
            labelWidth: '120px',
            schemas: searchFormSchema,
            autoAdvancedCol: 4,
            //update-begin-author:liusq---date:2024-06-11--for: 指定会签人员的弹框 查询遮挡了
            baseColProps: { xs: 24, sm: 24, md: 24, lg: 24, xl: 12, xxl: 10 },
            actionColOptions: { xs: 24, sm: 24, md: 24, lg: 24, xl: 12, xxl: 12 },
            //update-end-author:liusq---date:2024-06-11--for:指定会签人员的弹框 查询遮挡了
          },
        },
      });
      const [registerTable, { reload, deleteSelectRowByKey }, { rowSelection, selectedRows, selectedRowKeys }] = tableContext;

      watch(
        () => props.multi,
        (val) => {
          if (val === false) {
            rowSelection.type = 'radio';
          } else {
            rowSelection.type = 'checkbox';
          }
        }
      );

      /*-----------------用户列表--end-----------------*/
      const selectedUserList = ref([]);
      //update-begin-author:liusq---date:2024-06-11--for: TV360X-1047 指定下一步操作人/抄送给，选人组件无法多选。
      watch(
        selectedRows,
        () => {
          let arr = [];
          for (let row of unref(selectedRows)) {
            arr.push({
              realname: row.realname,
              username: row.username,
              id: row.id,
            });
          }
          selectedUserList.value = arr;
        },
        { deep: true }
      );
      //update-end-author:liusq---date:2024-06-11--for: TV360X-1047 指定下一步操作人/抄送给，选人组件无法多选。

      const { tableContext: selectedTableContext } = useListPage({
        designScope: 'bpm-select-user',
        pagination: false,
        tableProps: {
          title: '',
          columns: selectedUserColumns,
          pagination: false,
          dataSource: selectedUserList,
          showActionColumn: true,
          showTableSetting: false,
          canResize: false,
          useSearchForm: false,
        },
      });
      const [registerSelectedUserTable] = selectedTableContext;
      function handleDelete(record) {
        let id = record.id;
        let arr = selectedUserList.value;
        arr = arr.filter((item) => item.id != id);
        selectedUserList.value = arr;
        deleteSelectRowByKey(record.id);
      }

      function handleSelectSuccess() {
        let arr = toRaw(selectedUserList.value);
        emit('selected', arr);
        closeModal();
      }

      /**
       * 弹框打开 回显下拉框选中的数据
       * @param data
       */
      function showSelectedValue(data) {
        let selectedValue = data.selected;
        if (!selectedValue || selectedValue.length == 0) {
          selectedUserList.value = [];
          selectedRows.value = [];
          selectedRowKeys.value = [];
        } else {
          let arr1 = [],
            arr2 = [],
            arr3 = [];
          for (let item of selectedValue) {
            arr1.push(item.id);
            arr2.push({ ...item });
            arr3.push({ ...item });
          }
          selectedRowKeys.value = arr1;
          selectedUserList.value = arr2;
          selectedRows.value = arr3;
        }
      }

      loadRootDepart();
      return {
        registerModal,
        handleSelectSuccess,
        selectedList,
        departInfo,
        onSelectDepart,
        onClearSelectedDepart,
        onLoadTreeData,
        registerTable,
        rowSelection,
        registerSelectedUserTable,
        handleDelete,
      };
    },
  };
</script>

<style scoped></style>
