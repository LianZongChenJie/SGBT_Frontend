<template>
  <div class="low-app-excel-tag" @click="onClick">
    <div class="left" :style="{ 'background-color': color }"></div>
    <div class="right" :style="{ 'background-color': color }"></div>
    <div style="position: absolute; color: #fff; font-size: 13px; left: 5px; line-height: 23px">表头</div>
  </div>
</template>

<script>
  import { computed } from 'vue';
  export default {
    name: 'HeaderTag',
    props: {
      active: {
        type: Boolean,
        default: false,
      },
      show: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['tap'],
    setup(props, { emit }) {
      const color = computed(() => {
        return props.active === true ? '#30ae01' : '#9e9e9e';
      });

      function onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        emit('tap');
      }
      return {
        color,
      };
    },
  };
</script>

<style scoped lang="less">
  .low-app-excel-tag {
    height: 23px;
    width: 54px;
    position: relative;
    text-align: left;

    .left {
      width: 34px;
      height: 21px;
      display: inline-block;
      position: absolute;
    }
    .right {
      width: 17px;
      height: 17px;
      border-width: 0 0 0px 1px;
      transform: rotate(-135deg);
      display: inline-block;
      position: absolute;
      top: 2px;
      left: 25px;
    }
  }
</style>
