<template>
  <BasicModal title="选择节点审批人" @register="registerModal" :minHeight="80" :width="900" @ok="selected" :canFullscreen="false">
    <tr>
      <td>
        <span> 加签方式：</span>
      </td>
      <td colspan="3" style="width: 600px; margin: 0 auto; padding-top: 25px">
        <a-radio-group v-model:value="addSignType">
          <a-radio value="before">
            <a-tooltip>
              <template #title>需要他人核对流程，其他人核对完成后，回到当前节点处理人手中</template>
              向前加签
            </a-tooltip>
          </a-radio>
          <a-radio value="after">
            <a-tooltip>
              <template #title>需要让他人核对流程，其他人核对完成后，直接进入下一节点</template>
              向后加签
              </a-tooltip>
            </a-radio>
        </a-radio-group>
      </td>
    </tr>
    <tr>
      <td>
        <span> 选择用户：</span>
      </td>
      <td colspan="3" style="width: 600px; margin: 0 auto; padding-top: 25px">
        <j-select-user-by-dept v-model:value="person" button-icon="ant-design:search" placeholder="请选择人员" />
      </td>
    </tr>
  </BasicModal>
</template>

<script>
/**
 * 选择加签节点审批人
 */
import { BasicModal, useModalInner } from "/@/components/Modal";
import { ref, nextTick, unref } from "vue";
import { JSelectUserByDept } from "/@/components/Form";
import { useUserStore } from "/@/store/modules/user";
import { useMessage } from "/@/hooks/web/useMessage";

export default {
  name: "AddSignTaskModal",
  components: {
    BasicModal,
    JSelectUserByDept
  },
  emits: ["selected", "register"],
  setup(_p, { emit }) {
    //useModalInner
    const person = ref("");
    const taskId = ref("");
    const addSignType = ref("after");
    const { userInfo } = useUserStore();
    const { createMessage } = useMessage();
    const [registerModal, { closeModal }] = useModalInner((data) => {
      person.value = "";
      taskId.value = data.taskId;
    });

    function selected() {
      let signUserIds= unref(person);
      if(signUserIds.length==0){
        createMessage.warning('请选择审批人')
        return;
      }
      emit("selected", {
        currentTaskId: taskId.value,
        signUserIds: signUserIds,
        userCode: userInfo.username
      },addSignType.value);
      closeModal();
    }

    return {
      registerModal,
      person,
      selected,
      addSignType
    };
  }
};
</script>

<style scoped></style>
