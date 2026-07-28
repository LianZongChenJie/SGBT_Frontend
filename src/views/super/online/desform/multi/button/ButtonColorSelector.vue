<template>
  <ul class="button-color-select">
    <li v-for="item in colorList" :class="getLiClass(item)" :style="{ 'background-color': item }" @click="(e) => onClick(item, e)">
      <CheckOutlined />
    </li>
  </ul>
</template>

<script lang="ts">
  const colorList: string[] = [
    'rgb(33, 150, 243)',
    'rgb(156, 39, 176)',
    'rgb(63, 81, 181)',
    'rgb(233, 30, 99)',
    'rgb(255, 152, 0)',
    'rgb(76, 175, 80)',
    'rgb(0, 188, 212)',
  ];
  import { CheckOutlined } from '@ant-design/icons-vue';

  export default {
    name: 'ButtonColorSelector',
    components: {
      CheckOutlined,
    },
    props: {
      value: {
        type: String,
        default: '',
      },
    },
    emits: ['change', 'update:value'],
    setup(props, { emit }) {
      function getLiClass(item) {
        if (props.value === item) {
          return 'selected';
        }
        return '';
      }

      function onClick(color, e) {
        e.preventDefault();
        e.stopPropagation();
        emit('change', color);
        emit('update:value', color);
      }

      return {
        colorList,
        getLiClass,
        onClick,
      };
    },
  };
</script>

<style scoped lang="less">
  .button-color-select {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: block;
    li {
      border-radius: 50%;
      display: inline-block;
      height: 28px;
      line-height: 28px;
      margin-right: 14px;
      text-align: center;
      transition: all 0.4s ease;
      vertical-align: top;
      width: 28px;
      list-style: none;
      &:hover {
        transform: scale(1.22);
      }

      .anticon {
        color: #fff;
        font-size: 18px;
        //line-height: 28px;
        display: none;
        //update-begin-author:liusq---date:2023-12-25--for: 【QQYUN-7744】自定义按钮 选中 未居中
        position: relative;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        //update-end-author:liusq---date:2023-12-25--for:  【QQYUN-7744】自定义按钮 选中 未居中
      }

      &.selected {
        .anticon {
          display: block;
        }
      }
    }
  }
</style>
