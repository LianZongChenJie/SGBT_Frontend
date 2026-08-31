<template>
  <div>
    <a-modal centered :title="title" :width="1200" :open="visible" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
      <a-row :gutter="18">
        <a-col :xs="24" :sm="16">
          <a-card title="选择人员" :bordered="true">
            <!-- 查询区域 -->
            <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
              <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
                <a-row :gutter="24">
                  <a-col :span="8">
                    <a-form-item label="用户姓名">
                      <a-input placeholder="请输入姓名" v-model:value="queryParam.realname"></a-input>
                    </a-form-item>
                  </a-col>
                  <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
                    <a-col :span="6">
                      <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
                      <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
                    </a-col>
                  </span>
                </a-row>
              </a-form>
            </div>
            <!-- table区域-begin -->
            <div>
              <a-table
                size="small"
                bordered
                rowKey="id"
                :columns="columns1"
                :dataSource="dataSource1"
                :pagination="ipagination"
                :loading="loading"
                :rowSelection="{ selectedRowKeys: selectedRowKeys, onSelectAll: onSelectAll, onSelect: onSelect, onChange: onSelectChange }"
                @change="handleTableChange"
              >
                <template #username="{ text, record }">
                  <JEllipsis :value="text" :length="15" />
                </template>
                <template #realname="{ text, record }">
                  <JEllipsis :value="text" :length="10" />
                </template>
              </a-table>
            </div>
            <!-- table区域-end -->
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-card title="用户选择" :bordered="true">
            <div>
              <a-table size="small" bordered rowKey="id" :columns="columns2" :dataSource="dataSource2" :loading="loading" :scroll="{ y: 240 }">
                <template #action="{ text, record }">
                  <a-button type="primary" size="small" @click="handleDelete(record)" preIcon="ant-design:delete-outlined">删除</a-button>
                </template>
              </a-table>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script lang="ts">
  import { defineComponent, reactive, toRefs } from 'vue';
  import { getBizProcessNodeInfo, suspend } from '/src/views/super/bpm/process/manage/components/bpm.api';
  import { useMessage } from '/src/hooks/web/useMessage';
  import { list } from '/src/views/system/user/user.api.ts';
  import JEllipsis from '/src/components/Form/src/jeecg/components/JEllipsis.vue';
  import { filterObj } from '/src/utils/common/compUtils';

  export default defineComponent({
    props: ['formData'],
    components: {
      JEllipsis,
    },
    emits: ['selectFinished'],
    setup(_, { emit }) {
      const { createMessage } = useMessage();
      function searchQuery() {
        loadData(1);
      }
      function searchReset() {
        _this.queryParam = {};
        loadData(1);
      }
      function handleCancel() {
        _this.visible = false;
      }
      function handleOk() {
        if (_this.dataSource2.length <= 0) {
          createMessage.warning('请选用户信息');
          return;
        }
        emit('selectFinished', _this.dataSource2);
        _this.visible = false;
      }
      function add() {
        _this.visible = true;
      }
      function loadData(arg?) {
        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          _this.ipagination.current = 1;
        }
        let params = getQueryParams(); //查询条件
        list(params).then((res) => {
          if (res.records) {
            _this.dataSource1 = res.records;
            _this.ipagination.total = res.total;
          }
        });
      }
      function getQueryParams() {
        let param = Object.assign({}, _this.queryParam, _this.isorter);
        param.pageNo = _this.ipagination.current;
        param.pageSize = _this.ipagination.pageSize;
        return filterObj(param);
      }

      function onSelectAll(selected, selectedRows, changeRows) {
        if (selected === true) {
          for (let a = 0; a < changeRows.length; a++) {
            _this.dataSource2.push(changeRows[a]);
          }
        } else {
          for (let b = 0; b < changeRows.length; b++) {
            _this.dataSource2.splice(_this.dataSource2.indexOf(changeRows[b]), 1);
          }
        }
        // console.log(selected, selectedRows, changeRows);
      }
      function onSelect(record, selected) {
        if (selected === true) {
          _this.dataSource2.push(record);
        } else {
          var index = _this.dataSource2.indexOf(record);
          //console.log();
          if (index >= 0) {
            _this.dataSource2.splice(_this.dataSource2.indexOf(record), 1);
          }
        }
      }
      function onSelectChange(selectedRowKeys, selectedRows) {
        _this.selectedRowKeys = selectedRowKeys;
        _this.selectionRows = selectedRows;
      }
      function onClearSelected() {
        _this.selectedRowKeys = [];
        _this.selectionRows = [];
      }
      function handleDelete(record) {
        _this.dataSource2.splice(_this.dataSource2.indexOf(record), 1);
      }
      function handleTableChange(pagination, filters, sorter) {
        //分页、排序、筛选变化时触发
        //TODO 筛选
        if (Object.keys(sorter).length > 0) {
          _this.isorter.column = sorter.field;
          _this.isorter.order = 'ascend' == sorter.order ? 'asc' : 'desc';
        }
        _this.ipagination = pagination;
        loadData();
      }
      const _this = reactive({
        title: '用户列表',
        names: [],
        visible: false,
        placement: 'right',
        description: '人员管理页面',
        // 查询条件
        queryParam: {},
        dataSource1: [],
        dataSource2: [],
        // 分页参数
        ipagination: {
          current: 1,
          pageSize: 5,
          pageSizeOptions: ['5', '10', '20'],
          showTotal: (total, range) => {
            return range[0] + '-' + range[1] + ' 共' + total + '条';
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0,
        },
        isorter: {
          column: 'createTime',
          order: 'desc',
        },
        loading: false,
        selectedRowKeys: [],
        selectedRows: [],
        // 表头
        columns1: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 30,
            align: 'center',
            customRender: ({ index }) => {
              return parseInt(index) + 1;
            },
          },
          {
            title: '用户账号',
            align: 'center',
            dataIndex: 'username',
            width: 120,
            slots: { customRender: 'username' },
          },
          {
            title: '用户姓名',
            align: 'center',
            width: 100,
            dataIndex: 'realname',
            slots: { customRender: 'realname' },
          },
        ],
        columns2: [
          {
            title: '用户姓名',
            align: 'center',
            width: '60%',
            dataIndex: 'realname',
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            width: '40%',
            slots: { customRender: 'action' },
          },
        ],
        dealStatus: false,
        disabledButton: false,
      });
      const labelCol = reactive({
        xs: { span: 24 },
        sm: { span: 7 },
      });
      const wrapperCol = reactive({
        xs: { span: 24 },
        sm: { span: 16 },
      });
      loadData(1);
      return {
        ...toRefs(_this),
        handleOk,
        handleCancel,
        searchQuery,
        searchReset,
        onSelectAll,
        onSelect,
        onSelectChange,
        handleTableChange,
        handleDelete,
        labelCol,
        wrapperCol,
        add,
      };
    },
  });
</script>
<style lang="less" scoped>
  .ant-card-body .table-operator {
    margin-bottom: 18px;
  }

  .anty-row-operator button {
    margin: 0 5px;
  }

  .ant-btn-danger {
    background-color: #fff;
  }

  .ant-modal-cust-warp {
    height: 100%;
  }

  .ant-modal-cust-warp .ant-modal-body {
    height: calc(100% - 110px) !important;
    overflow-y: auto;
  }

  .ant-modal-cust-warp .ant-modal-content {
    height: 90% !important;
    overflow-y: hidden;
  }

  .jeecg-basic-table-form-container {
    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }
</style>
