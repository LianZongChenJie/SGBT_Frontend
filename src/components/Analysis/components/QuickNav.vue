<template>
  <Card title="快捷导航" v-bind="$attrs">
    <template v-for="item in navItems" :key="item.title">
      <CardGrid @click="goPage(item)">
        <div class="quick-nav-item">
          <div class="quick-nav-item__icon" :style="{ backgroundColor: item.softColor }">
            <Icon :icon="item.icon" :color="item.color" size="24" />
          </div>
          <span class="quick-nav-item__title">{{ item.title }}</span>
        </div>
      </CardGrid>
    </template>
  </Card>
</template>

<script lang="ts" setup>
  import { Card } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Icon } from '/@/components/Icon';
  import { useRouter } from 'vue-router';

  interface QuickNavItem {
    title: string;
    icon: string;
    color: string;
    softColor: string;
    path: string;
  }

  const CardGrid = Card.Grid;
  const { createMessage } = useMessage();
  const router = useRouter();

  const navItems: QuickNavItem[] = [
    {
      title: '故障报修',
      icon: 'ant-design:alert-outlined',
      color: '#ef4444',
      softColor: 'rgba(239, 68, 68, 0.12)',
      path: '/shengchanguanli/weixiubaoyang/guzhangbaoxiu',
    },
    {
      title: '设备维修',
      icon: 'ant-design:tool-outlined',
      color: '#14b8a6',
      softColor: 'rgba(20, 184, 166, 0.12)',
      // path: '/shengchanguanli/weixiubaoyang/weixiugongdan',
    },
    {
      title: '新增设备',
      icon: 'ant-design:plus-square-outlined',
      color: '#3b82f6',
      softColor: 'rgba(59, 130, 246, 0.12)',
      path: '/shengchanguanli/shebeiguanli/shebeitaizhang',
    },
    {
      title: '设备保养',
      icon: 'ant-design:dashboard-outlined',
      color: '#f59e0b',
      softColor: 'rgba(245, 158, 11, 0.12)',
      // path: '/shengchanguanli/gongdanguanli/shebeiweihugongdanguanli',
    },
    {
      title: '新增备件',
      icon: 'ant-design:appstore-outlined',
      color: '#8b5cf6',
      softColor: 'rgba(139, 92, 246, 0.12)',
      path: '/beijiantaizhang',
    },
    {
      title: '备件领用',
      icon: 'ant-design:shopping-cart-outlined',
      color: '#06b6d4',
      softColor: 'rgba(6, 182, 212, 0.12)',
      path: '/beijianguanli/beijianlingyong',
    },
    {
      title: '备件采购',
      icon: 'ant-design:shopping-outlined',
      color: '#ec4899',
      softColor: 'rgba(236, 72, 153, 0.12)',
      // path: '/shengchanguanli/gongdanguanli/beijianshiyongshenpi',
    },
    {
      title: '备件入库',
      icon: 'ant-design:inbox-outlined',
      color: '#22c55e',
      softColor: 'rgba(34, 197, 94, 0.12)',
      path: '/rukutaizhang',
    },
    {
      title: '备件出库',
      icon: 'ant-design:export-outlined',
      color: '#f97316',
      softColor: 'rgba(249, 115, 22, 0.12)',
      path: '/chukutaizhang',
    },
  ];

  function goPage(item: QuickNavItem) {
    const route = router.resolve({ path: item.path });
    if (!route.matched.length) {
      createMessage.warning(`${item.title}页面路由暂未配置`);
      return;
    }
    router.push({ path: item.path }).catch(() => undefined);
  }
</script>

<style lang="less" scoped>
  .quick-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 68px;
    text-align: center;
  }

  .quick-nav-item__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .quick-nav-item__title {
    font-size: 14px;
    font-weight: 500;
    color: #334155;
    line-height: 1.3;
  }
</style>
