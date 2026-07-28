<template>
  <div v-if="visible">
    <div class="button-conditions-text">
      <div style="flex: 1">
        <div class="condition-item" style="display: flex">
          <span style="width: 100px; display: inline-block">提示文字</span>
          <a-tooltip :title="confirmText.tip" placement="top">
            <span class="prompt-text">
              {{ confirmText.tip }}
            </span>
          </a-tooltip>
        </div>

        <div class="condition-item">
          <span style="width: 100px; display: inline-block">确认按钮文字</span>
          <span>
            {{ confirmText.ok }}
          </span>
        </div>

        <div class="condition-item">
          <span style="width: 100px; display: inline-block">取消按钮文字</span>
          <span>
            {{ confirmText.cancel }}
          </span>
        </div>
      </div>
      <div class="button-edit-icon">
        <EditOutlined @click="goEdit" />
      </div>
    </div>

    <a-modal centered v-model:open="modalVisible" title="二次确认" @ok="onOk">
      <div class="button-config" style="padding: 0px 24px 20px">
        <div class="item">
          <h5>提示文字</h5>
          <div class="content">
            <a-textarea v-model:value="confirmText.tip" placeholder="请输入提示文字" :rows="2" />
          </div>
        </div>

        <div class="item">
          <h5>确认按钮文字</h5>
          <div class="content">
            <a-input v-model:value="confirmText.ok" placeholder="请输入确认按钮文字" />
          </div>
        </div>

        <div class="item">
          <h5>取消按钮文字</h5>
          <div class="content">
            <a-input v-model:value="confirmText.cancel" placeholder="请输入取消按钮文字" />
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
  import { reactive, ref, watch } from 'vue';
  import { EditOutlined } from '@ant-design/icons-vue';
  import FilterFiledList from '../select/FilterFiledList.vue';

  export default {
    name: 'ButtonConfirmText',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      // tip-ok-cancel
      info: {
        type: Object,
        default: () => {},
      },
    },
    components: {
      EditOutlined,
      FilterFiledList,
    },
    emits: ['ok'],
    setup(props, { emit }) {
      const confirmText = reactive<any>({
        tip: '',
        ok: '',
        cancel: '',
      });

      watch(
        () => props.info,
        (info) => {
          if (info) {
            Object.keys(confirmText).map((k) => {
              confirmText[k] = info[k];
            });
          }
        },
        { immediate: true }
      );

      const modalVisible = ref(false);
      function goEdit() {
        modalVisible.value = true;
      }
      function onOk() {
        emit('ok', confirmText);
        modalVisible.value = false;
      }

      return {
        confirmText,
        modalVisible,
        onOk,
        goEdit,
      };
    },
  };
</script>

<style lang="less" scoped>
  .button-conditions-text {
    width: 100%;
    border: 1px solid rgb(221, 221, 221);
    border-radius: 3px;
    padding: 4px 12px 6px;
    box-sizing: border-box;
    color: rgb(51, 51, 51);
    margin: 10px 0px;
    display: flex;
    cursor: pointer;
    background: rgb(245, 245, 245);
    border-color: rgb(216, 216, 216);

    .button-edit-icon {
      color: rgb(158, 158, 158);
      font-size: 15px;
      padding-top: 0;
      &:hover {
        color: #0a8fe9;
      }
    }
    .condition-item {
      height: 25px;
      line-height: 25px;
      font-size: 13px;
      span {
        margin: 0px 7px 4px 1px;
      }
      //update-begin---author:wangshuai ---date:20230808  for：【QQYUN-6025】自定义按钮 提示文字太多时，样式问题------------
      .prompt-text{
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        width: 400px;
        display: block;
      }
      //update-end---author:wangshuai ---date:20230808  for：【QQYUN-6025】自定义按钮 提示文字太多时，样式问题------------
    }
  }
</style>
