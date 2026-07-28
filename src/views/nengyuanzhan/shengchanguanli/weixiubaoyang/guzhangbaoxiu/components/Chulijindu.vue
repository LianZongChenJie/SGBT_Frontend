<template>
  <a-spin :spinning="loading">
    <!--    <BasicForm @register="registerForm"/>-->
    <div class="box">
      <Timeline>
        <TimelineItem color="green">
          <div class="timeBox">2026-01-05 05:50:00</div>
          <div class="title">报修</div>
          <div class="content">
            <div>
              <span>报修人:aaa</span>
              <span class="pl10 pr10">所在部门:生产</span>
            </div>
          </div>
        </TimelineItem>
        <TimelineItem color="green">
          <div class="timeBox">2026-01-05 05:50:00</div>
          <div class="title">通过审核</div>
          <div class="content">
            <div>
              <span>审核人:aaa</span>
              <span class="pl10 pr10">所在部门:生产</span>
              <a-button type="link" >查看审核记录</a-button>
            </div>
          </div>
        </TimelineItem>
        <TimelineItem color="green">
          <div class="timeBox">2026-01-05 05:50:00</div>
          <div class="title">派工</div>
          <div class="content">
            <div>
              <span>派工人:aaa</span>
              <span class="pl10 pr10">所在部门:生产</span>
            </div>
          </div>
        </TimelineItem>
        <TimelineItem color="green">
          <div class="timeBox">2026-01-05 05:50:00</div>
          <div class="title">接单</div>
          <div class="content">
            <div>
              <span>接单人:aaa</span>
              <span class="pl10 pr10">维修班组:生产</span>
              <span class="pl10">关联维修工单:</span>
              <a-button type="link" >ME1100</a-button>
            </div>
          </div>
        </TimelineItem>
        <TimelineItem color="green">
          <div class="timeBox">2026-01-05 05:50:00</div>
          <div class="title">开始维修</div>
          <div class="content">
            <div>
              <span>维修负责人:aaa</span>
              <span class="pl10 pr10">维修班组:啊</span>
              <div>
                <span>其他维修人员:啊啊啊</span>
              </div>
            </div>
          </div>
        </TimelineItem>
        <TimelineItem color="green">
          <div class="timeBox">2026-01-05 05:50:00</div>
          <div class="title">执行维修</div>
          <div class="content">
            <div>
              <span>维修负责人:aaa</span>
              <span class="pl10 pr10">维修班组:啊</span>
              <div>
                <span>其他维修人员:啊啊啊</span>
              </div>
            </div>
          </div>
        </TimelineItem>
        <TimelineItem color="green">
          <div class="timeBox">2026-01-05 05:50:00</div>
          <div class="title">暂停维修</div>
          <div class="content">
            <div>
              <span>维修人员:aaa</span>
              <span class="pl10 pr10">维修班组:啊</span>
              <div>
                <span>暂停原因:啊啊啊</span>
              </div>
            </div>
          </div>
        </TimelineItem>
        <TimelineItem color="green">
          <div class="timeBox">2026-01-05 05:50:00</div>
          <div class="title">继续维修</div>
          <div class="content">
            <div>
              <span>维修人员:aaa</span>
              <span class="pl10 pr10">维修班组:啊</span>
            </div>
          </div>
        </TimelineItem>
        <TimelineItem color="green">
          <div class="timeBox">2026-01-05 05:50:00</div>
          <div class="title">完成维修</div>
          <div class="content">
            <div>
              <span>维修人员:aaa</span>
              <span class="pl10 pr10">维修班组:啊</span>
            </div>
          </div>
        </TimelineItem>
        <TimelineItem color="green">
          <div class="timeBox">2026-01-05 05:50:00</div>
          <div class="title">验收</div>
          <div class="content">
            <div>
              <div>
                <span>检验人员:aaa</span>
                <span class="pl10 pr10">所在部门:啊</span>
              </div>
              <div>验收结果:啊</div>
              <div >维修评分:啊</div>
              <div>维修评价:啊</div>
            </div>
          </div>
        </TimelineItem>
        <TimelineItem color="green">
          <div class="timeBox">2026-01-05 05:50:00</div>
          <div class="title">已完成</div>
        </TimelineItem>
      </Timeline>
    </div>
  </a-spin>
</template>
<script lang="ts" setup>
  import { Timeline } from 'ant-design-vue';
  // ❗ Item 必须单独解构
  const TimelineItem = Timeline.Item;
  import { watch, computed, inject, ref, unref, onMounted } from 'vue';
  import { usePermission } from '/@/hooks/web/usePermission';

  const { hasPermission } = usePermission();

  const emit = defineEmits(['success']);
  const props = defineProps({
    data: { type: Object, default: () => ({}) },
    rootTreeData: { type: Array, default: () => [] },
  });
  const loading = ref<boolean>(false);
  // 当前是否是更新模式
  const isUpdate = ref<boolean>(true);
  // 当前的弹窗数据
  const model = ref<object>({});

  onMounted(() => {
    // 禁用字段
    // updateSchema([
    //   {field: 'parentId', componentProps: {disabled: true}},
    //   {field: 'orgCode', componentProps: {disabled: true}},
    // ]);
    // // data 变化，重填表单
    watch(
      () => props.data,
      async (newValue) => {
        // model.value = record;
      },
      { deep: true, immediate: true }
    );
  });
</script>
<style lang="less" scoped>
  .box {
    padding:20px 5%;
    .timeBox {
      width: 200px;
      padding: 10px;
      background: #0bb27a;
      border: 4px solid #cef0e4;
      border-radius: 2px;
      color: white;
    }

    .title {
      margin: 10px;
      font-size: 16px;
      font-weight: bold;
    }

    .content {
      background: #eefaf5;
      padding:20px 10px;
      border:1px solid #b4e7d4;
    }
  }
</style>
