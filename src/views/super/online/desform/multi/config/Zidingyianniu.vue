<template>
  <div class="inner-content">
    <div class="title">自定义按钮</div>
    <div class="tip">在当前视图下的记录中添加自定义按钮，当用户点击按钮后填写预设的内容或执行一个工作流</div>

    <div class="config-detail" style="width: 360px; padding-top: 0" v-if="buttonList.length > 0">
      <div class="query-field-list">
        <draggable item-key="name" animation="300" v-model="buttonList" dragClass="dragClass" @end="onDragEnd">
          <template #item="{ element, index }">
            <div class="query-field-item">
              <div style="width: 30px; padding-left: 5px">
                <OrderedListOutlined title="调整顺序" />
              </div>
              <div style="flex: 1">
                <span style="margin-right: 8px">
                  <Icon v-if="element.icon" :icon="element.icon" :color="element.color" :size="16" />
                </span>
                <span class="ellipsis">
                  {{ element.label }}
                </span>
              </div>
              <div class="right-icon">
                <EditOutlined title="编辑" @click.prevent="(e) => onEdit(e, element)" />
                <DeleteOutlined title="删除" @click.prevent="(e) => onRemove(e, element)" />
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- -->
    <a-popover
      v-if="otherViewButtons.length > 0"
      overlayClassName="view-pop-field-select"
      placement="bottom"
      :overlayStyle="{ width: '360px' }"
      v-model:open="showPop"
      trigger="click"
    >
      <template #content>
        <div class="field-list">
          <div style="color: #9e9e9e !important; padding-left: 15px">选择已有按钮</div>
          <div v-for="item in otherViewButtons" class="field-item" @click="onSelect(item)">
            <div>{{ item.label }}</div>
          </div>
          <a-divider style="margin: 2px 0 5px 0" />
          <div class="field-item" @click="onAdd">
            <PlusOutlined />
            <span style="margin-left: 10px">创建新按钮</span>
          </div>
        </div>
      </template>
      <template #title></template>

      <a-button block style="margin-top: 15px">
        <PlusOutlined />
        <span style="margin-left: 10px">添加按钮</span>
      </a-button>
    </a-popover>

    <a-button v-else block style="margin-top: 15px" @click="onAdd">
      <PlusOutlined />
      <span style="margin-left: 10px">添加按钮</span>
    </a-button>
  </div>
  <zdyan-drawer 
    ref="innerDrawerRef" 
    @success="onSuccess" 
    :code="code" 
    :designFormName="designFormName" 
    :viewId="viewId" 
    :titleField="titleField"
    :contentWrapperStyle="contentWrapperStyle"
    :allColumns="allColumns"/>

  <a-modal centered v-model:open="modalVisible" wrapClassName="remove-confirm-mdoal" title="删除按钮" width="480px" destroyOnClose>
    <div style="padding: 15px 20px">
      <a-radio-group v-model:value="removeStatus">
        <a-radio :style="radioStyle" value="1" :disabled="disabledRCView">
          {{ disabledRCView ? '全局按钮无法单独从当前视图中删除' : '仅从当前视图中移除' }}
        </a-radio>
        <a-radio :style="radioStyle" value="2">彻底删除按钮，与之对应触发的工作流也将被删除</a-radio>
      </a-radio-group>
    </div>
    <template #footer>
      <a-button @click="modalVisible = false">取消</a-button>
      <a-button type="primary" danger @click="doRemove()">删除</a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
  /**
   * 自定义按钮
   */
  import { ref, watchEffect, defineComponent, computed } from 'vue';
  import { PlusOutlined, OrderedListOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons-vue';
  import { ButtonInfo } from '/@/views/super/online/desform/multi/ts/type.definition';
  import ZdyanDrawer from './ZdyanDrawer.vue';
  import { Icon, IconPicker, SvgIcon } from '/@/components/Icon/index';
  import { useButtonCurd } from '../ts/useCustomButton';
  import draggable from 'vuedraggable';
  import {useCardData} from "../../components/linkRecord/useCardData";

  export default defineComponent({
    name: 'Zidingyianniu',
    components: {
      PlusOutlined,
      ZdyanDrawer,
      Icon,
      IconPicker,
      SvgIcon,
      DeleteOutlined,
      draggable,
      EditOutlined,
      OrderedListOutlined,
    },
    emits: ['refresh'],
    props: {
      // buttonList
      info: {
        type: Object || String,
        require: false,
        default: {},
      },
      code: {
        type: String,
        require: false,
        default: '',
      },
      viewId: {
        type: String,
        require: false,
        default: '',
      },
      designFormName:{
        type: String,
        require: false,
        default: '',
      },
      isLowApp:{
        type: Boolean,
        default: false,
      }
    },
    setup(props, { emit }) {
      const { queryDesignButtonList, removeButton, removeRelation, addRelation, resetSequence } = useButtonCurd(props);

      const { allColumns } = useCardData(props, false)
      
      const buttonList = ref<ButtonInfo[]>([]);
      const otherViewButtons = ref<any[]>([]);
      const showPop = ref(false);
      const titleField = ref('')

      watchEffect(() => {
        console.log('----------执行了watchEffect--------------');
        let myViewId = props.viewId;
        let myButtonList = props.info.buttonList || [];
        init(myViewId, myButtonList);
        titleField.value = props.info.designFormTitleField;
      });

      async function init(myViewId, myButtonList) {
        const list: any = await queryDesignButtonList();
        console.log('自定义按钮集合---->', list);
        console.log('视图按钮---->', myButtonList);
        reset(list, myViewId, myButtonList);
      }

      function reset(all, _myViewId, myButtonList) {
        //做出分类--其他按钮/自己的按钮
        let myList: any[] = [];
        let otherList: any[] = [];
        if (all && all.length > 0) {
          for (let item of all) {
            if (myButtonList && myButtonList.indexOf(item.id) >= 0) {
              // 自己的
              myList.push({ ...item });
            } else if (item.allView === true) {
              // 全局的
              myList.push({ ...item });
            } else {
              otherList.push({ ...item });
            }
          }
        }
        myList.sort(function (a, b) {
          return a.seq - b.seq;
        });
        buttonList.value = myList;
        otherViewButtons.value = otherList;
      }

      async function onSelect(item) {
        //console.log(item);
        await addRelation(item.id);
        await onSuccess();
      }

      const defaultButton = {
        showStatus: 'always',
        clickThen: 'execute',
        flowStatus: true,
        color: 'rgb(33, 150, 243)',
      };

      function prevent(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const innerDrawerRef = ref();
      function openDrawer(data) {
        innerDrawerRef.value.show(data);
      }

      async function onSuccess() {
        // 按钮保存后 刷新视图
        emit('refresh');

        const list: any = await queryDesignButtonList();
        console.log('自定义按钮集合---->', list);
        let myViewId = props.viewId;
        let myButtonList = props.info.buttonList || [];
        reset(list, myViewId, myButtonList);
      }

      function onAdd(e) {
        e && prevent(e);
        showPop.value = false;
        openDrawer({
          title: '添加按钮',
          button: { ...defaultButton },
          isUpdate: false,
        });
      }

      function onEdit(e, item) {
        e && prevent(e);
        showPop.value = false;
        openDrawer({
          title: '编辑按钮',
          button: { ...item },
          isUpdate: true,
        });
      }

      function onDragEnd() {
        // 拖动完毕 改变查询控件的顺序
        onChangeList();
      }

      /**
       * 调整字段顺序时都会触发
       */
      function onChangeList() {
        let list = buttonList.value;
        let arr: any[] = [];
        if (list && list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            arr.push({
              id: list[i].id,
              seq: i,
            });
          }
        }
        resetSequence(arr);
      }

      const modalVisible = ref(false);
      const removeStatus = ref('1');
      const removeButtonId = ref('');
      const disabledRCView = ref(false);

      function onRemove(e, item) {
        e && prevent(e);
        modalVisible.value = true;
        removeButtonId.value = item.id;
        // 全局按钮，不可从当前视图删除，只能彻底删除
        disabledRCView.value = item.allView === true;
        if (disabledRCView.value) {
          removeStatus.value = '2';
        } else {
          removeStatus.value = '1';
        }
      }

      async function doRemove() {
        if (removeStatus.value === '1') {
          //移除关系
          await removeRelation(removeButtonId.value);
        } else {
          //彻底删除
          await removeButton(removeButtonId.value);
        }
        await onSuccess();
        modalVisible.value = false;
        removeButtonId.value = '';
      }
      const radioStyle = {
        display: 'flex',
        height: '30px',
        lineHeight: '30px',
      };
      
      const contentWrapperStyle = computed(()=>{
        if(props.isLowApp == true){
          return {
            top: '50px'
          }
        }else{
          return {
            top: '100px'
          }
        }
      });

      return {
        buttonList,
        showPop,
        otherViewButtons,
        innerDrawerRef,
        onSelect,
        onSuccess,
        onAdd,
        onEdit,
        onRemove,
        onDragEnd,
        radioStyle,
        modalVisible,
        removeStatus,
        disabledRCView,
        doRemove,
        allColumns,
        contentWrapperStyle,
        titleField
      };
    },
  });
</script>

<style scoped lang="less">
  @import './common';
</style>
<style lang="less">
  .remove-confirm-mdoal {
    .ant-modal-title {
      color: red !important;
      font-size: 17px !important;
      font-weight: 400 !important;
    }
  }
</style>
