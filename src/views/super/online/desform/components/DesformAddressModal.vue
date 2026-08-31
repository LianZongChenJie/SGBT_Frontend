<template>
  <BasicModal v-bind="getProps">
    <div class="content">
      <a-collapse v-model:activeKey="collapseKey" class="j-collapse" :bordered="false" ghost>
        <a-collapse-panel key="def" header="配置地址" class="j-collapse-panel no-header">
          <a-row style="margin-bottom: 8px">
            <a-col :span="24">
              <a-input :readOnly="true" addonBefore="数据列表地址" :value="getAddress.list">
                <template #addonAfter>
                  <a :href="getAddress.list" target="_blank">打开</a>
                </template>
              </a-input>
            </a-col>
          </a-row>

          <a-row v-if="false" style="margin-bottom: 8px">
            <a-col :span="24">
              <a-input :readOnly="true" addonBefore="普通表单地址" :value="getAddress.form">
                <template #addonAfter>
                  <a :href="getAddress.form" target="_blank">打开</a>
                </template>
              </a-input>
            </a-col>
          </a-row>

          <a-row style="margin-bottom: 8px">
            <a-col :span="24">
              <a-input :readOnly="true" addonBefore="积木报表地址" :value="getAddress.jm">
                <template #addonAfter>
                  <a @click="copyText(getAddress.jm)">复制</a>
                </template>
              </a-input>
            </a-col>
          </a-row>

          <a-button class="copy-sql" type="primary" size="small" @click="copySqlClick">复制菜单SQL</a-button>
        </a-collapse-panel>
        <a-collapse-panel key="more" header="后台地址">
          <a-row style="margin-bottom: 8px">
            <a-col :span="21">
              <a-input :readOnly="true" addonBefore="后台新增地址" :value="getAddress.back.add">
                <template #addonAfter>
                  <a :href="getAddress.back.add + '?token=' + accessToken" target="_blank">打开</a>
                </template>
              </a-input>
            </a-col>
            <a-col :span="3" style="text-align: center">
              <a-switch v-model:checked="model.add.checked" :loading="model.add.loading" v-bind="switchProps"/>
            </a-col>
          </a-row>

          <a-row style="margin-bottom: 8px">
            <a-col :span="21">
              <a-input :readOnly="true" addonBefore="后台修改地址" :value="getAddress.back.edit">
                <template #addonAfter>
                  <a @click="openPage(getAddress.back.edit)">打开</a>
                </template>
              </a-input>
            </a-col>
            <a-col :span="3" style="text-align: center">
              <a-switch v-model:checked="model.edit.checked" :loading="model.edit.loading" v-bind="switchProps"/>
            </a-col>
          </a-row>

          <a-row style="margin-bottom: 8px">
            <a-col :span="21">
              <a-input :readOnly="true" addonBefore="后台详情地址" :value="getAddress.back.detail">
                <template #addonAfter>
                  <a @click="openPage(getAddress.back.detail)">打开</a>
                </template>
              </a-input>
            </a-col>
            <a-col :span="3" style="text-align: center">
              <a-switch v-model:checked="model.detail.checked" :loading="model.detail.loading" v-bind="switchProps"/>
            </a-col>
          </a-row>
          <div style="text-align: right; color: red">注意：<span style="font-weight: bold">{dataId}</span> 为数据id</div>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </BasicModal>

  <!-- 让用户输入 dataId 的弹窗 -->
  <BasicModal v-model:visible="dataIdProps.visible" v-bind="dataIdBind">
    <a-input placeholder="请输入dataId" v-model:value="dataIdProps.value"></a-input>
    <template #footer>
      <a class="ant-btn ant-btn-primary" :href="dataIdHref" target="_blank" @click="dataIdProps.visible = false">确定</a>
    </template>
  </BasicModal>
</template>

<script lang="ts">
  import type { ModalProps } from '/@/components/Modal';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { computed, defineComponent, reactive, ref, unref } from 'vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useGlobSetting } from '/@/hooks/setting';
  import { cloneDeep } from 'lodash-es';
  import { getToken } from '/@/utils/auth';
  import { addressApi } from '/@/views/super/online/desform/desform.api';
  import { buildUUID } from '@/utils/uuid';
  import { copyTextToClipboard } from '@/hooks/web/useCopyToClipboard';
  import { useMessage } from '@/hooks/web/useMessage';

  const defaultModel = {
    add: {
      checked: false,
      loading: true,
    },
    edit: {
      checked: false,
      loading: true,
    },
    detail: {
      checked: false,
      loading: true,
    },
  };

  export default defineComponent({
    name: 'DesformAddressModal',
    components: {
      BasicModal,
    },
    emits: ['register'],
    setup(props) {
      const attrs = useAttrs();
      const { domainUrl } = useGlobSetting();
      const collapseKey = ref(['def'])
      // 表单code
      const desformCode = ref();
      // 弹窗标题
      const title = ref('配置地址');
      const model = ref<Recordable>(cloneDeep(defaultModel));
      // 注册弹窗
      const [registerModal, { closeModal }] = useModalInner(open);
      // 弹窗最终props
      const getProps = computed(() => {
        let modalProps: Partial<ModalProps> = {
          width: 750,
          title: unref(title),
        };
        let finalProps: Recordable = {
          ...modalProps,
          ...unref(attrs),
          ...props,
          onOk: onSubmit,
          onCancel: close,
          onRegister: registerModal,
        };
        return finalProps;
      });
      // switch 组件 props
      const switchProps = computed(() => ({
        checkedChildren: '有效',
        unCheckedChildren: '无效',
      }));

      const getAddress = computed(() => {
        let before = `${domainUrl}/desform/`;
        let after = `/${desformCode.value}`;
        return {
          list: `/online/desform/list/${desformCode.value}`,
          form: `/online/desform/view/${desformCode.value}`,
          jm: `{{ domainURL }}/desform/api/data/${desformCode.value}/queryById?id=\${id}&token=\${token}`,
          back: {
            add: `${before}add${after}`,
            edit: `${before}edit${after}/{dataId}`,
            detail: `${before}detail${after}/{dataId}`,
          },
        };
      });
      const accessToken = computed(() => getToken());

      const desformName = ref<string>('');

      /** 弹窗开启 */
      function open(data) {
        let record = data?.record;
        desformCode.value = record?.desformCode;
        desformName.value = record?.desformName;
        request();
      }

      /** 弹窗关闭 */
      function close() {
        closeModal();
      }

      function onSubmit() {
        close();
        addressApi.editAllStatus(desformCode.value, {
          add: model.value.add.checked === true ? 1 : 2,
          edit: model.value.edit.checked === true ? 1 : 2,
          detail: model.value.detail.checked === true ? 1 : 2,
        });
      }

      async function request() {
        let result = await addressApi.queryAllStatus(desformCode.value);
        let status = {};
        result.forEach((item) => {
          status[item.urlType] = {
            checked: item.urlStatus === 1,
            loading: false,
          };
        });
        model.value = status;
      }

      const dataIdProps = reactive({
        base: '',
        value: '',
        visible: false,
      });
      const dataIdHref = computed(() => {
        return dataIdProps.value ? dataIdProps.base.replace(/{dataId}/, dataIdProps.value) + '?token=' + accessToken.value : undefined;
      });
      const dataIdBind = computed(() => {
        return {
          title: '请输入dataId',
          minHeight: 120,
          centered: true,
          canFullscreen: false,
          onOk: () => (dataIdProps.visible = false),
          onCancel: () => (dataIdProps.visible = false),
        };
      });

      function openPage(baseUrl) {
        dataIdProps.base = baseUrl;
        dataIdProps.value = '';
        dataIdProps.visible = true;
      }

      //update-begin---author:wangshuai---date:2024-06-11---for:【TV360X-629】跟online一样，加一个复制插入SQL的功能---
      const $message = useMessage();

      /**
       * 复制sql
       */
      function copySqlClick() {
        const insertMenuSql = `INSERT INTO sys_permission(id, parent_id, name, url, component, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_route, is_leaf, keep_alive, hidden, hide_tab, description, status, del_flag, rule_flag, create_by, create_time, update_by, update_time, internal_or_external)
                               VALUES ('${buildUUID()}', NULL, '${desformName.value}', '${getAddress.value.list}', 'super/online/desform/auto/AutoDesformDataList.vue', NULL, NULL, 0, NULL, '1', 0.00, 0, NULL, 0, 1, 0, 0, 0, NULL, '1', 0, 0, 'admin', null, NULL, NULL, 0)`;
        copyText(insertMenuSql);
      }
      //update-end---author:wangshuai---date:2024-06-11---for:【TV360X-629】跟online一样，加一个复制插入SQL的功能---

      // 复制文本到剪贴板
      function copyText(text: string) {
        const success = copyTextToClipboard(text)
        if (success) {
          $message.createMessage.success('复制成功！')
        } else {
          $message.createMessage.error('复制失败！')
        }
        return success
      }

      return {
        getProps,
        switchProps,
        getAddress,
        collapseKey,
        model,
        accessToken,

        openPage,
        dataIdBind,
        dataIdHref,
        dataIdProps,
        copyText,
        copySqlClick,
      };
    },
  });
</script>

<style scoped lang="less">

.j-collapse {
  //background: red;
  :deep(.ant-collapse-header) {
    padding-left: 0;
  }

  :deep(.ant-collapse-content-box) {
    padding: 0;
  }

  .j-collapse-panel {
    &.no-header {
      :deep(.ant-collapse-header) {
        display: none;
      }
    }
  }

}

.content {
  padding: 20px;
}

.copy-sql {
  float: right;
  margin-top: 6px;
}
</style>
