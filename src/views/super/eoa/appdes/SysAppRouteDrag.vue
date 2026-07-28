<template>
  <!--方式一-->
  <a-row :class="['p-4']" type="flex" :gutter="10">
    <!--app部分-->
    <a-col :md="12" :sm="24">
      <a-card :bordered="false">
        <div class="containerDrag">
          <div style="overflow-y: auto; background-color: #fff; height: 580px">
            <!--轮播图-->
            <section style="margin-top: 5px" @click="handleConfig">
              <a-carousel autoplay :dots="false" v-if="carouselImgArr && carouselImgArr.length > 0">
                <div v-for="(data, index) in carouselImgArr" class="carouselDiv">
                  <img :src="data" style="width: 100%; height: 160px" />
                </div>
              </a-carousel>
              <a-card v-else>
                <a-empty>
                  <template #description> 请配置APP基础信息! </template>
                </a-empty>
              </a-card>
            </section>
            <section style="display: flex; flex-direction: column">
              <!--审核模块-->
              <div>
                <ul v-if="approveDataSource.length > 0">
                  <draggable :force-fallback="true" @end="end" v-model="approveDataSource" item-key="id" filter=".unmover">
                    <template #item="{ element }">
                      <li style="float: left; width: 50%" @click="handleEdit(element)" @dblclick="dbClick()">
                        <div
                          class="approveDiv"
                          :class="{ setGray: element.status === '2', unmover: element.status === '2', error: element.status === '2' }"
                        >
                          <img
                            v-if="data.delShow"
                            src="https://static.jeecg.com/files/del_1625995633443.png"
                            class="delete"
                            @click.stop="delItem(element.id)"
                          />
                          <img style="width: 40px; height: 40px" :src="getFileAccessHttpUrl(element.icon)" />
                          <div style="font-size: 12px; white-space: nowrap"
                            >{{ element.title }}<div>{{ element.subTitle }}</div></div
                          >
                        </div>
                      </li>
                    </template>
                  </draggable>
                </ul>
              </div>
              <div style="width: 100%; height: 15px; background: #f1f1f1"></div>
              <!--服务模块-->
              <div>
                <div class="titleDiv">常用服务</div>
                <ul v-if="commonDataSource.length > 0">
                  <draggable
                    @end="end"
                    @add="add"
                    group="service"
                    :options="{ animation: 300 }"
                    item-key="id"
                    v-model="commonDataSource"
                    filter=".unmover"
                    :force-fallback="true"
                  >
                    <template #item="{ element }">
                      <li style="float: left; width: 25%" @click="handleEdit(element)" @dblclick="dbClick()">
                        <div
                          class="imgDiv"
                          :class="{ setGray: element.status === '2', unmover: element.status === '2', error: element.status === '2' }"
                        >
                          <img
                            v-if="data.delShow"
                            src="https://static.jeecg.com/files/del_1625995633443.png"
                            class="delete"
                            @click.stop="delItem(element.id)"
                          />
                          <img style="width: 40px; height: 40px" :src="getFileAccessHttpUrl(element.icon)" />
                          <div class="titleSpan">{{ getTitle(element.title) }}</div>
                        </div>
                      </li>
                    </template>
                  </draggable>
                  <li style="float: left; width: 25%" @click="handleAdd()"><div class="add"></div></li>
                </ul>
              </div>
              <div style="width: 100%; height: 15px; background: #f1f1f1"></div>
              <!--其他服务-->
              <div>
                <div class="titleDiv">其他服务</div>
                <ul v-if="otherDataSource.length > 0">
                  <draggable
                    @end="end"
                    @add="add"
                    group="service"
                    :options="{ animation: 300 }"
                    item-key="id"
                    v-model="otherDataSource"
                    filter=".unmover"
                    :force-fallback="true"
                  >
                    <template #item="{ element, index }">
                      <li style="float: left; width: 25%" @click="handleEdit(element)" @dblclick="dbClick()">
                        <div
                          class="imgDiv"
                          :class="{ setGray: element.status === '2', unmover: element.status === '2', error: element.status === '2' }"
                        >
                          <img
                            v-if="data.delShow"
                            src="https://static.jeecg.com/files/del_1625995633443.png"
                            class="delete"
                            @click.stop="delItem(element.id)"
                          />
                          <img style="width: 40px; height: 40px" :src="getFileAccessHttpUrl(element.icon)" />
                          <span class="titleSpan">{{ getTitle(element.title) }}</span>
                        </div>
                      </li>
                    </template>
                  </draggable>
                  <li style="float: left; width: 25%" @click="handleAdd()"><div class="add"></div></li>
                </ul>
              </div>
            </section>
            <a-button
              v-if="!data.typeSetDisabled"
              @click="sureChange"
              type="primary"
              class="floating-button"
              style="margin-top: 30px"
              :disabled="data.typeSetDisabled"
              >保存排版</a-button
            >
          </div>
        </div>
      </a-card>
    </a-col>
    <!--表单部分-->
    <a-col :md="12" :sm="24">
      <a-tabs v-model:activeKey="data.activeKey">
        <a-tab-pane tab="配置信息" key="1">
          <a-card :bordered="false">
            <SysAppConfigForm ref="appConfigForm" @ok="modalFormOk" />
            <div class="anty-form-btn">
              <a-button @click="save('config')" type="primary" preIcon="ant-design:save-outlined">保存</a-button>
            </div>
          </a-card>
        </a-tab-pane>
        <a-tab-pane tab="菜单信息" key="2" forceRender>
          <a-card :bordered="false">
            <SysAppRouteForm ref="appRouteForm" @ok="modalFormOk" />
            <div class="anty-form-btn">
              <a-button @click="save('route')" type="primary" preIcon="ant-design:save-outlined">保存</a-button>
            </div>
          </a-card>
        </a-tab-pane>
        <a-tab-pane tab="版本管理" key="3" forceRender v-if="hasPermission('edit:app:version')">
          <a-card :bordered="false">
            <SysAppVersionForm ref="appVersionForm" @ok="modalFormOk" />
            <div class="anty-form-btn">
              <a-button @click="save('version')" type="primary" preIcon="ant-design:save-outlined">保存</a-button>
            </div>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup name="appdes-sysAppRouteDrag">
  import draggable from 'vuedraggable';
  import { ref, reactive, unref, onMounted, getCurrentInstance } from 'vue';
  import SysAppRouteForm from './components/SysAppRouteForm.vue';
  import SysAppConfigForm from './components/SysAppConfigForm.vue';
  import SysAppVersionForm from './components/SysAppVersionForm.vue';
  import { queryAppConfig, getRouteList, sortChange, deleteRoute } from './appdes.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { usePermission } from '@/hooks/web/usePermission';

  const { hasPermission } = usePermission();
  const { createMessage } = useMessage();
  //app配置数据
  const appConfig = ref<any>({});
  //轮播图
  const carouselImgArr = ref([]);
  const temporaryTestingToken = 'NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==';
  //常用路由
  const commonDataSource = ref<any>([]);
  //其他路由
  const otherDataSource = ref<any>([]);
  //审核路由
  const approveDataSource = ref<any>([]);
  const $instance: any = getCurrentInstance();
  const data = reactive({
    newDateSource: [],
    delShow: false,
    time: null,
    type: 'config',
    activeKey: '1',
    typeSetDisabled: true, //排版按钮状态
  });
  //初始化数据
  function initData() {
    loadConfig();
    loadData();
  }

  /**
   * 加载配置项
   */
  async function loadConfig() {
    const res = await queryAppConfig();
    if (res.success && res.result) {
      appConfig.value = res.result;
      let carouselImgStr = res.result.carouselImgJson;
      carouselImgArr.value = carouselImgStr && carouselImgStr.length > 0 ? carouselImgStr.split(',') : [];
      $instance.refs?.appConfigForm?.initFormData(unref(appConfig));
      $instance.refs?.appVersionForm?.initFormData(unref(appConfig));
    } else {
      createMessage.warning(res.message);
    }
  }

  /**
   * 加载路由信息
   */
  async function loadData() {
    const res = await getRouteList();
    if (res.success) {
      let allDate = res.result;
      commonDataSource.value = allDate.filter((item) => item.type == 'common');
      otherDataSource.value = allDate.filter((item) => item.type == 'other');
      approveDataSource.value = allDate.filter((item) => item.type == 'approve');
    } else {
      createMessage.warning(res.message);
    }
  }

  /**
   * 新增
   */
  function handleAdd() {
    data.activeKey = '2';
    $instance.refs.appRouteForm.show();
  }

  /**
   * 编辑
   * @param record
   */
  function handleEdit(record) {
    clearTimeout(data.time);
    data.time = setTimeout(() => {
      data.activeKey = '2';
      $instance.refs.appRouteForm.resetForm();
      $instance.refs.appRouteForm.show(record);
    }, 200);
  }

  /**
   * 轮播图点击
   */
  function handleConfig() {
    data.activeKey = '1';
  }

  /**
   * 表单保存回调，刷新配置
   */
  function modalFormOk() {
    initData();
  }

  function add(e) {
    data.typeSetDisabled = false;
  }

  /**
   * 拖拽结束事件
   * @param evt
   */
  function end(evt) {
    console.log('拖动前的位置' + evt.oldIndex);
    console.log('拖动后的位置' + evt.newIndex);
    let model = $instance.refs.appRouteForm.model;
    if (model && model.sort == evt.oldIndex) {
      model.sort = evt.newIndex;
    }
    initSort();
    if (evt.oldIndex !== evt.newIndex) {
      data.typeSetDisabled = false;
    }
  }

  /**
   * 初始化排序
   */
  function initSort() {
    //常用服务
    for (let i = 0; i < unref(commonDataSource).length; i++) {
      unref(commonDataSource)[i].sort = i;
      unref(commonDataSource)[i].type = 'common';
    }
    //其他服务
    for (let i = 0; i < unref(otherDataSource).length; i++) {
      unref(otherDataSource)[i].sort = i;
      unref(otherDataSource)[i].type = 'other';
    }
    //审核服务
    for (let i = 0; i < unref(approveDataSource).length; i++) {
      unref(approveDataSource)[i].sort = i;
      unref(approveDataSource)[i].type = 'approve';
    }
  }

  /**
   * 确认更新
   * NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
   */
  async function sureChange() {
    initSort();
    //更新排版
    data.newDateSource = unref(commonDataSource).concat(unref(otherDataSource)).concat(unref(approveDataSource));
    let res = await sortChange({ newDateSource: data.newDateSource });
    data.typeSetDisabled = true;
    if (res.success) {
      createMessage.success('更新成功');
      $instance.refs.appRouteForm.syncForm();
    } else {
      createMessage.warning(res.message);
    }
  }

  /**
   * 保存
   * @param type
   */
  function save(type) {
    if (type === 'config') {
      $instance.refs.appConfigForm.handleSubmit();
    } else if (type === 'version') {
      $instance.refs.appVersionForm.handleSubmit();
    } else {
      $instance.refs.appRouteForm.handleSubmit();
    }
  }

  /**
   * 双击显示删除按钮
   */
  function dbClick() {
    clearTimeout(data.time);
    data.delShow = !data.delShow;
  }

  /**
   * 删除路由
   * @param id
   */
  async function delItem(id) {
    await deleteRoute({ id }, (res) => {
      console.log('delItem', res);
      if (!res.success) {
        createMessage.warning(res.message);
      } else {
        initData();
        //重新计算分页问题
        $instance.refs.appRouteForm.syncForm(id);
      }
    });
  }
  //标题
  function getTitle(title) {
    if (title.length > 6) {
      return title.substring(0, 6);
    }
    return title;
  }

  onMounted(() => {
    initData();
  });
</script>

<style scoped>
  .containerDrag {
    text-align: center;
    width: 378px;
    height: 770px;
    margin: 20px auto 0;
    padding: 90px 25px 100px;
    background-image: url(https://static.jeecg.com/files/modile_162571234753.png);
    background-repeat: no-repeat;
    background-size: 378px 770px;
  }

  .imgDiv {
    position: relative;
    padding: 8px;
    border: 1px solid #d9d9d9;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .error::before,
  .error::after {
    position: absolute;
    content: ' ';
    background-color: #fff;
    width: 1.4px;
    height: 40px;
  }

  .error::before {
    transform: rotate(45deg);
  }

  .error::after {
    transform: rotate(-45deg);
  }

  .add {
    border: 1px solid;
    height: 75.5px;
    color: #ccc;
    transition: color 0.25s;
    position: relative;
  }

  .add::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 40px;
    margin-left: -20px;
    border-top: 2px solid;
  }

  .add::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    height: 40px;
    margin-top: -20px;
    border-left: 2px solid;
  }

  .ant-carousel >>> .slick-slide {
    text-align: center;
    height: 160px;
    line-height: 160px;
    background: #364d79;
    overflow: hidden;
  }

  .ant-carousel >>> .slick-slide h3 {
    color: #fff;
  }

  .delete {
    width: 21px;
    height: 21px;
    border-radius: 60%;
    position: absolute;
    top: -10px;
    right: -4px;
    z-index: 99;
    cursor: pointer;
  }

  .anty-form-btn {
    width: 100%;
    text-align: center;
  }

  .anty-form-btn button {
    margin: 0 5px;
  }

  .approveDiv {
    position: relative;
    padding: 8px;
    border: 1px solid #d9d9d9;
    display: flex;
    align-items: center;
  }

  .setGray {
    -webkit-filter: grayscale(100%);
    -moz-filter: grayscale(100%);
    -ms-filter: grayscale(100%);
    -o-filter: grayscale(100%);
    filter: grayscale(100%);
    filter: gray;
    filter: progid:DXImageTransform.Microsoft.BasicImage(grayscale=1);
  }

  .setGray:hover {
    cursor: not-allowed;
  }

  .approveDiv span {
    margin: 0 20px;
  }

  .titleDiv {
    text-align: left;
    margin: 10px 15px;
  }

  .carouselDiv {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 160px;
  }

  .titleSpan {
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chosen {
    border: solid 1px #3089dc !important;
  }
  .floating-button {
    position: absolute;
    bottom: 125px; /* 距离底部的距离 */
    left: 50%; /* 水平居中 */
    transform: translateX(-50%); /* 水平居中 */
    z-index: 100;
  }
</style>
