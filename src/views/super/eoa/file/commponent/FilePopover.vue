<template>
  <a-popover overlayClassName="file-popover">
    <template #content>
      <div class="popover-box flex">
        <div class="avatar-box">
          <img v-if="userData.avatar" :src="getFileAccessHttpUrl(userData.avatar)" />
          <img v-else :src="headerImg" />
        </div>
        <div>
          <span class="popover-name ellipsis">{{ userData.realname }}</span>
          <div class="popover-phone">
            <span class="ellipsis">{{ userData.phone }}</span>
          </div>
        </div>
      </div>
    </template>
    <a>{{ userData.realname }}</a>
  </a-popover>
</template>

<script lang="ts" name="file-popover" setup>
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import headerImg from '/@/assets/images/header.jpg';

const props = defineProps({
  userData:{type:Object,default:null}
})
</script>

<style>
.popover-box {
  position: relative;
}

.avatar-box {
  height: 47px;
  width: 47px;
  border-radius: 50%;
  display: inline-block;
  color: white;
  position: relative;
  text-align: center;
  overflow: hidden;
  font-size: 14px;
  margin-left: 10px;
}
.popover-name {
  position: relative;
  color: #000;
  font-size: 15px;
  font-weight: 700;
  margin-top: 3px;
  width: 130px;
  left: 7px;
}
.popover-phone {
  min-height: 35px;
  word-wrap: break-word;
  color: #aaa;
  padding: 7px 5px 0;
  word-break: break-all;
}
</style>
