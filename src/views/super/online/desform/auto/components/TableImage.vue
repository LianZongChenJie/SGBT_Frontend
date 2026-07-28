<template>
  <a-popover v-for="(url, imgIndex) of urlArray" overlayClassName="pop-image-container">
    <template #title></template>
    <template #content>
      <div class="">
        <div class="image-area">
          <img :src="getFileAccessHttpUrl(url)" alt=" " />
        </div>
        <div class="text-area">
          <span style="color: rgb(51, 51, 51); flex: 1" class="ellipsis" :title="getFilename(url)">
            {{ getFilename(url) }}
          </span>
          <span style="width: 24px; margin-left: 5px">
            <DownloadOutlined style="cursor: pointer" title="下载" @click="(e)=>onDownload(e, url)"/>
          </span>
        </div>
      </div>
    </template>
    <img
      style="cursor: pointer; max-height: 24px; display: inline"
      :src="getFileAccessHttpUrl(url)"
      alt=" "
      preview
      v-show="imgIndex === 0"
      @click="viewOnlineCellImage"
    />
  </a-popover>
</template>

<script lang="ts">
  import { computed } from 'vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  import { DownloadOutlined } from '@ant-design/icons-vue';

  export default {
    name: 'TableImage',
    components: {
      DownloadOutlined,
    },
    props: {
      text: {
        type: Array,
        default: () => [],
      },
    },
    setup(props) {
      const urlArray = computed(() => {
        if (!props.text || props.text.length == 0) {
          return [];
        }
        return props.text.map((k) => k.url);
      });

      function viewOnlineCellImage(event) {
        // 阻止事件冒泡
        event.stopPropagation();
        event.preventDefault();

        let arr = props.text;
        if (arr && arr.length > 0) {
          let imgList: any[] = [];
          for (let temp of arr) {
            if (temp && temp.url) {
              imgList.push(getFileAccessHttpUrl(temp.url));
            }
          }
          createImgPreview({ imageList: imgList });
        }
      }

      function getFilename(url) {
        if (url.indexOf('/') > 0) {
          return url.substring(url.lastIndexOf('/') + 1);
        } else if (url.indexOf('\\') > 0) {
          return url.substring(url.lastIndexOf('\\') + 1);
        }
        return url;
      }
      // NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
      function onDownload(e, url){
        e.preventDefault();
        e.stopPropagation();
        let path = getFileAccessHttpUrl(url);
        if(path){
          window.open(path, '_blank');
        }
      }

      return {
        urlArray,
        viewOnlineCellImage,
        getFileAccessHttpUrl,
        getFilename,
        onDownload
      };
    },
  };
</script>

<style lang="less">
  .pop-image-container {
    text-align: center;
    width: 240px;
    border-radius: 6px;
    background-color: rgb(255, 255, 255);
    overflow: hidden;
    .ant-popover-inner-content {
      padding: 0;
    }
    .image-area {
      background-color: rgb(245, 245, 245);
      height: 160px;
      display: flex;
      -webkit-box-pack: center;
      justify-content: center;
      -webkit-box-align: center;
      align-items: center;
      > img {
        max-width: 100%;
        max-height: 160px;
        object-fit: contain;
        margin: 0 5px;
      }
    }
    .text-area {
      text-align: left;
      font-size: 13px;
      padding: 8px 10px 8px 12px;
      word-break: break-all;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .anticon-download {
        &:hover {
          color: #0a8fe9;
        }
      }
      .ellipsis {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
    }
  }
</style>
