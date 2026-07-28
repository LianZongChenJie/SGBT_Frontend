import { h, ref, createVNode } from 'vue';
import { useRouter } from 'vue-router';
import { Input, Radio, RadioGroup, Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { useDrawer } from '/@/components/Drawer';
import { CgformPageType } from '../types';
import { useListPage } from '/@/hooks/system/useListPage';
import {
  doBatchDelete,
  doBatchRemove,
  doSingleDelete,
  doSingleRemove,
  doCopyOnlineView,
  doDatabaseSync,
  doCopyTable,
  list,
} from '../cgform.api';
import { useCopyModal } from './useCopyCgformModal';
import { isArray } from '/@/utils/is';
import {useCgformStore} from "../store/cgformState";

interface IOptions {
  // 页面类型
  pageType: CgformPageType;
  designScope: string;
  columns: BasicColumn[];
  formSchemas: FormSchema[];
}

export function useCgformList(options: IOptions) {
  const isNormalPage = options.pageType === CgformPageType.normal;
  const router = useRouter();
  const cgformStore = useCgformStore();

  // 列表页面公共参数、方法
  const pageContext = useListPage({
    designScope: options.designScope,
    tableProps: {
      api: list,
      columns: options.columns,
      formConfig: {
        //labelWidth: 200,
        schemas: options.formSchemas,
      },
      beforeFetch: (params) => {
        let copyType = isNormalPage ? 0 : 1;
        let physicId = isNormalPage ? undefined : router.currentRoute.value.params.code;
        // TODO 等字典组件支持逗号分割后删除改代码【LOWCOD-2371】
        if (isArray(params.tableType_MultiString)) {
          params.tableType_MultiString = params.tableType_MultiString.join(',');
        }
        return Object.assign(params, { copyType, physicId });
      },
    },
  });
  const { tableContext, createMessage: $message, createConfirm: $confirm } = pageContext;
  // 注册table数据
  const [, { reload, setLoading }, { selectedRowKeys, selectedRows }] = tableContext;

  // 注册编辑弹窗 NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
  const [registerCgformModal, cgformModal] = useModal();
  // 注册从数据库导入表单
  const [registerDbToOnlineModal, dbToOnlineModal] = useModal();
  // 注册ai建表弹窗
  const [registerAiToOnlineModal, aiToOnlineModal] = useModal();
  // 注册代码生成弹窗
  const [registerCodeGeneratorModal, codeGeneratorModal] = useModal();
  // 注册自定义按钮弹窗
  const [registerCustomButtonModal, customButtonModal] = useModal();
  // 注册JS增强弹窗
  const [registerEnhanceJsModal, enhanceJsModal] = useModal();
  // 注册SQL增强弹窗
  const [registerEnhanceSqlModal, enhanceSqlModal] = useModal();
  // 注册Java增强弹窗
  const [registerEnhanceJavaModal, enhanceJavaModal] = useModal();
  // 注册权限管理抽屉
  const [registerAuthManagerDrawer, authManagerDrawer] = useDrawer();
  // 注册角色授权弹窗
  const [registerAuthSetterModal, authSetterModal] = useModal();

  function onAdd() {
    cgformModal.openModal(true, { isUpdate: false });
  }
  function onAiCreateTable(){
    aiToOnlineModal.openModal(true);
  }
  function  onCreateAiTable() {
    reload();
  }
  let thatRecord: Nullable<Recordable> = null

  function onEdit(record) {
    thatRecord = record
    cgformModal.openModal(true, { isUpdate: true, record });
  }

  function onSuccess() {
    if (thatRecord?.id) {
      cgformStore.addChangedTable(thatRecord.id)
      thatRecord = null
    }
    reload();
  }

  /**
   * 删除事件
   */
  async function handleDelete(id) {
    await doSingleDelete(id);
    reload();
  }

  /**
   * 移除事件
   */
  async function handleRemove(id) {
    await doSingleRemove(id);
    reload();
  }
  
  // 批量删除
  function onDeleteBatch() {
    let idList = selectedRowKeys.value as string[];
    if (idList.length <= 0) {
      $message.warning('请先选择一条记录！');
      return;
    }
    $confirm({
      title: '删除',
      content: '<p>移除只会删除表单配置；<br>删除则会删除对应的数据库表以及子表且不能恢复。<br>请确认您的操作…</p>',
      iconType: 'warning',
      closable: true,
      okText: '移除',
      cancelText: '删除',
      cancelButtonProps: { danger: true },
      onOk: async () => executeDelete(doBatchRemove, idList, true),
      onCancel(event) {
        // update-begin--author:liaozhiyang---date:20240326---for：【QQYUN-8719】批量删除弹窗点击关闭按钮走了删除逻辑
        if(event.name){
          if (!event?.triggerCancel) {
            return executeDelete(doBatchDelete, idList, true);
          }
          return Promise.resolve();
        }
         // update-end--author:liaozhiyang---date:20240326---for：【QQYUN-8719】批量删除弹窗点击关闭按钮走了删除逻辑
      },
    });
  }

  /**
   * 执行删除操作
   * @param fn 删除方法
   * @param idList 删除参数
   * @param clearSelected 清空选择
   */
  async function executeDelete(fn: Fn, idList: string[], clearSelected = false) {
    try {
      setLoading(true);
      const res = await fn(idList);
      reload();
      if (clearSelected) {
        selectedRowKeys.value = [];
      }
      return res;
    } finally {
      setLoading(false);
    }
    return Promise.reject();
  }

  // 显示自定义按钮弹窗
  function onShowCustomButton() {
    getSelectedRows(([row]) => customButtonModal.openModal(true, { row }));
  }

  // 显示 js 增强弹窗
  function onShowEnhanceJs() {
    getSelectedRows(([row]) => enhanceJsModal.openModal(true, { row }));
  }

  // 显示 sql 增强弹窗
  function onShowEnhanceSql() {
    getSelectedRows(([row]) => enhanceSqlModal.openModal(true, { row }));
  }

  // 显示 java 增强弹窗
  function onShowEnhanceJava() {
    getSelectedRows(([row]) => enhanceJavaModal.openModal(true, { row }));
  }

  // 显示导入数据库表弹窗
  function onImportDbTable() {
    dbToOnlineModal.openModal(true, {});
  }

  function getSelectedRows(fn: Fn, min = 1, max = 1) {
    if (selectedRows.value.length < min) {
      $message.warning(`请先至少选中 ${min} 条记录`);
    } else if (selectedRows.value.length > max) {
      $message.warning(`最多只能选中 ${min} 条记录`);
    } else {
      fn(selectedRows.value);
    }
  }

  // 显示代码生成弹窗
  function onGenerateCode() {
    if (selectedRows.value.length === 0) {
      $message.warning('请先选中一条记录');
    } else if (selectedRows.value.length > 1) {
      $message.warning('代码生成只能选中一条记录');
    } else {
      let row = selectedRows.value[0];
      if (!row) {
        $message.warning('请选中当前页的数据！');
      } else if (row.isDbSynch != 'Y') {
        $message.warning('请先同步数据库！');
      } else if (row.tableType == 3) {
        $message.warning('请选中该表对应的主表');
      } else {
        codeGeneratorModal.openModal(true, { code: row.id });
      }
    }
  }

  // 功能测试
  function onGoToTest(record) {
    console.log(record);
    if (record.isTree == 'Y') {
      router.push({ path: '/online/cgformTreeList/' + record.id });
    } else {
      // update-begin--author:liaozhiyang---date:20230818---for：【QQYUN-5803】online一对多Erp风格
      switch (record.themeTemplate) {
        case 'erp':
          router.push({ path: '/online/cgformErpList/' + record.id });
          break;
        case 'tab':
          router.push({ path: '/online/cgformTabList/' + record.id });
          break;
        case 'innerTable':
          router.push({ path: '/online/cgformInnerTableList/' + record.id });
          break;
        default:
          router.push({ path: '/online/cgformList/' + record.id });
          break;
      }
      // update-end--author:liaozhiyang---date:20230818---for：【QQYUN-5803】online一对多Erp风格
    }
  }

  // 同步数据库
  function onSyncDatabase(record) {
    const syncMethod = ref('normal');
    const disabled = ref(false);
    const modalFunc = $confirm({
      iconType: 'info',
      title: '同步数据库',
      content: () =>
        h(
          'div',
          {
            style: 'margin: 20px 0;',
          },
          h(
            RadioGroup,
            {
              value: syncMethod.value,
              disabled: disabled.value,
              'onUpdate:value': (v) => (syncMethod.value = v),
            },
            () => [h(Radio, { value: 'normal' }, () => '普通同步（保留表数据）'), h(Radio, { value: 'force' }, () => '强制同步（删除表，重新生成）')]
          )
        ),
      maskClosable: true,
      okText: '开始同步',
      async onOk() {
        disabled.value = true;
        modalFunc.update({
          maskClosable: false,
          keyboard: false,
          okText: '同步中…',
          okButtonProps: { loading: disabled.value },
          cancelButtonProps: { disabled: disabled.value },
        });
        try {
          await doDatabaseSync(record.id, syncMethod.value);
        } catch (e: any) {
          // update-begin--author:liaozhiyang---date:20240521---for：【TV360X-244】同步数据库没权限时提示两次
          // $message.warn(e.message || e);
          // update-end--author:liaozhiyang---date:20240521---for：【TV360X-244】同步数据库没权限时提示两次
        } finally {
          reload();
        }
      },
    });
  }

  const { createCopyModal } = useCopyModal();

  // 显示online地址弹窗
  function onShowOnlineUrl(record) {
    let onlineUrl: string;
    if (record.themeTemplate === 'erp') {
      onlineUrl = `/online/cgformErpList/${record.id}`;
    } else if (record.themeTemplate === 'innerTable') {
      onlineUrl = `/online/cgformInnerTableList/${record.id}`;
    } else if (record.themeTemplate === 'tab') {
      onlineUrl = `/online/cgformTabList/${record.id}`;
    } else if (record.isTree == 'Y') {
      onlineUrl = `/online/cgformTreeList/${record.id}`;
    } else {
      onlineUrl = `/online/cgformList/${record.id}`;
    }
    createCopyModal({
      title: `菜单链接【${record.tableTxt}】`,
      content: onlineUrl,
      copyText: onlineUrl,
      copyTitle: `${record.tableTxt}`
    });
  }

  /**
   * 显示复制表弹窗
   * @param record
   */
  function onCopyTable(record) {
    const tableName = ref(record.tableName + '_copy');
    $confirm({
      title: '复制表',
      content: () =>
        h(
          'div',
          {
            style: 'margin: 20px 0;',
          },
          [
            '请输入新表名：',
            h(Input, {
              value: tableName.value,
              'onUpdate:value': (v) => (tableName.value = v),
            }),
          ]
        ),
      iconType: 'info',
      closable: true,
      okText: '复制',
      onOk() {
        if (!tableName.value) {
          $message.warning('请输入新表名');
        } else if (tableName.value === record.tableName) {
          $message.warning('新表名和旧表名不能一致');
        } else {
          doCopyTable(record.id, tableName.value).then(reload);
        }
      },
    });
  }

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: () => onEdit(record),
      },
    ];
  }

  /**
   * 下拉操作栏
   */
  function getDropDownAction(record): ActionItem[] {
    return [
      {
        label: '同步数据库',
        onClick: () => onSyncDatabase(record),
        ifShow: () => isNormalPage && record.isDbSynch != 'Y',
      },
      {
        // TODO 功能测试
        label: '功能测试',
        class: ['low-app-hide'],
        onClick: () => onGoToTest(record),
        ifShow: () => (isNormalPage ? record.isDbSynch == 'Y' && record.tableType !== 3 : true),
      },
      {
        label: '配置地址',
        class: ['low-app-hide'],
        onClick: () => onShowOnlineUrl(record),
        ifShow: () => (isNormalPage ? record.isDbSynch == 'Y' && record.tableType !== 3 : true),
      },
      {
        label: '权限控制',
        onClick: () => authManagerDrawer.openDrawer(true, { cgformId: record.id, tableType: record.tableType}),
      },
      {
        label: '角色授权',
        onClick: () => authSetterModal.openModal(true, { cgformId: record.id }),
      },
      {
        label: '视图管理',
        class: ['low-app-hide'],
        onClick: () => router.push(`/online/copyform/${record.id}`),
        ifShow: () => isNormalPage && record.hascopy == 1,
      },
      {
        label: '生成视图',
        class: ['low-app-hide'],
        popConfirm: {
          title: '确定生成视图吗？',
          placement: 'left',
          confirm: () => {
            setLoading(true);
            doCopyOnlineView(record.id)
              .then(() => {
                $message.success('已成功生成视图');
              })
              .finally(() => {
                setLoading(false);
                reload();
              });
          },
        },
        ifShow: () => isNormalPage,
      },
      {
        label: '复制表',
        onClick: () => onCopyTable(record),
        ifShow: () => isNormalPage,
      },
      // update-begin--author:liaozhiyang---date:20240313---for：【QQYUN-8485】online删除提示优化
      {
        label: '移除',
        onClick: () => {
          Modal.confirm({
            title: `确认移除该表吗？`,
            icon: createVNode(ExclamationCircleOutlined),
            content: `只删除online配置表，数据库物理表保留`,
            onOk() {
              return handleRemove(record.id);
            },
            okText: '移除',
            cancelText: '取消',
          });
        },
      },
      {
        label: '删除',
        onClick: () => {
          Modal.confirm({
            title: `确认彻底删除该表吗？`,
            icon: createVNode(ExclamationCircleOutlined),
            content: `删除online配置表的同时会删除数据库物理表`,
            onOk() {
              return handleDelete(record.id);
            },
            okText: '删除',
            cancelText: '取消',
          });
        },
        ifShow: () => isNormalPage,
      },
      // update-end--author:liaozhiyang---date:20240313---for：【QQYUN-8485】online删除提示优化
    ];
  }

  return {
    router,
    pageContext,
    onAdd,
    onAiCreateTable,
    onSuccess,
    onDeleteBatch,
    onImportDbTable,
    onGenerateCode,
    onShowCustomButton,
    onShowEnhanceJs,
    onShowEnhanceSql,
    onShowEnhanceJava,
    onCreateAiTable,
    getTableAction,
    getDropDownAction,
    registerCustomButtonModal,
    registerEnhanceJsModal,
    registerEnhanceSqlModal,
    registerEnhanceJavaModal,
    registerAuthManagerDrawer,
    registerAuthSetterModal,
    registerCgformModal,
    registerDbToOnlineModal,
    registerCodeGeneratorModal,
    registerAiToOnlineModal,
  };
}
