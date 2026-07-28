<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="50%">
    <a-form ref="formRef" :model="formState" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol" class="form mr3">
      <a-form-item ref="ruleName" label="规则名称" name="ruleName">
        <a-input v-model:value="formState.ruleName" placeholder="请输入规则名称" />
      </a-form-item>
      <a-form-item ref="ruleType" label="执行规则类型" name="ruleType">
        <a-radio-group @change="changeRuleType(formState.ruleType)" v-model:value="formState.ruleType" button-style="solid">
          <!--                    <a-radio-button :value="1">小时</a-radio-button>-->
          <a-radio-button :value="2">日</a-radio-button>
          <a-radio-button :value="3">周</a-radio-button>
          <a-radio-button :value="4">月</a-radio-button>
          <a-radio-button :value="5">季</a-radio-button>
          <a-radio-button :value="6">年</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <div v-if="formState.ruleType === 1">
        <!--        <a-form-item label="执行频率" name="resource">-->
        <!--          <a-radio-group v-model:value="formState.resource">-->
        <!--            <a-radio value="1">小时</a-radio>-->
        <!--          </a-radio-group>-->
        <!--        </a-form-item>-->

        <a-form-item label="执行间隔" name="frequencyInterval">
          <a-form-item-rest>
            <div>
              <a-input-number v-model:value="formState.frequencyInterval" placeholder="每小时" :disabled="!formState.remember"></a-input-number>
              <span class="ml1 mr2">小时</span>
              <a-checkbox v-model:checked="formState.remember"></a-checkbox>
            </div>
          </a-form-item-rest>
        </a-form-item>
        <a-form-item label="开始执行时间" required name="unifiedStartTime">
          <a-time-picker
            v-model:value="formState.unifiedStartTime"
            value-format="HH:mm"
            format="HH:mm"
            placeholder="开始执行时间"
            style="width: 100%"
          />
        </a-form-item>
      </div>
      <div v-else-if="formState.ruleType === 2">
        <!--        <a-form-item label="执行频率" name="resource">-->
        <!--          <a-radio-group v-model:value="formState.resource">-->
        <!--            &lt;!&ndash;            <a-radio value="1">小时</a-radio>&ndash;&gt;-->
        <!--            <a-radio value="2">每天</a-radio>-->
        <!--          </a-radio-group>-->
        <!--        </a-form-item>-->
        <a-form-item label="执行间隔" name="frequencyInterval">
          <a-form-item-rest>
            <div>
              <a-input-number v-model:value="formState.frequencyInterval" placeholder="每天" :disabled="!formState.rememberDay"></a-input-number>
              <span class="ml1 mr2">天</span>
              <a-checkbox v-model:checked="formState.rememberDay"></a-checkbox>
            </div>
          </a-form-item-rest>
        </a-form-item>
        <a-form-item label="开始执行时间" required name="unifiedStartTime">
          <a-time-picker
            v-model:value="formState.unifiedStartTime"
            show-time
            placeholder="开始执行时间"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
          />
          <!--          <a-time-picker v-model:value="formState.unifiedStartTime" value-format="HH:mm" format="HH:mm" placeholder="开始执行时间" style="width: 100%" />-->
        </a-form-item>
        <a-form-item label="结束执行时间" required name="unifiedEndTime">
          <a-time-picker
            v-model:value="formState.unifiedEndTime"
            show-time
            placeholder="结束执行时间"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
          />
          <!--          <a-time-picker v-model:value="formState.unifiedEndTime" value-format="HH:mm" format="HH:mm" placeholder="结束执行时间" style="width: 100%" />-->
        </a-form-item>
      </div>
      <div v-else-if="formState.ruleType === 3">
        <a-form-item label="执行间隔" name="frequencyInterval">
          <a-form-item-rest>
            <div>
              <a-input-number v-model:value="formState.frequencyInterval" placeholder="每周" :disabled="!formState.rememberWeek"></a-input-number>
              <span class="ml1 mr2">周</span>
              <a-checkbox v-model:checked="formState.rememberWeek"></a-checkbox>
            </div>
          </a-form-item-rest>
        </a-form-item>
        <a-form-item label="执行时间" name="timeMode">
          <a-radio-group v-model:value="formState.timeMode">
            <a-radio :value="1">灵活时间</a-radio>
            <a-radio :value="2">统一时间</a-radio>
          </a-radio-group>
        </a-form-item>
        <div v-if="formState.timeMode === 1" class="formItem">
          <div v-for="(list, i) in weekList" :key="i">
            <a-form-item label="&nbsp;">
              <a-checkbox v-model:checked="list.checked" :style="{ display: 'flex', height: '30px', lineHeight: '30px', marginBottom: '20px' }">
                <div class="flex justify-between" style="width: 450px">
                  <span>{{ list.week }}</span>
                  <div>
                    <span class="mr1">开始时间</span>
                    <a-time-picker
                      v-model:value="list.startTime"
                      value-format="HH:mm"
                      format="HH:mm"
                      placeholder="开始时间"
                      style="display: inline-block"
                      :disabled="!list.checked"
                    />
                  </div>
                  <div>
                    <span class="mr1">结束时间</span>
                    <a-time-picker
                      v-model:value="list.endTime"
                      value-format="HH:mm"
                      format="HH:mm"
                      placeholder="结束时间"
                      style="display: inline-block"
                      :disabled="!list.checked"
                    />
                  </div>
                </div>
              </a-checkbox>
            </a-form-item>
          </div>
        </div>
        <div v-else-if="formState.timeMode === 2" class="formItem">
          <a-form-item label="&nbsp;">
            <a-checkbox-group @change="changeWeeksTongyi" v-model:value="weeksTongyi" name="checkboxgroup" :options="weekOptions" />
          </a-form-item>
          <a-form-item label="开始执行时间" required name="unifiedStartTime">
            <a-time-picker
              v-model:value="formState.unifiedStartTime"
              value-format="HH:mm"
              format="HH:mm"
              placeholder="开始执行时间"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item label="结束执行时间" required name="unifiedEndTime">
            <a-time-picker
              v-model:value="formState.unifiedEndTime"
              value-format="HH:mm"
              format="HH:mm"
              placeholder="结束执行时间"
              style="width: 100%"
            />
          </a-form-item>
        </div>
      </div>
      <div v-else-if="formState.ruleType === 4">
        <a-form-item label="执行间隔" name="frequencyInterval">
          <a-form-item-rest>
            <div>
              <a-input-number v-model:value="formState.frequencyInterval" placeholder="每月" :disabled="!formState.rememberMonth"></a-input-number>
              <span class="ml1 mr2">月</span>
              <a-checkbox v-model:checked="formState.rememberMonth"></a-checkbox>
            </div>
          </a-form-item-rest>
        </a-form-item>
        <a-form-item label="执行时间" name="timeMode">
          <a-radio-group v-model:value="formState.timeMode">
            <a-radio :value="1">灵活时间</a-radio>
            <a-radio :value="2">统一时间</a-radio>
          </a-radio-group>
        </a-form-item>
        <div v-if="formState.timeMode === 1" class="formItem">
          <a-form-item label=" " name="">
            <BasicTable @register="registerTable" style="width: 100%">
              <template #tableTitle>
                <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">添加日期</a-button>
              </template>
              <template #action="{ record }">
                <TableAction :actions="getActions(record)" />
              </template>

              <template #dayValue="{ text, record, index }">
                <span>{{ record.dayValue }}日</span>
              </template>
              <template #startTime="{ text, record, index }">
                <a-time-picker v-model:value="record.startTime" value-format="HH:mm" format="HH:mm" placeholder="开始时间" style="width: 100%" />
              </template>
              <template #endTime="{ text, record, index }">
                <a-time-picker v-model:value="record.endTime" value-format="HH:mm" format="HH:mm" placeholder="结束时间" style="width: 100%" />
              </template>
            </BasicTable>
          </a-form-item>
        </div>
        <div v-else-if="formState.timeMode === 2" class="formItem">
          <a-form-item label="&nbsp;" class="allCheckedBox">
            <a-checkbox-group v-model:value="monthsTongyi" name="checkboxgroup" :options="monthOptions" />
          </a-form-item>
          <a-form-item label="开始执行时间" required name="unifiedStartTime">
            <a-time-picker
              v-model:value="formState.unifiedStartTime"
              value-format="HH:mm"
              format="HH:mm"
              placeholder="开始执行时间"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item label="结束执行时间" required name="unifiedEndTime">
            <a-time-picker
              v-model:value="formState.unifiedEndTime"
              value-format="HH:mm"
              format="HH:mm"
              placeholder="结束执行时间"
              style="width: 100%"
            />
          </a-form-item>
        </div>
      </div>
      <div v-else-if="formState.ruleType === 5">
        <a-form-item label="执行间隔" name="frequencyInterval">
          <a-form-item-rest>
            <div>
              <a-input-number v-model:value="formState.frequencyInterval" placeholder="每季度" disabled></a-input-number>
              <!--            <span class="ml1 mr2">周</span>-->
              <!--            <a-checkbox v-model:checked="formState.remember"></a-checkbox>-->
            </div>
          </a-form-item-rest>
        </a-form-item>
        <a-form-item label="执行时间" name="resource">
          <a-form-item-rest>
            <a-tabs v-model:activeKey="quarterValue">
              <a-tab-pane :key="1" tab="第一季度">
                <a-radio-group v-model:value="monthValue1" style="width: 100%">
                  <a-radio
                    v-for="(list, i) in jiList1"
                    :key="i"
                    :value="list.monthValue"
                    :style="{ display: 'flex', height: '30px', lineHeight: '30px', marginBottom: '20px' }"
                  >
                    <div class="flex">
                      <span>{{ list.monthValue }}月</span>
                      <div class="">
                        <span class="ml3 mr1">开始时间</span>
                        <a-select
                          :options="riqiList"
                          placeholder="日"
                          allow-clear
                          v-model:value="list.startDay"
                          style="width: 120px; display: inline-block"
                          class="mr1"
                        >
                        </a-select>
                        <a-time-picker
                          v-model:value="list.startTime"
                          value-format="HH:mm"
                          format="HH:mm"
                          placeholder="时间"
                          style="display: inline-block"
                        />

                        <span class="ml3 mr1">结束时间</span>
                        <a-select allow-clear placeholder="日" v-model:value="list.endDay" style="width: 120px; display: inline-block" class="mr1">
                          <a-select-option v-for="(list, i) in riqiList" :key="i" :value="list.value">{{ list.label }} </a-select-option>
                        </a-select>
                        <a-time-picker
                          v-model:value="list.endTime"
                          value-format="HH:mm"
                          format="HH:mm"
                          placeholder="时间"
                          style="display: inline-block"
                        />
                      </div>
                    </div>
                  </a-radio>
                </a-radio-group>
              </a-tab-pane>
              <a-tab-pane :key="2" tab="第二季度">
                <a-radio-group v-model:value="monthValue2" style="width: 100%">
                  <a-radio
                    v-for="(list, i) in jiList2"
                    :key="i"
                    :value="list.monthValue"
                    :style="{ display: 'flex', height: '30px', lineHeight: '30px', marginBottom: '20px' }"
                  >
                    <div class="flex">
                      <span>{{ list.monthValue }}月</span>
                      <div class="">
                        <span class="ml3 mr1">开始时间</span>
                        <a-select allow-clear placeholder="日" v-model:value="list.startDay" style="width: 120px; display: inline-block" class="mr1">
                          <a-select-option v-for="(list, i) in riqiList" :key="i" :value="list.value">{{ list.label }} </a-select-option>
                        </a-select>

                        <a-time-picker
                          v-model:value="list.startTime"
                          value-format="HH:mm"
                          format="HH:mm"
                          placeholder="时间"
                          style="display: inline-block"
                        />

                        <span class="ml3 mr1">结束时间</span>

                        <a-select allow-clear placeholder="日" v-model:value="list.endDay" style="width: 120px; display: inline-block" class="mr1">
                          <a-select-option v-for="(list, i) in riqiList" :key="i" :value="list.value">{{ list.label }} </a-select-option>
                        </a-select>

                        <a-time-picker
                          v-model:value="list.endTime"
                          value-format="HH:mm"
                          format="HH:mm"
                          placeholder="时间"
                          style="display: inline-block"
                        />
                      </div>
                    </div>
                  </a-radio>
                </a-radio-group>
              </a-tab-pane>
              <a-tab-pane :key="3" tab="第三季度">
                <a-radio-group v-model:value="monthValue3" style="width: 100%">
                  <a-radio
                    v-for="(list, i) in jiList3"
                    :key="i"
                    :value="list.monthValue"
                    :style="{ display: 'flex', height: '30px', lineHeight: '30px', marginBottom: '20px' }"
                  >
                    <div class="flex">
                      <span>{{ list.monthValue }}月</span>
                      <div class="">
                        <span class="ml3 mr1">开始时间</span>
                        <a-select allow-clear placeholder="日" v-model:value="list.startDay" style="width: 120px; display: inline-block" class="mr1">
                          <a-select-option v-for="(list, i) in riqiList" :key="i" :value="list.value">{{ list.label }} </a-select-option>
                        </a-select>

                        <a-time-picker
                          v-model:value="list.startTime"
                          value-format="HH:mm"
                          format="HH:mm"
                          placeholder="时间"
                          style="display: inline-block"
                        />

                        <span class="ml3 mr1">结束时间</span>
                        <a-select allow-clear placeholder="日" v-model:value="list.endDay" style="width: 120px; display: inline-block" class="mr1">
                          <a-select-option v-for="(list, i) in riqiList" :key="i" :value="list.value">{{ list.label }} </a-select-option>
                        </a-select>
                        <a-time-picker
                          v-model:value="list.endTime"
                          value-format="HH:mm"
                          format="HH:mm"
                          placeholder="时间"
                          style="display: inline-block"
                        />
                      </div>
                    </div>
                  </a-radio>
                </a-radio-group>
              </a-tab-pane>
              <a-tab-pane :key="4" tab="第四季度">
                <a-radio-group v-model:value="monthValue4" style="width: 100%">
                  <a-radio
                    v-for="(list, i) in jiList4"
                    :key="i"
                    :value="list.monthValue"
                    :style="{ display: 'flex', height: '30px', lineHeight: '30px', marginBottom: '20px' }"
                  >
                    <div class="flex">
                      <span>{{ list.monthValue }}月</span>
                      <div class="">
                        <span class="ml3 mr1">开始时间</span>
                        <a-select allow-clear placeholder="日" v-model:value="list.startDay" style="width: 120px; display: inline-block" class="mr1">
                          <a-select-option v-for="(list, i) in riqiList" :key="i" :value="list.value">{{ list.label }} </a-select-option>
                        </a-select>
                        <a-time-picker
                          v-model:value="list.startTime"
                          value-format="HH:mm"
                          format="HH:mm"
                          placeholder="时间"
                          style="display: inline-block"
                        />

                        <span class="ml3 mr1">结束时间</span>
                        <a-select allow-clear placeholder="日" v-model:value="list.endDay" style="width: 120px; display: inline-block" class="mr1">
                          <a-select-option v-for="(list, i) in riqiList" :key="i" :value="list.value">{{ list.label }} </a-select-option>
                        </a-select>

                        <a-time-picker
                          v-model:value="list.endTime"
                          value-format="HH:mm"
                          format="HH:mm"
                          placeholder="时间"
                          style="display: inline-block"
                        />
                      </div>
                    </div>
                  </a-radio>
                </a-radio-group>
              </a-tab-pane>
            </a-tabs>
          </a-form-item-rest>
        </a-form-item>
      </div>

      <div v-else-if="formState.ruleType === 6">
        <a-form-item label="执行间隔" name="frequencyInterval">
          <a-form-item-rest>
            <div>
              <a-input-number v-model:value="formState.frequencyInterval" placeholder="每年" :disabled="!formState.rememberYear"></a-input-number>
              <span class="ml1 mr2">年</span>
              <a-checkbox v-model:checked="formState.rememberYear"></a-checkbox>
            </div>
          </a-form-item-rest>
        </a-form-item>
        <a-form-item label="执行时间" name="timeMode">
          <a-radio-group v-model:value="formState.timeMode">
            <a-radio :value="1">灵活时间</a-radio>
            <a-radio :value="2">统一时间</a-radio>
            <a-radio :value="3">时间段</a-radio>
          </a-radio-group>
        </a-form-item>
        <!--     执行时间选择灵活时间显示下面   -->
        <a-form-item v-if="formState.timeMode === 1" label=" " name="resource">
          <!--          <a-tabs v-model:activeKey="activeKeyYue" type="editable-card" @edit="onEdit" size="small">-->
          <!--            <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable" ></a-tab-pane>-->
          <!--          </a-tabs>-->
          <BasicTable @register="registerTableNianLinghuoshijian" style="width: 100%">
            <template #tableTitle>
              <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAddMonth">添加月份</a-button>
            </template>
            <template #action="{ record, index }">
              <TableAction :actions="getActionsNianLinghuoshijian(record, index)" />
            </template>

            <template #monthValue="{ text, record, index }">
              <span>{{ record.monthValue }}月</span>
            </template>
            <template #dayValue="{ text, record, index }">
              <a-select :options="riqiList" placeholder="日" allow-clear v-model:value="record.dayValue" style="width: 100%"> </a-select>
            </template>
            <template #startTime="{ text, record, index }">
              <a-time-picker v-model:value="record.startTime" format="HH:mm" value-format="HH:mm" placeholder="开始时间" />
            </template>
            <template #endTime="{ text, record, index }">
              <a-time-picker v-model:value="record.endTime" format="HH:mm" value-format="HH:mm" placeholder="结束时间" />
            </template>
          </BasicTable>
        </a-form-item>
        <!--     执行时间选择统一时间显示下面   -->
        <a-form-item v-if="formState.timeMode === 2" label="&nbsp;" name="">
          <BasicTable @register="registerTableNianTongyishijian" style="width: 100%">
            <template #tableTitle>
              <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAddMonth">添加月份</a-button>
            </template>
            <template #action="{ record }">
              <TableAction :actions="getActionsNianTongyishijian(record)" />
            </template>

            <template #monthValue="{ text, record, index }">
              <span>{{ record.monthValue }}月</span>
            </template>
            <template #date="{ text, record, index }">
              <a-input-search v-model:value="record.date" placeholder="添加日期" style="width: 100%" @search="handleAdd(index)" />
            </template>
          </BasicTable>
        </a-form-item>
        <a-form-item v-if="formState.timeMode === 2" label="开始执行时间" required name="unifiedStartTime">
          <a-time-picker
            v-model:value="formState.unifiedStartTime"
            value-format="HH:mm"
            format="HH:mm"
            placeholder="开始执行时间"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item v-if="formState.timeMode === 2" label="结束执行时间" required name="unifiedEndTime">
          <a-time-picker
            v-model:value="formState.unifiedEndTime"
            value-format="HH:mm"
            format="HH:mm"
            placeholder="结束执行时间"
            style="width: 100%"
          />
        </a-form-item>
        <!--     执行时间选择时间段显示下面   -->
        <a-form-item v-if="formState.timeMode === 3" label="&nbsp;" name="">
          <BasicTable @register="registerTableNianShijianduan" style="width: 100%">
            <template #tableTitle>
              <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAddMonth">添加月份</a-button>
            </template>
            <template #action="{ record }">
              <TableAction :actions="getActionsNianShijianduan(record)" />
            </template>

            <template #monthValue="{ text, record, index }">
              <span>{{ record.monthValue }}月</span>
            </template>
            <template #startDay="{ text, record, index }">
              <a-select :options="riqiList" placeholder="日" allow-clear v-model:value="record.startDay" style="width: 100%"> </a-select>
            </template>
            <template #startTime="{ text, record, index }">
              <a-time-picker v-model:value="record.startTime" value-format="HH:mm" format="HH:mm" placeholder="时间" style="display: inline-block" />
            </template>
            <template #endDay="{ text, record, index }">
              <a-select :options="riqiList" placeholder="日" allow-clear v-model:value="record.endDay" style="width: 100%"> </a-select>
            </template>
            <template #endTime="{ text, record, index }">
              <a-time-picker v-model:value="record.endTime" value-format="HH:mm" format="HH:mm" placeholder="时间" style="display: inline-block" />
            </template>
          </BasicTable>
        </a-form-item>
      </div>
      <a-form-item label="状态" name="ruleDescription">
        <a-switch v-model:checked="formState.status" :checkedValue="1" :unCheckedValue="0" checked-children="启用" un-checked-children="禁用" />
      </a-form-item>
      <a-form-item label="规则描述" name="ruleDescription">
        <a-textarea v-model:value="formState.ruleDescription" disabled :auto-size="{ minRows: 3, maxRows: 5 }" />
      </a-form-item>
    </a-form>
    <DemoModalDate @register="registerModalDate" @success="successDate" :isDisabled="isDisabled" />
    <DemoModalMonth @register="registerModalMonth" @success="successMonth" :isDisabled="isDisabled" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive, toRaw, nextTick } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { saveOrUpdateDemo, getDemoById } from './demo.api';
  import { usePermission } from '/@/hooks/web/usePermission';

  const [registerModalDate, { openModal: openModalDate }] = useModal();
  const [registerModalMonth, { openModal: openModalMonth }] = useModal();
  import DemoModalDate from './DemoModalDate.vue';
  import DemoModalMonth from './DemoModalMonth.vue';
  import { BasicTable, TableAction, useTable } from '@/components/Table';
  import { columnsMonth, columnsNianLinghuoshijian, columnsNianTongyishijian, columnsNianShijianduan } from './demo.data';
  const { hasPermission } = usePermission();
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const num = ref(0);
  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });
  const weekList = ref([
    {
      weekValue: 1,
      startTime: '',
      endTime: '',
      week: '周一',
      checked: false,
    },
    {
      weekValue: 2,
      startTime: '',
      endTime: '',
      week: '周二',
      checked: false,
    },
    {
      weekValue: 3,
      startTime: '',
      endTime: '',
      week: '周三',
      checked: false,
    },
    {
      weekValue: 4,
      startTime: '',
      endTime: '',
      week: '周四',
      checked: false,
    },
    {
      weekValue: 5,
      startTime: '',
      endTime: '',
      week: '周五',
      checked: false,
    },
    {
      weekValue: 6,
      startTime: '',
      endTime: '',
      week: '周六',
      checked: false,
    },
    {
      weekValue: 7,
      startTime: '',
      endTime: '',
      week: '周日',
      checked: false,
    },
  ]);
  const weeksTongyi = ref([]);
  const monthsTongyi = ref([]);
  const dataSource = ref([]);
  // 第一季的数据格式
  const riqiList = ref([
    { label: '1日', value: 1 },
    { label: '2日', value: 2 },
    { label: '3日', value: 3 },
    { label: '4日', value: 4 },
    { label: '5日', value: 5 },
    { label: '6日', value: 6 },
    { label: '7日', value: 7 },
    { label: '8日', value: 8 },
    { label: '9日', value: 9 },
    { label: '10日', value: 10 },
    { label: '11日', value: 11 },
    { label: '12日', value: 12 },
    { label: '13日', value: 13 },
    { label: '14日', value: 14 },
    { label: '15日', value: 15 },
    { label: '16日', value: 16 },
    { label: '17日', value: 17 },
    { label: '18日', value: 18 },
    { label: '19日', value: 19 },
    { label: '20日', value: 20 },
    { label: '21日', value: 21 },
    { label: '22日', value: 22 },
    { label: '23日', value: 23 },
    { label: '24日', value: 24 },
    { label: '25日', value: 25 },
    { label: '26日', value: 26 },
    { label: '27日', value: 27 },
    { label: '28日', value: 28 },
    { label: '29日', value: 29 },
    { label: '30日', value: 30 },
    { label: '31日', value: 31 },
  ]);
  const monthValue1 = ref(1);
  const jiList1 = ref([
    {
      monthValue: 1,
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: '',
    },
    {
      monthValue: 2,
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: '',
    },
    {
      monthValue: 3,
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: '',
    },
  ]);
  // 第二季的数据格式
  const monthValue2 = ref(1);
  const jiList2 = ref([
    {
      monthValue: 4,
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: '',
    },
    {
      monthValue: 5,
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: '',
    },
    {
      monthValue: 6,
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: '',
    },
  ]);
  // 第三季的数据格式
  const monthValue3 = ref(1);
  const jiList3 = ref([
    {
      monthValue: 7,
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: '',
    },
    {
      monthValue: 8,
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: '',
    },
    {
      monthValue: 9,
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: '',
    },
  ]);
  // 第四季的数据格式
  const monthValue4 = ref(1);
  const jiList4 = ref([
    {
      monthValue: 10,
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: '',
    },
    {
      monthValue: 11,
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: '',
    },
    {
      monthValue: 12,
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: '',
    },
  ]);
  const [registerTable, { reload, getDataSource, setTableData }] = useTable({
    title: '',
    // api: getDemoListAll,
    columns: columnsMonth,
    // formConfig: {
    //   // labelWidth: 120,
    //   schemas: searchFormSchema,
    //   // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
    //   // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
    //   autoAdvancedCol: 2,
    //   actionColOptions: {
    //     style: { textAlign: 'left' },
    //   },
    // },
    //自定义默认排序
    defSort: {
      // column: 'createTime,sex',
      // order: 'desc',
    },
    striped: true,
    useSearchForm: true,
    showTableSetting: false,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: false,
    rowKey: 'id',
    pagination: false,
    // beforeFetch: (params) => {
    //   return {
    //     ...params,
    //     // tabType: activeKey.value,
    //   };
    // },
    actionColumn: {
      width: 80,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });
  const [registerTableNianLinghuoshijian, { getDataSource: getDataSourceNianLinghuoshijian, setTableData: setTableDataNianLinghuoshijian }] =
    useTable({
      title: '',
      // api: getDemoListAll,
      columns: columnsNianLinghuoshijian,
      // formConfig: {
      //   // labelWidth: 120,
      //   schemas: searchFormSchema,
      //   // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
      //   // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
      //   autoAdvancedCol: 2,
      //   actionColOptions: {
      //     style: { textAlign: 'left' },
      //   },
      // },
      //自定义默认排序
      defSort: {
        // column: 'createTime,sex',
        // order: 'desc',
      },
      striped: true,
      useSearchForm: true,
      showTableSetting: false,
      clickToRowSelect: false,
      bordered: true,
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      tableSetting: { fullScreen: true },
      canResize: false,
      rowKey: 'id',
      pagination: false,
      // beforeFetch: (params) => {
      //   return {
      //     ...params,
      //     // tabType: activeKey.value,
      //   };
      // },
      actionColumn: {
        width: 80,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    });
  const [registerTableNianTongyishijian, { getDataSource: getDataSourceNianTongyishijian, setTableData: setTableDataNianTongyishijian }] = useTable({
    title: '',
    // api: getDemoListAll,
    columns: columnsNianTongyishijian,
    // formConfig: {
    //   // labelWidth: 120,
    //   schemas: searchFormSchema,
    //   // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
    //   // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
    //   autoAdvancedCol: 2,
    //   actionColOptions: {
    //     style: { textAlign: 'left' },
    //   },
    // },
    //自定义默认排序
    defSort: {
      // column: 'createTime,sex',
      // order: 'desc',
    },
    striped: true,
    useSearchForm: true,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: false,
    rowKey: 'id',
    pagination: false,
    // beforeFetch: (params) => {
    //   return {
    //     ...params,
    //     // tabType: activeKey.value,
    //   };
    // },
    actionColumn: {
      width: 80,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });
  const [registerTableNianShijianduan, { getDataSource: getDataSourceNianShijianduan, setTableData: setTableDataNianShijianduan }] = useTable({
    title: '',
    // api: getDemoListAll,
    columns: columnsNianShijianduan,
    // formConfig: {
    //   // labelWidth: 120,
    //   schemas: searchFormSchema,
    //   // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
    //   // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
    //   autoAdvancedCol: 2,
    //   actionColOptions: {
    //     style: { textAlign: 'left' },
    //   },
    // },
    //自定义默认排序
    defSort: {
      // column: 'createTime,sex',
      // order: 'desc',
    },
    striped: true,
    useSearchForm: true,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: false,
    rowKey: 'id',
    pagination: false,
    // beforeFetch: (params) => {
    //   return {
    //     ...params,
    //     // tabType: activeKey.value,
    //   };
    // },
    actionColumn: {
      width: 80,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });

  /**
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
        auth: scheduleRuleActionAuth.value,
        // auth: 'operation:operation_base_fault_order:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
    ];
  }

  function getActionsNianLinghuoshijian(record, index) {
    return [
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDeleteNianLinghuoshijian.bind(null, record, index),
        },
        auth: scheduleRuleActionAuth.value,
        // auth: 'operation:operation_base_fault_order:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
    ];
  }

  function getActionsNianTongyishijian(record) {
    return [
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDeleteNianTongyishijian.bind(null, record),
        },
        auth: scheduleRuleActionAuth.value,
        // auth: 'operation:operation_base_fault_order:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
    ];
  }

  function getActionsNianShijianduan(record) {
    return [
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDeleteNianShijianduan.bind(null, record),
        },
        auth: scheduleRuleActionAuth.value,
        // auth: 'operation:operation_base_fault_order:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
    ];
  }

  //表单赋值
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    //重置表单
    formRef.value.resetFields();
    formState.status = 0;
    // setModalProps({ confirmLoading: true, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      //获取详情
      data.record = await getDemoById({ id: data.record.id });
      // console.log(data.record,'aaaaaaaaaaa');
      switch (data.record.ruleType) {
        case 2:
          Object.assign(formState, data.record);
          break;
        case 3:
          weeksTongyi.value = [];
          data.record.scheduleDetailList.forEach((item) => {
            weekList.value.forEach((list) => {
              if (item.weekValue === list.weekValue) {
                list.checked = true;
                list.startTime = item.startTime;
                list.endTime = item.endTime;
              }
            });
            weeksTongyi.value.push(item.weekValue);
          });

          // weekList.value = data.record.scheduleDetailList
          Object.assign(formState, data.record);
          break;
        case 4:
          monthsTongyi.value = [];
          data.record.scheduleDetailList.forEach((item) => {
            monthsTongyi.value.push(item.dayValue);
          });
          Object.assign(formState, data.record);
          // console.log(data.record.scheduleDetailList,'aaaaaaaaaaaaaa');
          if (formState.timeMode === 1) {
            nextTick(() => {
              setTableData(data.record.scheduleDetailList);
            });
          }
          break;
        case 5:
          Object.assign(formState, data.record);
          data.record.scheduleDetailList.forEach((item) => {
            if (item.quarterValue === 1) {
              monthValue1.value = item.monthValue;
              jiList1.value.forEach((list) => {
                if (item.monthValue === list.monthValue) {
                  list.startDay = item.startDay;
                  list.endDay = item.endDay;
                  list.startTime = item.startTime;
                  list.endTime = item.endTime;
                } else {
                  list.startDay = undefined;
                  list.endDay = undefined;
                  list.startTime = undefined;
                  list.endTime = undefined;
                }
              });
            } else if (item.quarterValue === 2) {
              monthValue2.value = item.monthValue;
              jiList2.value.forEach((list) => {
                if (item.monthValue === list.monthValue) {
                  list.startDay = item.startDay;
                  list.endDay = item.endDay;
                  list.startTime = item.startTime;
                  list.endTime = item.endTime;
                } else {
                  list.startDay = undefined;
                  list.endDay = undefined;
                  list.startTime = undefined;
                  list.endTime = undefined;
                }
              });
            } else if (item.quarterValue === 3) {
              monthValue3.value = item.monthValue;
              jiList3.value.forEach((list) => {
                if (item.monthValue === list.monthValue) {
                  list.startDay = item.startDay;
                  list.endDay = item.endDay;
                  list.startTime = item.startTime;
                  list.endTime = item.endTime;
                } else {
                  list.startDay = undefined;
                  list.endDay = undefined;
                  list.startTime = undefined;
                  list.endTime = undefined;
                }
              });
            } else if (item.quarterValue === 4) {
              monthValue4.value = item.monthValue;
              jiList4.value.forEach((list) => {
                if (item.monthValue === list.monthValue) {
                  list.startDay = item.startDay;
                  list.endDay = item.endDay;
                  list.startTime = item.startTime;
                  list.endTime = item.endTime;
                } else {
                  list.startDay = undefined;
                  list.endDay = undefined;
                  list.startTime = undefined;
                  list.endTime = undefined;
                }
              });
            }
          });
          break;
        case 6:
          Object.assign(formState, data.record);

          if (formState.timeMode === 1) {
            nextTick(() => {
              setTableDataNianLinghuoshijian(data.record.scheduleDetailList);
            });
          } else if (formState.timeMode === 2) {
            const result = Object.values(
              data.record.scheduleDetailList.reduce((acc, item) => {
                const key = item.monthValue;

                if (!acc[key]) {
                  acc[key] = {
                    monthValue: key,
                    date: [],
                  };
                }

                acc[key].date.push(item.dayValue);

                return acc;
              }, {})
            ).map((item) => ({
              ...item,
              date: item.date.join(','), // 🔥 这里转成字符串
            }));
            nextTick(() => {
              setTableDataNianTongyishijian(result);
            });
            // console.log(result)
          } else if (formState.timeMode === 3) {
            Object.assign(formState, data.record);
            nextTick(() => {
              setTableDataNianShijianduan(data.record.scheduleDetailList);
            });
          }
          break;
        default:
          break;
      }
    } else {
      Object.assign(formState, {
        ruleName: '',
        ruleType: 2,
        frequencyInterval: undefined,
        ruleDescription: '',
        timeMode: 1,
        unifiedStartTime: '',
        unifiedEndTime: '',
        status: 0,
        scheduleDetailList: [],
      });
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

  const scheduleRuleActionAuth = computed(() => (unref(isUpdate) ? 'operation:operation_schedule_rule:edit' : 'operation:operation_schedule_rule:add'));
  const canEditScheduleRuleDetail = computed(() => hasPermission(scheduleRuleActionAuth.value));
  const formRef = ref();
  const labelCol = {
    span: 4,
  };
  const wrapperCol = {
    span: 20,
  };
  const activeKey = ref(1);

  const weekOptions = [
    { label: '周一', value: 1 },
    { label: '周二', value: 2 },
    { label: '周三', value: 3 },
    { label: '周四', value: 4 },
    { label: '周五', value: 5 },
    { label: '周六', value: 6 },
    { label: '周日', value: 7 },
  ];
  const monthOptions = ref([
    { label: '1日', value: 1 },
    { label: '2日', value: 2 },
    { label: '3日', value: 3 },
    { label: '4日', value: 4 },
    { label: '5日', value: 5 },
    { label: '6日', value: 6 },
    { label: '7日', value: 7 },
    { label: '8日', value: 8 },
    { label: '9日', value: 9 },
    { label: '10日', value: 10 },
    { label: '11日', value: 11 },
    { label: '12日', value: 12 },
    { label: '13日', value: 13 },
    { label: '14日', value: 14 },
    { label: '15日', value: 15 },
    { label: '16日', value: 16 },
    { label: '17日', value: 17 },
    { label: '18日', value: 18 },
    { label: '19日', value: 19 },
    { label: '20日', value: 20 },
    { label: '21日', value: 21 },
    { label: '22日', value: 22 },
    { label: '23日', value: 23 },
    { label: '24日', value: 24 },
    { label: '25日', value: 25 },
    { label: '26日', value: 26 },
    { label: '27日', value: 27 },
    { label: '28日', value: 28 },
    { label: '29日', value: 29 },
    { label: '30日', value: 30 },
    { label: '31日', value: 31 },
  ]);
  const quarterValue = ref(1);
  const formState = reactive({
    ruleName: '',
    ruleType: 2,
    timeMode: 1,
    // date1: undefined,
    // delivery: false,
    // type: [],
    // resource: '1',
    // desc: '',
  });
  const rules = {
    ruleName: [
      {
        required: true,
        message: '请输入规则名称',
        trigger: 'blur',
      },
      // {
      //   min: 3,
      //   max: 5,
      //   message: 'Length should be 3 to 5',
      //   trigger: 'blur',
      // },
    ],
    region: [
      {
        required: true,
        message: 'Please select Activity zone',
        trigger: 'change',
      },
    ],
    date1: [
      {
        required: true,
        message: 'Please pick a date',
        trigger: 'change',
        type: 'object',
      },
    ],
    type: [
      {
        type: 'array',
        required: true,
        message: 'Please select at least one activity type',
        trigger: 'change',
      },
    ],
    resource: [
      {
        required: false,
        message: 'Please select activity resource',
        trigger: 'change',
      },
    ],
    desc: [
      {
        required: false,
        message: 'Please input activity form',
        trigger: 'blur',
      },
    ],
  };

  const handleAdd = (index) => {
    if (!canEditScheduleRuleDetail.value) return;
    num.value = index;
    openModalDate(true, {
      isUpdate: false,
    });
  };

  const handleAddMonth = () => {
    if (!canEditScheduleRuleDetail.value) return;
    openModalMonth(true, {
      isUpdate: false,
    });
  };

  //   添加日期
  async function successDate(obj) {
    let array = [];
    const arr = obj.dayValue.split(',');
    arr.forEach((item) => {
      array.push({ dayValue: Number(item) });
    });
    if (formState.ruleType === 6) {
      let array = await getDataSourceNianTongyishijian();
      array[num.value].date = obj.dayValue;
      await setTableDataNianTongyishijian(array);
    } else if (formState.ruleType === 4) {
      await setTableData(array);
    }
  }

  // 删除tabs月里的 table日期list
  async function handleDelete(record) {
    if (!canEditScheduleRuleDetail.value) return;
    let arr = getDataSource();
    arr.forEach((item, index) => {
      if (item.dayValue == record.dayValue) {
        arr.splice(index, 1);
      }
    });
    setTableData(arr);
  }

  async function successMonth(obj) {
    let array = [];
    const arr = obj.month.split(',');
    // console.log(arr, '11111111');
    arr.forEach((item) => {
      array.push({ monthValue: Number(item) });
    });
    if (formState.timeMode === 1) {
      let oldArr = await getDataSourceNianLinghuoshijian();
      await setTableDataNianLinghuoshijian([...array, ...oldArr]);
    } else if (formState.timeMode === 2) {
      await setTableDataNianTongyishijian(array);
    } else if (formState.timeMode === 3) {
      await setTableDataNianShijianduan(array);
    }
  }

  //   删除年里的灵活时间里的table里的list
  async function handleDeleteNianLinghuoshijian(record, index) {
    if (!canEditScheduleRuleDetail.value) return;
    let arr = getDataSourceNianLinghuoshijian();
    arr.forEach((item, i) => {
      if (i === index) {
        arr.splice(index, 1);
      }
    });
    setTableDataNianLinghuoshijian(arr);
  }

  //   删除年里的统一时间里的table里的list
  async function handleDeleteNianTongyishijian(record) {
    if (!canEditScheduleRuleDetail.value) return;
    let arr = getDataSourceNianTongyishijian();
    arr.forEach((item, index) => {
      if (item.monthValue === record.monthValue) {
        arr.splice(index, 1);
      }
    });
    setTableDataNianTongyishijian(arr);
  }

  //   删除年里的时间段table里的list
  async function handleDeleteNianShijianduan(record) {
    if (!canEditScheduleRuleDetail.value) return;
    let arr = getDataSourceNianShijianduan();
    arr.forEach((item, index) => {
      if (item.monthValue === record.monthValue) {
        arr.splice(index, 1);
      }
    });
    setTableDataNianShijianduan(arr);
  }

  // 更改执行规则类型
  function changeRuleType(val) {
    switch (val) {
      case 2:
        break;
      case 3:
        if (formState.timeMode === 1) {
          weekList.value = [
            {
              weekValue: 1,
              startTime: '',
              endTime: '',
              week: '周一',
              checked: false,
            },
            {
              weekValue: 2,
              startTime: '',
              endTime: '',
              week: '周二',
              checked: false,
            },
            {
              weekValue: 3,
              startTime: '',
              endTime: '',
              week: '周三',
              checked: false,
            },
            {
              weekValue: 4,
              startTime: '',
              endTime: '',
              week: '周四',
              checked: false,
            },
            {
              weekValue: 5,
              startTime: '',
              endTime: '',
              week: '周五',
              checked: false,
            },
            {
              weekValue: 6,
              startTime: '',
              endTime: '',
              week: '周六',
              checked: false,
            },
            {
              weekValue: 7,
              startTime: '',
              endTime: '',
              week: '周日',
              checked: false,
            },
          ];
        }
        break;
      case 4:
        break;
      case 5:
        break;
      case 6:
        break;
      default:
        break;
    }
  }

  // 周下的统一时间
  function changeWeeksTongyi() {}

  //表单提交事件
  async function handleSubmit() {
    try {
      formRef.value.validate().then(async () => {
        // console.log('values', formState, toRaw(formState));
        //setModalProps({ confirmLoading: true });
        //提交表单
        switch (formState.ruleType) {
          case 2:
            Object.assign(formState, {
              timeMode: 0,
              scheduleDetailList: [],
            });
            break;
          case 3:
            if (formState.timeMode === 1) {
              formState.scheduleDetailList = [];
              weekList.value.forEach((item) => {
                if (item.checked) {
                  formState.scheduleDetailList.push({
                    weekValue: item.weekValue,
                    startTime: item.startTime,
                    endTime: item.endTime,
                  });
                }
              });
            } else {
              formState.scheduleDetailList = [];
              weeksTongyi.value.forEach((a) => {
                formState.scheduleDetailList.push({
                  weekValue: a,
                  startTime: formState.unifiedStartTime,
                  endTime: formState.unifiedEndTime,
                });
              });
            }

            break;
          case 4:
            if (formState.timeMode === 1) {
              formState.scheduleDetailList = getDataSource();
            } else {
              formState.scheduleDetailList = [];
              monthsTongyi.value.forEach((a) => {
                formState.scheduleDetailList.push({
                  dayValue: a,
                  startTime: formState.unifiedStartTime,
                  endTime: formState.unifiedEndTime,
                });
              });
            }
            break;
          case 5:
            formState.scheduleDetailList = [];
            jiList1.value.forEach((list) => {
              if (list.monthValue === monthValue1.value) {
                formState.scheduleDetailList[0] = {
                  quarterValue: 1,
                  monthValue: list.monthValue,
                  startDay: list.startDay,
                  endDay: list.endDay,
                  startTime: list.startTime,
                  endTime: list.endTime,
                };
              }
            });
            jiList2.value.forEach((list) => {
              if (list.monthValue === monthValue2.value) {
                formState.scheduleDetailList[1] = {
                  quarterValue: 2,
                  monthValue: list.monthValue,
                  startDay: list.startDay,
                  endDay: list.endDay,
                  startTime: list.startTime,
                  endTime: list.endTime,
                };
              }
            });
            jiList3.value.forEach((list) => {
              if (list.monthValue === monthValue3.value) {
                formState.scheduleDetailList[2] = {
                  quarterValue: 3,
                  monthValue: list.monthValue,
                  startDay: list.startDay,
                  endDay: list.endDay,
                  startTime: list.startTime,
                  endTime: list.endTime,
                };
              }
            });
            jiList4.value.forEach((list) => {
              if (list.monthValue === monthValue4.value) {
                formState.scheduleDetailList[3] = {
                  quarterValue: 4,
                  monthValue: list.monthValue,
                  startDay: list.startDay,
                  endDay: list.endDay,
                  startTime: list.startTime,
                  endTime: list.endTime,
                };
              }
            });
            Object.assign(formState, {
              frequencyInterval: 0,
              timeMode: 0,
            });
            break;
          case 6:
            if (formState.timeMode === 1) {
              formState.scheduleDetailList = getDataSourceNianLinghuoshijian();
              formState.unifiedStartTime = '';
              formState.unifiedEndTime = '';
            } else if (formState.timeMode === 2) {
              let dataList = getDataSourceNianTongyishijian();
              let array = [];
              dataList.forEach((item) => {
                item.arr = item.date.split(',');
                item.arr.forEach((list) => {
                  array.push({
                    monthValue: Number(item.monthValue),
                    dayValue: Number(list),
                    startTime: formState.unifiedStartTime,
                    endTime: formState.unifiedEndTime,
                  });
                });
              });
              formState.scheduleDetailList = array;
              // console.log(getDataSourceNianTongyishijian(),'统一时间 table');
              // console.log(array,'9999999999999');
            } else if (formState.timeMode === 3) {
              formState.scheduleDetailList = getDataSourceNianShijianduan();
            }

            // Object.assign(formState, {
            //   frequencyInterval: 0,
            //   timeMode: 0,
            // });
            // console.log(getDataSourceNianLinghuoshijian(),'获取的 table');
            break;
          default:
            break;
        }
        await saveOrUpdateDemo(formState, isUpdate.value);
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success', formState);
      });
    } finally {
      // setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  .formItem {
    :deep(.ant-checkbox-wrapper) {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
  }

  .allCheckedBox {
    :deep(.ant-checkbox-wrapper) {
      width: 60px;
    }
  }

  .form {
    :deep(.ant-tabs-tab) {
      padding: 5px 0;
    }
  }

  :deep(.jeecg-basic-table .ant-table-wrapper) {
    padding: 0;
  }

  :deep(.jeecg-basic-table-form-container) {
    padding: 0;
  }
</style>
