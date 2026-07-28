<template>
  <div>
    <a-card :bordered="false">
      <a-spin :spinning="loading">
        <template v-if="processTypeDictOptions.length > 0">
          <a-button type="primary" @click="handleSetUse" preIcon="ant-design:setting-outlined">设置常用流程</a-button>
          <template v-if="commUseList.length > 0">
            <a-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
              <a-card :loading="loading" title="常用流程" :style="{ marginTop: '24px', height: 'auto' }">
                <template v-for="des of commUseList">
                  <a-card-grid :style="{ width: cardWidth }" @click="handleOk(des)">
                    <template v-if="des.desformIcon">
                      <Icon v-if="des.desformIcon.indexOf('ant-design')>=0" :icon="des.desformIcon" :style="style" />
                      <a-icon v-else :type="des.desformIcon" :style="style" />
                    </template>
                    <Icon v-else icon="ant-design:file-text-outlined" :style="style" />
                    <span class="bsSpan" v-if="screenWidth > 700">
                      <JEllipsis :value="des.desformName" :length="6" />
                    </span>
                    <div v-else class="mobName">
                      <a-icon v-if="des.appIcon" :type="des.appIcon" :style="style" />
                      <Icon v-else icon="ant-design:file-text-outlined" :style="style" />
                      {{ des.desformName.length > 4 ? des.desformName.substr(0, 4) : des.desformName }}
                    </div>
                  </a-card-grid>
                </template>
              </a-card>
            </a-col>
          </template>

          <template v-for="item of processTypeDictOptions">
            <a-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
              <a-card
                :loading="loading"
                :title="item.text"
                :style="{ marginTop: '24px', height: 'auto' }"
              >
                <template v-for="des of desformList">
                  <template v-if="des.procType == item.value">
                    <a-card-grid :style="{ width: cardWidth }" @click="handleOk(des)">
                      <template v-if="des.desformIcon">
                        <Icon v-if="des.desformIcon.indexOf('ant-design')>=0" :icon="des.desformIcon" :style="style" />
                        <a-icon v-else :type="des.desformIcon" :style="style" />
                      </template>
                      <Icon v-else icon="ant-design:file-text-outlined" :style="style" />
                      <span class="bsSpan" v-if="screenWidth > 700">
                        <JEllipsis :value="des.desformName" :length="6" />
                      </span>
                      <div v-else class="mobName">
                        {{ des.desformName.length > 4 ? des.desformName.substr(0, 4) : des.desformName }}
                      </div>
                    </a-card-grid>
                  </template>
                </template>
              </a-card>
            </a-col>
          </template>
        </template>
        <!--设置online流程-->
        <template v-if="onlineFormList && onlineFormList.length > 0">
          <a-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
            <a-card :loading="loading" title="online表单" :style="{ marginTop: '24px', height: 'auto' }">
              <template v-for="des of onlineFormList">
                <a-card-grid :style="{ width: cardWidth }" @click="handleOpenOnlineModal(des)">
                  <template v-if="des.desformIcon">
                    <Icon v-if="des.desformIcon.indexOf('ant-design')>=0" :icon="des.desformIcon" :style="style" />
                    <a-icon v-else :type="des.desformIcon" :style="style" />
                  </template>
                  <Icon v-else icon="ant-design:file-text-outlined" :style="style" />
                  <span class="bsSpan" v-if="screenWidth > 700">
                    <JEllipsis :value="des.desformName" :length="20" />
                  </span>
                  <div v-else class="mobName">
                    {{ des.desformName.length > 10 ? des.desformName.substr(0, 10) : des.desformName }}
                  </div>
                </a-card-grid>
              </template>
            </a-card>
          </a-col>
        </template>

        <template v-if="(!onlineFormList || onlineFormList.length == 0) && (!processTypeDictOptions || processTypeDictOptions.length == 0)">
          <span>没有找到配置的流程！</span>
        </template>
      </a-spin>
    </a-card>
    <!--online动态弹窗-->
    <OnlineDynamicModal ref="onlineModal" @register="registerOnlineModal" />
    <!--表单设计弹窗-->
    <DesformDataModal ref="desformModal" :dialogOptions="dialogOptions" @added="handleDesformDataAdded" />
    <!--常用流程设置-->
    <BpmAutoDesformSetUse @register="registerModal" @success="reload"></BpmAutoDesformSetUse>
  </div>
</template>
<script lang="ts" name="order-apply-list" setup>
  import { ref, onMounted, computed, unref } from 'vue';
  import { router } from '/@/router';
  import JEllipsis from '/@/components/Form/src/jeecg/components/JEllipsis.vue';
  import BpmAutoDesformSetUse from './components/BpmAutoDesformSetUse.vue';
  import DesformDataModal from '../myApply/components/DesformDataModal.vue';
  import OnlineDynamicModal from './components/OnlineDynamicModal.vue';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { initDictOptions } from '/@/utils/dict/index';
  import { roleDegisnList, getCommUseList, queryByCode, addDesignFlowData, getOnlineList } from './apply.api';

  const commUseList = ref([]);
  const loading = ref(false);
  const desformList = ref([]);
  const processTypeDict = ref([]);
  const processTypeDictOptions = ref([]);
  const flowCodePre = 'desform_';
  const dialogOptions = ref({ top: 60, width: 1000, padding: { top: 25, right: 25, bottom: 30, left: 25 } });
  const cardWidth = ref('20%');
  const screenWidth = ref();
  const onlineFormList = ref([]);
  const desformModal = ref(null);
  const onlineModal = ref(null);
  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();

  const style = computed(() => {
    let style = { 'vertical-align': 'middle' };
    if (screenWidth.value > 700) {
      style['font-size'] = '30px';
    } else {
      style['font-size'] = '25px';
      style['margin-left'] = '30%';
    }
    return style;
  });
  /** 加载desform */
  async function loadDesformList() {
    loading.value = true;
    let dictRes = await initDictOptions('bpm_process_type');
    if (dictRes && dictRes.length > 0) {
      processTypeDict.value = dictRes;
    }
    let res = await roleDegisnList();
    if (res.success) {
      desformList.value = res.result;
    }
    //获取指定属性的数据集合
    let procTypeArr = [...new Set(Array.from(unref(desformList), ({ procType }) => procType))];
    //工单类型字典项
    processTypeDictOptions.value = processTypeDict.value.filter((item) => procTypeArr.indexOf(item.value) != -1);

    loading.value = false;
  }

  async function loadCommUseList() {
    loading.value = true;
    let res = await getCommUseList();
    if (res.success) {
      commUseList.value = res.result;
    }
    loading.value = false;
  }

  const [registerOnlineModal, { openModal: openOnlineModal }] = useModal();
  function handleOpenOnlineModal(item) {
    openOnlineModal(true, {
      id: item.id,
      name: item.desformCode,
    });
  }

  function handleOk(desform) {
    if (desform) {
      if (desform.formType == 'online') {
        handleOpenOnlineModal(desform)
      } else {
        handleOkBpmSelect(desform);
      }
    }
  }
  /** bmp 选择 ok */
  function handleOkBpmSelect(desform) {
    let title = '表单【' + desform.desformName + '】发起申请';
    openDesformModal('add', desform, title);
  }
  /** 打开表单设计器弹窗*/
  async function openDesformModal(mode, record, title) {
    let desform = record,
      dataId = null;
    if (mode === 'edit' || mode === 'detail') {
      let { desformId: id, desformCode, desformDataId } = record;
      dataId = desformDataId;
      desform = { id, desformCode };
    }

    let res = await queryByCode({ desformCode: desform.desformCode });
    if (res.success) {
      let designJson = res.result.desformDesignJson;
      let json = JSON.parse(designJson);
      // 保存 dialogConfig
      let options = json.config.dialogOptions;
      if (options) {
        dialogOptions.value = options;
      }
      desformModal.value.open(mode, desform, dataId, title);
    }
  }

  /** 流程数据保存成功后触发该事件 */
  async function handleDesformDataAdded(event) {
    // 将流程保存至后台
    let { desform, dataId } = event;
    loading.value = true;

    //发起流程（往设计表单和流程的关系表中，插入一条数据）
    let res = await addDesignFlowData({
      desformId: desform.id,
      desformCode: desform.desformCode,
      desformDataId: dataId,
      desformName: desform.desformName,
      processName: desform.procName,
      flowCode: flowCodePre + desform.desformCode,
      titleExp: desform.titleExp,
    });
    loading.value = false;
    if (res.success) {
      router.push({ path: '/oaOffice/myOrder' });
    } else {
      createMessage.error(res.message);
    }
  }
  //打开常用流程设计弹窗
  function handleSetUse() {
    openModal(true, { processTypeDict: unref(processTypeDict) });
  }

  /**
   * 重新加载常用流程
   */
  async function reload() {
    let res = await getCommUseList();
    if (res.success) {
      commUseList.value = res.result;
    }
  }
  /**
   * 设置卡片size
   */
  function resetCardSize() {
    console.log('document.body.clientWidth:resetCardSize:', document.body.clientWidth);
    screenWidth.value = document.body.clientWidth;
    if (unref(screenWidth) <= 1350) {
      cardWidth.value = '33.3%';
    }
  }

  /**
   * 查询online表单
   */
  async function queryOnlineFormList() {
    onlineFormList.value = [];
    let res = await getOnlineList();
    if (res.success) {
      onlineFormList.value = res.result;
    }
  }

  onMounted(() => {
    loadDesformList();
    loadCommUseList();
    queryOnlineFormList();
    //当页面初始化时,根据屏幕大小来给设置card宽度
    resetCardSize();
  });
</script>
<style lang="less" scoped>
  .bsSpan {
    vertical-align: middle;
    margin-left: 20px;
    display: inline-block;
    width: calc(100% - 51px);
    overflow: hidden;

    :first-child {
      white-space: nowrap;
    }
  }

  .mobName {
    text-align: center;
    font-size: 12px;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
  }
  html[data-theme='light'] {
    .ant-card {
      :deep(.ant-card-head) {
        background-color: #eaeaea;
      }
    }
  }
</style>
