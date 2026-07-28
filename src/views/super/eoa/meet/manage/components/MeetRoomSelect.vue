<template>
  <div>
    <a-tooltip>
      <template #title>
        {{ names ? names : '暂无地点' }}
      </template>
      <div>
        <a-input-search v-model:value="names" placeholder="请选择会议地点" readOnly @search="onSearchRoom" :disabled="disabled">
          <template #enterButton>
            <span>选择地点</span>
          </template>
        </a-input-search>
      </div>
    </a-tooltip>
    <MeetRoomSelectModal @register="registerModal" :multi="multi" @ok="selectOK" :room-ids="value" @initComp="initComp"></MeetRoomSelectModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, unref, watchEffect } from 'vue';
  import MeetRoomSelectModal from './MeetRoomSelectModal.vue';
  import { useModal } from '/@/components/Modal';

  // Emits声明
  const emit = defineEmits(['register', 'change', 'update:value']);
  // props声明
  const props = defineProps({
    value: {
      type: String,
      required: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    multi: {
      type: Boolean,
      default: true,
      required: false,
    },
  });
  const roomIds = ref('');
  const names = ref('');
  const [registerModal, { openModal }] = useModal();

  watchEffect(() => {
    if (props.value) {
      roomIds.value = props.value;
    } else {
      roomIds.value = '';
    }
  });
  /**
   * 初始化名称
   */
  function initComp(roomNames) {
    console.log('initComp', roomNames);
    names.value = roomNames;
  }

  /**
   * 打开会议室选择弹窗
   */
  function onSearchRoom() {
    openModal(true);
  }

  /**
   * 选择回调
   * @param rows
   * @param idstr
   */
  function selectOK(rows, idstr) {
    let processStatus = '0';
    if (!rows) {
      names.value = '';
      roomIds.value = '';
    } else {
      let temp = '';
      for (let item of rows) {
        temp += ',' + item.name;
        processStatus = item.processStatus;
      }
      names.value = temp.substring(1);
      roomIds.value = idstr;
    }
    emit('change', unref(roomIds), processStatus);
  }
</script>

<style scoped></style>
