<template>
  <div class="link-record-selected-item">
    <div
      style="
        display: flex;
        flex-direction: row;
        height: 24px;
        border-radius: 12px;
        padding-right: 3px;
        vertical-align: middle;
        background-color: #e5e5e5;
        color: #333;
      "
    >
      <span style="width: 24px; height: 24px; line-height: 24px; padding: 0 5px; display: inline-block">
        <BlockOutlined />
      </span>

      <div style="height: 24px; line-height: 24px" class="ellipsis">
        {{ info.label }}
      </div>

      <div class="icon-close">
        <CloseOutlined @click="removeSelect" style="padding: 5px"/>
      </div>
    </div>
  </div>
</template>

<script>
  import { CloseOutlined, BlockOutlined } from '@ant-design/icons-vue';

  export default {
    name: 'SelectedItem',
    components: {
      CloseOutlined,
      BlockOutlined,
    },
    props: {
      info: {
        type: Object,
        default: () => {},
      },
    },
    emits: ['unSelect'],
    setup(props, { emit }) {
      function removeSelect(e) {
        e.preventDefault();
        e.stopPropagation();
        emit('unSelect', props.info.value);
      }

      return {
        removeSelect,
      };
    },
  };
</script>

<style lang="less">
  .link-record-selected-item {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-right: 8px;
    height: 30px;
    border-radius: 12px;
    line-height: 30px;
    vertical-align: middle;

    .ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .icon-remove {
      position: absolute;
      top: -10px;
      right: -4px;
      font-size: 18px;
      width: 15px;
      height: 15px;
      cursor: pointer;
      display: none;
    }

    .icon-close {
      height: 22px;
      line-height: 24px;
      font-size: 10px;
      font-weight: bold;
      &:hover {
        color: #0a8fe9;
      }
    }

    &:hover {
      .icon-remove {
        display: block;
      }
    }
  }
</style>
