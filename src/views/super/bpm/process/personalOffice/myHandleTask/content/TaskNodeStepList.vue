<template>
  <a-card>
    <a-steps progressDot :current="stepIndex" style="padding: 10px" size="default">
      <template v-if="stepCount > 3">
        <a-step>
          <template #title>
            <div class="task-title">...</div>
          </template>
        </a-step>
      </template>

      <template v-for="(item, index) in taskStepList">
        <a-step>
          <template #title>
            <div class="task-title">{{ item.taskName }}</div>
          </template>
          <template #description>
            <div class="descriptionDiv">
              <span>
                <!--#40a9ff-->
                <a-avatar shape="square" style="background-color: #40a9ff"
                  ><template #icon><UserOutlined /></template
                ></a-avatar>
              </span>

              <span style="margin-left: 5px">
                <div class="task-date" style="text-align: left">
                  <a-tooltip placement="top">
                    <template #title>
                      <span>{{ item.opTime }}</span>
                    </template>

                    <span> {{ item.opTime ? item.opTime.substr(0, 10) : item.opTime }}</span>
                  </a-tooltip>
                </div>
                <div class="task-user" style="text-align: left">
                  <span> {{ item.opUserName }}</span>
                </div>
              </span>
            </div>
          </template>
        </a-step>
      </template>

      <a-step v-if="currentNode.taskName && currentNode.taskName != ''">
        <template #title>
          <div class="task-title">{{ currentNode.taskName }}</div>
        </template>
        <template #description
          ><!--#faad14eb-->
          <div class="descriptionDiv">
            <span>
              <a-avatar style="background-color: #faad14eb"
                ><template #icon><UserOutlined /></template
              ></a-avatar>
            </span>
            <span style="margin-left: 5px">
              <div class="task-date" style="text-align: left">
                <a-tooltip placement="top">
                  <template #title>
                    <span>{{ currentNode.taskNameStartTime }}</span>
                  </template>

                  <span style="color: #ff6d75">
                    {{ currentNode.taskNameStartTime ? currentNode.taskNameStartTime.substr(0, 10) : currentNode.taskNameStartTime }}
                  </span>
                </a-tooltip>
              </div>
              <div class="task-user" style="text-align: left">
                <span> {{ currentNode.taskAssigneeName }}</span>
              </div>
            </span>
          </div>
        </template>
      </a-step>
      <a-step>
        <template #title>
          <div class="task-title">...</div>
        </template>
      </a-step>
    </a-steps>
  </a-card>
</template>

<script>
  /**
   * top上节点步骤
   */
  import { computed } from 'vue';
  import { UserOutlined } from '@ant-design/icons-vue';

  export default {
    name: 'TaskNodeStepList',
    components: {
      UserOutlined,
    },
    props: {
      stepCount: {
        type: Number,
        default: 0,
      },
      taskStepList: {
        type: Array,
        default: () => [],
      },
      currentNode: {
        type: Object,
        default: () => {},
      },
    },
    setup(props) {
      const stepIndex = computed(() => {
        if (props.taskStepList.length > 3) {
          return props.taskStepList.length + 1;
        }
        return props.taskStepList.length;
      });

      return {
        stepIndex,
      };
    },
  };
</script>
