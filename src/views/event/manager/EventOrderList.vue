<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
      <!--      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">新增
        </a-button>
      </template>-->
    </BasicTable>
    <OrderModal @register="registerModal" @success="reload" />
    <DetailModal @register="registerModal2" @success="reload" :footer="null" @handleTakeOrder='handleTakeOrder'
      @doAction="doAction">
    </DetailModal>
    <UserSelect @register="registerModal3" @success="reload" />
    <Assign @register="registerModal7" @success="reload" />
    <Process @register="registerModal4" @success="reload" />
    <Check @register="registerModal5" @success="reload" />
    <default-process @register="registerModal8" @success="reload" />
    <time-out-process @register="registerModal9" @success="reload" />
    <Appraise @register="registerModal6" @success="reload" style="position: relative;z-index:10000;" />
    <SpareParts @register="registerModal10" @success="reload" />
  </div>
</template>
<script setup lang="ts" name="OrderList">
import BasicTable from "@/components/Table/src/BasicTable.vue";
import { useListPage } from "@/hooks/system/useListPage";
import {
  getEventOrderList, takeOrder
} from "./eventOrder.api";
import { columns, searchFormSchema } from "./event.data";
import { useMessage } from "@/hooks/web/useMessage";
import { useModal } from "@/components/Modal";
import OrderModal from './eventModel.vue';
import DetailModal from './detailModel.vue';
import TableAction from "@/components/Table/src/components/TableAction.vue";
import UserSelect from "@/views/event/manager/userSelect.vue";
import Process from "@/views/event/manager/process.vue";
import Check from "@/views/event/manager/check.vue";
import Appraise from "@/views/event/manager/appraise.vue";
import Assign from "@/views/event/manager/assign.vue";
import DefaultProcess from "@/views/event/manager/defaultProcess.vue";
import TimeOutProcess from "@/views/event/manager/timeOutProcess.vue";
import SpareParts from "@/views/event/manager/spareParts.vue";
import { ref } from 'vue';

const { createMessage } = useMessage();
const [registerModal] = useModal();
const [registerModal2, { openModal: openModal2 }] = useModal();
const [registerModal3, { openModal: openModal3 }] = useModal();
const [registerModal4, { openModal: openModal4 }] = useModal();
const [registerModal5, { openModal: openModal5 }] = useModal();
const [registerModal6, { openModal: openModal6 }] = useModal();
const [registerModal7, { openModal: openModal7 }] = useModal();
const [registerModal8, { openModal: openModal8 }] = useModal();
const [registerModal9, { openModal: openModal9 }] = useModal();
const [registerModal10, { openModal: openModal10 }] = useModal();
const { tableContext } = useListPage({
  designScope: 'eventOder-template',
  tableProps: {
    title: '事件工单',
    api: getEventOrderList,
    columns: columns,
    formConfig: {
      schemas: searchFormSchema,
    },
    actionColumn: {
      width: 160,
      fixed: 'right',
    },
    showIndexColumn: true,
  }
});
const [registerTable, { reload }] = tableContext;
/**
 * 新增事件
 */
// function handleAdd() {
//   openModal(true, {
//     isUpdate: false,
//   });
// }

/**
 * 操作列定义
 * @param record
 */
function getActions(record: any) {
  let actions = [
    {
      label: '详情',
      onClick: doAction.bind(null, record, '详情')
    }
  ];
  return actions;
}
/**
 * 下拉操作栏
 */
function getDropDownAction(record: any) {
  // 创建响应式数组
  const actions = ref<any[]>([]);
  let eventOperationList = record.eventOperationList;
  //label 对应 eventCode
  //每个执行函数都不一样
  //最前面需要追加详情按钮
  // 动态生成操作按钮
  eventOperationList.forEach((item: any) => {
    if (item.name === '接单') {
      actions.value.push({
        label: item.name,
        popConfirm: {
          title: '确认接单?',
          confirm: handleTakeOrder.bind(null, record)// 确保传递正确的参数
        },
        onClick: () => {
        } // 添加空函数满足类型要求
      } as any); // 使用类型断言绕过类型检查
    } else {
      actions.value.push({
        label: item.name,
        onClick: doAction.bind(null, record, item.name, item.code)
      });
    }
  });
  return actions.value;
}
function doAction(record: any, name: any, code: any) {
  if (name == '详情') {
    openModal2(true, {
      record,
      isUpdate: true,
      showFooter: false,
    });
    return;
  }
  if (name == '接单') {
    takeOrder({
      id: record.id
    });
    return;
  }
  if (name == '分配') {
    openModal3(true, { record, code });
    return
  }
  if (name == '处理') {
    openModal4(true, { record, code });
    return;
  }
  if (name == '验收') {
    openModal5(true, { record, code });
    return;
  }
  if (name == '评价') {
    openModal6(true, { record, code });
    return;
  }
  if (name == '指派') {
    openModal7(true, { record, code });
    return;
  }
  if (name == '暂停') {
    openModal9(true, { record, code, name });
    return;
  }
  if (name == '备件') {
    openModal10(true, { record, code });
    return;
  }
  openModal8(true, { record, code, name })
}

async function handleTakeOrder(record: any, callback: any) {
  try {
    await takeOrder({
      id: record.id
    });
    // 接单成功后刷新列表
    reload().then(() => {
      createMessage.success('接单成功');
      // 执行回调
      callback?.();
    });

  } catch (error) {
    createMessage.error('接单失败');
    console.error('接单失败:', error);
  }
}

</script>
