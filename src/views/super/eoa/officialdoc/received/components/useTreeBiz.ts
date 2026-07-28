import { inject, reactive, ref, unref, watch, nextTick } from 'vue';
import { getListDepart } from '../received.api';

export function useTreeBiz(getList, props) {
  //接收下拉框选项
  const selectOptions = inject('selectOptions', ref<Array<object>>([]));
  //接收已选择的值
  const selectValues = <object>inject('selectValues', reactive({}));
  //数据集
  const treeData = ref<Array<object>>([]);
  //已选择的值
  const checkedKeys = ref<Array<string | number>>([]);
  //选则的行记录
  const selectRows = ref<Array<object>>([]);
  //是否是打开弹框模式
  const openModal = ref(false);
  //存在分发的部门
  const departIds = ref<string>('');
  //存放初始化的checkedKeys
  const initCheckedKeys = ref<Array<string | number>>([]);
  //是否为第一次加载
  const num = ref<number>(0);
  /**
   * 监听selectValues变化
   */
  watch(selectValues, () => {
    if (openModal.value == false) {
      onLoadData(selectValues['value'].join(',')).then();
    }
  });

  /**
   * 树节点选择
   */
  function onSelect(_keys, info) {
    let eventKey = info.node.eventKey;
    if (checkedKeys.value.indexOf(eventKey) >= 0) {
      checkedKeys.value = checkedKeys.value.filter((item) => item != eventKey);
    } else {
      checkedKeys.value.push(eventKey);
    }
    setRowData();
  }

  /**
   * 设置selectRows选中的行记录
   */
  function setRowData() {
    const rows = ref<Array<object>>([]);
    for (let key of checkedKeys.value) {
      let row = forChildren(treeData.value, key);
      if (row != null) {
        rows.value.push(row);
      }
    }
    selectRows.value = rows.value;
  }

  /**
   * 循环树子节点查找数据
   */
  function forChildren(list, key) {
    for (let item of list) {
      if (item.id === key) {
        return item;
      }
      if (item.children instanceof Array) {
        let value = forChildren(item.children, key);
        if (value != null) {
          return value;
        }
      }
    }
    return null;
  }

  /**
   * 树节点复选框选择
   */
  function onCheck(keys, info) {
    const data = ref<Array<string | number>>([]);
    for (const row of keys.checked) {
      data.value.push(row);
    }
    checkedKeys.value = data.value;
    const { checkedNodes } = info;
    const rows = ref<Array<object>>([]);
    checkedNodes.forEach((item) => {
      rows.value.push(item);
    });
    selectRows.value = rows.value;
  }

  /**
   * 加载树数据
   */
  async function onLoadData(ids) {
    //获取树的数据
    let params = {};
    if (ids) {
      params['ids'] = ids;
    }
    const record = await getList(params);
    if (openModal.value == true) {
      //获取可选部门的数据
      const depData = await getListDepart();
      if (depData) {
        depData.forEach((item) => {
          departIds.value = departIds.value + item.departId + ',';
        });
      }
      //遍历树对象进行disabled不可选择
      await setDisabledTreeData(record);
      expandTree();
    } else {
      const options = <any[]>[];
      record.forEach((item) => {
        options.push({ label: item[props.labelKey], value: item[props.rowKey] });
      });
      selectOptions.value = options;
    }
  }

  //设置列表默认选中
  function expandTree() {
    nextTick(() => {
      //设置列表默认选中
      checkedKeys.value = selectValues['value'];
      //为initCheckedKeys进行深拷贝，避免出现混入
      if (initCheckedKeys.value.length == 0 && num.value == 0) {
        let selectValue = selectValues['value'];
        if (selectValue.length > 0) {
          selectValue.forEach((item) => {
            initCheckedKeys.value.push(item);
          });
        } else {
          initCheckedKeys.value = [];
        }
        num.value = num.value + 1;
      }
    }).then();
  }

  /**
   * 设置不可选择的部门
   */
  async function setDisabledTreeData(record) {
    for (const item of record) {
      if (departIds.value) {
        if (unref(departIds).includes(item.id)) {
          item.disabled = false;
        } else {
          item.disabled = true;
        }
        //存在下一级接着递归循环，直到循环结束
        if (item.children && item.children.length > 0) {
          await setDisabledTreeData(item.children);
        }
      } else {
        item.disabled = true;
      }
    }
    treeData.value = record;
  }

  /**
   * 获取已选择数据
   */
  function getSelectTreeData(success) {
    const options = <any[]>[];
    const values = <any[]>[];
    selectRows.value.forEach((item) => {
      options.push({ label: item[props.labelKey], value: item[props.rowKey] });
    });
    checkedKeys.value.forEach((item) => {
      values.push(item);
    });
    selectOptions.value = options;
    initCheckedKeys.value = [];
    num.value = 0;
    success && success(options, values);
  }

  /**
   * 弹出框显示隐藏触发事件
   */
  async function visibleChange(visible) {
    if (visible) {
      //弹出框打开时加载全部数据
      openModal.value = true;
      await onLoadData(null);
    } else {
      openModal.value = false;
    }
  }

  /**
   * 取消事件
   */
  function cancel(success) {
    const options = <any[]>[];
    const values = <any[]>[];
    selectRows.value.forEach((item) => {
      options.push({ label: item[props.labelKey], value: item[props.rowKey] });
    });
    initCheckedKeys.value.forEach((item) => {
      values.push(item);
    });
    initCheckedKeys.value = [];
    num.value = 0;
    success && success(options, values);
  }

  return [
    {
      checkedKeys,
      treeData,
      visibleChange,
      onSelect,
      onCheck,
      getSelectTreeData,
      cancel,
      selectOptions,
      selectValues,
    },
  ];
}
