<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    width="900px"
    @ok="ok"
    @cancel="closeModal"
    @visible-change="visibleChange"
    centered
    :closable="false"
  >
    <a-tabs>
      <a-tab-pane tab="系统图标" key="1">
        <ul>
          <li v-for="icon in appIcons" :key="icon">
            <img :src="icon" @click="chooseIcon(icon)" :class="{ active: activeIndex === icon }" />
          </li>
        </ul>
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { useMessage } from '/@/hooks/web/useMessage';
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  const emit = defineEmits(['choose', 'register']);
  const { createMessage } = useMessage();
  const choosedIcon = ref('');
  const activeIndex = ref('');
  const [registerModal, { closeModal }] = useModalInner();

  /**
   * 选择图标
   * @param icon
   */
  function chooseIcon(icon) {
    activeIndex.value = icon;
    choosedIcon.value = icon;
  }

  /**
   * 提交确认
   */
  function ok() {
    if (choosedIcon) {
      closeModal();
      emit('choose', unref(choosedIcon));
    } else {
      createMessage.warning('尚未选择任何图标');
    }
  }

  function visibleChange() {
    activeIndex.value = '';
  }
  //图标初始数据
  const appIcons = [
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/chuchai.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/duanxin.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/gongwen.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/hetong.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/huiyi.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/kaoqin.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/kehu.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/liucheng.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/qingjia.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/qingjia1.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/renwu.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/richang.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/richeng.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/tongxun.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/tongzhi.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/toupiao.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/wendang.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/xinwen.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/youjian.png',
    'https://jeecgos.oss-cn-beijing.aliyuncs.com/files/appimg/128/zhoubao.png',
  ];
</script>
<style lang="less" scoped>
  ul {
    max-height: 700px;
    overflow-y: auto;
    padding-left: 0.5rem;

    img {
      width: 64px;
      height: 64px;
      padding: 0.2rem;
      margin: 0.3rem;
      cursor: pointer;

      &.active,
      &:hover {
        border: 1px solid #11da75;
        border-radius: 2px;
        color: #fff;
        transition: all 0.3s;
      }
    }

    li {
      list-style: none;
      float: left;
      text-align: center;
      cursor: pointer;
      color: #555;
      transition: color 0.3s ease-in-out, background-color 0.3s ease-in-out;
      position: relative;
      margin: 3px 0;
      border-radius: 4px;
      background-color: #fff;
      overflow: hidden;
      padding: 10px 0 0;
    }
  }
</style>
