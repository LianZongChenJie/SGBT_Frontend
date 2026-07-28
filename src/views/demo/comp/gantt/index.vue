<template>
  <div>
    <div class="legend">
      <div class="legendBox">
        <div class="legendSml legendColor1"></div>
        <div>计划时间</div>
      </div>
      <div class="legendBox">
        <div class="legendSml legendColor2"></div>
        <div>相交时间</div>
      </div>
      <div class="legendBox">
        <div class="legendSml legendColor3"></div>
        <div>实际时间</div>
      </div>
    </div>


    <div ref="gantt" class="left-container" />
  </div>
</template>
<script>
  import dayjs from 'dayjs' // dayjs格式化时间
  import gantt from "dhtmlx-gantt"; // 引入模块
  import "dhtmlx-gantt/codebase/dhtmlxgantt.css"; //皮肤

  export default {
    name: "gantt",
    data() {
      return {
        tasks: {
          data: [],
        },
      };
    },
    mounted() {
      this.initData();

      gantt.config.show_progress = false;
      function percenToString(num) {
        return Math.floor(num * 100) + "%";
      }

      // 设置每一部分的颜色
      function renderLabel(progress, type, state) {
        var relWidth = progress * 100;
        var cssClass = "custom_progress ";
        if (type === 1) {
          cssClass += "nearly_done";
        } else if (type === 2) {
          if (state) {
            cssClass += "in_progress";
          } else {
            cssClass += "in_progress_w";
          }
        } else {
          cssClass += "idle";
        }
        return (
          "<div class='" +
          cssClass +
          "' style='width:" +
          relWidth +
          "%'>" +
          percenToString(progress) +
          "</div>"
        );
      }

      // 根据定义类型判断颜色顺序
      gantt.templates.task_text = function(start, end, task) {
        let colorType = task.colorType
        if (colorType === 'j12' || colorType === 'one') {
          return (
            renderLabel(task.progress1, 1, task.state) +
            renderLabel(task.progress2, 2, task.state) +
            renderLabel(task.progress3, 3, task.state)
          );
        } else if (colorType === 'j21') {
          return (
            renderLabel(task.progress1, 3, task.state) +
            renderLabel(task.progress2, 2, task.state) +
            renderLabel(task.progress3, 1, task.state)
          );
        } else if (colorType === 'b12') {
          return (
            renderLabel(task.progress1, 1, task.state) +
            renderLabel(task.progress2, 2, task.state) +
            renderLabel(task.progress3, 1, task.state)
          );
        } else if (colorType === 'b21') {
          return (
            renderLabel(task.progress1, 3, task.state) +
            renderLabel(task.progress2, 2, task.state) +
            renderLabel(task.progress3, 3, task.state)
          );
        } else if (colorType === 'l12') {
          return (
            renderLabel(task.progress1, 1, task.state) +
            renderLabel(task.progress2, 2, task.state) +
            renderLabel(task.progress3, 3, task.state)
          );
        } else if (colorType === 'l21') {
          return (
            renderLabel(task.progress1, 3, task.state) +
            renderLabel(task.progress2, 2, task.state) +
            renderLabel(task.progress3, 1, task.state)
          );
        } else {
          return (
            renderLabel(task.progress1, 1, task.state) +
            renderLabel(task.progress2, 2, task.state) +
            renderLabel(task.progress3, 3, task.state)
          );
        }
      };
      gantt.plugins({ marker: true, tooltip: true }); // 开启marker插件 
      var dateToStr = gantt.date.date_to_str(gantt.config.task_date);
      var today = new Date();
      // 添加固定时间线
      gantt.addMarker({
        start_date: today,
        css: 'today',
        text: '今日:' + dayjs(new Date()).format('YYYY-MM-DD'),
        title: 'Today: ' + dateToStr(today)
      });
      // 提示框内容
      gantt.templates.tooltip_text = function(start, end, task){
        return "<b>任务内容:</b>" + task.text +
          "<br/><b>计划开始:</b> " + task.planStart +
          "<br/><b>计划结束:</b> " + task.planEnd +
          "<br/><b>实际开始:</b> " + task.actualStart +
          "<br/><b>实际结束:</b> " + task.actualEnd
      };

      gantt.config.scale_unit = "year";
      gantt.config.step = 1;
      gantt.config.date_scale = "%Y";
      //当右侧不止显示年份时，可以添加展示月日，添加一个就加一行
      
      gantt.config.subscales = [
        { unit: "month", step: 1, date: "%m" },
        // { unit: "day", step: 1, date: "%d" },
      ];
      //甘特图右侧表头的高度
      gantt.config.scale_height = 80;
      //使用中文
      gantt.i18n.setLocale("cn");
      //自适应甘特图的尺寸大小, 使得在不出现滚动条的情况下, 显示全部任务
      gantt.config.autosize = true;
      //只读模式
      gantt.config.readonly = false;
      //是否显示左侧树表格
      gantt.config.show_grid = true;
      //表格列设置
      gantt.config.columns = [
        { name: "text", label: "任务内容", width: "120", align: "center" },
        { name: "planStart", label: "计划开始", width: "100", align: "center" },
        { name: "planEnd", label: "计划结束", width: "100", align: "center" },
        { name: "actualStart", label: "实际开始", width: "100", align: "center" },
        { name: "actualEnd", label: "实际结束", width: "100", align: "center" },
      ];
      //任务条上的文字大小 以及取消border自带样式
      gantt.templates.task_class = function() {
        return "firstLevelTask"
      };
      // 初始化
      gantt.init(this.$refs.gantt);
      // 数据解析
      gantt.parse(this.tasks);
    },
    methods: {
      initData() {
        // 处理数据
        let arr = [{
          id: '1',
          task: '12相交',
          planStart: '2022-09-01',
          planEnd: '2022-12-01',
          actualStart: '2022-10-01',
          actualEnd: '2022-02-01',
        }, {
          id: '2',
          task: '21相交',
          planStart: '2022-10-01',
          planEnd: '2022-02-01',
          actualStart: '2022-09-01',
          actualEnd: '2022-12-01',
        }, {
          id: '3',
          task: '1包含2',
          planStart: '2022-09-01',
          planEnd: '2022-05-01',
          actualStart: '2022-12-01',
          actualEnd: '2022-02-01',
        }, {
          id: '4',
          task: '2包含1',
          planStart: '2022-12-01',
          planEnd: '2022-02-01',
          actualStart: '2022-09-01',
          actualEnd: '2022-05-01',
        }, {
          id: '5',
          task: '12相离',
          planStart: '2022-09-01',
          planEnd: '2022-12-01',
          actualStart: '2022-02-01',
          actualEnd: '2022-05-01',
        }, {
          id: '6',
          task: '21相离',
          planStart: '2022-02-01',
          planEnd: '2022-05-01',
          actualStart: '2022-09-01',
          actualEnd: '2022-12-01',
        }, {
          id: '7',
          task: '1包含2',
          planStart: '2022-09-01',
          planEnd: '2022-05-01',
          actualStart: '2022-09-01',
          actualEnd: '2022-02-01',
        }, {
          id: '8',
          task: '1包含2',
          planStart: '2023-09-01',
          planEnd: '2022-05-01',
          actualStart: '2022-12-01',
          actualEnd: '2022-05-01',
        }, {
          id: '9',
          task: '2包含1',
          planStart: '2022-09-01',
          planEnd: '2022-02-01',
          actualStart: '2022-09-01',
          actualEnd: '2022-05-01',
        }, {
          id: '10',
          task: '2包含1',
          planStart: '2022-12-01',
          planEnd: '2022-05-01',
          actualStart: '2022-09-01',
          actualEnd: '2022-05-01',
        }, {
          id: '11',
          task: '12相等',
          planStart: '2022-09-01',
          planEnd: '2022-05-01',
          actualStart: '2022-09-01',
          actualEnd: '2022-05-01',
        }];

        let newArr = []
        arr.forEach((item, index) => {
          let obj = this.getDate(item.planStart, item.planEnd, item.actualStart, item.actualEnd)
          newArr.push({
            id: item.id,
            text: item.task,
            start_date: new Date(dayjs(obj.minTime).format("YYYY-MM-DD")),
            progress1: Math.abs(obj.progress1),
            progress2: Math.abs(obj.progress2),
            progress3: Math.abs(obj.progress3),
            duration: obj.duration,

            planStart: item.planStart,
            planEnd: item.planEnd,
            actualStart: item.actualStart,
            actualEnd: item.actualEnd,
            state: obj.state,
            colorType: obj.colorType
          })
        });
        this.tasks.data = newArr
      },

      // 时间计算
      getDate(Atime, Btime, Ctime, Dtime) {
        let obj = {};
        let arr = [Atime, Btime, Ctime, Dtime];
        let timeArr = [];
        arr.forEach((item) => {
          timeArr.push(new Date(item));
        });
        let minTime = dayjs(Math.min(...timeArr)).format("MM-DD-YYYY");
        let maxTime = dayjs(Math.max(...timeArr)).format("YYYY-MM-DD");
        let duration = this.difference(minTime, maxTime);

        let progress1 = 0;
        let progress2 = 0;
        let progress3 = 0;
        let state = true;
        let colorType = true;

        if (Atime < Ctime && Ctime < Btime &&  Btime < Dtime) {
          // console.log('12相交', index)
          colorType = 'j12'
          progress2 = (this.difference(Ctime, Btime) / duration)
          progress1 = (this.difference(Atime, Ctime) / duration)
          progress3 = (this.difference(Btime, Dtime) / duration)
        } else if (Btime > Ctime && Btime >= Dtime && Ctime >= Atime && Dtime > Atime) {
          // console.log('1包含2', index)
          colorType = 'b12'
          state = true
          progress2 = (this.difference(Ctime, Dtime) / duration)
          progress1 = (this.difference(Atime, Ctime) / duration)
          progress3 = (this.difference(Dtime, Btime) / duration)
        } else if (Dtime >= Btime && Dtime > Atime && Atime >= Ctime && Btime > Ctime) {
          // console.log('2包含1', index)
          colorType = 'b21'
          state = true
          progress2 = (this.difference(Atime, Btime) / duration)
          progress1 = (this.difference(Ctime, Atime) / duration)
          progress3 = (this.difference(Btime, Dtime) / duration)
        } else if (Btime > Dtime && Dtime > Atime && Atime > Ctime) {
          // console.log('21相交', index)
          colorType = 'j21'
          state = true
          progress2 = (this.difference(Atime, Dtime) / duration)
          progress1 = (this.difference(Ctime, Atime) / duration)
          progress3 = (this.difference(Dtime, Btime) / duration)
        } else if (Btime < Ctime) {
          // console.log('12相离')
          colorType = 'l12'
          state = false
          progress2 = (this.difference(Btime, Ctime) / duration)
          progress1 = (this.difference(Atime, Btime) / duration)
          progress3 = (this.difference(Ctime, Dtime) / duration)
        } else if (Dtime < Atime) {
          // console.log('21相离')
          colorType = 'l21'
          state = false
          progress2 = (this.difference(Dtime, Atime) / duration)
          progress3 = (this.difference(Atime, Btime) / duration)
          progress1 = (this.difference(Ctime, Dtime) / duration)
        } else {
          colorType = 'one'
          console.log('状态错误')
        }
        obj = {
          state: state,
          minTime: minTime,
          duration: duration * 1,
          progress1: progress1 * 1,
          progress2: progress2 * 1,
          progress3: progress3 * 1,
          colorType: colorType,
        };
        return obj;
      },
      difference(beginTime, Dtime) {
        var dateBegin = new Date(beginTime);
        var dateEnd = new Date(Dtime);
        var dateDiff = dateEnd.getTime() - dateBegin.getTime(); //时间差的毫秒数
        var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000)); //计算出相差天数
        return dayDiff;
      }
    }
  }
</script>
<style lang="less" scoped>
  html,
  body {
    height: 100%;
    padding: 0px;
    margin: 0px;
    overflow: hidden;
  }

  .legend {
    padding: 10px;
    display: flex;

    .legendBox {
      display: flex;
      align-items: center;
      margin-right: 20px;

      .legendSml {
        width: 30px;
        height: 16px;
        border-radius: 5px;
        margin-right: 4px;
      }

      .legendColor1 {
        background: #01aff4;
      }
      
      .legendColor2 {
        background: #0169bd;
      }
      
      .legendColor3 {
        background: rgb(1, 105 , 189, 50%);
      }
    }
  }

  .gantt_task_content {
    display: flex;
  }

  .gantt_task_line {
    background: #fff;
  }

  .custom_progress {
    display: inline-block;
    vertical-align: top;
    text-align: center;
    height: 100%;
  }
  
  .nearly_done {
    background-color: #01aff4 !important;
  }

  .in_progress {
    background-color: #0169bd !important;
  }

  .in_progress_w {
    background-color: #FFF !important;
  }

  .idle {
    background-color: rgb(1, 105 , 189, 50%) !important;
  }
  
  .firstLevelTask {
    border: none;
  }

  .secondLevelTask {
    border: none;
  }

  .left-container {
    height: 600px;
  }

  /** 去掉单元格线 */
  .gantt_task_cell{
    border: none;
  }
</style>
