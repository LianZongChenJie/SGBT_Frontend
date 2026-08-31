<template>
  <div class="filter-tab-bar">
    <span :class="active=='1'?'active':''" @click="(e)=>onClick(e, '1')">新的筛选</span>
    <span :class="active=='2'?'active':''" @click="(e)=>onClick(e, '2')">已保存</span>
  </div>
</template>

<script>
  import { computed } from 'vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  
  export default {
    name: 'FilterTabBar',
    emits: ['active'],
    setup(_p, {emit}){
      const attrs = useAttrs();
      console.log('attrs', attrs)
      const active = computed(()=>{
        return attrs.value.activeKey;
      });
      
      function onClick(e, key) {
        e.preventDefault();
        e.stopPropagation();
        emit('active', key)
      }
      return {
        active,
        onClick
      }
    }
  };
</script>

<style lang="less">
  .filter-tab-bar {
    padding: 4px;
    font-weight: bold;
    background: rgb(235, 235, 235);
    margin: 0px auto;
    border-radius: 32px;
    span {
      cursor: pointer;
      height: 24px;
      line-height: 24px;
      border-radius: 24px;
      color: rgb(117, 117, 117);
      padding: 0px 22px;
      display: inline-block;
      &.active {
        color: rgb(33, 150, 243);
        background: rgb(255, 255, 255);
      }
    }
  }
</style>
