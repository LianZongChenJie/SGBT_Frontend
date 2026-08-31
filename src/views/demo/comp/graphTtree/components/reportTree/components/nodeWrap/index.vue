<template>
  <div class="nodeWrap" :class="[rootNode && 'rootNodeWrap']">
    <node
      v-for="(item, index) in treeSource"
      :parentNode="parentNode"
      :accountId="accountId"
      :key="item[accountId]"
      :item="item"
      v-bind="$attrs"
    ></node>
  </div>
</template>

<script setup name="nodeWrap">
  import node from '../node/index.vue';
  import { computed, ref, watch } from 'vue';
  const props = defineProps({
    accountId: {
      type: String,
      default: 'accountId'
    },
    children: {
      type: String,
      default: 'children'
    },
    rootNode: {
      type: Boolean,
      default: false
    },
    parentNode: {
      type: Object || Null,
      default: null
    },
    treeSource: {
      type: Array,
      default: () => []
    }
  });
  //let emit = defineEmits(['add', 'del', 'replace']);
</script>

<style lang="less" scoped>
  .nodeWrap {
    padding-left: 80px;
    &.rootNodeWrap {
      padding-left: 20px;
    }
  }
</style>
