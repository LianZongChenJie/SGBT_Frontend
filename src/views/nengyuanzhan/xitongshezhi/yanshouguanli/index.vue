<template>
<div class="box" style="padding:10px;">
  <a-row :gutter="10" style="width:100%;">
    <a-col :span="8" v-for="(list,index) in lists" :key="index" class="mb2">
      <a-card :title="list.formName" >
        <template #extra>
          <a-switch
            v-if="hasPermission('operation:operation_acceptance_config:changeStatus')"
            @change="changeStatus(list)"
            v-model:checked="list.isEnable"
            :checkedValue="1"
            :unCheckedValue="0"
          />
        </template>
        <p>适用范围:{{list.scopeNames}}</p>
        <p>验证人：{{list.acceptorNames}}</p>
        <p>操作时间：{{list.createTime}}</p>
        <div class="flex flex-justify-end">
          <a-button v-if="hasPermission('operation:operation_acceptance_config:edit')" type="link" @click="handleEdit(list)">设置</a-button>
        </div>
      </a-card>
    </a-col>
  </a-row>
  <DemoModal @register="registerModal"  :isDisabled="isDisabled" @success="success"/>
</div>
</template>

<script setup lang="ts">
import { usePermission } from '/@/hooks/web/usePermission';
const { hasPermission } = usePermission();
import {ref} from "vue"
const isDisabled = ref(false);
import DemoModal from './DemoModal.vue';
import { useModal } from '@/components/Modal';
import { getDemoList,setChangeStatus } from './demo.api';
const [registerModal, { openModal }] = useModal();
const lists = ref([
  // {checked:true,title:'维修工单'},
  // {checked:true,title:'维修快速工单'},
  // {checked:true,title:'巡检任务'},
  // {checked:true,title:'点检任务'},

])

function handleEdit(record) {
  isDisabled.value = false;
  openModal(true, {
    record,
    isUpdate: true,
  });
}
async function changeStatus(list) {
 await setChangeStatus({id: list.id, status: list.isEnable},init )
}
function success() {
  init()
}

async function init() {
  let arr  = await getDemoList()
  lists.value = arr.records;
  // console.log(lists.value,'aaaaaa');
}
init()
</script>

<style scoped lang="less">

</style>
