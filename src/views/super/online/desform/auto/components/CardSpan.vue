<script lang="tsx">
  import { defineComponent } from 'vue';

  /**
   * 用于兼容customRender和纯文本
   */
  export default defineComponent({
    name: 'CardSpan',
    props: {
      is: { required: true },
    },
    setup(props) {
      /**
       * 判断是否有值
       */
      function has() {
        if (props.is == null) {
          return false;
        }
        if (Array.isArray(props.is)) {
          return props.is.length > 0;
        }
        return props.is !== '';
      }

      return () => {
        if (has()) {
          return <span>{props.is as any}</span>;
        } else {
          return <span class="card-span-empty"></span>;
        }
      };
    },
  });
</script>

<style scoped lang="less">
  .card-span-empty {
    display: inline-block;
    width: 22px;
    height: 6px;
    background: #eaeaea;
    border-radius: 3px;
    position: relative;
    top: 8px;
  }
</style>
