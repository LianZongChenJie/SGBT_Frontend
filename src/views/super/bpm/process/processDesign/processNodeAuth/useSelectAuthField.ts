import { useModalInner } from '/@/components/Modal';
import { useListPage } from '/@/hooks/system/useListPage';
import { getOnlineFields, getDesignFields } from './node.auth.api';
import { BasicColumn } from '/@/components/Table';
import { ref } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';

export default function (isOnline, emit) {
  const { createMessage } = useMessage();
  let selectedAuthFields: any = [];
  let formBizCode = '';
  const [registerModal, { closeModal }] = useModalInner((data) => {
    console.log('useModalInner', data);
    selectedAuthFields = data.selectedAuthFields || [];
    formBizCode = data.formBizCode;
  });

  const leftColumns: BasicColumn[] = [
    {
      title: '权限字段',
      align: 'center',
      dataIndex: 'authTitle',
      ellipsis: true,
    },
    {
      title: '权限字段编码',
      align: 'center',
      dataIndex: 'authField',
      ellipsis: true,
    },
  ];

  async function getLeftTableData() {
    let arr: any = [];
    if (isOnline === true) {
      //online
      const exclude = ['id'];
      let data = await getOnlineFields(formBizCode);
      console.log('getLeftTableData', data);
      data.map((item) => {
        if (exclude.indexOf(item.code) < 0) {
          if (item.isShowForm == 1) {
            item.authField = 'online:' + item.tableName + ':' + item.code;
            item.authTitle = item.tableNameTxt + ':' + item.title;
            arr.push(item);
          }
        }
      });
    } else {
      //设计器
      let data = await getDesignFields(formBizCode);
      console.log('getLeftTableData', data);
      //针对子表，特殊处理 authField编码
      data.map(function (e) {
        if (e.subTable) {
          e.authField = e.subKey + '::' + e.authField;
          e.authTitle = e.subTitle + '::' + e.authTitle;
        }
        arr.push(e);
      });
    }
    arr = arr.filter((a) => !selectedAuthFields.some((b) => b.ruleCode == a.authField));
    return arr;
  }

  const { tableContext: leftTableContext } = useListPage({
    designScope: 'select-auth-field-left',
    tableProps: {
      api: getLeftTableData,
      columns: leftColumns,
      pagination: false,
      useSearchForm: false,
      clickToRowSelect: true,
      showActionColumn: false,
      scroll: { y: 240 },
      minHeight: 240,
      rowSelection: {
        type: 'radio',
        columnWidth: 50,
        onChange: handleSelected,
      },
      showTableSetting: false,
    },
  });
  const [registerLeftTable, { clearSelectedRowKeys }, { rowSelection }] = leftTableContext;

  const rightColumns: BasicColumn[] = [
    {
      title: '权限字段',
      align: 'center',
      width: 100,
      dataIndex: 'authTitle',
      ellipsis: true,
    },
  ];
  const rightDataSource = ref([]);
  const { tableContext: rightTableContext } = useListPage({
    designScope: 'select-auth-field-right',
    tableProps: {
      columns: rightColumns,
      dataSource: rightDataSource,
      pagination: false,
      useSearchForm: false,
      clickToRowSelect: true,
      showActionColumn: true,
      showTableSetting: false,
      scroll: { y: 240 },
      minHeight: 240,
    },
  });
  const [registerRightTable] = rightTableContext;

  /**
   * 左侧表格选中事件
   * @param rowKeys
   * @param rows
   */
  function handleSelected(_rowKeys, rows) {
    rightDataSource.value = rows;
  }

  function handleSubmit() {
    let arr = rightDataSource.value;
    if (!arr || arr.length <= 0) {
      createMessage.warning('请选择一条数据');
      return;
    }
    emit('selected', arr[0]);
    closeModal();
  }

  function handleDelete() {
    rightDataSource.value = [];
    clearSelectedRowKeys();
  }

  return {
    registerModal,
    registerLeftTable,
    registerRightTable,
    handleSubmit,
    rowSelection,
    handleDelete,
    rightDataSource,
  };
}
