<template>
  <BasicDrawer @register="register" showFooter v-bind="$attrs" title="流程高级配置" width="330" height="300" @ok="handleSubmit" @close="handleClose">
    <div class="process-config">
      <div class="chunk">
        <div class="header">流程提醒</div>
        <div class="content">
          <a-checkbox-group v-model:value="config.notifyWay">
            <div><a-checkbox value="system">系统消息</a-checkbox></div>
            <div><a-checkbox value="email">邮件消息</a-checkbox></div>
            <div><a-checkbox value="dingtalk">钉钉消息</a-checkbox></div>
            <div><a-checkbox value="wechat_enterprise">企业微信</a-checkbox></div>
          </a-checkbox-group>
        </div>
      </div>

      <a-divider />

      <div class="chunk">
        <div class="header switch">
          <div>
            流程发起后允许撤回
            <a-tooltip title="流程发起后允许撤回">
              <question-circle-outlined />
            </a-tooltip>
          </div>
          <div>
            <a-switch v-model:checked="config.backStatus" checkedValue="1" unCheckedValue="0" checked-children="开" un-checked-children="关" />
          </div>
        </div>
      </div>

      <a-divider />

      <div class="chunk">
        <div class="header switch">
          <div>
            允许流程发起人催办
            <a-tooltip title="允许流程发起人催办">
              <question-circle-outlined />
            </a-tooltip>
          </div>
          <div>
            <a-switch v-model:checked="config.urgeStatus" checkedValue="1" unCheckedValue="0" checked-children="开" un-checked-children="关" />
          </div>
        </div>
      </div>

      <a-divider />

      <div class="chunk" style="display: none">>
        <div class="header switch">
          <div>
            允许查看流程动图和流转图
            <a-tooltip title="允许查看流程动图和流转图">
              <question-circle-outlined />
            </a-tooltip>
          </div>
          <div>
            <a-switch v-model:checked="config.graphicStatus" checkedValue="1" unCheckedValue="0" checked-children="开" un-checked-children="关" />
          </div>
        </div>
      </div>

      <a-divider style="display: none"/>

      <div class="chunk" style="display: none">
        <div class="header switch">
          <div>
            自动提交规则
            <a-tooltip title="保存数据后，自动提交流程">
              <question-circle-outlined />
            </a-tooltip>
          </div>
        </div>
        <div class="nextline-input">
          <a-select v-model:value="config.autoSubmitStatus" style="width: 100%">
            <a-select-option value="0">不启用</a-select-option>
            <a-select-option value="1">启用</a-select-option>
          </a-select>
        </div>
      </div>
      <a-divider style="display: none"/>

      <div class="chunk">
        <div class="header switch">
          <div>桌面图标<DesktopOutlined /> </div>
        </div>
        <div class="nextline-input">
          <IconPicker v-model:value="config.pcIcon" :disabled="false" placeholder="点击选择表单图标" />
        </div>
      </div>
      <a-divider />

      <div class="chunk">
        <div class="header switch">
          <div>移动图标<MobileOutlined /> </div>
        </div>
        <div class="nextline-input">
          <IconPicker v-model:value="config.appIcon" :disabled="false" placeholder="点击选择表单图标" />
        </div>
      </div>
    </div>
  </BasicDrawer>
</template>

<script lang="ts">
  /**
   * 高级配置 vue3新增功能点
   */
  import { defineComponent, reactive, toRaw } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { QuestionCircleOutlined, DesktopOutlined, MobileOutlined } from '@ant-design/icons-vue';
  import { IconPicker } from '/@/components/Icon';
  import { edit } from '../process.design.api';

  interface ProcessConfig {
    id?: string;
    notifyWay?: string[] | string;
    urgeStatus?: string;
    backStatus?: string;
    graphicStatus?: string;
    autoSubmitStatus?: string;
    pcIcon?: string;
    appIcon?: string;
    messageTemplate?: string
  }

  export default defineComponent({
    name: 'ProcessOtherConfigDrawer',
    components: {
      BasicDrawer,
      QuestionCircleOutlined,
      DesktopOutlined,
      MobileOutlined,
      IconPicker,
    },
    emits: ['success', 'register'],
    setup(_p, { emit }) {
      //高级配置属性
      const config = reactive<ProcessConfig>({
        id: '',
        notifyWay: [],
        urgeStatus: '1',
        backStatus: '1',
        graphicStatus: '1',
        autoSubmitStatus: '0',
        pcIcon: '',
        appIcon: '',
        messageTemplate: ''
      });

      // 弹窗
      const [register, { closeDrawer }] = useDrawerInner((data) => {
        console.log('data', data);
        resetForm(data);
      });

      //赋值
      function resetForm(data) {
        Object.keys(config).map((k) => {
          //通知类型是数组格式
          if (k == 'notifyWay') {
            if (!data[k]) {
              config[k] = [];
            } else {
              config[k] = data[k].split(',');
            }
          } else {
            if(k=='messageTemplate'){
              config[k] = data[k] || 'bpm_node_notify';
            }else{
              config[k] = data[k] || '';
            }
          }
        });
      }

      //保存配置
      async function handleSubmit() {
        let data = {
          ...toRaw(config),
        };
        if (data.notifyWay && data.notifyWay.length > 0) {
          let temp = (data.notifyWay as string[]).join(',');
          data.notifyWay = temp;
        }else{
          data.notifyWay = ''
        }
        console.log('修改流程高级配置属性', data);
        await edit(data);
        emit('success');
        closeDrawer();
      }

      //handleClose
      function handleClose() {
        resetForm({});
      }

      return {
        register,
        closeDrawer,
        config,
        handleSubmit,
        handleClose,
      };
    }
    
  });
</script>
<style lang="less" scoped>
  .process-config {
    .ant-divider {
      margin: 10px 0;
    }
    .header {
      color: #000000d9;
      font-weight: 700;
      font-size: 14px;
      line-height: 1.5715;
      white-space: nowrap;
      text-overflow: ellipsis;
      &.switch {
        display: flex;
        justify-content: space-between;
        .anticon {
          font-size: 14px;
          color: @primary-color;
          margin-left: 5px;
        }
      }
    }
    .content {
      margin-top: 8px;
      .ant-checkbox-group > div {
        margin: 5px;
      }
    }
    .chunk {
      .nextline-input {
        margin: 7px 0 3px 0;
      }
    }
  }
  html[data-theme='dark'] {
    .process-config .header {
      color: rgba(255, 255, 255, 0.88);
    }
  }
</style>
