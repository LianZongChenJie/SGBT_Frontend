<template>
  <div class="device-list-container">
    <div>
      <div class="device-card-list" v-loading="loading">
        <div
          v-for="device in deviceList"
          :key="device.id"
          class="device-card"
          :class="{ active: selectedDeviceId === device.id }"
          @click="handleDeviceClick(device)"
        >
          <div class="card-header">
            <div class="device-name">设备名称：{{ device.deviceName }}</div>
          </div>
          <div class="card-divider"></div>
          <div class="card-body">
            <div v-for="attr in device.attributes" :key="attr.id" class="attr-item">
              <span class="attr-label">{{ attr.attributeName }}</span>
              <div class="attr-value-container"
                ><a-select
                  size="small"
                  v-if="attr.readwriteLevel == '1' && attr.configList"
                  v-model:value="attr.value"
                  :options="attr.configList"
                  :fieldNames="{ label: 'value', value: 'key' }"
                  style="width: 100px; text-align: center; background: rgba(0, 0, 0, 0)"
                />
                <a-input v-else-if="attr.readwriteLevel == '1'" size="small" style="width: 100px; text-align: center" v-model:value="attr.value" />
                <span v-else class="attr-value" :class="getStatusColor(attr)">{{ attr.label }}{{ attr.unit || '' }}</span></div
              >
            </div>
          </div>
        </div>
      </div>
      <!-- <el-pagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        background
        layout="prev, pager, next,  ->, total, sizes"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        @current-change="onPageChange"
        @size-change="onSizeChange"
        style="float: right; margin-top: 10px"
      /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { getDeviceListByCategoryId, getDeviceByCategoryId } from './api';

  const props = defineProps({
    categoryId: {
      type: String,
      default: '',
    },
  });

  const deviceList = ref<any[]>([]);
  const selectedDeviceId = ref('');
  const loading = ref(true);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  const getStatusColor = (attr: any) => {
    const { attributeCode, label } = attr;
    const statusLabel = label || '';
    const status = statusLabel.trim();

    if (attributeCode === 'EFS') {
      if (status === '运行') return 'status-running';
      if (status === '停机') return 'status-stopped';
    } else if (attributeCode === 'EFAM') {
      if (status === '自动') return 'status-auto';
      if (status === '手动') return 'status-manual';
    } else if (attributeCode === 'EFF') {
      if (status === '故障') return 'status-fault';
      if (status === '正常') return 'status-normal';
    } else if (attributeCode === 'EFC') {
      if (status === '开机') return 'status-running';
      if (status === '停机') return 'status-stopped';
    }

    return '';
  };

  const getDeviceAttributes = async (deviceId: string) => {
    const res = await getDeviceByCategoryId({ deviceId });
    return res.map((item: any) => {
      if (item.valueConfig) {
        item.configList = JSON.parse(item.valueConfig);
        item.configList.forEach((e: any) => {
          if (e.key == item.value) {
            item.label = e.value;
          }
        });
      } else {
        if (Number(item.value)) {
          item.label = Number(item.value).toFixed(1);
        } else {
          item.label = item.value;
        }
      }
      return item;
    });
  };

  const loadDeviceList = async () => {
    loading.value = true;
    try {
      const res = await getDeviceListByCategoryId({ categoryId: props.categoryId, pageNo: currentPage.value, pageSize: pageSize.value });
      total.value = res.length;
      const devices = await Promise.all(
        res.map(async (item: any) => {
          const attributes = await getDeviceAttributes(item.id);
          return {
            ...item,
            attributes,
          };
        })
      );
      deviceList.value = devices || [];
      if (deviceList.value.length > 0) {
        selectedDeviceId.value = deviceList.value[0].id;
      }
    } finally {
      loading.value = false;
    }
    console.log(deviceList.value, 'device');
  };

  const handleDeviceClick = (device: any) => {
    selectedDeviceId.value = device.id;
  };

  onMounted(async () => {
    await loadDeviceList();
  });
</script>

<style scoped lang="less">
  .device-list-container {
    height: 100%;
    padding: 12px;
    background-color: #f5f5f5;
    overflow: auto;

    .loading-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: calc(100% - 60px);

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #8080ff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-text {
        margin-top: 16px;
        font-size: 14px;
        color: #666;
      }
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .list-title {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      .icon-box {
        width: 4px;
        height: 20px;
        background-color: #8080ff;
        margin-right: 10px;
      }

      > span {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }

    .device-card-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 12px;
    }

    .device-card {
      background-color: #fff;
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;

      &:hover {
        border-color: #8080ff;
        box-shadow: 0 4px 12px rgba(128, 128, 255, 0.15);
      }

      &.active {
        border-color: #8080ff;
        background-color: #f8f9ff;
      }

      .card-header {
        margin-bottom: 12px;

        .device-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .device-type {
          font-size: 14px;
          color: #666;
        }
      }

      .card-divider {
        height: 2px;
        background-color: #e8e8e8;
        margin-bottom: 0px;
      }

      .card-body {
        .attr-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .attr-label {
            font-size: 13px;
            color: #666;
          }

          .attr-value {
            font-size: 13px;
            font-weight: 500;
            color: #333;

            &.btn-style {
              display: inline-block;
              padding: 4px 16px;
              border-radius: 4px;
              background-color: #e8e8e8;
              color: #333;
              font-weight: 600;
            }

            &.status-running {
              color: #52c41a;
              &.btn-style {
                background-color: #f6ffed;
                border: 1px solid #b7eb8f;
              }
            }

            &.status-stopped {
              color: #999;
              &.btn-style {
                background-color: #f5f5f5;
                border: 1px solid #d9d9d9;
              }
            }

            &.status-auto {
              color: #1890ff;
              &.btn-style {
                background-color: #e6f7ff;
                border: 1px solid #91d5ff;
              }
            }

            &.status-manual {
              color: #faad14;
              &.btn-style {
                background-color: #fffbe6;
                border: 1px solid #ffe58f;
              }
            }

            &.status-fault {
              color: #f5222d;
              &.btn-style {
                background-color: #fff1f0;
                border: 1px solid #ffccc7;
              }
            }

            &.status-normal {
              color: #52c41a;
              &.btn-style {
                background-color: #f6ffed;
                border: 1px solid #b7eb8f;
              }
            }
          }
        }
      }
    }
  }
</style>
