<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <div style="float: left; text-align: center; background-color: white; width: 100%">
          <h2 style="margin-top: 10px">收件箱</h2>
        </div>
        <div style="display: inline-flex">
          <div>
            <a-dropdown :trigger="['click']">
              <a-button class="ant-dropdown-link" preIcon="ant-design:edit" @click.prevent
                >标签
                <a-icon type="down" />
              </a-button>
              <template #overlay>
                <a-menu @click="addTags">
                  <a-menu-item value="清空" key="QXFL">清空</a-menu-item>
                  <a-divider style="margin: 2px 0 !important" />
                  <a-menu-item v-for="item in mailboxTypeOptions" :key="item.value" :value="item.value">
                    {{ item.text }}
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div style="margin-left: 10px">
            <a-dropdown :trigger="['click']">
              <a-button class="ant-dropdown-link" preIcon="ant-design:tags" @click.prevent
                >标记
                <a-icon type="down" />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item value="已读" @click="setReaded(1)">已读</a-menu-item>
                  <a-menu-item value="未读" @click="setReaded(0)">未读</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div style="margin-left: 10px">
            <a-dropdown :trigger="['click']">
              <a-button class="ant-dropdown-link" preIcon="ant-design:delete" @click.prevent
                >删除
                <a-icon type="down" />
              </a-button>
              <template #overlay>
                <a-menu slot="overlay">
                  <a-menu-item value="删除" @click="deleteChange(1)">删除</a-menu-item>
                  <a-divider style="margin: 2px 0 !important" />
                  <a-menu-item value="彻底删除" @click="deleteChange(2)">彻底删除</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </template>
      <template #title="{ text, record }">
        <a @click="handleClick(record)">
          <a-icon type="alert" title="紧急" style="color: red" v-if="record.urgentFlag === '1'" />
          <JEllipsis :value="text" :length="12" />
        </a>
      </template>
      <template #tags="{ text }">
        <div v-for="(tag, index) in text" style="float: left; margin-right: 2px">
          <a-tag
            v-if="index < 5"
            @click="tagChange(tag)"
            :color="tag.color"
            closable
            :key="tag.value"
            @close="tabClose(tag)"
            style="border-style: dashed"
          >
            <span style="margin-right: 2px"><JEllipsis :value="tag.title" :length="4" /></span>
          </a-tag>
          <a-tag v-if="index === 5">
            <span style="float: left" v-if="text.length > 5">...</span>
          </a-tag>
        </div>
      </template>
    </BasicTable>
    <EoaMailBoxInModal @register="registerModal" @success="handleSuccess" @reply="handleReply"></EoaMailBoxInModal>
  </div>
</template>

<script lang="ts" name="eoa-email-in-list" setup>
  import { onMounted, ref, watch } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getLabelName, inboxList, updateMailboxType, mailboxCategory, updateBatchReadFlag, updateEmailDelete, selectOne } from './EoaMailBox.api';
  import { columns } from './EoaMailBox.data';
  import { useModal } from '/@/components/Modal';
  import DepartUserModal from './DepartUserModal.vue';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { JEllipsis } from '/@/components/Form';
  import { Modal } from 'ant-design-vue';
  import EoaMailBoxInModal from './components/EoaMailBoxInModal.vue';
  import type { PropType } from 'vue';

  // Emits声明
  const emit = defineEmits(['register', 'delete', 'reply', 'tagclick']);
  const $message = useMessage();
  const color = ref<any>(['purple', 'red', 'orange', 'green', 'cyan', 'blue', 'pink']);
  const mailboxTypeOptions = ref<any>([]);
  const userStore = useUserStore();
  const props = defineProps({
    search: { type: String as PropType<string>, default: () => '' },
  });
  const { prefixCls, tableContext } = useListPage({
    designScope: 'depart-user-template',
    tableProps: {
      rowKey: 'receiverId',
      title: '收件箱',
      api: (params) => {
        params.status = '0';
        params.userId = userStore.getUserInfo.id;
        params.title = props.search;
        return inboxList(params);
      },
      columns: columns,
      showActionColumn: false,
      canResize: false,
      bordered: false,
      ellipsis: true,
      useSearchForm: false,
      afterFetch: (result) => getMailBoxTags(result),
    },
  });

  const [registerModal, { openModal }] = useModal();
  //注册table数据
  const [registerTable, { reload, updateTableDataRecord }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * 编辑
   * @param record
   */
  function handleEdit(record) {
    openModal(true, {
      isUpdate: true,
      record,
    });
  }

  /**
   * 更新已读、未读
   * @param flag 0未读 1已读
   */
  async function setReaded(flag) {
    if (selectedRowKeys.value.length > 0) {
      //请求后台接口 e.key
      var params = {
        receiverId: selectedRowKeys.value.join(','),
        readFlag: flag,
      };
      await updateBatchReadFlag(params, reload);
    } else {
      $message.createMessage.warning('请选择一条数据！');
    }
  }

  /**
   * 删除或彻底删除
   * @param flag 1删除到垃圾箱 2彻底删除
   */
  async function deleteChange(flag) {
    if (selectedRowKeys.value.length > 0) {
      let params = { checkedList: selectedRowKeys.value, delFlag: flag };
      const title = params.delFlag == '2' ? '彻底' : '';
      Modal.confirm({
        title: title + '删除',
        content: '确定要' + title + '删除吗',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          await updateEmailDelete(params, handleSuccess);
          emit('delete');
        },
      });
    } else {
      $message.createMessage.warning('请选择一条数据！');
    }
  }

  /**
   * 添加标签
   * @param e
   */
  async function addTags(e) {
    if (selectedRowKeys.value.length > 0) {
      let params = {
        mailboxId: selectedRowKeys.value.join(','),
        mailboxValue: e.key,
      };
      await updateMailboxType(params);
      await getMailBoxType();
      reload();
    } else {
      $message.createMessage.warning('请选择一条数据！');
    }
  }

  /**
   * 获取标签
   */
  async function getMailBoxType() {
    await getLabelName({ userId: userStore.getUserInfo.id }).then((res) => {
      if (res.success) {
        const type = ref<any>([]);
        let j = 0;
        for (let i = 0; i < res.result.length; i++) {
          if (j >= color.length) {
            j = 0;
          }
          type.value.push({
            text: res.result[i].labelName,
            value: res.result[i].id,
            color: color.value[j],
          });
          j++;
        }
        mailboxTypeOptions.value = type.value;
      }
    });
  }

  /**
   * list返回结果之后获取邮箱标签
   * @param result
   */
  function getMailBoxTags(result) {
    if (result) {
      for (let i = 0; i < result.length; i++) {
        const tool = ref<any>([]);
        if (result[i].mailboxType) {
          const mailboxValue = result[i].mailboxType.split(',');
          const labelName = result[i].labelName.split(',');
          let j = 0;
          for (let k = 0; k < mailboxValue.length; k++) {
            const tab = {
              value: mailboxValue[k],
              title: labelName[k],
              color: color.value[j],
              id: result[i].receiverId,
            };
            if (j >= color.value.length) {
              j = 0;
            }
            j++;
            tool.value.push(tab);
          }
          result[i].tags = tool.value;
        }
      }
    }
    return result;
  }

  /**
   * tab点击事件
   * @param tag
   */
  function tagChange(tag) {
    tag.text = tag.title;
    emit('tagclick', tag);
  }

  /**
   * tab删除事件
   * @param e
   */
  async function tabClose(e) {
    let params = {
      id: e.id,
      mailboxValue: e.value,
    };
    await mailboxCategory(params);
    await getMailBoxType();
    reload();
  }

  /**
   * 预览页面点击事件
   * @param record
   */
  function handleClick(record) {
    openModal(true, record);
  }

  /**
   * 预览回调事件
   */
  function handleSuccess() {
    (selectedRowKeys.value = []) && reload();
  }

  /**
   * 回复或转发
   * @param record
   */
  function handleReply(record) {
    emit('reply', record);
  }

  //监听search
  watch(
    () => props.search,
    () => {
      handleSuccess();
    }
  );
  onMounted(async () => {
    //获取邮箱类型
    await getMailBoxType();
  });
  
  async function openHrefDetailModal(id){
    const record = await selectOne(id);
    if(record && record.id){
      handleClick(record)
    }else{
      console.error('这个邮件ID不识别', id)
    }
  }

  // script setup 需要显式定义可供外部访问的方法
  defineExpose({
    openHrefDetailModal,
    reload,
  })

</script>
