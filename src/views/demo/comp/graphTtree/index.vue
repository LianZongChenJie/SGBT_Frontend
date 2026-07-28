<template>
  <div class="container">
    <a-button type="primary" @click="lookHandle">查看</a-button>
    <reportTree
      v-if="show"
      :companyName="companyName"
      :treeSource="treeSource"
      :readonly="readonly"
      :loadData="onLoadData"
      department="department"
      @add="addHandle"
      @replace="replaceHandle"
      @del="delHandle"
    ></reportTree>
  </div>
</template>

<script setup>
  import { reactive, ref, nextTick } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import reportTree from './components/reportTree/index.vue';
  import { resData, resLookData } from './data.js';

  console.log(cloneDeep({ a: 'name' }));
  const companyName = '天脉聚源（攸县）有限公司';
  const treeSource = ref(resData.data.pagedDatas);
  const readonly = ref(false);
  const show = ref(true);

  //添加下属
  const addHandle = data => {
    let res = toDemo();
    res['accountId'] = uuid();
    if (data['isRoot']) {
      delete res['parentId'];
      delete res['subTotalCount'];
      delete res['hasSub'];
      treeSource.value.unshift(res);
    } else {
      res['parentId'] = data['accountId'];
      if (data['children']?.length) {
        data['children'].push(res);
      } else {
        data['children'] = [res];
      }
    }
  };
  //替换成员
  const replaceHandle = (node, parentNode) => {
    // const data = parentNode ? parentNode['children'] : treeSource.value;
    // const index = data.findIndex(item => item['accountId'] == node['accountId']);
    let res = toDemo();
    Object.assign(node, res);
    // parentNode && (res['parentId'] = parentNode['accountId']);
    // if (index != -1) {
    //   if (data[index]['children']) {
    //     res['children'] = data[index]['children'];
    //   }
    //   data.splice(index, 1, res);
    // }
  };
  //删除成员
  const delHandle = (node, parentNode) => {
    const data = parentNode ? parentNode['children'] : treeSource.value;
    const index = data.findIndex(item => item['accountId'] == node['accountId']);
    data.splice(index, 1);
  };
  //动态加载
  const onLoadData = data => {
    return new Promise((resove, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          console.log('reject');
          reject();
        } else {
          console.log('resove');
          const { accountId, subTotalCount } = data;
          const res = [];
          for (let i = 0, len = subTotalCount; i < len; i++) {
            const obj = toDemo();
            obj['parentId'] = accountId;
            obj[accountId] = uuid();
            obj['fullname'] += i;
            res.push(obj);
          }
          data.children = res;
          resove();
        }
      }, 1e3);
    });
  };
  const lookHandle = () => {
    show.value = false;
    nextTick(() => {
      readonly.value = true;
      treeSource.value = resLookData.data.pagedDatas;
      show.value = true;
    });
  };
  const uuid = () => {
    return String(+new Date()) + Math.random();
  };
  const radom = (min, max) => {
    return Math.round(Math.random() * max + min);
  };
  const toDemo = () => {
    let data = {
      parentId: '',
      fullname: '小仙女' + radom(0, 1000),
      accountId: radom(100, 10000),
      avatar:
        'https://p1.mingdaoyun.cn/UserAvatar/default9.png?watermark/2/text/5LuZ5aWz/font/5b6u6L2v6ZuF6buR/fontsize/700/fill/d2hpdGU=/dissolve/100/gravity/Center/dx/0/dy/0%7CimageView2/1/w/100/h/100/q/90',
      department: '秘书办',
      job: '董事会秘书',
      status: 1,
      subTotalCount: radom(0, 2),
      hasSub: true
    };
    !data['subTotalCount'] && (data['hasSub'] = false);
    return data;
  };
</script>

<style lang="less" scoped>
  .container {
    height: 700px;
    width: 100%;
    position: relative;
    background: #fff;
    padding: 10px;
  }
  .ant-btn {
    position: absolute;
    top: 10px;
    right: 10px;
  }
</style>
