<template>
  <a-spin :spinning="loading">
    <!--    <BasicForm @register="registerForm"/>-->
    <div v-if="arr.length > 0" class="box">
      <Timeline>
        <TimelineItem v-for="(list, i) in arr" :key="i" color="green">
          <div class="timeBox">{{ list.date }}</div>
          <div class="time">{{ list.time }}</div>
          <div class="title">{{ list.title }}</div>
          <div class="content">
            <div>
              <span v-for="(value, key) in list.details" :key="key" class="pr10"> {{ key }}: {{ value }}</span>
              <!--              <span class="pl10 pr10">所在部门:{{list.dept}}</span>-->
            </div>
          </div>
        </TimelineItem>
        <!--        <TimelineItem color="green">-->
        <!--&lt;!&ndash;          <div class="timeBox">2026-01-05 05:50:00</div>&ndash;&gt;-->
        <!--&lt;!&ndash;          <div class="title">通过审核</div>&ndash;&gt;-->
        <!--          <div class="timeBox">2026-01-05</div>-->
        <!--          <div class="time"> 05:50:00</div>-->
        <!--          <div class="title">通过审核</div>-->
        <!--          <div class="content">-->
        <!--            <div>-->
        <!--              <span>审核人:aaa</span>-->
        <!--              <span class="pl10 pr10">所在部门:生产</span>-->
        <!--              <a-button type="link" >查看审核记录</a-button>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </TimelineItem>-->
        <!--        <TimelineItem color="green">-->
        <!--          <div class="timeBox">2026-01-05</div>-->
        <!--          <div class="title">派工</div>-->
        <!--          <div class="content">-->
        <!--            <div>-->
        <!--              <span>派工人:aaa</span>-->
        <!--              <span class="pl10 pr10">所在部门:生产</span>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </TimelineItem>-->
        <!--        <TimelineItem color="green">-->
        <!--          <div class="timeBox">2026-01-05 05:50:00</div>-->
        <!--          <div class="title">接单</div>-->
        <!--          <div class="content">-->
        <!--            <div>-->
        <!--              <span>接单人:aaa</span>-->
        <!--              <span class="pl10 pr10">维修班组:生产</span>-->
        <!--              <span class="pl10">关联维修工单:</span>-->
        <!--              <a-button type="link" >ME1100</a-button>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </TimelineItem>-->
        <!--        <TimelineItem color="green">-->
        <!--          <div class="timeBox">2026-01-05 05:50:00</div>-->
        <!--          <div class="title">开始维修</div>-->
        <!--          <div class="content">-->
        <!--            <div>-->
        <!--              <span>维修负责人:aaa</span>-->
        <!--              <span class="pl10 pr10">维修班组:啊</span>-->
        <!--              <div>-->
        <!--                <span>其他维修人员:啊啊啊</span>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </TimelineItem>-->
        <!--        <TimelineItem color="green">-->
        <!--          <div class="timeBox">2026-01-05 05:50:00</div>-->
        <!--          <div class="title">执行维修</div>-->
        <!--          <div class="content">-->
        <!--            <div>-->
        <!--              <span>维修负责人:aaa</span>-->
        <!--              <span class="pl10 pr10">维修班组:啊</span>-->
        <!--              <div>-->
        <!--                <span>其他维修人员:啊啊啊</span>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </TimelineItem>-->
        <!--        <TimelineItem color="green">-->
        <!--          <div class="timeBox">2026-01-05 05:50:00</div>-->
        <!--          <div class="title">暂停维修</div>-->
        <!--          <div class="content">-->
        <!--            <div>-->
        <!--              <span>维修人员:aaa</span>-->
        <!--              <span class="pl10 pr10">维修班组:啊</span>-->
        <!--              <div>-->
        <!--                <span>暂停原因:啊啊啊</span>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </TimelineItem>-->
        <!--        <TimelineItem color="green">-->
        <!--          <div class="timeBox">2026-01-05 05:50:00</div>-->
        <!--          <div class="title">继续维修</div>-->
        <!--          <div class="content">-->
        <!--            <div>-->
        <!--              <span>维修人员:aaa</span>-->
        <!--              <span class="pl10 pr10">维修班组:啊</span>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </TimelineItem>-->
        <!--        <TimelineItem color="green">-->
        <!--          <div class="timeBox">2026-01-05 05:50:00</div>-->
        <!--          <div class="title">完成维修</div>-->
        <!--          <div class="content">-->
        <!--            <div>-->
        <!--              <span>维修人员:aaa</span>-->
        <!--              <span class="pl10 pr10">维修班组:啊</span>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </TimelineItem>-->
        <!--        <TimelineItem color="green">-->
        <!--          <div class="timeBox">2026-01-05 05:50:00</div>-->
        <!--          <div class="title">验收</div>-->
        <!--          <div class="content">-->
        <!--            <div>-->
        <!--              <div>-->
        <!--                <span>检验人员:aaa</span>-->
        <!--                <span class="pl10 pr10">所在部门:啊</span>-->
        <!--              </div>-->
        <!--              <div>验收结果:啊</div>-->
        <!--              <div >维修评分:啊</div>-->
        <!--              <div>维修评价:啊</div>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </TimelineItem>-->
        <!--        <TimelineItem color="green">-->
        <!--          <div class="timeBox">2026-01-05 05:50:00</div>-->
        <!--          <div class="title">已完成</div>-->
        <!--        </TimelineItem>-->
      </Timeline>
    </div>
    <a-empty v-else class="empty-state" :image="simpleImage" description="暂无执行进度" />
  </a-spin>
</template>
<script lang="ts" setup>
  import { Empty, Timeline } from 'ant-design-vue';
  // ❗ Item 必须单独解构
  const TimelineItem = Timeline.Item;
  import { watch, ref, onMounted } from 'vue';
  import { getQueryProgress } from '@/views/nengyuanzhan/shengchanguanli/weixiubaoyang/weixiugongdan/demo.api';

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
  const emit = defineEmits(['success']);
  const props = defineProps({
    data: { type: Object, default: () => ({}) },
    rootTreeData: { type: Array, default: () => [] },
  });
  const loading = ref<boolean>(false);
  const arr = ref([]);

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
        if (!newValue?.id) {
          arr.value = [];
          return;
        }
        loading.value = true;
        try {
          const result = await getQueryProgress({ id: newValue.id });
          arr.value = Array.isArray(result) ? result : [];
        } finally {
          loading.value = false;
        }
      },
      { deep: true, immediate: true }
    );
  });
</script>
<style lang="less" scoped>
  .box {
    padding: 20px 5%;
    .timeBox {
      margin-left: -60px;
      width: 120px;
      padding: 10px;
      background: #0bb27a;
      border: 4px solid #cef0e4;
      border-radius: 2px;
      color: white;
      text-align: center;
    }
    :deep(.ant-timeline-item-head-green) {
      top: 60px;
    }
    .time {
      position: absolute;
      left: 0;
      top: 60px;
      margin-left: -90px;
    }
    .title {
      margin: 10px;
      font-size: 16px;
      font-weight: bold;
    }

    .content {
      background: #eefaf5;
      padding: 20px 10px;
      border: 1px solid #b4e7d4;
    }
  }

  .empty-state {
    padding: 48px 0 36px;
    border: 1px dashed #dbe5f1;
    border-radius: 12px;
    background: linear-gradient(180deg, #fbfdff 0%, #f5f9ff 100%);
  }
</style>
