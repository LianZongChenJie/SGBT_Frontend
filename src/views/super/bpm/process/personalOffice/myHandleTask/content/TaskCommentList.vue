<template>
  <a-collapse v-model:activeKey="activeKey" style="margin-top: 10px">
    <a-collapse-panel key="1" header="意见信息">
      <a-list itemLayout="vertical">
        <template v-for="(item, index) in bpmLogList">
          <a-list-item>
            <a-list-item-meta :description="item.remarks||'无意见信息'">
              <template #title>
                {{ item.opUserName }}
                <span style="color: #ff6d75">[{{ item.taskName }}]</span>
                {{ item.opTime }}
              </template>

              <template #avatar>
                <a-avatar :size="36" style="background-color: #51cbff"
                  ><template #icon><UserOutlined /></template
                ></a-avatar>
              </template>
            </a-list-item-meta>

            <template v-for="(file, index) in item.bpmFiles">
              <div class="ant-upload-list ant-upload-list-text">
                <div class="ant-upload-list-item ant-upload-list-item-done">
                  <div class="ant-upload-list-item-info">
                    <span>
                      <paper-clip-outlined />
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        :title="file.fileName"
                        :href="getFileDownloadUrl(file.filePath)"
                        class="ant-upload-list-item-name"
                        >{{ file.fileName }}</a
                      >
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-collapse-panel>
  </a-collapse>
</template>

<script>
  import { UserOutlined, PaperClipOutlined } from '@ant-design/icons-vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { ref, watch } from 'vue';
  export default {
    name: 'TaskCommentList',
    components: {
      UserOutlined,
      PaperClipOutlined,
    },
    props: {
      bpmLogList: {
        type: Array,
        default: () => [],
      },
    },
    setup(props) {
      const activeKey = ref('1');

      watch(
        () => props.bpmLogList,
        () => {
          if (props.bpmLogList.length > 0) {
            activeKey.value = '1';
          } else {
            activeKey.value = '';
          }
        }
      );

      function getFileDownloadUrl(path) {
        return getFileAccessHttpUrl(path);
      }

      return {
        activeKey,
        getFileDownloadUrl,
      };
    },
  };
</script>

<style scoped></style>
