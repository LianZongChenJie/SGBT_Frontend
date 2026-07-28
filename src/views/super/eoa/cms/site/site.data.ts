import { BasicColumn } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '站点名称',
    align: 'center',
    dataIndex: 'siteName',
  },
  {
    title: '站点Logo',
    align: 'center',
    dataIndex: 'siteLogo',
    customRender: ({ text }) => {
      return render.renderImage({ text });
    },
  },
  {
    title: '公司电话',
    align: 'center',
    dataIndex: 'companyTel',
  },
  {
    title: '站点模板',
    align: 'center',
    dataIndex: 'siteTemplateStyle',
  },
  {
    title: '经度',
    align: 'center',
    dataIndex: 'longitude',
  },
  {
    title: '纬度',
    align: 'center',
    dataIndex: 'latitude',
  },
];
