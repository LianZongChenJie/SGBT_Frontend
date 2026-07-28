<template>
  <BasicTable @register="registerTable">
    <!--插槽:table标题-->
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate" v-if="isMiniDesgin=='default'">新建流程</a-button>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreateMini" v-if="isMiniDesgin=='mini'">新建简流程</a-button>
    </template>
    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)">
        <template #updateProcess>
          <a-upload
            :showUploadList="false"
            :action="processUpload.action(record.id)"
            :data="processUpload.data"
            :headers="processUpload.headers"
            @change="processUpload.onChange"
          >
            <span>上传流程</span>
          </a-upload>
        </template>
      </TableAction>
    </template>
  </BasicTable>

  <!-- 流程设计modal -->
  <process-design-modal @register="registerDesignModal" @success="loadTable"></process-design-modal>

  <!-- 简流设计器modal -->
  <mini-des-flow-modal @register="registerMiniDesFlowModal" :isLowApp="false" @success="loadTable"></mini-des-flow-modal>

  <!-- 流程配置modal -->
  <process-config-modal @register="registerDesignConfigModal"></process-config-modal>

  <!-- 图标配置 -->
  <process-icon-modal @register="registerIconModal" @success="loadTable"></process-icon-modal>

  <!-- 版本监控 -->
  <process-deployment-modal @register="registerDeploymentModal"></process-deployment-modal>

  <!-- 流程属性配置 -->
  <process-other-config-drawer @register="registerOtherDrawer" @success="loadTable"></process-other-config-drawer>
</template>

<script>
  import {ref, unref, reactive, nextTick} from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { list, publish, deleteOne, copy, uploadProcess } from './process.design.api';
  import { columns, searchFormSchema } from './process.design.data';
  import { initDictOptions } from '/@/utils/dict';
  import { filterDictText } from '/@/utils/dict/JDictSelectUtil';
  import { getToken } from '/@/utils/auth';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRouter } from 'vue-router'
  import { useDrawer } from '/@/components/Drawer';
  import { useModal } from '/@/components/Modal';
  import ProcessDesignModal from './modal/ProcessDesignModal.vue';
  import ProcessConfigModal from './modal/ProcessConfigModal.vue';
  import ProcessIconModal from './modal/ProcessIconModal.vue';
  import ProcessDeploymentModal from './modal/ProcessDeploymentModal.vue';
  import ProcessOtherConfigDrawer from './modal/ProcessOtherConfigDrawer.vue'

  export default {
    name: 'ProcessDesignList',
    components: {
      BasicTable,
      TableAction,
      ProcessDesignModal,
      ProcessConfigModal,
      ProcessIconModal,
      ProcessDeploymentModal,
      ProcessOtherConfigDrawer
    },
    setup() {
      const { createMessage: $message } = useMessage();

      //update-begin---author:scott ---date:2022-10-21  for：默认流程和简版流程，拆分成两个菜单，方便维护-----------
      //自定义查询条件默认值
      let searchFormSchemaNew = searchFormSchema;
      const isMiniDesgin = ref("default");
      
      //获取路由地址
      let router = useRouter()
      console.log('router.currentRoute.value.path', router.currentRoute.value.path)
      
      if(router.currentRoute.value.path.endsWith("/mini")){
        isMiniDesgin.value = 'mini'
        searchFormSchemaNew = searchFormSchema.map(item => {
          if(item.field == 'processDesginType'){
            item.defaultValue = 'mini';
          }
        })
      }else if(router.currentRoute.value.path.endsWith("/list/desflow")){
        isMiniDesgin.value = 'mini'
        searchFormSchemaNew = searchFormSchema.map(item => {
          if(item.field == 'processDesginType'){
            item.defaultValue = 'mini';
          }
        })
      }else{
        isMiniDesgin.value = 'default'
        searchFormSchemaNew = searchFormSchema.map(item => {
          if(item.field == 'processDesginType'){
            item.defaultValue = 'default';
          }
        })
      }
      //update-end---author:scott ---date::2022-10-21  for：默认流程和简版流程，拆分成两个菜单，方便维护--------------
      
      const { tableContext } = useListPage({
        designScope: 'process-design',
        pagination: true,
        tableProps: {
          title: '流程设计',
          api: list,
          columns: columns,
          actionColumn: {
            width: 300,
            dataIndex: 'action',
            slots: { customRender: 'action' },
          },
          formConfig: {
            schemas: searchFormSchema,
            autoAdvancedCol: 4,
            baseColProps: { xs: 24, sm: 12, md: 8, lg: 8, xl: 8, xxl: 5 },
            actionColOptions: {
              xs: 24,
              sm: 12,
              md: 8,
              lg: 8,
              xl: 8,
              xxl: 4,
            },
          },
        },
      });
      const [registerTable, { getForm , reload }] = tableContext;
      nextTick(() => {
        console.log("getForm() data", getForm().getFieldsValue());
      });
     

      const [registerDesignModal, { openModal: openDesignModal }] = useModal();

      const [registerMiniDesFlowModal, { openModal: openDesignModalMini }] = useModal();

      const [registerDesignConfigModal, { openModal: openDesignConfigModal }] = useModal();

      const [registerIconModal, { openModal: openIconModal }] = useModal();

      const [registerDeploymentModal, { openModal: openDeploymentModal }] = useModal();

      const [registerOtherDrawer, { openDrawer }] = useDrawer();

      /**
       * 打开流程设计表单
       */
      function handleCreate() {
        openDesignModal(true, {
          isUpdate: false,
        });
      }

      /**
       * 打开流程设计表单
       */
      function handleCreateMini() {
        openDesignModalMini(true, {
          isUpdate: false,
        });
      }


      function handleUpdate(record) {
        openDesignModal(true, {
          isUpdate: true,
          id: record.id,
        });
      }

      function handleUpdateTest(record) {
        openDesignModalMini(true, {
          isUpdate: true,
          id: record.id,
        });
      }

      function handleOpenConfigModal(record) {
        openDesignConfigModal(true, record);
      }

      async function handlePublish(record) {
        await publish({ id: record.id });
        reload();
      }

      /**
       * 操作栏
       */
      function getTableAction(record) {
        return [
          {
            label: '设计流程',
            onClick: handleUpdate.bind(null, record),
            // ifShow: () => {
            //   return record.processJson == null || record.processJson == '';
            // },
          },
          {
            label: '简流',
            onClick: handleUpdateTest.bind(null, record),
            ifShow: () => {
              return isMiniDesgin.value =='mini';
            },
          },
          {
            label: '配置',
            onClick: handleOpenConfigModal.bind(null, record),
            // ifShow: () => {
            //   return record.processJson == null || record.processJson == '';
            // },
          },
          {
            label: '发布',
            popConfirm: {
              title: '是否确认发布该流程?',
              confirm: handlePublish.bind(null, record),
            },
          },
        ];
      }

      /**
       * 下拉操作栏
       */
      function getDropDownAction(record) {
        let arr = [];
        // arr.push( {
        //   label: '设计 · 简',
        //   onClick: handleUpdateTest.bind(null, record),
        //   ifShow: () => {
        //     return record.processJson !== null && record.processJson !== '';
        //   },
        // });
        if (record.processStatus === 1) {
          arr.push({
            label: '版本监控',
            onClick: showDeploymentList.bind(null, record),
          });
        }
        arr.push(
          {
            label: '高级配置',
            onClick: handleOtherConfig.bind(null, record),
          },
          {
            label: '流程复制',
            popConfirm: {
              title: '确定复制该流程吗?',
              confirm: handleCopy.bind(null, record),
            },
          },
          {
            label: '上传流程',
            slot: 'updateProcess',
          },
     /*     {
            label: '表单图标',
            onClick: handleIcon.bind(null, record),
          },*/
        );
        if (record.processStatus === 0) {
          arr.push({
            label: '删除',
            popConfirm: {
              title: '是否确认删除',
              confirm: handleDelete.bind(null, record),
            },
          });
        }
        return arr;
      }

      function handleOtherConfig(record){
        openDrawer(true, record)
      }

      async function handleDelete(record) {
        await deleteOne({ id: record.id });
        reload();
      }

      async function handleCopy(record) {
        await copy({ id: record.id });
        reload();
      }

      function handleIcon(record) {
        openIconModal(true, record);
      }

      function showDeploymentList(record) {
        openDeploymentModal(true, record);
      }

      const processUpload = reactive({
        action: function (id) {
          let url = window._CONFIG['domianURL'] + uploadProcess + '?id=' + id;
          let ceshiToken = 'NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ=='
          // console.log('----------------', url);
          return url;
        },
        data: { isup: 1 },
        headers: { 'X-Access-Token': getToken() },
        onChange: function (info) {
          if (info.file.status === 'done') {
            if (info.file.response.success) {
              $message.success(`流程上传成功`);
            } else {
              $message.error(`${info.file.name} ${info.file.response.message}.`);
            }
          } else if (info.file.status === 'error') {
            $message.error(`流程上传失败: ${info.file.msg} `);
          }
        },
      });

      function loadTable() {
        reload();
      }

      return {
        registerTable,
        handleCreate,
        handleCreateMini,
        getTableAction,
        getDropDownAction,
        processUpload,
        loadTable,

        //流程设计
        registerDesignModal,
        //测试流程设计
        registerMiniDesFlowModal,

        //流程配置
        registerDesignConfigModal,

        //图标配置
        registerIconModal,

        //版本监控
        registerDeploymentModal,

        registerOtherDrawer,
        isMiniDesgin
      };
    },
  };
</script>

<style lang="less">
  /*QQYUN-3131【流程列表】删除效果，为什么跟复制流程效果不一样*/
  .ant-popconfirm {
    .ant-popover-buttons{
      min-width: 120px;
      text-align: center;
    }
  }
</style>
