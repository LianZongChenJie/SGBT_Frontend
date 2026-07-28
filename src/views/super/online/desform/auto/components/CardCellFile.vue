<template>
  <div class="card-cell-file-custom">
    <div class="ant-upload-list ant-upload-list-text">
      <div v-if="urlArray.length > 0" class="">
        <span>
          <div style="margin-top: 0" class="ant-upload-list-item ant-upload-list-item-done ant-upload-list-item-list-type-text">
            <div class="ant-upload-list-item-info">
              <span class="ant-upload-span">
                <div class="ant-upload-text-icon">
                  <PaperClipOutlined />
                </div>
                <a
                  @click="(e) => onDownload(e, urlArray[0])"
                  :title="getFilename(urlArray[0])"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="width: 158px"
                  class="ant-upload-list-item-name"
                >
                  {{ getFilename(urlArray[0]) }}
                </a>
                <span class="ant-upload-list-item-card-actions" v-if="urlArray.length > 1">
                  <a-popover overlayClassName="pop-file-container">
                    <template #title></template>
                    <template #content>
                      <div class="ant-upload-list ant-upload-list-text">
                        <div v-for="url in urlArray" class="">
                          <span>
                            <div style="margin-top: 2px" class="ant-upload-list-item ant-upload-list-item-done ant-upload-list-item-list-type-text">
                              <div class="ant-upload-list-item-info">
                                <span class="ant-upload-span">
                                  <div class="ant-upload-text-icon">
                                    <paper-clip-outlined />
                                  </div>
                                  <a
                                    @click="(e) => onDownload(e, url)"
                                    :title="getFilename(url)"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style="width: 160px"
                                    class="ant-upload-list-item-name"
                                  >
                                    {{ getFilename(url) }}
                                  </a>
                                </span>
                              </div>
                            </div>
                          </span>
                        </div>
                      </div>
                    </template>
                    <MoreOutlined title="更多" class="card-cell-file-more" />
                  </a-popover>
                </span>
              </span>
            </div>
          </div>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  /**
   * 卡片视图 文件显示
   */
  import { watch, ref } from 'vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { PaperClipOutlined, DownloadOutlined, MoreOutlined } from '@ant-design/icons-vue';

  export default {
    name: 'CardCellFile',
    components: {
      DownloadOutlined,
      MoreOutlined,
      PaperClipOutlined,
    },
    props: {
      text: {
        type: Array,
        default: () => [],
      },
    },
    setup(props) {
      const urlArray = ref<any[]>([]);
      watch(
        () => props.text,
        (val) => {
          if (!val || val.length == 0) {
            urlArray.value = [];
          } else {
            let arr = props.text.map((k) => k.url);
            urlArray.value = arr;
          }
        },
        { immediate: true }
      );

      function getFilename(url) {
        if (url.indexOf('/') > 0) {
          return url.substring(url.lastIndexOf('/') + 1);
        } else if (url.indexOf('\\') > 0) {
          return url.substring(url.lastIndexOf('\\') + 1);
        }
        return url;
      }

      function onDownload(e, url) {
        e.preventDefault();
        e.stopPropagation();
        let path = getFileAccessHttpUrl(url);
        if (path) {
          window.open(path, '_blank');
        }
      }

      return {
        urlArray,
        getFileAccessHttpUrl,
        getFilename,
        onDownload,
      };
    },
  };
</script>

<style lang="less">
  .card-cell-file-custom {
    .card-cell-file-more {
      font-size: 16px;
      font-weight: bold;
      &:hover {
        color: #0a8fe9;
      }
    }
  }
  .pop-file-container {
    width: 300px;
  }
</style>
