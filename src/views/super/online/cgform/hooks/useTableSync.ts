import type { Ref, ComputedRef } from 'vue';
import { ref, computed, nextTick, inject } from 'vue';
import { CgformModal } from '../types';
import { JVxeColumn, JVxeTableInstance } from '/@/components/jeecg/JVxeTable/types';
import { VALIDATE_FAILED } from '../cgform.data';
import { pick } from 'lodash-es';

export function useTableSync(columns: Ref<JVxeColumn[]>) {
  const tables = inject<CgformModal.TablesRef>('tables');
  const fullScreenRef = inject<ComputedRef<boolean>>('fullScreenRef');
  const tableRef = ref<JVxeTableInstance>();
  const loading = ref(false);
  const dataSource = ref<Recordable[]>([]);
  // 表格动态高度
  const tableHeight = computed(() => ({
    // 正常表格高度
    normal: fullScreenRef?.value ? 430 : 260,
    // 没有 toolbar 的表格高度
    noToolbar: fullScreenRef?.value ? 480 : 320,
  }));

  // 当前表的所有列字段key
  const columnKeys = computed<string[]>(() => ['id'].concat(columns.value.map((col) => col.key)));

  // 表格其他props
  const tableProps = computed(() => {
    return {
      // 针对Online表单对虚拟滚动做出优化
      // 虚拟滚动配置，y轴（行数）大于xx条数据时启用虚拟滚动
      // update-begin--author:liaozhiyang---date:20231025---for：【QQYUN-6808】online编辑字段多了卡顿
      scrollY: {
        enabled: true,
        gt: 15,
      },
      // 列数
      scrollX: {
        enabled: true,
        gt: 20,
      },
      // update-begin--author:liaozhiyang---date:20231025---for：【QQYUN-6808】online编辑字段多了卡顿
    };
  });

  // 校验并获取表格数据
  async function validateData(activeKey: string) {
    let instance = tableRef.value!;
    let errMap = await instance.fullValidateTable();
    if (errMap) {
      throw { code: VALIDATE_FAILED, activeKey };
    }
    // 过滤掉当前表中不存在的字段，以防止多个表冲突
    let tableData = instance.getTableData().map((data) => pick(data, columnKeys.value));
    // 获取被删除的ID
    let deleteIds = instance.getDeleteData().map((d) => d.id);
    return { tableData, deleteIds };
  }

  /**
   * 设置数据源
   * @param data
   * @param insert
   */
  async function setDataSource(data, insert = false) {
    if (insert) {
      dataSource.value = [];
      await nextTick();
      await tableRef.value!.addOrInsert(data, 0, null, { setActive: false });
      await nextTick();
      tableRef.value!.recalcDisableRows();
    } else {
      dataSource.value = data;
      // update-begin--author:liaozhiyang---date:20240705---for：【TV360X-1762】解决编辑时id可删除
      await nextTick();
      tableRef.value!.recalcDisableRows();
      // update-end--author:liaozhiyang---date:20240705---for：【TV360X-1762】解决编辑时id可删除
    }
  }

  /**
   * 同步列表，可以同步新增、修改、删除
   * @param dbTable
   */
  function syncTable(dbTable: Ref<CgformModal.DBAttributeTableType | undefined>) {
    let targetTable = tableRef.value!;
    let sourceTable = dbTable.value!.tableRef!;

    let removeIds = dbTable.value!.getRemoveIds();
    let sourceData = sourceTable.getXTable().internalData.tableFullData;
    let targetData = targetTable.getXTable().internalData.tableFullData;

    sourceData.forEach((sourceValue) => {
      let flag = false;
      targetData.forEach((targetValue) => {
        if (sourceValue.id === targetValue.id) {
          // 判断是否修改了值
          let dbFieldName = targetValue['dbFieldName'];
          let dbFieldTxt = targetValue['dbFieldTxt'];
          if (sourceValue.dbFieldName !== dbFieldName || sourceValue.dbFieldTxt !== dbFieldTxt) {
            // 同步修改字段
            targetTable.setValues([
              {
                rowKey: targetValue.id,
                values: {
                  dbFieldName: sourceValue.dbFieldName,
                  dbFieldTxt: sourceValue.dbFieldTxt,
                },
              },
            ]);
          }
          flag = true;
        } else {
          // id不匹配则有可能是新增也有可能是删除了的
          // 遍历传进来的 deleteIds 进行对比
          removeIds.forEach((deletedId) => {
            // 对比成功，则删除该条数据
            if (deletedId === targetValue.id) {
              // update-begin--author:liaozhiyang---date:20240724---for：【TV360X-1852】新增时删除所有字段再新增一个字段，保存报错
              // 根本原因是删除导致 targetData 数组减少了forEach侦测不到。可改成for循环 or 也可使用宏任务setTimeout特性解决
              setTimeout(() => {
                targetTable.removeRowsById(deletedId);
              }, 0);
              // update-end--author:liaozhiyang---date:20240724---for：【TV360X-1852】新增时删除所有字段再新增一个字段，保存报错
              flag = true;
            }
          });
        }
      });
      // 判断是否操作了该条数据，若没有操作则代表要执行新增操作
      if (!flag) {
        let record = Object.assign({}, sourceValue);
        columns.value.forEach((column) => {
          if (column.key !== 'dbFieldName' && column.key !== 'dbFieldTxt') {
            record[column.key] = column.defaultValue;
          }
        });
        targetTable.addRows(record);
      }
    });
    return nextTick();
  }

  return { tables, tableRef, loading, dataSource, columnKeys, tableHeight, tableProps, syncTable, validateData, setDataSource };
}
