<template>
  <a-card v-bind="$attrs" :style="{ height: '150px' }">
    <a style="float: right" @click="loadMore('oaOffice-orderApplyList')">更多</a>
    <!--展示头部导航信息-->
    <div class="bpm_header">
      <div v-for="(des, index) of commUseList" :key="index"  @click="handleOk(des)">
        <a-button
          type="primary"
          shape="circle"
          :preIcon="`ant-design:${des.desformIcon}`"
          :style="{ background: colorList[index], border: 0 }"
        />
        <span style="margin-left: 5px">{{ des.desformName.length > 4 ? des.desformName.substr(0, 4) : des.desformName }}</span>
      </div>
    </div>
    <!--表单设计弹窗-->
		<Teleport to="body">
        <DesformDataModal ref="desformModal" :dialogOptions="dialogOptions" @added="handleDesformDataAdded" />
		</Teleport>
  </a-card>
</template>

<script lang="ts" setup name="eoa-cms-comm-use">
  import { ref, unref } from 'vue';
  import { router } from '/@/router';
  import { queryCommUseList, queryByCode, save } from '../cmsbpm.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  const props = defineProps({
    isDesign: {
      type: Boolean,
      required: false,
      default: false,
    },
    size: {
      type: [String, Object],
    },
  });
  const { createMessage } = useMessage();
  const colorList = ['#F14A2D', '#0079DE', '#217346', '#F14A2D', '#6D3CF7', '#0079DE'];
  const flowCodePre = 'desform_';
  const commUseList = ref([]);
  const desformModal = ref(null);
  const currentDesForm = ref({});
  const dialogOptions = ref({ top: 60, width: 1000, padding: { top: 25, right: 25, bottom: 30, left: 25 } });

  function handleOkBpmSelect(desform) {
    var title = '表单【' + desform.desformName + '】发起申请';
    openDesformModal('add', desform, title);
  }
  /**
   * 打开表单
   */
  function openDesformModal(mode, record, title) {
    let desform = record,
      dataId = null;
    if (mode === 'edit' || mode === 'detail') {
      let { desformId: id, desformCode, desformDataId } = record;
      dataId = desformDataId;
      desform = { id, desformCode };
    }
    queryByCode({ desformCode: desform.desformCode }).then((res) => {
      if (res.success) {
        let designJson = res.result.desformDesignJson;
        let json = JSON.parse(designJson);
        // 保存 dialogConfig
        let dialogOptions = json.config.dialogOptions;
        if (dialogOptions) {
          dialogOptions.value = dialogOptions;
        }
        desformModal.value.open(mode, desform, dataId, title);
      }
    });
  }
  /**
   * 添加我的申请表单流程
   */
  function handleDesformDataAdded(event) {
    // 将流程保存至后台
    let { desform, dataId } = event;
    save({
      desformId: desform.id,
      desformCode: desform.desformCode,
      desformDataId: dataId,
      desformName: desform.desformName,
      processName: desform.procName,
      flowCode: `${flowCodePre}${desform.desformCode}`,
      titleExp: desform.titleExp,
    }).then((res) => {
      if (!res.success) {
        createMessage.error(res.message);
        return;
      }
      router.push({ path: '/oaOffice/myOrder' });
    });
  }

  /** bmp 选择 ok */
  function handleOk(value) {
    if (value) {
      currentDesForm.value = value;
    }
    handleOkBpmSelect(unref(currentDesForm));
  }
  //跳转更多
  function loadMore(name) {
    router.push({ name });
  }

  /**
   * 加载常用表单
   */
  async function loadCommUseList() {
    const res = await queryCommUseList();
    if (res.success) {
      let data = res.result;
      if (data.length > 6) {
        commUseList.value = data.slice(0, 6);
      } else {
        commUseList.value = data;
      }
      console.log('commUseList================>', commUseList);
    }
  }
  //加载常用流程表单
  loadCommUseList();
</script>

<style scoped>
  .bpm_header {
    display: flex;
    justify-content: space-around;
    margin-top: 40px;
  }
</style>
