<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose title="常用流程设置" @ok="handleSubmit" width="1200px">
    <!--工单部分-->
    <template v-for="(item, index) of processTypeDictOptions">
      <a-card :title="item.text" :style="{ marginTop: index == 0 ? '0px' : '12px', height: 'auto' }" :headStyle="{ backgroundColor: '#eaeaea' }">
        <a-checkbox-group v-model:value="designNameValue[index]" style="width: 100%">
          <a-row>
            <template v-for="des in designNameOption">
              <a-col :span="6" v-if="des.procType == item.value">
                <a-checkbox :value="des.value">{{ des.text }}</a-checkbox>
              </a-col>
            </template>
          </a-row>
        </a-checkbox-group>
      </a-card>
    </template>
    <!--online表单部分-->
    <template v-if="onlineFormList && onlineFormList.length > 0">
      <a-card title="online表单" :style="{ marginTop: '24px', height: 'auto' }" :headStyle="{ backgroundColor: '#eaeaea' }">
        <a-checkbox-group v-model:value="onlineCommonUserList" style="width: 100%">
          <a-row>
            <template v-for="des in onlineFormList">
              <a-col :span="6">
                <a-checkbox :value="des.id">{{ des.desformName.length > 10 ? des.desformName.substr(0, 10) : des.desformName }}</a-checkbox>
              </a-col>
            </template>
          </a-row>
        </a-checkbox-group>
      </a-card>
    </template>
    <!--树操作部分-->
    <template #insertFooter>
      <a-dropdown placement="top">
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="checkALL">全部勾选</a-menu-item>
            <a-menu-item key="2" @click="cancelCheckALL">取消全选</a-menu-item>
          </a-menu>
        </template>
        <a-button style="float: left"> 树操作 <Icon icon="ant-design:up-outlined" /> </a-button>
      </a-dropdown>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/src/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getCommUseList, roleDegisnList, getOnlineList, addCommUse } from '../apply.api';
  const { createMessage } = useMessage();
  // 声明Emits
  const emit = defineEmits(['success', 'register', 'ok']);
  //原始工单id
  const oldDesignId = ref('');
  //新工单id
  const newDesignId = ref('');
  //工单字典类型
  const processTypeDict = ref([]);
  //工单字典类型项
  const processTypeDictOptions = ref([]);
  //工单集合
  const desformList = ref([]);
  //工单名称集合
  const designNameOption = ref([]);
  //工单数据集合
  const designNameValue = ref([]);
  //online集合
  const onlineFormList = ref([]);
  //online数据集合
  const onlineCommonUserList = ref([]);
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false });
    //初始化数据
    processTypeDict.value = data.processTypeDict;
    loadDesformList();
    queryOnlineFormList();
  });

  /**
   * 初始化工单数据
   */
  async function loadDesformList() {
    //获取表单设计信息
    let res = await roleDegisnList();
    if (res.success) {
      let designList = res.result;
      desformList.value = res.result;
      //获取指定属性的数据集合
      let procTypeArr = [...new Set(Array.from(unref(desformList), ({ procType }) => procType))];
      //工单类型字典项
      processTypeDictOptions.value = processTypeDict.value.filter((item) => procTypeArr.indexOf(item.value) != -1);
      //工单名称集合
      designNameOption.value = designList.map((design) => {
        return { value: design.id, text: design.desformName, procType: design.procType };
      });
    }
    //获取表单信息
    let useRes = await getCommUseList();
    if (useRes.success) {
      let commUseList = useRes.result;
      if (commUseList.length > 0) {
        let onlineList = commUseList.filter((item) => item.formType == 'online');
        let designList = commUseList.filter((item) => item.formType !== 'online');
        let { designName, designValues } = selectedDesign(designList);
        designNameValue.value = designValues;
        onlineCommonUserList.value = onlineList.map((item) => item.id);
        oldDesignId.value = commUseList.map((item) => item.id).join(',');
      } else {
        designNameValue.value = [];
        onlineCommonUserList.value = [];
        oldDesignId.value = '';
      }
    }
  }
  /**
   * 初始化online数据
   */
  async function queryOnlineFormList() {
    onlineFormList.value = [];
    let res = await getOnlineList();
    if (res.success) {
      onlineFormList.value = res.result;
    }
  }
  /**
   * 点击修改
   */
  function designNameChange(selectedValue) {
    newDesignId.value = unref(designNameValue).join(',');
  }
  /**
   * 全选
   */
  function checkALL() {
    let { designName, designValues } = selectedDesign(toRaw(unref(desformList)));
    designNameValue.value = designValues;
    onlineCommonUserList.value = onlineFormList.value.map((item) => item.id);
    newDesignId.value = [...designName, ...toRaw(unref(onlineCommonUserList))].join(',');
  }
  /**
   * 取消全选
   */
  function cancelCheckALL() {
    designNameValue.value = [];
    onlineCommonUserList.value = [];
    newDesignId.value = '';
  }
  /**
   * 选中工单信息
   */
  function selectedDesign(selectedList) {
    let designName = [];
    let designValues = [];
    for (let option of unref(processTypeDictOptions)) {
      let values = [];
      for (let value of selectedList) {
        if (option.value == value.procType) {
          designName.push(value.id);
          values.push(value.id);
        }
      }
      designValues.push(values);
    }
    return { designName, designValues };
  }
  /**
   * 提交事件
   */
  async function handleSubmit() {
    try {
      setModalProps({ confirmLoading: true });
      let formData = {};
      //TODO designNameValue的问题
      let designValues = [];
      unref(designNameValue).forEach((item) => {
        designValues.push.apply(designValues, item);
      });
      formData['newDesignId'] = [...designValues, ...toRaw(unref(onlineCommonUserList))].join(',');
      formData['oldDessignId'] = toRaw(unref(oldDesignId));
      formData['onlineForm'] = onlineCommonUserList.value.join(',');
      //保存常用流程
      let res = await addCommUse(formData);
      if (res.success) {
        createMessage.success(res.message);
        emit('success');
        emit('ok');
      } else {
        createMessage.warning(res.message);
      }
      //关闭弹窗
      closeModal();
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
