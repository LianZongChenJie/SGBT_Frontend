<template>
  <a-transfer
    :titles="['未授权', '已授权']"
    :loading="loading"
    :dataSource="dataSource"
    :targetKeys="targetKeys"
    :selectedKeys="selectedKeys"
    :listStyle="{ width: 'calc(50% - 25px)' }"
    style="height: 100%"
    @change="onChange"
    @selectChange="onSelectChange"
  >
    <template #render="record">
      <span v-if="record.authScopeIsAll === 'Y'">
        <a-icon type="eye-invisible" />
        {{ record.title }}
      </span>
      <span v-else>{{ record.title }}</span>
    </template>
  </a-transfer>
</template>

<script lang="ts">
  import { computed, h, ref, watch, defineComponent } from 'vue';
  import { sleep } from '/@/utils';
  import { defHttp } from '/@/utils/http/axios';
  import { propTypes } from '/@/utils/propTypes';
  import { pushIfNotExist } from '/@/utils/common/compUtils';

  export default defineComponent({
    name: 'AuthBatchTransfer',
    components: {},
    props: {
      authScopeCode: propTypes.string,
      authScopeType: propTypes.string,
      desformCode: propTypes.string,
      permissionType: propTypes.string,
      loading: propTypes.bool,
      desformId: propTypes.string,
      authScope: propTypes.object,
    },
    emits: ['update:loading'],
    setup(props, { emit }) {
      const dataSource = ref<any>([]);
      const targetKeys = ref<any>([]);
      const sourceSelectedKeys = ref<any>([]);
      const targetSelectedKeys = ref<any>([]);
      const url = computed(() => {
        return {
          list: `/desform/auth/${props.authScopeType}List/${props.authScopeCode}/${props.permissionType}/${props.desformCode}`,
          soub: `/desform/auth/saveOrUpdateBatch`,
        };
      });
      const selectedKeys = computed(() => [...sourceSelectedKeys.value, ...targetSelectedKeys.value]);

      watch(
        () => url.value.list,
        () => refresh(),
        { immediate: true }
      );

      function refresh(sleepMs = 0) {
        if (props.authScopeType && props.permissionType && props.authScopeCode && props.desformCode) {
          return loadData(sleepMs);
        }
      }

      async function loadData(sleepMs: number) {
        setLoading(true);
        try {
          let result = await defHttp.get({ url: url.value.list }, { successMessageMode: 'none' });
          dataSource.value = result.records;
          targetKeys.value = result.targetKeys;
        } finally {
          await sleep(sleepMs);
          setLoading(false);
        }
      }

      function setLoading(flag) {
        emit('update:loading', flag);
      }

      /**
       *
       * @param _nextTargetKeys
       * @param direction 方向（left or right）
       * left = 未授权；  从右至左的行去掉授权
       * right = 已授权； 从左至右的行添加授权
       * @param moveKeys
       */
      async function onChange(_nextTargetKeys, direction, moveKeys) {
        // this.targetKeys = nextTargetKeys
        // 整理授权
        let moveRows = moveKeys.map((key) => filterByKey(key));
        moveRows.forEach((row) => {
          let scopeValue = row['scopeValue'];
          let scopeValues = scopeValue ? scopeValue.split(',') : [];
          // 添加授权
          if (direction === 'right') {
            pushIfNotExist(scopeValues, props.authScopeCode);
          }
          // 删除授权
          if (direction === 'left') {
            let index = scopeValues.indexOf(props.authScopeCode);
            if (index !== -1) {
              scopeValues.splice(index, 1);
            }
          }
          row['scopeValue'] = scopeValues.join(',');
        });
        // 提交更改
        let params = props.authScope.getUpdateParams(moveRows);
        // 如果是按钮，可能存在临时数据的情况，需要填充一下
        if (props.permissionType === 'button') {
          fillTempButton(params);
        }
        try {
          setLoading(true);
          await defHttp.put({ url: url.value.soub, params }, { successMessageMode: 'none' });
          await refresh(100);
        } finally {
          setLoading(false);
        }
      }

      function fillTempButton(list) {
        const startText = 'temp-';
        list.forEach((item) => {
          // 凡是以 temp- 开头的按钮，都是数据库里没有的临时数据
          if (item.id.startsWith(startText)) {
            delete item.id;
            item['desformId'] = props.desformId;
            item['desformCode'] = props.desformCode;
            item['permissionType'] = props.permissionType;
            item['authScopeIsAll'] = 'Y';
            item['status'] = 1;
          }
        });
      }

      function onSelectChange($sourceSelectedKeys, $targetSelectedKeys) {
        sourceSelectedKeys.value = $sourceSelectedKeys;
        targetSelectedKeys.value = $targetSelectedKeys;
      }

      function filterByKey(key) {
        return dataSource.value.filter((i) => i.key === key)[0];
      }

      return {
        dataSource,
        targetKeys,
        selectedKeys,
        sourceSelectedKeys,
        targetSelectedKeys,
        onChange,
        onSelectChange,
      };
    },
  });
</script>

<style scoped></style>
