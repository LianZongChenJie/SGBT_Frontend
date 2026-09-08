<template>
  <div class="monitoring-source-main-box">
    <div class="tabs-container">
      <div class="level-one-tabs">
        <template v-for="category in categoryData" :key="category.key">
          <!-- 一级分类 -->
          <div
            class="level-one-tab"
            :class="{ active: activeCategory === category.key }"
            @click="handleCategoryClick(category)"
          >
            <span class="tab-label">{{ category.value }}</span>
            <span v-if="category.children && category.children.length" class="arrow-icon">›</span>
          </div>

          <!-- 二级分类 -->
          <div
            v-if="category.children && category.children.length && expandedCategory === category.key"
            class="level-two-tabs"
            :class="{ 'animate-expand': true }"
          >
              <div
                v-for="child in category.children"
                :key="child.key"
                class="level-two-tab"
                :class="{ active: activeChild === child.key }"
                @click="handleChildClick(child, category.key)"
              >
              <span class="child-label">{{ child.value }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 组件展示区域 -->
    <div class="component-container">
      <component :is="currentComponent" v-if="currentComponent" />
      <div v-else class="empty-state">请选择一个分类查看详情</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import gas from './components/gas.vue';
  import hydrogen from './components/hydrogen.vue';
  import gl1 from './components/gl1.vue';
  import gl2 from './components/gl2.vue';
  import gl3 from './components/gl3.vue';
  import glfj from './components/glfj.vue';
  import cqhq from './components/cqhq.vue';
  import cqqqjyq from './components/cqqqjyq.vue';
  import bfxtscl from './components/bfxtscl.vue';
  import ysclq from './components/ysclq.vue';
  import eldb from './components/eldb.vue';
  import gf from './components/gf.vue';
  import grxtzj from './components/grxtzj.vue';
  import ld from './components/ld.vue';
  import bems from './components/bems.vue';
  import nyz from './components/nyz.vue';

  // 组件映射
  const componentMap: Record<string, any> = {
    gas,
    hydrogen,
    gl1,
    gl2,
    gl3,
    glfj,
    cqhq,
    cqqqjyq,
    bfxtscl,
    ysclq,
    eldb,
    gf,
    grxtzj,
    ld,
    bems,
    nyz,
  };

  // 分类数据
  const categoryData = [
    { key: 'bjq', value: '报警器', children: [{ key: 'gas', value: '燃气' }, { key: 'hydrogen', value: '氢气' }] },
    { key: 'glxt', value: '锅炉系统', children: [{ key: 'gl1', value: '1#锅炉' }, { key: 'gl2', value: '2#锅炉' }, { key: 'gl3', value: '3#锅炉' }, { key: 'glfj', value: '锅炉辅机' }] },
    { key: 'cqxt', value: '掺氢系统', children: [{ key: 'cqhq', value: '掺氢-混气' }, { key: 'cqqqjyq', value: '掺氢-氢气减压撬' }] },
    { key: 'bfxtscl', value: '水处理系统', children: [{ key: 'bfxtscl', value: '北方稀土水处理' }, { key: 'ysclq', value: '雨水处理器' }] },
    { key: 'eldb', value: '二楼电表' },
    { key: 'gf', value: '光伏系统' },
    { key: 'grxtzj', value: '光热系统' },
    { key: 'ld', value: '零氮' },
    { key: 'bems', value: 'cems系统' },
    { key: 'nyz', value: '能源站' },
  ];

  // 状态管理
  const activeCategory = ref<string>('');
  const activeChild = ref<string>('');
  const expandedCategory = ref<string>('');

  // 当前显示的组件
  const currentComponent = computed(() => {
    const key = activeChild.value || activeCategory.value;
    return componentMap[key] || null;
  });

  // 点击一级分类
  const handleCategoryClick = (category: any) => {
    activeCategory.value = category.key;

    // 如果点击的是已经展开的分类，则收起
    if (expandedCategory.value === category.key) {
      expandedCategory.value = '';
      activeChild.value = '';
    } else {
      // 否则展开当前分类，收起其他分类
      expandedCategory.value = category.key;
      activeChild.value = '';
    }

    // 如果没有子分类，直接渲染组件
    if (!category.children || category.children.length === 0) {
      expandedCategory.value = '';
    }
  };

  // 点击二级分类
  const handleChildClick = (child: any, parentKey: string) => {
    activeChild.value = child.key;
    activeCategory.value = parentKey;
    // 保持当前分类展开
    expandedCategory.value = parentKey;
  };
</script>

<style scoped lang="less">
  .monitoring-source-main-box {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .tabs-container {
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    padding: 0;
  }

  .level-one-tabs {
    display: flex;
    align-items: center;
    overflow-x: auto;
    white-space: nowrap;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */

    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
  }

  .level-one-tab {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    cursor: pointer;
    transition: color 0.2s ease;
    background: #fff;
    border-right: 1px solid #e8e8e8;
    color: #333;
    font-size: 13px;
    user-select: none;
    position: relative;

    &:hover {
      color: #1890ff;
    }

    &.active {
      color: #1890ff;
      font-weight: 500;
    }

    .tab-label {
      flex-shrink: 0;
    }

    .arrow-icon {
      font-size: 14px;
      color: #999;
      transition: transform 0.2s ease;
    }
  }

  .level-two-tabs {
    display: flex;
    align-items: center;
    background: #f7f7f7;
    border-bottom: 1px solid #e8e8e8;
    padding: 0;
    overflow: hidden;
    max-width: 0;
    animation: expandWidth 0.3s ease-out forwards;
  }

  @keyframes expandWidth {
    from {
      max-width: 0;
      opacity: 0;
    }
    to {
      max-width: 1000px;
      opacity: 1;
    }
  }

  .level-two-tab {
    display: flex;
    align-items: center;
    padding: 6px 16px;
    cursor: pointer;
    transition: color 0.2s ease;
    color: #666;
    font-size: 12px;
    border-right: 1px solid #e8e8e8;
    user-select: none;

    &:hover {
      color: #1890ff;
    }

    &.active {
      color: #1890ff;
      font-weight: 500;
    }

    .child-label {
      flex-shrink: 0;
    }
  }

  .component-container {
    flex: 1;
    overflow: auto;
    padding: 16px;
    background: #f0f2f5;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
    font-size: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
</style>
