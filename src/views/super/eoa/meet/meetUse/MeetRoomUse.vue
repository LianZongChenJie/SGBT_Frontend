<template>
  <div :class="['p-4']">
    <a-card :bordered="false">
      <a-row style="width: 100%" :gutter="24">
        <a-col :span="4" style="max-height: 500px; overflow: auto">
          <!-- 部门树形结构  -->
          <a-directory-tree
            :dropdownStyle="{ maxHeight: '200px', overflow: 'auto' }"
            :loadData="onLoadData"
            :treeData="tableData.departTree"
            v-model:expandedKeys="tableData.expandedKeys"
            v-model:selectedKeys="tableData.selectedDepIds"
            @select="onDepSelect"
          />
        </a-col>
        <a-col :span="20">
          <MeetCalendarUse ref="calendarUser" @change="resourceChange" @reloadTable="loadMetting(tableData.selectedDepKey)"></MeetCalendarUse>
          <a-table
            v-if="!tableData.resourceIsNull"
            ref="table"
            size="middle"
            rowKey="id"
            :columns="columns"
            :dataSource="tableData.dataSource"
            :pagination="tableData.ipagination"
            :loading="tableData.loading"
            :rowSelection="{ selectedRowKeys: tableData.selectedRowKeys, onChange: onSelectChange }"
          />
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script lang="ts" name="meet-room-use" setup>
  import { reactive, ref } from 'vue';
  import MeetCalendarUse from './MeetCalendarUse.vue';
  import { queryList, loadTreeData } from '/@/views/super/eoa/meet/manage/manage.api.ts';
  import { queryTreeList } from '/@/api/common/api';
  import { useMessage } from '/@/hooks/web/useMessage';
  //提示弹窗
  const $message = useMessage();
  const calendarUser = ref(null);
  const columns = [
    {
      title: '会议名称',
      align: 'center',
      dataIndex: 'name',
    },
    {
      title: '召集人',
      align: 'center',
      dataIndex: 'originator_dictText',
    },
    {
      title: '位置',
      align: 'center',
      dataIndex: 'location_dictText',
    },
    {
      title: '开始时间',
      align: 'center',
      dataIndex: 'beginTime',
    },
    {
      title: '结束时间',
      align: 'center',
      dataIndex: 'endTime',
    },
    {
      title: '状态',
      align: 'center',
      dataIndex: 'status_dictText',
    },
  ];
  //表格数据
  const tableData = reactive({
    loading: false,
    dataSource: [],
    /* 分页参数 */
    ipagination: {
      current: 1,
      pageSize: 10,
      pageSizeOptions: ['10', '20', '30'],
      showTotal: (total, range) => {
        return range[0] + '-' + range[1] + ' 共' + total + '条';
      },
      showQuickJumper: true,
      showSizeChanger: true,
      total: 0,
    },
    /* table选中keys*/
    selectedRowKeys: [],
    /* table选中records*/
    selectionRows: [],
    selectedDepIds: [],
    departTree: [],
    expandedKeys: [],
    visible: true,
    resourceIsNull: true,
    selectedDepKey: '',
    tranLeft: 0,
    tranTop: 0,
  });
  //查询左侧树信息
  queryDepartTree();
  //数据修改后同步resourceIsNull
  function resourceChange(value) {
    if (value != null && value.length > 0) {
      tableData.resourceIsNull = false;
    } else {
      tableData.resourceIsNull = true;
    }
  }
  /**
   * 根据部门加载会议
   * @param departId
   * */
  async function loadMetting(departId) {
    let params = {}; //查询条件
    params.pageNo = tableData.ipagination.current;
    params.pageSize = tableData.ipagination.pageSize;
    params.departId = departId;
    tableData.loading = true;
    let res = await queryList(params);
    if (res.success) {
      tableData.dataSource = res.result.records;
      tableData.ipagination.total = res.result.total;
    }
    if (res.code === 510) {
      $message.warning(res.message);
    }
    tableData.loading = false;
  }
  /**
   * 查询树信息
   */
  async function queryDepartTree() {
    let result = await queryTreeList();
    if (result) {
      tableData.departTree = result;
      // 默认展开父节点
      tableData.expandedKeys = tableData.departTree.map((item) => item.id);
      // 默认选中部门
      let departId = '';
      if (tableData.expandedKeys != null && tableData.expandedKeys.length > 0) {
        departId = tableData.expandedKeys[0];
      }
      calendarUser.value.loadRoom(departId);
      //默认选中节点
      tableData.selectedDepKey = departId;
      tableData.selectedDepIds = [departId];
      loadMetting(departId);
    }
  }
  // 点击树节点,筛选出对应的会议室
  function onDepSelect(selectedDepIds) {
    if (selectedDepIds[0] != null) {
      //二次点击处理，取消选中的的部门机构，刷新日历和会议列表内容
      if (tableData.selectedDepKey == selectedDepIds[0]) {
        tableData.selectedDepKey = '';
        tableData.selectedDepIds = [];
        calendarUser.value.loadRoom(null, '1');
        tableData.dataSource = [];
        tableData.ipagination.total = 0;
      } else {
        tableData.selectedDepKey = selectedDepIds[0];
        calendarUser.value.loadRoom(selectedDepIds[0]);
        loadMetting(selectedDepIds[0]);
        // 调用方法根据选选择的id查询会议室信息
        if (tableData.selectedDepIds[0] !== selectedDepIds[0]) {
          tableData.selectedDepIds = [selectedDepIds[0]];
        }
      }
    }
  }
  function onSelectChange(selectedRowKeys, selectionRows) {
    tableData.selectedRowKeys = selectedRowKeys;
    tableData.selectionRows = selectionRows;
  }
  /**
   * 异步加载数据
   */
  async function onLoadData(treeNode) {
    let pid = treeNode.dataRef.key;
    let res = await loadTreeData({ pid });
    if (res.success) {
      for (let i of res.result) {
        i.value = i.key;
        i.isLeaf = !!i.leaf;
      }
      //添加子节点
      addChildren(pid, res.result, tableData.treeData.value);
      tableData.treeData.value = [...tableData.treeData.value];
    }
    return Promise.resolve();
  }

  /**
   * 加载子节点
   */
  function addChildren(pid, children, treeArray) {
    if (treeArray && treeArray.length > 0) {
      for (let item of treeArray) {
        if (item.key == pid) {
          if (!children || children.length == 0) {
            item.isLeaf = true;
          } else {
            item.children = children;
          }
          break;
        } else {
          addChildren(pid, children, item.children);
        }
      }
    }
  }
</script>
