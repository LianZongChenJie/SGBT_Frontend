<template>
  <div class="node">
    <div
      class="box"
      @mouseleave="
        () => {
          isShow = false;
        }
      "
    >
      <div class="card">
        <div class="userInfo">
          <img class="avatar" :src="item[avatar]" alt="" />
          <div class="info">
            <p class="name">{{ item[fullname] }}</p>
            <p class="department">{{ item[department] }}</p>
            <p class="position">{{ item[job] }}</p>
          </div>
          <div v-if="item[subTotalCount]" class="count">
            <span class="icon"></span>
            <span class="text">{{ item[subTotalCount] }}</span>
          </div>
        </div>
      </div>
      <div class="result">
        <i
          class="icon"
          @click="
            () => {
              isShow = true;
            }
          "
        ></i>
        <ul v-if="isShow" class="options">
          <li @click="handleAdd(item, parentNode)">添加下属</li>
          <li @click="handleReplace(item, parentNode)">替换成员</li>
          <li @click="handleDel(item, parentNode)">移除成员</li>
        </ul>
      </div>
      <div v-if="item[hasSub]" class="toggle" :class="[isExpand ? 'minus' : 'add']" @click="handleExpand(item)"></div>
    </div>
    <nodeWrap
      v-if="item[children]?.length && (isExpand || isExpand === null)"
      :treeSource="item[children]"
      :parentNode="item"
      :readonly="readonly"
      @del="handleDel"
      @replace="handleReplace"
      @add="handleAdd"
      :loadData="loadData"
      :fullname="fullname"
      :children="children"
      :avatar="avatar"
      :accountId="accountId"
      :department="department"
      :job="job"
      :subTotalCount="subTotalCount"
      :hasSub="hasSub"
    ></nodeWrap>
    <p v-if="tips?.status && isExpand" class="tips" :class="tips.status">{{ tips.text }}</p>
  </div>
</template>

<script setup name="node">
  import nodeWrap from '../nodeWrap/index.vue';
  import { computed, ref, watch } from 'vue';
  const props = defineProps({
    item: {
      type: Object,
      default: () => {}
    },
    fullname: {
      type: String,
      default: 'fullname'
    },
    avatar: {
      type: String,
      default: 'avatar'
    },
    accountId: {
      type: String,
      default: 'accountId'
    },
    department: {
      type: String,
      default: '-department'
    },
    job: {
      type: String,
      default: 'job'
    },
    subTotalCount: {
      type: String,
      default: 'subTotalCount'
    },
    hasSub: {
      type: String,
      default: 'hasSub'
    },
    children: {
      type: String,
      default: 'children'
    },
    readonly: {
      type: Boolean,
      default: false
    },
    loadData: {
      type: Function,
      default: () => ({})
    },
    treeSource: {
      type: Array,
      default: () => []
    },
    rootNode: {
      type: Boolean,
      default: false
    },
    parentNode: {
      default: null
    }
  });
  let emit = defineEmits(['add', 'del', 'replace']);
  const isShow = ref(false);
  // true:展开;false:收缩;null:当下级有值的时候默认展开(1.新增时下级需展开;2.查看是默认得展开)
  const isExpand = ref(null);
  const tips = ref(null);
  const handleExpand = item => {
    isExpand.value = !isExpand.value;
    if (!item[props.children]?.length && isExpand.value) {
      tips.value = { status: 'loading', text: '正在加载中...' };
      props
        .loadData(item)
        .then(() => {
          tips.value = { status: 'succes', text: '' };
        })
        .catch(() => {
          tips.value = { status: 'error', text: '加载失败，请重试~' };
        });
    }
  };
  const handleAdd = item => {
    emit('add', item);
  };
  const handleReplace = (item, parentNode) => {
    emit('replace', item, parentNode);
  };
  const handleDel = (item, parentNode) => {
    emit('del', item, parentNode);
  };
</script>

<style lang="less" scoped>
  p { margin-bottom: 0;}
  .node {
    padding-top: 10px;
    position: relative;
    &::before {
      border-bottom: 1px solid #d3d3d3;
      content: '';
      display: inline-block;
      position: absolute;
      top: 50px;
      width: 40px;
    }
    &:not(&:last-child) {
      border-left: 1px solid #d3d3d3;
    }
    &:last-child {
      &::after {
        border-left: 1px solid #d3d3d3;
        content: '';
        display: inline-block;
        height: 50px;
        left: 0;
        position: absolute;
        top: 0;
      }
    }
  }

  .box {
    display: inline-block;
    padding-right: 40px;
    position: relative;
    &:hover {
      .result {
        display: block;
      }
    }
  }
  .card {
    border: 1px solid transparent;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
    display: inline-block;
    height: 80px;
    margin-left: 40px;
    padding: 0 6px;
    width: 240px;
    &:hover {
      border-color: #1e88e5;
    }
  }
  .userInfo {
    box-sizing: initial;
    display: flex;
    flex-direction: row;
    height: 60px;
    padding: 10px 0;
    .avatar {
      align-self: center;
      border-radius: 50%;
      flex: 0 0 48px;
      height: 48px;
      margin-left: 10px;
    }
    .info {
      display: flex;
      flex: 1 0 0%;
      flex-direction: column;
      margin-left: 16px;
      padding-right: 10px;
      .name {
        color: #333;
        font-size: 15px;
        margin-bottom: 4px;
        max-width: 100px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .department,
      .position {
        color: #9e9e9e;
        flex: 1 0 0%;
        font-size: 12px;
        max-width: 155px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .count {
      position: absolute;
      right: 50px;
      top: 10px;
      display: flex;
      align-items: center;
      line-height: 14px;
      .icon {
        width: 14px;
        height: 14px;
        background-image: url(../../asstes/person.png);
        background-size: 100% auto;
      }
      .text {
        font-size: 13px;
        margin-left: 2px;
        color: #333;
      }
    }
  }
  .result {
    display: none;
    .icon {
      background-image: url(../../asstes/omit.png);
      background-size: 100% 100%;
      height: 20px;
      width: 20px;
      right: 4px;
      top: 30px;
      position: absolute;
      cursor: pointer;
    }
    .options {
      background: #fff;
      border-radius: 2px;
      box-shadow: 0 2px 5px 3px #ddd;
      line-height: 30px;
      padding: 6px 0;
      position: absolute;
      right: -120px;
      top: 30px;
      width: 120px;
      z-index: 1;
      line-height: 32px;
      li {
        text-align: center;
        cursor: pointer;
        &:hover {
          background-color: #1890ff;
          color: #fff;
        }
      }
    }
  }
  .toggle {
    position: absolute;
    top: 50%;
    left: -10px;
    transform: translate(0, -50%);
    width: 20px;
    height: 20px;
    background-size: 100% auto;
    background-color: #fff;
    border-radius: 50%;
    cursor: pointer;
    z-index: 1;
    &.add {
      background-image: url(../../asstes/add.png);
    }
    &.minus {
      background-image: url(../../asstes/minus.png);
    }
  }
  .tips {
    margin-left: 40px;
    width: 240px;
    line-height: 40px;
    text-align: center;
    &.error {
      color: #a7a1a2;
    }
    &.loading {
      color: #1890ff;
    }
    &.success {
      display: none;
    }
  }
</style>
