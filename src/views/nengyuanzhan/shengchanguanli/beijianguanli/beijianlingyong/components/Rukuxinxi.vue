<template>
  <a-spin :spinning="loading">
    <BasicForm @register="registerForm" class="mr3" />
  </a-spin>
</template>

<script lang="ts" setup>
  import { onMounted, ref, unref, watch } from 'vue';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';
  import { getUserData } from '@/views/system/usersetting/UserSetting.api';
  import { queryTreeList } from '@/api/common/api';

  const props = defineProps({
    data: { type: Object, default: () => ({}) },
  });

  const loading = ref(false);

  function findEmployeeInfo(treeData: any[], employeeId: string | number, parentLabel = ''): { name: string; deptName: string } | null {
    if (!employeeId || !Array.isArray(treeData)) {
      return null;
    }
    for (const node of treeData) {
      if (String(node?.id) === String(employeeId)) {
        return {
          name: node?.label || '',
          deptName: parentLabel,
        };
      }
      if (Array.isArray(node?.children) && node.children.length) {
        const match = findEmployeeInfo(node.children, employeeId, node?.label || parentLabel);
        if (match) {
          return match;
        }
      }
    }
    return null;
  }

  function normalizeStatus(status: string | number) {
    if (status === 5 || status === '5') {
      return '已提交';
    }
    if (status === 20 || status === '20') {
      return '审批完成';
    }
    if (status === 30 || status === '30') {
      return '已关闭';
    }
    return '';
  }

  function isLikelyId(value: unknown) {
    if (value === null || value === undefined) {
      return false;
    }
    const normalized = String(value).trim();
    return /^[0-9a-fA-F-]{16,}$/.test(normalized) || /^\d{6,}$/.test(normalized);
  }

  const schemas: FormSchema[] = [
    {
      field: 'baseTitle',
      component: 'Divider',
      label: '基本信息',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'sheetNo',
      label: '领用单号',
      component: 'Input',
      colProps: { span: 12 },
      componentProps: { disabled: true },
    },
    {
      field: 'subject',
      label: '领用主题',
      component: 'Input',
      colProps: { span: 12 },
      componentProps: { disabled: true },
    },
    {
      field: 'opDate',
      label: '申请时间',
      component: 'Input',
      colProps: { span: 12 },
      componentProps: { disabled: true },
    },
    {
      field: 'statusText',
      label: '单据状态',
      component: 'Input',
      colProps: { span: 12 },
      componentProps: { disabled: true },
    },
    {
      field: 'applicantName',
      label: '领用申请人',
      component: 'Input',
      colProps: { span: 12 },
      componentProps: { disabled: true },
    },
    {
      field: 'orgName',
      label: '申请部门',
      component: 'Input',
      colProps: { span: 12 },
      componentProps: { disabled: true },
    },
    {
      field: 'repairSheetNo',
      label: '关联单号',
      component: 'Input',
      colProps: { span: 12 },
      componentProps: { disabled: true },
    },
    {
      field: 'remark',
      label: '领用原因',
      component: 'InputTextArea',
      colProps: { span: 24 },
      componentProps: {
        rows: 3,
        disabled: true,
        style: { width: '100%' },
      },
    },
  ];

  const [registerForm, { resetFields, setFieldsValue }] = useForm({
    labelWidth: 150,
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
    schemas,
    showActionButtonGroup: false,
  });

  onMounted(() => {
    watch(
      () => props.data,
      async (newValue) => {
        let record = unref(newValue);
        if (typeof record !== 'object' || !record) {
          record = {};
        }

        loading.value = true;
        try {
          const employeeTree = await getTreeListRenyuan();
          const employeeInfo = findEmployeeInfo(employeeTree, record?.applicant);
          let currentUser = null;
          let deptName = record?.orgName || record?.deptName || record?.departName || record?.sysOrgCode_dictText || employeeInfo?.deptName || '';
          let applicantDisplayName =
            record?.applicantName && String(record?.applicantName) !== String(record?.applicant) && !isLikelyId(record?.applicantName)
              ? record.applicantName
              : employeeInfo?.name || '';

          if (!deptName || !applicantDisplayName) {
            currentUser = await getUserData();
          }

          if (currentUser?.result?.id && String(currentUser.result.id) === String(record?.applicant)) {
            applicantDisplayName = applicantDisplayName || currentUser.result.username || '';
            if (!deptName) {
              const deptList = await queryTreeList({ ids: currentUser.result.departIds });
              deptName = deptList?.[0]?.departName || '';
            }
          }

          const normalizedRecord = {
            ...record,
            applicantName: applicantDisplayName || record?.createBy || '',
            orgName: deptName,
            repairSheetNo: record?.repairSheetNo || '',
            statusText: normalizeStatus(record?.status),
          };

          await resetFields();
          await setFieldsValue(normalizedRecord);
        } finally {
          loading.value = false;
        }
      },
      { deep: true, immediate: true }
    );
  });
</script>
