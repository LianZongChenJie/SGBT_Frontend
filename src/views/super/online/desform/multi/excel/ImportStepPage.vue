<template>
  <div>
    <!-- 第1步、数据导入 - 上传Excel -->
    <ImportModal @register="registerImportModal" @success="uploadExcelSuccess" @next="goSecond" />

    <!-- 第2步、导入数据 - 选择内容 -->
    <ImportContentModal @register="registerContentModal" @next="showFieldInfo" />

    <!-- 第3步、 数据导入 - 建立映射 -->
    <ImportFieldSetModal @register="registerFieldModal" @back="backSecond" @next="doImport" />

    <!--  错误信息  -->
    <ErrorInfoModal @register="registerErrorModal" />
  </div>
</template>

<script lang="ts">
  import { ref, defineComponent, computed, h } from 'vue';
  import { useModal } from '/@/components/Modal';
  import ImportModal from './ImportModal.vue';
  import { sheetInfo } from './useExcelAction';
  import ImportContentModal from './ImportContentModal.vue';
  import ImportFieldSetModal from './ImportFieldSetModal.vue';
  import { defHttp } from '/@/utils/http/axios';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Button } from 'ant-design-vue';
  import ErrorInfoModal from './ErrorInfoModal.vue'
  
  export default defineComponent({
    name: 'ImportStepPage',
    components: {
      ImportModal,
      ImportContentModal,
      ImportFieldSetModal,
      Button,
      ErrorInfoModal
    },
    emits: ['success'],
    setup(_p, { emit }) {
      const designFormCode = ref('');
      const desformName = ref('');
      const fileKey = ref('');
      const sheetList = ref<sheetInfo[]>([]);
      const fileName = ref('');
      const sheetInfoStatus = ref(false);
      //  视图列 用于选择- model & name
      const viewFieldOptions = ref<any[]>([]);
      const subFieldOptions = ref<Record<string, any>>({});
      const selectedSheetName = ref('')

      function clear() {
        fileKey.value = '';
        fileName.value = '';
        sheetList.value = [];
        selectedSheetName.value = ''
        sheetInfoStatus.value = false;
      }

      // 注册 导入弹窗
      const [registerImportModal, { openModal: openImportModal, closeModal: closeImportModal }] = useModal();
      function onImportExcel(info) {
        console.log('onImportExcel', info);
        clear();
        initViewFieldOptions(info);
        initSubFieldOptions(info);
        openImportModal(true, {
          info,
        });
        desformName.value = info.desformName;
      }
      
      function initViewFieldOptions(info) {
        let arr: any[] = [];
        if(info && info.columns && info.columns.length>0){
          for(let item of info.columns){
            arr.push({
              value: item.model,
              label: item.name
            })
          }
          arr.unshift({
            value: '_id',
            label: '记录ID'
          })
        }
        viewFieldOptions.value = arr;
      }

      function initSubFieldOptions(info) {
        if(info && info.columns && info.columns.length>0){
          for(let item of info.columns){
            if(item.type !== 'sub-table-design') {
              continue;
            }
            if(!Array.isArray(item.columns) || item.columns.length == 0) {
              continue;
            }
            const opts = item.columns.map((col) => ({value: col.model, label: col.name}));
            opts.unshift({value: '_id', label: '记录ID'});
            subFieldOptions.value[item.model] = opts;
          }
        }
      }

      function uploadExcelSuccess(data, name) {
        console.log('uploadExcelSuccess', data);
        fileKey.value = data.fileKey;
        sheetList.value = data.sheetList;
        fileName.value = name;
      }

      const { createMessage, notification } = useMessage();
      const [registerContentModal, { openModal: openContentModal, closeModal: closeContentModal }] = useModal();
      function goSecond(code) {
        designFormCode.value = code;
        if (!fileKey.value) {
          createMessage.warn('请先上传文件！');
          return;
        }
        closeImportModal();
        showSheetInfo();
      }
      function showSheetInfo() {
        sheetInfoStatus.value = true;

        /*        fileKey.value = '7d5d7ace3718025904a434b8aabffba7';
        fileName.value = '一对多的_全部 (11).xlsx';
        sheetList.value = [
          {
            sheetName: '一对多的',
            sheetData: {
              '0': ['名称', '性别'],
              '1': ['张三丰', '男'],
            },
          },
          {
            sheetName: '一对1的',
            sheetData: {
              '0': ['名称1', '性别1'],
              '1': ['张三丰1', '男2'],
              '2': ['张三丰3', '男3'],
            },
          },
        ];*/

        openContentModal(true, {
          fileKey: fileKey.value,
          sheetList: sheetList.value,
          fileName: fileName.value
        });
      }
      
      
      const [registerFieldModal, { openModal: openFieldModal, closeModal: closeFieldModal }] = useModal();
      function showFieldInfo(titleList, sheetName) {
        console.log('标题', titleList, sheetName);
        closeContentModal();
        selectedSheetName.value = sheetName;
        let selectedSheetNames = sheetName?.split(':') ?? [];
        openFieldModal(true, {
          titleList,
          desformName: desformName.value,
          fileKey: fileKey.value,
          fileName: fileName.value,
          viewFieldOptions: viewFieldOptions.value,
          subFieldOptions: subFieldOptions.value,
          // 传给下一步时，需要过滤掉已经选择的sheet
          sheetList: sheetList.value.filter(item=> !selectedSheetNames.includes(item.sheetName)),
        });
      }

      function backSecond() {
        closeFieldModal();
        showSheetInfo();
      }

      async function doImport(info) {
        console.log('映射关系', info);
        const url = `/desform/data/lowAppImportXls/${designFormCode.value}`;
        let params = {
          fileKey: fileKey.value,
          sheetName: selectedSheetName.value,
          ...info
        };
        const data = await defHttp.post({ url, params }, {isTransformResponse: false});
        
        if(data.success){
          closeFieldModal();
          emit('success');
          
          if(data.result && data.result.path){
            notification.success({
              message: '导入完成',
              description: data.result.title,
              duration: 10,
              placement: 'bottomLeft',
              btn: () =>
                h(
                  Button,
                  {
                    type: 'primary',
                    size: 'small',
                    onClick: () => showErrorInfo(data.result)
                  },
                  { default: () => '查看错误报告' },
                ),
            });
          }else{
            createMessage.success('导入完成')
          }
        }else{
          createMessage.error(data.message)
        }
      }

      const [registerErrorModal, { openModal: openErrorModal }] = useModal();
      
      function showErrorInfo(info) {
        openErrorModal(true, {
          ...info
        })
      }

      return {
        registerImportModal,
        onImportExcel,
        uploadExcelSuccess,
        showSheetInfo,
        registerContentModal,
        registerFieldModal,
        showFieldInfo,
        backSecond,
        goSecond,
        doImport,
        registerErrorModal
      };
    },
  });
</script>

<style scoped></style>
