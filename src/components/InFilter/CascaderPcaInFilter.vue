<!-- 省市县选择组件，在筛选中的用法 -->
<template>
  <a-space :class="[prefixCls]" direction="vertical">
    <a-space-compact block>
      <!-- 自定义省市区级联选择器 -->
      <CascaderPcaForQuery v-model:value="innerValue" :areaLevel="innerLevel" v-bind="attrs"/>
      <!-- 右侧下拉菜单 -->
      <a-dropdown v-if="allowChangeLevel && areaLevel > 1" :trigger="['click']">
        <a-button preIcon="ant-design:menu-unfold"/>
        <template #overlay>
          <a-menu @click="onMenuClick">
            <template v-for="opt of LEVEL_OPTIONS" :key="opt.level">
              <a-menu-item v-if="areaLevel >= opt.level" v-bind="{key: opt.level}">
                <div :class="[`${prefixCls}-menu-item-icon`]">
                  <a-icon v-if="innerLevel == opt.level" type="check-outlined"/>
                </div>
                <span>{{ opt.label }}</span>
              </a-menu-item>
            </template>
          </a-menu>
        </template>
      </a-dropdown>
    </a-space-compact>
  </a-space>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'CascaderPcaInFilter',
  inheritAttrs: false,
})
</script>

<script lang="ts" setup>
import {ref, watch, useAttrs} from 'vue'
import CascaderPcaForQuery from "../jeecg/super/desform/CascaderPcaForQuery.vue";
import {useDesign} from '/@/hooks/web/useDesign';
import { Form } from 'ant-design-vue';
const formItemContext = Form.useInjectFormItemContext();

const LEVEL_OPTIONS = [
  {level: 1, label: '省级'},
  {level: 2, label: '市级'},
  {level: 3, label: '县/区级'},
]

const {prefixCls} = useDesign('j-cascader-pca-in-filter');
const props = defineProps({
  value: {
    type: [String],
    default: ''
  },
  areaLevel: {
    type: Number,
    default: 3
  },
  // 是否允许更改级别
  allowChangeLevel: {
    type: Boolean,
    default: true,
  }
})
const emit = defineEmits(['change', 'update:value'])
const attrs = useAttrs()

const innerValue = ref(props.value)
const innerLevel = ref(props.areaLevel)

// 同步value
watch(() => props.value, (val) => {
  if (val && /^LIKE_\d/.test(val)) {
    const valArr = val.split('_')
    if (valArr.length === 3) {
      innerLevel.value = Number(valArr[1])
      val = valArr[2]
    }
  }
  innerValue.value = val
}, {immediate: true})

// 同步level
watch(() => props.areaLevel, (val) => {
  innerLevel.value = val
})

// emit 更改
watch(innerValue, (val) => {
  if (innerLevel.value !== props.areaLevel) {
    val = 'LIKE_' + innerLevel.value + '_' + val;
  }
  emit('change', val)
  emit('update:value', val)
  formItemContext?.onFieldChange();
})

watch(innerLevel, () => {
  innerValue.value = ''
})

watch(() => props.allowChangeLevel, (allow) => {
  // 如果
  if (!allow) {
    innerLevel.value = props.areaLevel
  }
}, {immediate: true});

// 点击右侧下拉菜单
function onMenuClick(event: Recordable) {
  innerLevel.value = event.key
}

</script>

<style lang="less">
//noinspection LessUnresolvedVariable
@prefix-cls: ~'@{namespace}-j-cascader-pca-in-filter';

.@{prefix-cls} {
  width: 100%;
}


.@{prefix-cls}-menu-item-icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  margin-right: 6px;

  &, & + span {
    vertical-align: middle;
  }
}
</style>