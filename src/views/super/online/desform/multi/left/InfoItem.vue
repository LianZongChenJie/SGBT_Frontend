<template>
  <div class="calendar-info-item" @click="onClick">
    <div class="left-border"></div>
    <div class="title">
      {{ title }}
    </div>
    <template v-for="item in dateInfoList">
      <div class="date-info" v-if="item.val">
        {{ item.val }}
        <span v-if="item.tag" style="margin-left: 10px">
          {{ item.tag }}
        </span>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
  import dayjs from 'dayjs';
  import { ref, watchEffect } from 'vue';

  export default {
    name: 'InfoItem',
    props: {
      info: {
        type: Object,
        default: () => {},
      },
      calendarColumnList: {
        type: Array,
        default: () => [],
      },
      titleField: {
        type: String,
        default: '',
      },
      // 1全部  2已排期 3 未排期
      type: {
        type: String,
        default: '1',
      },
    },
    emits: ['tap'],
    setup(props, { emit }) {
      const dateInfoList = ref([]);
      const title = ref('');
      watchEffect(() => {
        let temp = props.info;
        if (temp) {
          let key = props.titleField;
          if (key) {
            title.value = temp[key];
          }

          let arr = props.calendarColumnList;
          let list = [];
          if (arr && arr.length > 0) {
            for (let item of arr) {
              if (props.type === '1') {
                handle1(temp, item, list);
              } else if (props.type === '2') {
                handle2(temp, item, list);
              }
            }
          }
          dateInfoList.value = list;
        }
      });

      function handle1(data, item, list) {
        let field = item.beginDateField;
        let type = item.type;
        let tag = item.tag;
        let val = data[field];
        if (val) {
          if (type === 'datetime') {
            val = dayjs(new Date(val)).format('YYYY-MM-DD HH:mm:ss');
          } else if (type === 'date') {
            val = dayjs(new Date(val)).format('YYYY-MM-DD');
          }
        }
        list.push({
          val,
          tag,
        });
      }

      function handle2(data, item, list) {
        if (data.tagSeq === item.seq) {
          let field = item.beginDateField;
          let type = item.type;
          let tag = item.tag;
          let val = data[field];
          if (val) {
            if (type === 'datetime') {
              val = dayjs(new Date(val)).format('YYYY-MM-DD HH:mm:ss');
            } else if (type === 'date') {
              val = dayjs(new Date(val)).format('YYYY-MM-DD');
            }
          }
          list.push({
            val,
            tag,
          });
        }
      }

      function onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        emit('tap', props.info['_id']);
      }

      return {
        title,
        dateInfoList,
        onClick,
      };
    },
  };
</script>

<style scoped lang="less">
  .calendar-info-item {
    background: #fff;
    border-radius: 3px;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 12%);
    box-sizing: border-box;
    margin: 8px 12px 0;
    overflow: hidden;
    padding: 10px 12px;
    position: relative;
    .left-border {
      background-color: rgb(201, 230, 252);
      bottom: 0;
      content: '';
      left: 0;
      position: absolute;
      top: 0;
      width: 3px;
    }
    .title {
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      word-break: break-all;
      font-size: 14px !important;
      font-weight: 700 !important;
    }
    .date-info {
      font-size: 13px !important;
      color: #9e9e9e !important;
      margin-top: 2px !important;
    }
    &:hover {
      box-shadow: 0 2px 5px 0 rgb(0 0 0 / 20%);
      cursor: pointer;
    }
  }
</style>
