<template>
  <span v-if="isAnt">
      <Icon :icon="iconName" :size="14" v-bind="getProps" class="design-comp-icon"/>
  </span>
    <span v-else>
    <icon-font :type="iconName" v-bind="getProps" class="design-comp-icon"/>
  </span>
</template>

<script lang="ts">
  import { createFromIconfontCN, BlockOutlined } from '@ant-design/icons-vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  const IconFont = createFromIconfontCN({
    scriptUrl: '/resource/js/iconfont.js'
  });
  import { Icon } from '/@/components/Icon/index';
  import { ref, watch, computed, unref } from 'vue';

  export default {
    name: 'ComponentIcon',
    components: {
      BlockOutlined,
      IconFont,
      Icon
    },
    props: {
      type: {
        type: String,
        default: '',
      },
    },
    setup(props) {
      const attrs = useAttrs();

      const isAnt = ref(false);
      const iconName = ref('');
      watch(
        () => props.type,
        (val) => {
          isAnt.value = false;
          let name = getIconName(val);
          iconName.value = name;
        },
        { immediate: true }
      );

      // 弹窗最终props
      const getProps = computed(() => {
        let finalProps: Recordable = {
          ...unref(attrs),
        };
        return finalProps;
      });

      function getIconName(type) {
        switch (type) {
          case 'input':
          case 'textarea':
            return 'icon-input1';
          case 'color':
            return 'icon-color';
          case 'money':
            return 'icon-money';
          case 'rate':
            return 'icon-rate';
          case 'integer':
          case 'number':
            return 'icon-number';
          case 'slider':
            return 'icon-slider';
          case 'radio':
            return 'icon-radio-active';
          case 'checkbox':
            return 'icon-checkbox'
          case 'switch':
            return 'icon-switch';
          case 'select':
            return 'icon-select';
          case 'time':
            return 'icon-time';
          case 'year':
          case 'month':
          case 'date':
          case 'datetime':
            return 'icon-date';
          case 'area-linkage':
            return 'icon-jilianxuanze';
          case 'link-record':
            isAnt.value = true;
            return 'ant-design:block-outlined';
          case 'link-field':
            return 'icon-field';
          case 'select-user':
            return 'icon-user';
          case 'select-depart':
            return 'icon-depart';
          case 'table-dict':
            return 'icon-dict';
          case 'select-tree':
            return 'icon-tree';
          case 'org-role':
            return 'icon-zuzhijuese';
          case 'email':
            return 'icon-email';
          case 'phone':
            return 'icon-mobile-phone';
          case 'sub-table-design':
            isAnt.value = true;
            return 'ant-design:table-outlined';
          case 'map':
            return 'icon-map';
          case 'location':
            return 'icon-location'
          case 'summary':
            return 'icon-sigma';
          case 'imgupload':
            return 'icon-tupian';
          case 'file-upload':
            return 'icon-shangchuan';
          default:
            return 'icon-input';
        }
      }

      return {
        isAnt,
        iconName,
        getProps
      };
    },
  };
</script>

<style scoped lang="less">
    .design-comp-icon{
        font-size: 15px;
        margin-right: 6px;
        /*color: rgb(158, 158, 158);*/
    }

</style>
