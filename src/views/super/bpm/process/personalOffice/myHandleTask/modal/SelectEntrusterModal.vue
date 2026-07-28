<template>
  <BasicModal title="选择委托/转办人" @register="registerModal" :minHeight="80" :width="900" @ok="selected" :canFullscreen="false">
      <tr>
        <td>
          <span style="margin-left: 30px"> 选择用户：</span>
        </td>
        <td colspan="3" style="width: 600px; margin: 0 auto; padding-top: 25px">
            <j-select-user-by-dept v-model:value="person" button-icon="ant-design:search" :isRadioSelection="true" placeholder="请选择人员" />
        </td>
      </tr>
  </BasicModal>
</template>

<script>
  /**
   * 选择委托人
   */
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, nextTick, unref } from 'vue';
  import { JSelectUserByDept } from '/@/components/Form';

  export default {
    name: 'SelectEntrusterModal',
    components: {
      BasicModal,
      JSelectUserByDept,
    },
    emits: ['selected', 'register'],
    setup(_p, { emit }) {
      //useModalInner
      const person = ref('');
      const taskId = ref('');
      const [registerModal, { closeModal }] = useModalInner((data) => {
        person.value = '';
        taskId.value = data.taskId;
      });
      function selected() {
        let temp = unref(person);
        if (temp instanceof Array) {
          temp = temp[0];
        }
        emit('selected', {
          taskId: taskId.value,
          taskAssignee: temp,
        });
        closeModal();
      }
      return {
        registerModal,
        person,
        selected,
      };
    },
  };
</script>

<style scoped></style>
