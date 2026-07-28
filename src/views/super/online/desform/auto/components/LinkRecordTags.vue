<template>
  <a-space :class="[prefixCls]" :size="4" >
    <template v-for="record of records">
      <a-tag v-show="showTag(record)" @click.stop="() => onClick(record.id)">{{ record.text }}</a-tag>
    </template>
  </a-space>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { propTypes } from '/@/utils/propTypes';
  import { useDesign } from '/@/hooks/web/useDesign';

  export default defineComponent({
    name: 'LinkRecordTags',
    props: {
      records: propTypes.array.isRequired,
    },
    emits: ['open'],
    setup(_props, { emit }) {
      const { prefixCls } = useDesign('desform-link-record-tags');

      //update-begin-author:taoyan date:2022-12-31 for: QQYUN-3597【视图】列表 关联记录被删掉以后，列表显示id
      function showTag(record) {
        if(record.text === record.id){
          return false
        }
        return true
      }
      //update-end-author:taoyan date:2022-12-31 for: QQYUN-3597【视图】列表 关联记录被删掉以后，列表显示id
      
      function onClick(id) {
        emit('open', id);
      }

      return {
        prefixCls,
        onClick,
        showTag
      };
    },
  });
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-desform-link-record-tags';

  .@{prefix-cls} {
    width: 100%;
    overflow: hidden;

    .ant-space-item {
      max-width: 100%;

      .ant-tag {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
      }
    }
  }
</style>
