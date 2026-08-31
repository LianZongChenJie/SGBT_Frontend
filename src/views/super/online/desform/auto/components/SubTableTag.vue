<template>
  <div class="sub-table-tag" v-if="len">
    <TableOutlined />
    <span style="font-size: 14px">{{ len }}</span>
  </div>
</template>

<script lang="ts">
  import { TableOutlined } from '@ant-design/icons-vue';
  import { defineComponent, computed } from 'vue';

  export default defineComponent({
    name: 'SubTableTag',
    components: {
      TableOutlined,
    },
    props: {
      text: {
        type: Array,
        default: () => [],
      },
    },
    setup(props) {
      const len = computed(() => {
        if (!props.text || props.text.length == 0) {
          return '';
        }
        return props.text.length;
      });

      return {
        len,
      };
    },
  });
</script>

<style scoped lang="less">
  .sub-table-tag {
    background-color: #e8e8e8;
    border-radius: 3px;
    display: inline-block;
    font-size: 13px;
    height: 21px;
    line-height: 21px;
    padding: 0 6px;
    .anticon {
      color: #9d9d9d;
      font-size: 14px;
      margin-right: 4px;
    }
  }
</style>
