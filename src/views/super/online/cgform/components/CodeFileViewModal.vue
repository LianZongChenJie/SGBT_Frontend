<template>
  <BasicModal :height="modalHeight" @register="registerModal" okText="" cancelText="关闭" :width="1200" :defaultFullscreen="true" :canFullscreen="false" @ok="onDownloadGenerateCode" :wrapClassName="prefixCls">
    <template #title> <info-circle-two-tone /> 代码在线预览 </template>
    <div>
      <a-row>
        <a-col :span="6" :gutter="3" style="border-right: 1px solid #eee">
          <div :style="{ height: height + 'px', overflowY: 'auto' }">
            <a-directory-tree v-if="treeData.length" :defaultExpandAll="true" :tree-data="treeData" @select="showCodeContent"> </a-directory-tree>
          </div>
        </a-col>
        <a-col :span="18" :gutter="3">
          <JCodeEditor 
              v-if="activeCodeContent" 
              v-model:value="activeCodeContent"
              theme="idea"
              :language="language" 
              :fullScreen="false" 
              :lineNumbers="true" 
              :height="height + 'px'" 
              :disabled="true"
              :language-change="true">
          </JCodeEditor>
          <a-empty v-else style="margin-top: 50px" description="请选择左侧文件，显示详细代码" />
        </a-col>
      </a-row>
    </div>
    <template #footer>
      <a-button @click="handleClose">关闭</a-button>
      <a-button type="primary" @click="onDownloadGenerateCode">下载到本地</a-button>
    </template>
  </BasicModal>
</template>

<script lang="ts">
  /**
   * online代码生成后支持在线预览
   */
  import { ref, defineComponent, reactive } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { InfoCircleTwoTone } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';
  import { JCodeEditor } from '/@/components/Form';
  import 'codemirror/theme/idea.css';
  import { useDesign } from '/@/hooks/web/useDesign';

  export default defineComponent({
    name: 'CodeFileViewModal',
    components: {
      BasicModal,
      InfoCircleTwoTone,
      JCodeEditor,
    },
    emits: ['download', 'register', 'close'],
    setup(_p, { emit }) {
      const codeList = ref([]);
      const pathKey = ref('');
      const treeData = ref<any[]>([]);
      const expandStatus = ref(false);
      const height = window.innerHeight - 142;
      const language = ref('java');
      const activeCodeContent = ref('');
      let codeMap = reactive({});

      const [registerModal, { closeModal }] = useModalInner(async (data) => {
        codeMap = reactive({});
        activeCodeContent.value = '';

        codeList.value = data.codeList;
        pathKey.value = data.pathKey;
        getTreeData();
        expandStatus.value = true;
      });
      const { prefixCls } = useDesign('online-codeFileViewModal');

      function getTreeData() {
        let list = getPlainList();
        let root = list[0];
        assembleTree(root, list);
        let treeList: any[] = [];
        const getFinalTreeData = function (root) {
          if (root.children) {
            let children = root.children;
            if (children.length == 1) {
              getFinalTreeData(children[0]);
            } else if (children.length > 1) {
              treeList.push(root);
            }
          }
        };
        getFinalTreeData(root);
        console.log(123, treeList)
        treeData.value = treeList;
        setTimeout(()=>{
          loadFirstFileContent(root)
        }, 300)
      }

      /**
       * 默认加载第一个文件
       * @param root
       */
      async function loadFirstFileContent(root){
        const getFirstFile = function(temp){
          if(temp.isLeaf === true){
            return temp;
          }else{
            if (temp.children) {
              return getFirstFile(temp.children[0])
            }
          }
        }
        let node = getFirstFile(root);
        if(node && node.isLeaf === true){
          let path = node.path;
          if (!codeMap[path]) {
            await loadCode(path);
          }
          language.value = getCodeLanguage(path);
          activeCodeContent.value = codeMap[path];
        }
      }

      function assembleTree(root, list) {
        for (let item of list) {
          if (root.key == item.pid) {
            let children = root.children;
            if (!children) {
              root.children = [];
            }
            root.children.push(item);
            assembleTree(item, list);
          }
        }
      }

      function getAbsolutePath(arr, index){
        let i=0;
        let str = ''
        while(i<=index){
          str+=arr[i];
          i++;
        }
        return str;
      }
      
      function getPlainList() {
        // title key pid
        let list: any[] = [];
        let list2: any[] = [];
        let arr: any[] = codeList.value;
        for (let item of arr) {
          let temp = item.replace(new RegExp('\\\\', 'g'), '/').replace('生成成功：', '').trim();
          if (temp) {
            let arr2 = temp.split('/');
            for (let i = 0; i < arr2.length; i++) {
              let a = arr2[i];
              let id = getAbsolutePath(arr2, i)
              //  let str = getAbsolutePath(arr2, i)
              if (a) {
                let item = {
                  title: a,
                  key: id,
                };
                if (a == 0) {
                } else {
                  let lastKey = getAbsolutePath(arr2, i-1)
                          //arr2[i - 1] + (i - 1);
                  if (lastKey) {
                    item['pid'] = lastKey;
                  } else {
                  }
                }
                if (i == arr2.length - 1) {
                  //最后一个元素
                  item['isLeaf'] = true;
                  item['path'] = temp;
                }
                if (list2.indexOf(id) < 0 || i == arr2.length - 1) {
                  list.push(item);
                  list2.push(id);
                }
              }
            }
          }
        }
        return list;
      }

      function handleClose() {
        closeModal();
        emit('close')
      }
      function onDownloadGenerateCode() {
        emit('download');
      }

      function getCodeLanguage(path) {
        if (path.endsWith('xml')) {
          return 'application/xml';
        }
        if (path.endsWith('sql')) {
          return 'text/x-sql';
        }
        if (path.endsWith('vue')) {
          return 'text/x-vue';
        }
        if (path.endsWith('ts')) {
          return 'text/typescript';
        } else {
          return 'text/x-java';
        }
      }

      async function showCodeContent(_selectedKeys, e) {
        let node = e.node.dataRef;
        if (node.isLeaf) {
          let path = node.path;
          if (!codeMap[path]) {
            await loadCode(path);
          }
          language.value = getCodeLanguage(path);
          activeCodeContent.value = codeMap[path];
        }
      }
      function loadCode(path) {
        return new Promise((resolve) => {
          let params = {
            path: encodeURI(path),
            pathKey: pathKey.value
          };
          defHttp.get({ url: '/online/cgform/api/codeView', params }, { isTransformResponse: false }).then((data) => {
            if (!data || data.size === 0) {
              message.warning('文件下载失败');
              return;
            }else{
              if (data.message) {
                message.warning(data.message);
                return;
              }
            }
            
            let blob = new Blob([data]);
            let reader = new FileReader();
            reader.readAsText(blob, 'utf8');
            reader.onload = function () {
              let content = this.result;
              codeMap[path] = content;
              resolve(1);
            };
          });
        });
      }

      return {
        registerModal,
        codeList,
        onDownloadGenerateCode,
        handleClose,
        treeData,
        showCodeContent,
        activeCodeContent,
        expandStatus,
        height,
        language,
        prefixCls,
        modalHeight:1000
      };
    },
  });
</script>

<style lang="less">
  // update-begin--author:liaozhiyang---date:20240617---for：【TV360X-227】代码生成弹窗在线预览样式优化
  @prefix-cls: ~'@{namespace}-online-codeFileViewModal';
  .@{prefix-cls} {
    .scrollbar__wrap {
      margin-bottom: 0 !important;
    }
    .ant-modal-footer {
      padding-top: 32px;
    }
  }
  // update-end--author:liaozhiyang---date:20240617---for：【TV360X-227】代码生成弹窗在线预览样式优化
</style>
