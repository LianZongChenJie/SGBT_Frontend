<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <BasicForm @register="registerForm" :disabled="isDisabled" class="mr4">
      <template #workDescription="{ model, field }">
        <div style="display: flex; align-items: flex-start; gap: 8px; width: 100%">
          <a-textarea v-model:value="model[field]" :rows="3" style="flex: 1" placeholder="请输入工作描述" />
        </div>
      </template>
      <!--      工作量插槽table-->
      <template #tableSlot>
        <!--        <a-button @click="addRenyuan" preIcon="ant-design:plus-outlined" type="primary" class="ml4">添加人员</a-button>-->
        <BasicTable @register="registerTable" :rowSelection="rowSelection" @edit-change="onEditChange" class="ml4">
          <template #tableTitle>
            <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">添加</a-button>

            <!--            <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl, exportParams)"-->
            <!--            >导出-->
            <!--            </a-button>-->
          </template>
          <template #action="{ record }">
            <TableAction :actions="getActions(record)" />
          </template>
          <template #workerName="{ text, record }">
            <a-input-search v-model:value="record.workerName" placeholder="请选择人员" style="width: 100%" @search="addRenyuan(record)" />
          </template>
          <template #workerType="{ text, record }">
            <a-select v-model:value="record.workerType" style="width: 100%" placeholder="请选择">
              <a-select-option value="1">负责人</a-select-option>
              <a-select-option value="2">维修人员</a-select-option>
            </a-select>
          </template>
          <template #startTime="{ text, record }">
            <a-date-picker
              v-model:value="record.startTime"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
            />
          </template>
          <template #endTime="{ text, record }">
            <a-date-picker
              v-model:value="record.endTime"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
            />
          </template>
          <template #pauseReason="{ text, record }">
            <a-textarea v-model:value="record.pauseReason" auto-size placeholder="请输入" />
          </template>
          <template #workContent="{ text, record }">
            <a-textarea v-model:value="record.workContent" auto-size placeholder="请输入" />
          </template>
          <template #remark="{ text, record }">
            <a-textarea v-model:value="record.remark" auto-size placeholder="请输入" />
          </template>
          <!--          <template #tableSlot></template>-->
        </BasicTable>
      </template>
      <!--备件明细插槽table-->
      <template #tableSlotBeijian>
        <BasicTable class="ml3" @register="registerTableBeijian" :rowSelection="rowSelectionBeijian">
          <template #tableTitle>
            <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAddBeijian">添加</a-button>
            <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl, exportParams)"
              >导出
            </a-button>
          </template>
          <!--          <template v-if="checkedKeys.length > 0" #tableTitle>-->
          <!--            <a-dropdown v-if="checkedKeys.length > 0">-->
          <!--              <template #overlay>-->
          <!--                <a-menu>-->
          <!--                  <a-menu-item v-if="!hasPermission('operation:operation_inspection_point_plan:deleteBatch')"-->
          <!--                               @click="batchHandleDelete">-->
          <!--                    <Icon icon="ant-design:delete-outlined" />-->
          <!--                    批量删除-->
          <!--                  </a-menu-item>-->
          <!--                </a-menu>-->
          <!--              </template>-->
          <!--              <a-button>-->
          <!--                批量操作-->
          <!--                <Icon icon="ant-design:down-outlined" />-->
          <!--              </a-button>-->
          <!--            </a-dropdown>-->
          <!--          </template>-->
          <template #action="{ record }">
            <TableAction :actions="getActionsBeijian(record)" />
          </template>

          <template #applyQty="{ text, record }">
            <a-input-number v-model:value="record.applyQty" placeholder="请输入数量" style="width: 100%" />
          </template>
          <template #remark="{ text, record }">
            <a-input-number v-model:value="record.remark" placeholder="请输入" style="width: 100%" />
          </template>
        </BasicTable>
      </template>
      <!--上传附件插槽table-->
      <template #tableSlotFujian>
        <BasicTable @register="registerTableUpdate" :rowSelection="rowSelectionFujian">
          <template #tableTitle>
            <!--        <BasicUpload :maxSize="20000" :maxNumber="10"  :api="uploadApi" class="my-5" :accept="['png/*']" />-->
            <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">上传文档 </j-upload-button>
            <!--        <j-upload-button type="primary" preIcon="ant-design:import-outlined"  @click="handleImport">上传文档 </j-upload-button>-->

            <!--        <a-button v-if="hasPermission('energy:energy_device_info:exportXls')" preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl,exportParams)">-->
            <!--          导出-->
            <!--        </a-button>-->
            <!--        <a-dropdown v-if="checkedKeysUpdate.length > 0">-->
            <!--          <template #overlay>-->
            <!--            <a-menu>-->
            <!--              <a-menu-item @click="batchHandleDeleteFujian">-->
            <!--                <Icon icon="ant-design:delete-outlined" />-->
            <!--                批量删除-->
            <!--              </a-menu-item>-->
            <!--            </a-menu>-->
            <!--          </template>-->
            <!--          <a-button>-->
            <!--            批量操作-->
            <!--            <Icon icon="ant-design:down-outlined" />-->
            <!--          </a-button>-->
            <!--        </a-dropdown>-->
          </template>
          <!--          <template #action="{ record }">-->
          <!--            <TableAction :actions="getActionsUpdate(record)" />-->
          <!--          </template>-->
        </BasicTable>
      </template>
    </BasicForm>

    <template #insertFooter>
      <a-button @click="handleZancun">暂存</a-button>
    </template>

    <DemoModalLingyongdanhao :isDisabled="isDisabled" @register="registerModalLingyongdanhao" @success="successLingyongdanhao" />
    <DemoModalBeijian :isDisabled="isDisabled" @register="registerModalBeijian" @success="successBeijian" />
    <DemoModalRenyuan :isDisabled="isDisabled" @register="registerModalRenyuan" @success="successRenyuan" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import dayjs from 'dayjs';
  import { ref, computed, unref, reactive, watch, onMounted, nextTick } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';

  const activeKey = ref(1);
  const { hasPermission } = usePermission();
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import DemoModalRenyuan from './DemoModalRenyuan.vue';
  import DemoModalLingyongdanhao from './DemoModalLingyongdanhao.vue';
  import DemoModalBeijian from '@/views/nengyuanzhan/shengchanguanli/beijianguanli/beijiantaizhang/DemoModalBeijian.vue';

  const [registerModalLingyongdanhao, { openModal: openModalLingyongdanhao }] = useModal();
  const [registerModalBeijian, { openModal: openModalBeijian }] = useModal();
  const [registerModalRenyuan, { openModal: openModalRenyuan }] = useModal();
  import { getDemoById, saveExecute, getRepairWorkloadList } from './demo.api';
  import { getOptionLabel, normalizeIdList, normalizeNumberId, normalizeRepairOrderRecord, stringifyIdList } from './repairOrderFields';
  import { getTreeListBanzu } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banzuguanli/demo.api';
  import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';
  import { getTreeListGuzhangyuanyin } from '@/views/nengyuanzhan/shengchanguanli/weixiubaoyang/shebeiguzhangku/demo.api';
  import { BasicColumn, BasicTable, TableAction, useTable } from '@/components/Table';
  import { useMethods } from '@/hooks/system/useMethods';
  import { filterObj, getFileAccessHttpUrl } from '@/utils/common/compUtils';
  import { getTreeListWeixiuleibie } from '@/views/nengyuanzhan/shengchanguanli/weixiubaoyang/weixiujingyanku/demo.api';
  import { queryTreeList } from '@/api/common/api';
  import { getExportUrl } from '@/views/nengyuanzhan/shengchanguanli/shebeiguanli/shebeitaizhang/demo.api';
  import { useListPage } from '@/hooks/system/useListPage';
  import { getFileInfo } from '@/views/nengyuanzhan/shengchanguanli/xunjiandianjian/xunjianjihua/demo.api';

  import { getImportUrlFujian, getGongdanfujianList } from './demo.api';

  const { handleExportXls, handleImportXls } = useMethods();

  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const checkedRows = ref<any[]>([]);
  const checkedKeys = ref<Array<string | number>>([]);
  const selectedRowsFujian = ref<any[]>([]);
  const checkedKeysBeijian = ref<Array<string | number>>([]);
  const selectedRowsBeijian = ref<any[]>([]);
  const attachmentTableData = ref<any[]>([]);
  const orderId = ref(0);
  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });
  const exportParams = computed(() => {
    let paramsForm = {
      // id: id.value,
    };
    if (checkedKeys.value && checkedKeys.value.length > 0) {
      paramsForm['selections'] = checkedKeys.value.join(',');
    }
    return filterObj(paramsForm);
  });
  const formSchema: FormSchema[] = [
    {
      field: 'id',
      label: 'id',
      component: 'Input',
      show: false,
    },
    {
      field: 'createBy',
      label: 'createBy',
      component: 'Input',
      show: false,
    },
    {
      field: 'createTime',
      label: 'createTime',
      component: 'Input',
      show: false,
    },
    {
      field: 'baseTitle',
      component: 'Divider',
      label: '维修工单',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'orderNo',
      label: '工单单号',
      component: 'Input',
      required: false,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'theme',
      label: '工单主题',
      component: 'Input',
      required: false,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },
    {
      field: 'orderType',
      label: '工单类型',
      component: 'Select',
      required: false,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        options: [
          { label: '报修工单', value: '报修工单' },
          { label: '快速工单', value: '快速工单' },
        ],
        style: { width: '100%' },
      },
    },
    {
      field: 'faultOrderNo',
      label: '故障报修单',
      component: 'Input',
      required: false,
      colProps: { span: 12 },
      ifShow: ({ values }) => {
        return values.faultOrderNo;
      },
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },
    {
      field: 'assignerName',
      label: '派单人员',
      component: 'Input',
      required: false,
      colProps: { span: 12 },
      ifShow: ({ values }) => {
        return values.faultOrderNo;
      },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'groupName',
      label: '部门名称',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      ifShow: ({ values }) => {
        return values.faultOrderNo;
      },
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },
    {
      field: 'faultTime',
      label: '制单时间',
      component: 'DatePicker',
      required: true,
      colProps: { span: 12 },
      ifShow: ({ values }) => {
        return values.faultOrderNo;
      },
      componentProps: {
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      field: 'repairTeamId',
      label: '维修班组',
      component: 'ApiSelect',
      colProps: { span: 12 },
      required: true,
      componentProps: {
        disabled: true,
        api: getTreeListBanzu,
        labelField: 'groupName', // 下拉显示文字
        valueField: 'id', // 实际提交值
        immediate: true, // 页面加载立即请求
        onChange: (value, option) => {
          console.log('选中的值', value);
          console.log('选中的项', option);
          setFieldsValue({
            leaderId: normalizeNumberId(option?.leader),
            leaderName: option?.leaderName,
            repairTeamName: getOptionLabel(option, 'groupName'),
          });
        },
      },
    },
    {
      field: 'repairLeaderName',
      label: '负责人',
      component: 'Input',
      required: false,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },
    {
      field: 'otherWorkerIds',
      label: '其他维修人',
      component: 'ApiSelect',
      required: false,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        mode: 'multiple',
        api: getTreeListRenyuan,
        labelField: 'label', // 下拉显示文字
        valueField: 'id', // 实际提交值
        immediate: true, // 页面加载立即请求
        onChange: (value, option) => {
          console.log('选中的值', value);
          console.log('选中的项', option);
          let arr = Array.isArray(option) ? option.map((item) => getOptionLabel(item)).filter(Boolean) : [];
          // console.log(arr,`${arr}`,'aaaaaaaaa');
          setFieldsValue({
            otherWorkerNames: `${arr}`,
          });
        },
      },
    },
    {
      field: 'otherWorkerNames',
      label: '其他维修人(label)',
      component: 'Input',
      required: false,
      colProps: { span: 12 },
      show: false,
    },
    {
      field: 'remark',
      label: '备注',
      component: 'InputTextArea',
      required: false,
      colProps: { span: 24 },
      componentProps: {
        rows: 3,
        disabled: false,
        style: { width: '100%' },
      },
    },

    {
      field: 'baseTitle2',
      component: 'Divider',
      label: '处理情况',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'faultReasonId',
      label: '故障原因',
      component: 'ApiSelect',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        api: getTreeListGuzhangyuanyin, // 请求接口
        labelField: 'reasonName', // 下拉显示文字
        valueField: 'id', // 实际提交值
        immediate: true, // 页面加载就请求接口
        allowClear: true, // 可以清空
        style: { width: '100%' },
      },
    },
    {
      field: 'repairLevel',
      label: '维修级别',
      component: 'Select',
      required: true,
      // defaultValue: 1,
      colProps: { span: 12 },
      componentProps: {
        disabled: false,
        options: [
          { label: '大修', value: '1' },
          { label: '中修', value: '2' },
          { label: '小修', value: '3' },
          { label: '项修(项目修理)', value: '4' },
          { label: '设备改造', value: '5' },
          { label: '计划外修理', value: '6' },
        ],
      },
    },
    {
      field: 'repairType',
      label: '维修类型',
      component: 'ApiTreeSelect',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        api: getTreeListWeixiuleibie, // 请求接口
        immediate: true, // 页面加载就请求接口
        allowClear: true, // 可以清空
        treeDefaultExpandAll: true, // 默认展开所有节点
        fieldNames: {
          label: 'categoryName', // 下拉显示文字
          value: 'id', // 实际提交值
          children: 'children',
        },
      },
    },
    {
      field: 'urgencyLevel',
      label: '紧急程度',
      component: 'Select',
      required: false,
      // defaultValue: 1,
      colProps: { span: 12 },
      componentProps: {
        disabled: false,
        options: [
          { label: '紧急', value: '1' },
          { label: '高', value: '2' },
          { label: '中', value: '3' },
          { label: '低', value: '4' },
        ],
      },
    },
    {
      field: 'isDowntime',
      label: '是否停机',
      component: 'Switch',
      required: false,
      colProps: { span: 12 },
      defaultValue: 0,
      componentProps: {
        checkedChildren: '是',
        unCheckedChildren: '否',
        checkedValue: 1,
        unCheckedValue: 0,
      },
    },
    {
      field: 'realStartTime',
      label: '开始时间',
      component: 'DatePicker',
      required: false,
      colProps: { span: 12 },
      componentProps: {
        disabled: false,
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      field: 'realEndTime',
      label: '结束时间',
      component: 'DatePicker',
      required: false,
      colProps: { span: 12 },
      componentProps: {
        disabled: false,
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      field: 'totalDuration',
      label: '维修总时长',
      component: 'Input',
      required: false,
      colProps: { span: 12 },
      componentProps: {
        suffix: '小时',
      },
    },
    {
      field: 'repairCost',
      label: '维修费用',
      component: 'InputNumber',
      required: false,
      colProps: { span: 12 },
      suffix: '元',
      componentProps: {
        style: { width: '100%' },
      },
    },
    {
      field: 'workDescription',
      label: '工作描述',
      component: 'InputTextArea',
      required: false,
      colProps: { span: 24 },
      slot: 'workDescription',
    },

    {
      field: 'baseTitle3',
      component: 'Divider',
      label: '工作量',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },

    {
      field: 'tableSlot',
      label: '',
      component: 'Input',
      slot: 'tableSlot',
      colProps: { span: 24 },
    },

    {
      field: 'baseTitle4',
      component: 'Divider',
      label: '更换备件',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'isChangePart',
      label: '是否更换备件',
      component: 'RadioGroup',
      required: true,
      colProps: { span: 12 },
      defaultValue: 'N',
      componentProps: {
        options: [
          { label: '是', value: 'Y' },
          { label: '否', value: 'N' },
        ],
      },
    },
    // {
    //   field: 'assocType',
    //   label: '关联方式',
    //   component: 'RadioGroup',
    //   required: true,
    //   colProps: { span: 12 },
    //   ifShow: ({ values }) => {
    //     return values.isChangePart === 'Y';
    //   },
    //   defaultValue: 1,
    //   componentProps: {
    //     options: [
    //       { label: '关联已有单据', value: 1 },
    //       { label: '申请备件领用', value: 0 },
    //     ],
    //   },
    // },
    // {
    //   label: '领用单号',
    //   field: 'applyNo',
    //   component: 'InputSearch',
    //   colProps: { span: 12 },
    //   required: true,
    //   ifShow: ({ values }) => {
    //     return values.isChangePart === 'Y';
    //   },
    //   componentProps: ({ formModel }) => {
    //     return {
    //       placeholder: '请选择',
    //       disabled: formModel.assocType === 0,
    //       onSearch: () => {
    //         handleLingyongdanhao();
    //       },
    //     };
    //   },
    // },
    {
      field: 'Atheme',
      label: '领用主题',
      component: 'Input',
      required: false,
      colProps: { span: 12 },
      ifShow: ({ values }) => {
        return values.isChangePart === 'Y';
      },
      componentProps: ({ formModel }) => {
        return {
          placeholder: '请选择',
          // disabled: formModel.assocType === 1,
        };
      },
    },
    {
      field: 'applyTime',
      label: '取件时间',
      component: 'DatePicker',
      required: false,
      colProps: { span: 12 },
      ifShow: ({ values }) => {
        return values.isChangePart === 'Y';
      },
      componentProps: ({ formModel }) => {
        return {
          placeholder: '请选择',
          // disabled: formModel.assocType === 1,
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
        };
      },
    },
    // {
    //   field: 'warehouseName',
    //   label: '仓库名称',
    //   component: 'Input',
    //   required: false,
    //   ifShow: ({ values }) => {
    //     return values.isChangePart === 'Y';
    //   },
    //   colProps: { span: 12 },
    //   componentProps: ({ formModel }) => {
    //     return {
    //       placeholder: '请选择',
    //       disabled: formModel.assocType === 1,
    //       style: { width: '100%' },
    //     };
    //   },
    // },
    // {
    //   field: 'warehouseId',
    //   label: '仓库ID',
    //   component: 'Input',
    //   required: false,
    //   show:false,
    //   colProps: { span: 12 },
    //   componentProps: ({ formModel }) => {
    //     return {
    //       placeholder: '请选择',
    //       disabled: formModel.assocType === 1,
    //       style: { width: '100%' },
    //     };
    //   },
    // },
    // {
    //   field: 'applicantId',
    //   label: '领用申请人',
    //   component: 'ApiSelect',
    //   colProps: { span: 12 },
    //   required: false,
    //   ifShow: ({ values }) => {
    //     return values.isChangePart === 'Y';
    //   },
    //   componentProps: {
    //     disabled: true,
    //     api: getTreeListRenyuan,
    //     labelField: 'label', // 下拉显示文字
    //     valueField: 'id', // 实际提交值
    //     immediate: true, // 页面加载立即请求
    //   },
    // },
    // {
    //   field: 'applicantName',
    //   label: '负责人(label)',
    //   component: 'Input',
    //   show: false,
    // },
    // {
    //   field: 'AdeptId',
    //   label: '所在部门',
    //   component: 'JSelectDept',
    //   colProps: { span: 12 },
    //   ifShow: ({ values }) => {
    //     return values.isChangePart === 'Y';
    //   },
    //   componentProps: {
    //     showButton: false,
    //     style: {
    //       width: '100%',
    //     },
    //     labelKey: 'departName',
    //     rowKey: 'orgCode',
    //   },
    // },
    // {
    //   field: 'AdeptName',
    //   label: '所在部门',
    //   component: 'Input',
    //   required: false,
    //   show: false,
    //   // ifShow: ({ values }) => {
    //   //   return values.isChangePart === 'Y';
    //   // },
    //   colProps: { span: 12 },
    //   componentProps: {
    //     disabled: true,
    //     style: { width: '100%' },
    //   },
    // },
    {
      field: 'applyReason',
      label: '领用原因',
      component: 'Input',
      required: false,
      ifShow: ({ values }) => {
        return values.isChangePart === 'Y';
      },
      colProps: { span: 12 },
      componentProps: ({ formModel }) => {
        return {
          placeholder: '请输入',
          // disabled: formModel.assocType === 1,
          style: { width: '100%' },
        };
      },
    },
    {
      field: 'Aremark',
      label: '备注',
      component: 'InputTextArea',
      required: false,
      ifShow: ({ values }) => {
        return values.isChangePart === 'Y';
      },
      colProps: { span: 24 },
      componentProps: {
        rows: 3,
        // disabled: true,
        style: { width: '100%' },
      },
    },

    {
      field: 'baseTitle5',
      component: 'Divider',
      label: '备件明细',
      ifShow: ({ values }) => {
        return values.isChangePart === 'Y';
      },
      componentProps: {
        //是否虚线
        dashed: false,
        //分割线标题的位置（left | right | center）
        orientation: 'left',
        //文字是否显示为普通正文样式
        plain: true,
        //水平还是垂直类型（horizontal | vertical）
        type: 'horizontal',
      },
    },
    {
      field: 'tableSlotBeijian',
      label: '',
      component: 'Input',
      ifShow: ({ values }) => {
        return values.isChangePart === 'Y';
      },
      slot: 'tableSlotBeijian',
      colProps: { span: 24 },
    },
    {
      field: 'baseTitle6',
      component: 'Divider',
      label: '上传附件',
      ifShow: ({ values }) => {
        return values.isChangePart === 'Y';
      },
      componentProps: {
        //是否虚线
        dashed: false,
        //分割线标题的位置（left | right | center）
        orientation: 'left',
        //文字是否显示为普通正文样式
        plain: true,
        //水平还是垂直类型（horizontal | vertical）
        type: 'horizontal',
      },
    },
    {
      field: 'tableSlotFujian',
      label: '',
      component: 'Input',
      ifShow: ({ values }) => {
        return values.isChangePart === 'Y';
      },
      slot: 'tableSlotFujian',
      colProps: { span: 24 },
    },

    {
      field: 'baseTitle3323',
      component: 'Divider',
      label: '上传图片',
      componentProps: {
        //是否虚线
        dashed: false,
        //分割线标题的位置（left | right | center）
        orientation: 'left',
        //文字是否显示为普通正文样式
        plain: true,
        //水平还是垂直类型（horizontal | vertical）
        type: 'horizontal',
      },
    },

    {
      field: 'images',
      label: '上传图片',
      required: false,
      helpMessage: '最多上传10张图片',
      component: 'JImageUpload',
      componentProps: {
        //按钮显示文字
        text: '上传图片',
        //支持两种基本样式picture和picture-card
        // listType:'picture-card',
        //用于控制文件上传的业务路径,默认temp
        // bizPath:'temp',
        //是否禁用
        disabled: false,
        //最大上传数量
        fileMax: 10,
      },
    },
  ];
  //表单配置
  const [registerForm, { resetFields, clearValidate, getFieldsValue, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 150,
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
    schemas: formSchema,
    showActionButtonGroup: false,
  });

  function getActions(record) {
    return [
      // {
      //   label: '下载',
      //   onClick: handleDownLoad.bind(null, record),
      //   // auth: 'operation:operation_inspection_point_plan:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      //
      // },
      // {
      //   label: '预览',
      //   onClick: handleDetail.bind(null, record),
      // },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
        // auth: 'operation:operation_inspection_point_plan:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
    ];
  }

  function getActionsBeijian(record) {
    return [
      // {
      //   label: '下载',
      //   onClick: handleDownLoad.bind(null, record),
      //   // auth: 'operation:operation_inspection_point_plan:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      //
      // },
      // {
      //   label: '预览',
      //   onClick: handleDetail.bind(null, record),
      // },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDeleteBeijian.bind(null, record),
        },
        // auth: 'operation:operation_inspection_point_plan:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
    ];
  }

  const columnsTable: BasicColumn[] = [
    {
      title: '姓名(必填)',
      dataIndex: 'workerName',
      width: 200,
      resizable: true,
      slots: {
        customRender: 'workerName',
      },
    },
    // {
    //   title: '姓名（label）',
    //   dataIndex: 'workerName',
    //   width: 130,
    //   resizable: true,
    // },
    {
      title: '类型(必填)',
      dataIndex: 'workerType',
      width: 130,
      resizable: true,
      slots: {
        customRender: 'workerType',
      },
    },
    {
      title: '开始时间(必填)',
      dataIndex: 'startTime',
      slots: {
        customRender: 'startTime',
      },
      // edit: true,
      // editComponent: 'DatePicker',
      // editComponentProps: {
      //   showTime: true,
      //   timer:true,
      //   valueFormat: 'YYYY-MM-DD HH:mm',
      //   format: 'YYYY-MM-DD HH:mm',
      // },
      width: 250,
    },
    {
      title: '完成时间(必填)',
      dataIndex: 'endTime',
      slots: {
        customRender: 'endTime',
      },
      // edit: true,
      // editComponent: 'DatePicker',
      // editComponentProps: {
      //   timer:true,
      //   valueFormat: 'YYYY-MM-DD HH:mm',
      //   format: 'YYYY-MM-DD HH:mm',
      // },
      width: 250,
    },
    {
      title: '维修用时(小时)',
      dataIndex: 'durationHour',
      width: 200,
      resizable: true,
    },
    {
      title: '暂停原因',
      dataIndex: 'pauseReason',
      slots: {
        customRender: 'pauseReason',
      },
    },
    {
      title: '维修内容',
      dataIndex: 'workContent',
      slots: {
        customRender: 'workContent',
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      slots: {
        customRender: 'remark',
      },
    },
  ];
  const [registerTable, { getDataSource: getDataSourceGongzuoliang, setTableData }] = useTable({
    title: '',
    // api: getDemoListAll,
    columns: columnsTable,
    formConfig: {
      //labelWidth: 120,
      // schemas: searchFormSchema,
      // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
      // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
      autoAdvancedCol: 3,
      actionColOptions: {
        style: { textAlign: 'left' },
      },
    },
    //自定义默认排序
    defSort: {
      // column: 'createTime,sex',
      // order: 'desc',
    },
    striped: true,
    useSearchForm: false,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: false,
    pagination: false, // 🔥 直接不显示分页
    rowKey: 'id',
    // beforeFetch: (params) => {
    //   return {
    //     ...params,
    //     tabType: activeKey.value,
    //   };
    // },
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });
  /*备件明细table*/
  const columnsTableBeijian: BasicColumn[] = [
    {
      title: '备件编码',
      dataIndex: 'partCode',
      width: 170,
      resizable: true,
    },
    {
      title: '备件名称',
      dataIndex: 'partName',
      width: 170,
      resizable: true,
    },
    {
      title: '规格型号',
      dataIndex: 'specModel',
      width: 130,
      resizable: true,
    },
    {
      title: '备件类型',
      dataIndex: 'partType',
      width: 130,
      resizable: true,
    },
    // {
    //   title: '品牌',
    //   dataIndex: 'brand',
    //   width: 140,
    //   resizable: true,
    // },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 140,
      resizable: true,
    },
    {
      title: '当前库存',
      dataIndex: 'stockQty',
      width: 140,
      resizable: true,
    },
    {
      title: '领用数量',
      dataIndex: 'applyQty',
      slots: {
        customRender: 'applyQty',
      },
      width: 200,
    },
    // {
    //   title: '存放位置', //后端给的是设备位置
    //   dataIndex: 'storageLocation',
    //   width: 140,
    //   resizable: true,
    // },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 140,
      resizable: true,
      slots: {
        customRender: 'remark',
      },
      customRender: ({ text, record }) => {
        // assocType === 1
        console.log(text, record, '插槽里的数据');
      },
      // edit: () => {
      //   const { assocType } = getFieldsValue();
      //   return assocType === 1; // 👈 关联已有单据 才能编辑
      // },
      // editRule: () => {
      //   const { assocType } = getFieldsValue();
      //   return assocType === 1;
      // },
      // editComponent: 'Input',
    },
  ];
  const [registerTableBeijian, { getDataSource: getDataSourceBeijian, setTableData: setTableDataBeijian }] = useTable({
    title: '',
    // api: getBeijianmingxiList,
    columns: columnsTableBeijian,
    formConfig: {
      //labelWidth: 120,
      // schemas: searchFormSchema,
      // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
      // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
      // autoAdvancedCol: 3,
      // actionColOptions: {
      //   style: { textAlign: 'left' },
      // },
    },
    //自定义默认排序
    defSort: {
      // column: 'createTime,sex',
      // order: 'desc',
    },
    striped: true,
    useSearchForm: false,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: false,
    rowKey: 'id',
    // beforeFetch: (params) => {
    //   return {
    //     ...params,
    //     tabType: activeKey.value,
    //   };
    // },
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });

  /*附件*/
  const checkedKeysUpdate = ref<Array<string | number>>([]);
  const columnsTableUpdata: BasicColumn[] = [
    {
      title: 'id',
      dataIndex: 'id',
      width: 130,
      resizable: true,
      ifShow: false,
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      width: 130,
      resizable: true,
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      width: 130,
      resizable: true,
      ifShow: () => {
        return isUpdate.value;
      },
    },
    {
      title: '上传者',
      dataIndex: 'uploaderName',
      width: 130,
      resizable: true,
      ifShow: () => {
        return isUpdate.value;
      },
    },
    {
      title: '文档大小',
      dataIndex: 'fileSize',
      width: 130,
      resizable: true,
    },
    {
      title: '存储地址',
      dataIndex: 'filePath',
      width: 130,
      resizable: true,
    },
  ];
  const { tableContext: tableContextFujian, onImportXls } = useListPage({
    tableProps: {
      title: '',
      // api: getGongdanfujianList,
      rowKey: 'id',
      columns: columnsTableUpdata,
      formConfig: {
        // schemas: searchFormSchema,
        autoAdvancedCol: 2,
      },
      striped: true,
      bordered: true,
      showIndexColumn: true,
      actionColumn: {
        width: 180,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
        ifShow: false,
      },
    },
    exportConfig: {
      name: '下载模版',
      url: getExportUrl,
    },
    importConfig: {
      // 上传
      url: getImportUrlFujian,
      success: async (res) => {
        let url = getFileAccessHttpUrl(res.message);
        // 传文件名调取文件详情信息
        // let arr = await  getGongdanfujianList()
        //  setTableDataFujian(arr.result)
        //  checkedKeysUpdate.value = [];
        getFileInfo({ url }).then((record) => {
          record.filePath = url;
          attachmentTableData.value = mergeAttachmentRows([record]);
          setTableDataFujian(attachmentTableData.value);
          checkedKeysUpdate.value = [];
          selectedRowsFujian.value = attachmentTableData.value;
          // reload()
        });
      },
    },
  });
  const [registerTableUpdate, { setTableData: setTableDataFujian, getDataSource: getDataSourceFujian }] = tableContextFujian;
  // function getActionsUpdate(record) {
  //   return [
  //     // {
  //     //   label: '下载',
  //     //   onClick: handleDownLoad.bind(null, record),
  //     //   // auth: 'operation:operation_inspection_point_plan:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
  //     //
  //     // },
  //     // {
  //     //   label: '预览',
  //     //   onClick: handleDetail.bind(null, record),
  //     // },
  //     {
  //       label: '删除',
  //       popConfirm: {
  //         title: '是否确认删除',
  //         confirm: handleDelete.bind(null, record),
  //       },
  //       // auth: 'operation:operation_inspection_point_plan:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
  //     },
  //   ];
  // }

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    checkedKeys.value = [];
    checkedRows.value = [];
    checkedKeysUpdate.value = [];
    checkedKeysBeijian.value = [];
    selectedRowsFujian.value = [];
    selectedRowsBeijian.value = [];
    attachmentTableData.value = [];

    const treeDataRenyuan = await getTreeListRenyuan();
    const treeData = await getTreeListBanzu();
    updateSchema([
      {
        field: 'repairTeamId',
        componentProps: {
          treeData,
        },
      },
      {
        field: 'otherWorkerIds',
        componentProps: {
          treeData: treeDataRenyuan,
        },
      },
    ]);

    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    if (data.createBy) {
      await setFieldsValue({ createBy: data.createBy });
    }
    if (data.createTime) {
      await setFieldsValue({ createTime: data.createTime });
    }
    if (unref(isUpdate)) {
      const recordId = data.record?.id ?? data?.recordId;
      orderId.value = recordId;
      // 已经传入完整详情时直接使用，避免工具栏勾选路径出现二次取值不稳。
      data.record = normalizeRepairOrderRecord(data?.skipFetch && data.record ? data.record : await getDemoById({ id: recordId }));
      //表单赋值
      const array = normalizeIdList(data.record.otherWorkerIds);
      const dept = data.record.assignerId ? await queryTreeList({ ids: data.record.assignerId }) : [];
      // console.log(dept,'获取部门');
      await setFieldsValue({
        ...data.record,
        faultReasonId: data.record.faultReasonId ? Number(data.record.faultReasonId) : undefined,
        otherWorkerIds: array,
        leaderId: normalizeNumberId(data.record.leaderId),
        repairLeaderName: data.record.assignerName || data.record.leaderName,
        groupName: data.record.groupName || data.record.deptName || dept?.[0]?.departName,
        workDescription: data.record.workDescription || data.record.faultDesc,
      });
      await clearValidate();
      await waitForEmbeddedTables();

      // 工作量回显
      safelySetTableData(setTableData, await resolveWorkloadList(data.record));

      if (data.record.isChangePart === 'Y') {
        // 回显更换备件
        let byidObj = data.record?.requisition || {};
        let obj = {
          applicantId: byidObj.applicantId, //领用申请人ID
          applicantName: byidObj.applicantName, //领用申请人姓名
          applyNo: byidObj.applyNo, //领用单号 (系统自动生成)
          applyReason: byidObj.applyReason, //领用原因
          applyTime: byidObj.applyTime, //申请时间
          assocType: 2, //关联方式 (1-关联已有单据, 2-申请备件领用)
          createTime: byidObj.createTime, //createTime
          AdeptId: byidObj.deptId, //所在部门ID
          AdeptName: byidObj.deptName, //所在部门名称
          id: byidObj.id, //主键ID
          Aremark: byidObj.remark, //备注
          repairOrderId: byidObj.repairOrderId || data.record.id, //关联维修工单ID
          repairOrderNo: byidObj.repairOrderNo || data.record.orderNo, //关联维修工单号
          Atheme: byidObj.theme, //领用主题
          updateTime: byidObj.updateTime, //updateTime
          // warehouseId:values.warehouseId,//仓库ID
          // warehouseName:values.warehouseName,//仓库名称
        };
        await setFieldsValue({
          // ...data.record,
          // faultReasonId: Number(data.record.faultReasonId),
          // otherWorkerIds: array,
          // leaderId: Number(data.record.leaderId),
          // deptName: dept[0].departName,
          ...obj,
        });
        await waitForEmbeddedTables();
        safelySetTableData(setTableDataBeijian, data.record?.details || []);
        // 回显附件
        // let arr = await getGongdanfujianList();
        // setTableDataFujian(arr.result);
        checkedKeysUpdate.value = [];
        attachmentTableData.value = data.record?.attachments || [];
        selectedRowsFujian.value = attachmentTableData.value;
        safelySetTableData(setTableDataFujian, attachmentTableData.value);
      }
    }
  });

  async function waitForEmbeddedTables() {
    await nextTick();
    await nextTick();
  }

  function safelySetTableData(setter: (data: any[]) => void, data: any[] = []) {
    try {
      setter(data);
    } catch (error) {
      console.warn('Embedded table is not ready yet, skip this sync once.', error);
    }
  }

  async function resolveWorkloadList(record) {
    if (Array.isArray(record?.workloadList) && record.workloadList.length > 0) {
      return normalizeWorkloadList(record.workloadList, record.id);
    }
    if (!record?.id) {
      return [];
    }
    const res = await getRepairWorkloadList({ orderId: record.id, pageNo: 1, pageSize: 999 });
    const rows = Array.isArray(res) ? res : res?.records || res?.result?.records || [];
    return normalizeWorkloadList(rows, record.id);
  }

  function normalizeWorkloadList(rows: any[] = [], fallbackOrderId = orderId.value) {
    return rows.map((item) => ({
      orderId: item.orderId || fallbackOrderId,
      workerId: item.workerId,
      workerName: item.workerName,
      workerType: item.workerType,
      startTime: item.startTime,
      endTime: item.endTime,
      durationHour: item.durationHour,
      pauseReason: item.pauseReason,
      workContent: item.workContent,
      remark: item.remark,
      id: item.id,
    }));
  }

  function buildExecutePayload(values, submitMode) {
    const workloadList = normalizeWorkloadList(getDataSourceGongzuoliang(), values.id);
    const payload: Record<string, any> = {
      ...values,
      otherWorkerIds: stringifyIdList(values.otherWorkerIds),
      workDescription: values.workDescription,
      workloadList,
      submitMode,
    };

    delete payload.assignerName;
    delete payload.repairLeaderName;
    delete payload.groupName;
    delete payload.AdeptId;
    delete payload.AdeptName;
    delete payload.Aremark;
    delete payload.Atheme;
    delete payload.applicantId;
    delete payload.applicantName;
    delete payload.applyNo;
    delete payload.applyReason;
    delete payload.applyTime;

    if (values.isChangePart === 'Y') {
      payload.requisition = {
        applicantId: values.applicantId,
        applicantName: values.applicantName,
        applyNo: values.applyNo,
        applyReason: values.applyReason,
        applyTime: values.applyTime,
        assocType: 2,
        deptId: values.AdeptId,
        deptName: values.AdeptName,
        remark: values.Aremark,
        repairOrderId: values.id,
        repairOrderNo: values.orderNo,
        theme: values.Atheme,
      };
      payload.details = getDataSourceBeijian();
      payload.attachments = attachmentTableData.value;
    }

    return payload;
  }

  const rowSelectionFujian = {
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeysUpdate,
    onChange: onSelectChangeUpdate,
  };
  const rowSelectionBeijian = {
    type: 'checkbox',
    columnWidth: 40,
    fixed: 'left',
    selectedRowKeys: checkedKeysBeijian,
    onChange: onSelectChangeBeijian,
  };

  function onSelectChangeBeijian(selectedRowKeys: (string | number)[], selectedRows) {
    console.log('checkedKeys222------>', checkedKeys);
    checkedKeysBeijian.value = selectedRowKeys;
    selectedRowsBeijian.value = selectedRows;
  }

  function onSelectChangeUpdate(selectedRowKeys: (string | number)[], selectedRows) {
    console.log('checkedKeys222------>', checkedKeys);
    checkedKeysUpdate.value = selectedRowKeys;
    selectedRowsFujian.value = selectedRows;
  }

  /**
   * 选择列配置
   */
  const rowSelection = {
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys,
    fixed: 'left',
    onChange: onSelectChange,
  };

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[], selectedRows) {
    console.log('checkedKeys------>', checkedKeys, selectedRows);
    checkedKeys.value = selectedRowKeys;
    checkedRows.value = selectedRows;
  }

  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '执行维修工单' : '执行维修工单'));

  const index = ref(0);
  const id = ref(0);

  async function handleDelete(record) {
    let arr = getDataSourceGongzuoliang();
    arr.forEach((item, index) => {
      if (item.id === record.id) {
        arr.splice(index, 1);
      }
    });
    setTableData(arr);
  }

  async function handleDeleteBeijian(record) {
    let arr = getDataSourceBeijian();
    arr.forEach((item, index) => {
      if (item.id === record.id) {
        arr.splice(index, 1);
      }
    });
    setTableDataBeijian(arr);
  }

  function handleAdd() {
    let arr = getDataSourceGongzuoliang();
    arr.push({
      id: index.value,
      orderId: orderId.value,
    });
    index.value++;
    setTableData(arr);
  }

  function handleLingyongdanhao() {
    openModalLingyongdanhao(true, {
      record: {},
      isUpdate: false,
    });
  }

  function handleAddBeijian() {
    openModalBeijian(true, {
      record: {},
      isUpdate: false,
    });
  }

  function onEditChange({ column, value, record }) {
    // 本例
    // if (column.dataIndex === 'id') {
    //   record.editValueRefs.name4.value = `${value}`;
    // }
    console.log(column, value, record);
  }

  function addRenyuan(record) {
    id.value = record.id;
    openModalRenyuan(true, {
      // record,
      // isUpdate: false,
    });
  }

  function successRenyuan(obj) {
    console.log(obj, '选择的人员');
    let arr = getDataSourceGongzuoliang();
    arr.forEach((item) => {
      if (item.id === id.value) {
        item.workerId = obj.id;
        item.workerName = obj.employeeName;
      }
    });
    setTableData(arr);
  }

  function successLingyongdanhao(obj) {
    console.log(obj, '获取的领用单号');
    // let arr = getDataSource();
    // arr.forEach((item) => {
    //   if (item.id === id.value) {
    //     item.workerId = obj.id;
    //     item.workerName = obj.employeeName;
    //   }
    // });
    // setTableData(arr)
  }

  function successBeijian(arr) {
    console.log(arr, '获取的备件数组');
    let oldArr = getDataSourceBeijian();
    // arr.forEach((item) => {
    //   if (item.id === id.value) {
    //     item.workerId = obj.id;
    //     item.workerName = obj.employeeName;
    //   }
    // });
    let newArr = arr.map((item) => {
      return {
        partCode: item.deviceCode, //备件编码
        partName: item.deviceName, //备件名称
        specModel: item.deviceModule, //规格型号
        partType: '', //备件类型
        brand: '', //品牌
        unit: '', //单位
        stockQty: '', //当前库存
        storageLocation: item.spaceId, //存放位置
      };
    });
    // console.log([...oldArr,...newArr],'aaaaaaaaaaaaaaaaaaaa');
    setTableDataBeijian([...oldArr, ...newArr]);
  }

  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      const obj = buildExecutePayload(values, 'confirm');
      setModalProps({ confirmLoading: true });
      await saveExecute(obj);
      closeModal();
      emit('success', obj);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  //暂存
  async function handleZancun() {
    try {
      let values = await validate();
      const obj = buildExecutePayload(values, 'temp');
      setModalProps({ confirmLoading: true });
      await saveExecute(obj);
      closeModal();
      emit('success', obj);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  onMounted(() => {
    watch(
      () => activeKey.value,
      (newVal) => {},
      { deep: true }
    );
  });

  function mergeAttachmentRows(rows) {
    const map = new Map();
    [...(attachmentTableData.value || []), ...(rows || [])].forEach((item) => {
      const key = item.id ?? item.filePath ?? item.fileUrl ?? item.fileName;
      map.set(String(key), item);
    });
    return Array.from(map.values());
  }
</script>
