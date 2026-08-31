<template>
  <div class="bpmSelectUser" v-bind="$attrs">
    <a-select style="width: 300px" mode="multiple" :placeholder="placeholder" :value="selectValue" :options="options" @change="handleChange" />
    <a-button type="primary" @click="openSelect" preIcon="ant-design:search-outlined" style="margin-left: 8px">选择</a-button>
    <a-button type="primary" @click="clearSelected" preIcon="ant-design:reload-outlined" style="margin-left: 8px">清空</a-button>
  </div>
  <teleport to="body">
    <bpm-select-user-modal @register="registerModal" @selected="onSelected" />
  </teleport>
</template>

<script>
  /**
   * 流程审批中选择用户用 - 只管选择，不管回显
   */
  import { ref, toRaw, computed } from 'vue';
  import BpmSelectUserModal from './BpmSelectUserModal.vue';
  import { useModal } from '/@/components/Modal';

  export default {
    name: 'BpmSelectUser',
    components: {
      BpmSelectUserModal,
    },
    props: {
      placeholder: {
        type: String,
        default: '',
      },
    },
    emits: ['change'],
    setup(_p, { emit }) {
      let selectedUserList = [];
      const options = ref([]);
      const selectValue = ref([]);
      const [registerModal, { openModal }] = useModal();
      const lastSelectedRows = ref([]);

      function openSelect() {
        let arr = getModalData();
        openModal(true, {
          selected: arr,
        });
        selectedUserList = [];
      }

      function clearSelected() {
        selectValue.value = [];
      }

      function getModalData() {
        //找rows
        let arr = lastSelectedRows.value;
        //找username
        let arr2 = selectValue.value;
        let dataArray = arr.filter((item) => arr2.indexOf(item.username) >= 0);
        return dataArray;
      }

      function onSelected(data) {
        lastSelectedRows.value = data;
        let arr1 = [],
          arr2 = [];
        if (data && data.length > 0) {
          data.map((item) => {
            arr1.push(item.username);
            arr2.push({ value: item.username });
          });
        }
        selectValue.value = arr1;
        options.value = arr2;
        selectedUserList = data;
        emit('change', data);
      }

      function handleChange(values) {
        selectValue.value = values;
        let data = selectedUserList.filter((item) => values.indexOf(item.username) >= 0);
        emit('change', data);
      }

      return {
        selectValue,
        options,
        openSelect,
        clearSelected,
        onSelected,
        handleChange,
        registerModal,
      };
    },
  };
</script>

<style lang="less" scoped>
  // update-begin--author:liaozhiyang---date:20240605---for：【TV360X-1050】Safari浏览器指定下一步处理人页面控件没对齐
  .ant-select {
    vertical-align: middle;
  }
  // update-end--author:liaozhiyang---date:20240605---for：【TV360X-1050】Safari浏览器指定下一步处理人页面控件没对齐
</style>
