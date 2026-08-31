<template>
  <div class="reportTree">
    <div class="root">
      <p class="company">{{ companyName }}</p>
      <p class="add">
        <span class="icon"></span>
        <span v-if="!readonly" class="text" @click="addHandle({ isRoot: true })">添加下属</span>
      </p>
    </div>
    <p v-if="treeSourceLen" class="line"></p>
    <nodeWrap
      v-if="treeSourceLen"
      :readonly="readonly"
      :treeSource="treeSource"
      rootNode
      @add="addHandle"
      v-bind="$attrs"
    ></nodeWrap>
  </div>
</template>

<script setup name="reportTree">
  import nodeWrap from './components/nodeWrap/index.vue';
  import { computed } from 'vue';
  const props = defineProps({
    companyName: {
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    },
    treeSource: {
      type: Array,
      default: []
    }
  });
  const emit = defineEmits(['add']);
  const treeSourceLen = computed(() => props.treeSource.length);
  const addHandle = (...arg) => {
    console.log('reportTree');
    emit('add', ...arg);
  };
</script>

<style lang="less" scoped>
  p { margin-bottom: 0; }
  .reportTree {
    height: 100%;
    overflow: auto;
  }
  .root {
    display: flex;
    align-items: center;
    line-height: 36px;
    height: 36px;
  }
  .company {
    margin: 0 10px;
    font-size: 16px;
  }
  .add {
    color: #9e9e9e;
    cursor: pointer;
  }
  .line {
    border-left: 1px solid #d3d3d3;
    height: 20px;
    margin-left: 20px;
  }
</style>
