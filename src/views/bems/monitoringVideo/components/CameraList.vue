<template>
  <div class="camera-list card">
    <div class="card-header">
      <h3><video-camera-outlined /> 摄像头列表</h3>
    </div>
    <div class="card-body">
      <BasicTable @register="registerTable">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'online'">
            <span v-if="!hasOnlineStatus(record)" class="camera-status">-</span>
            <a-tag v-else :color="isOnline(record) ? 'success' : 'error'">
              {{ isOnline(record) ? '在线' : '离线' }}
            </a-tag>
          </template>
        </template>
      </BasicTable>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { BasicColumn, BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { VideoCameraOutlined } from '@ant-design/icons-vue';
  import { getCameraPage } from '../index.api';
  import type { CameraRecord } from '../index.api';

  /** 字段名兼容：按候选字段顺序取第一个非空值 */
  const pickField = (record: CameraRecord, keys: string[]) => {
    for (const key of keys) {
      const value = record?.[key];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return '';
  };

  /** 是否存在在线状态字段 */
  const hasOnlineStatus = (record: CameraRecord) => {
    const value = record?.online ?? record?.status;
    return value !== undefined && value !== null && value !== '';
  };

  /** 在线状态：1/true/'online' 视为在线，其余为离线 */
  const isOnline = (record: CameraRecord) => {
    const value = record?.online ?? record?.status;
    return value === 1 || value === '1' || value === true || value === 'online' || value === '在线';
  };

  /** 监控点类型：0-枪机，1-半球，2-快球，3-带云台枪机 */
  const CAMERA_TYPE_MAP: Record<string, string> = {
    0: '枪机',
    1: '半球',
    2: '快球',
    3: '带云台枪机',
  };

  const cameraTypeText = (value: unknown) => {
    if (value === undefined || value === null || value === '') return '-';
    return CAMERA_TYPE_MAP[String(value)] ?? String(value);
  };

  const columns: BasicColumn[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 70,
      customRender: ({ index }) => index + 1,
    },
    {
      title: '摄像头名称',
      dataIndex: 'cameraName',
      key: 'cameraName',
      customRender: ({ record }) => pickField(record, ['cameraName', 'name', 'title']) || '-',
    },
    {
      title: '摄像头编码',
      dataIndex: 'cameraIndexCode',
      key: 'cameraIndexCode',
      customRender: ({ record }) => pickField(record, ['cameraIndexCode', 'cameraCode', 'indexCode']) || '-',
    },
    {
      title: '区域名称',
      dataIndex: 'regionName',
      key: 'regionName',
      customRender: ({ record }) => pickField(record, ['regionName']) || '-',
    },
    {
      title: '监控点类型',
      dataIndex: 'cameraType',
      key: 'cameraType',
      customRender: ({ record }) => cameraTypeText(record?.cameraType),
    },
    {
      title: '在线状态',
      dataIndex: 'online',
      key: 'online',
      width: 110,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
      customRender: ({ record }) => record?.updateTime || '-',
    },
  ];

  /** 分页查询摄像头列表（/bems/hikvision/camera/page） */
  const getCameraList = async (pageParams) => {
    const { pageNo, pageSize } = pageParams;
    const res: any = await getCameraPage({ pageNo, pageSize });
    return {
      records: res?.records ?? res?.list ?? [],
      total: res?.total ?? 0,
    };
  };

  const { tableContext } = useListPage({
    designScope: 'basic-table-demo',
    tableProps: {
      api: getCameraList,
      columns,
      showActionColumn: false,
      showTableSetting: false,
      useSearchForm: false,
      size: 'middle',
      rowKey: 'id',
      pagination: {
        pageSize: 10,
        showSizeChanger: true,
      },
    },
  });

  const [registerTable] = tableContext;
</script>

<style scoped lang="less">
  .camera-list.card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    .card-header {
      padding: 18px 22px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #2d3748;
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
      }
    }

    .card-body {
      padding: 22px;
    }
  }

  .camera-status {
    color: #bfbfbf;
  }
</style>
