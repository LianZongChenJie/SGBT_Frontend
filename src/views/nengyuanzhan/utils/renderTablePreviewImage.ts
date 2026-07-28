import type { CSSProperties } from 'vue';
import { h } from 'vue';
import { Image } from 'ant-design-vue';
import Icon from '/@/components/Icon';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';

interface RenderTablePreviewImageOptions {
  text?: string;
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
  alt?: string;
}

function getImageList(text?: string) {
  if (!text) {
    return [];
  }
  return String(text)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => getFileAccessHttpUrl(item));
}

function getPreviewMask() {
  return h(Icon, { icon: 'ant-design:eye-outlined', size: 20 });
}

export function renderTablePreviewImage({ text, width = 100, height = 60, style = {}, alt = '图片' }: RenderTablePreviewImageOptions) {
  const imageList = getImageList(text);
  if (!imageList.length) {
    return '-';
  }

  return h(Image.PreviewGroup, null, {
    default: () =>
      imageList.map((item) =>
        h(Image, {
          src: item,
          alt,
          width,
          height,
          wrapperStyle: { marginRight: '5px', cursor: 'zoom-in' },
          style,
          previewMask: getPreviewMask,
        })
      ),
  });
}
