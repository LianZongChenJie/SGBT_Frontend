<template>
  <div class="ant-radio-group ant-radio-group-solid">
    <label
      class="ant-radio-button-wrapper"
      v-for="item in options"
      :class="isChecked(item.value) ? 'ant-radio-button-wrapper-checked' : ''"
      style="padding: 0 8px; margin: 1px"
    >
      <span class="ant-radio-button" :class="isChecked(item.value) ? 'ant-radio-button-checked' : ''" @click="(e) => handleClick(e, item)">
        <input type="radio" class="ant-radio-button-input" :value="item.value" />
        <span class="ant-radio-button-inner"></span>
      </span>
      <span>{{ item.label }}</span>
    </label>
  </div>
</template>

<script>
  export default {
    name: 'CheckboxButton',
    props: {
      options: {
        type: Array,
        default: [],
      },
      value: {
        type: Array,
        default: [],
      },
    },
    emits: ['update:value', 'select'],
    setup(props, { emit }) {
      function isChecked(value) {
        let arr = props.value;
        if (!arr || arr.length == 0) {
          return false;
        }
        return arr.indexOf(value) >= 0;
      }

      function handleClick(e, item) {
        e.preventDefault();
        e.stopPropagation();
        let arr = props.value;
        let index = arr.indexOf(item.value);
        if (index >= 0) {
          //设置必须留选中一个
          if (arr.length > 1) {
            arr.splice(index, 1);
          }
        } else {
          arr.push(item.value);
        }
        emit('update:value', arr);
        emit('select', arr);
      }

      return {
        isChecked,
        handleClick,
      };
    },
  };
</script>

<style lang="less" scoped>
  .ant-radio-button-wrapper:first-child {
    border-inline-start: 1px solid #d9d9d9;
    border-start-start-radius: 2px;
    border-end-start-radius: 2px;
  }

  .ant-radio-button-wrapper {
    position: relative;
    display: inline-block;
    height: 32px;
    margin: 0;
    padding-inline: 15px;
    padding-block: 0;
    color: rgba(0, 0, 0, 0.88);
    font-size: 14px;
    line-height: 30px;
    background: #ffffff;
    border: 1px solid #d9d9d9;
    border-block-start-width: 1.02px;
    border-inline-start-width: 0;
    border-inline-end-width: 1px;
    cursor: pointer;
    transition:
      color 0.2s,
      background 0.2s,
      border-color 0.2s,
      box-shadow 0.2s;
  }

  .ant-radio-button-wrapper > .ant-radio-button {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
  }

  .ant-radio-group-solid .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
    color: #fff;
    background: #2196f3;
    border-color: #2196f3;
  }
</style>
