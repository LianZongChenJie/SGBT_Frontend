<template>
    <div>
        <div style="display: flex;height: 32px;line-height: 32px;margin: 10px 0px">
            <div style="width: 60px">
                <a-button type="text" @click="onBack">
                    <ArrowLeftOutlined style="font-size: 18px" title="返回"/>
                </a-button>
            </div>
            
            <div class="filter-edit-title-div">
                <div ref="divRef" class="text" contenteditable="true"  @input="onInputChange">
                    {{filterInfo.title}}
                </div>
            </div>
        </div>
        

        <div>
            <div class="inner-content filter-select-adding" style="padding:1px 10px 15px 1px">
                <AdvancedFilter
                        ref="filterRef"
                        :columnList="columnList"
                        @save="saveInfo"
                        @copy="copyInfo"
                        @search="onlySearch"
                        :info="filterInfo"
                        :saveButton="false" >
                    <template #save-button="{saveable}">
                        <a-dropdown-button @click="save" class="save-button filter-edit-save-button" :disabled="!saveable">
                            保 存
                            <template #overlay>
                                <a-menu>
                                    <a-menu-item key="1" @click="save">保 存</a-menu-item>
                                    <a-menu-item key="2" @click="newSave">另存为</a-menu-item>
                                </a-menu>
                            </template>
                            <template #icon><DownOutlined /></template>
                        </a-dropdown-button>
                    </template>
                </AdvancedFilter>
            </div>
        
        </div>
        <div></div>
    </div>
</template>

<script>
    import { ArrowLeftOutlined, DownOutlined } from '@ant-design/icons-vue';
    import AdvancedFilter from './AdvancedFilter.vue';
    import {watch, reactive, ref, computed} from 'vue'
    import { useSuperQueryCurd } from '../ts/useSuperQueryCurd'
    
    export default {
        name: "FilterEdit",
        components:{
            ArrowLeftOutlined,
            AdvancedFilter,
            DownOutlined
        },
        props:{
            info:{
                type: Object,
                default: ()=>{}
            },
            // 表单设计器默认的列
            columnList: {
                type: Array,
                default: () => [],
            },
        },
        emits:['back', 'save', 'copy', 'search'],
        setup(props, {emit}){
            const divRef = ref();
            const filterRef = ref();
            console.log('info', props.info);
            const filterInfo = reactive({
                conditionType:"and",
                conditions: [],
                conditionsGroup: [],
                iconVisible: false,
                index: -1,
                myself: false,
                selected: false,
                title: '',
                id: ''
            });
            watch(()=>props.info, (filter)=>{
                console.log('编辑页面', filter);
                Object.keys(filterInfo).map((k)=>{
                    filterInfo[k] = filter[k]
                });
            }, {deep:true, immediate: true});

            function onBack() {
                emit('back')
            }
            
            const {updateSuperQuery} = useSuperQueryCurd()
            async function saveInfo(data) {
                let temp = {
                    ...data,
                    id: filterInfo.id,
                    title: filterInfo.title,
                    myself: filterInfo.myself,
                    selected: filterInfo.selected,
                }
                // 编辑到数据库
                await updateSuperQuery(temp);
                emit('save', filterInfo.index, temp)
            }

            function copyInfo(data) {
                let temp = {
                    ...data,
                    title: filterInfo.title,
                    id: filterInfo.id
                }
                emit('copy',filterInfo.index, temp)
            }

            function onlySearch(data) {
                emit('search', data)
            }
            
            
            function save(e) {
                e && prevent(e);
                filterRef.value.saveCondition();
            }

            function newSave(e) {
                e && prevent(e);
                filterRef.value.copyCondition();
            }

            function prevent(e) {
                e.preventDefault();
                e.stopPropagation();
            }


            const inputStatus = ref(false);
            const inputWidth = ref(100)
            function clickTitle(e) {
                e.preventDefault();
                e.stopPropagation();
                inputWidth.value = e.target.scrollWidth;
                inputStatus.value = true;
            }
            function onInputBlur() {
                inputStatus.value = false;
            }

            function onInputChange() {
                filterInfo.title = divRef.value.innerHTML
            }
 
            return {
                divRef,
                filterInfo,
                onBack,
                save,
                newSave,
                saveInfo,
                copyInfo,
                inputWidth,
                inputStatus,
                clickTitle,
                onInputBlur,
                filterRef,
                onlySearch,
                onInputChange
            }
        }
    }
</script>

<style lang="less">

    .filter-edit-save-button > .ant-btn:first-child:not(:last-child){
        border-top-left-radius: 15px;
        border-bottom-left-radius: 15px;
    }
    .filter-edit-save-button > .ant-btn:last-child:not(:first-child){
        border-top-right-radius: 15px;
        border-bottom-right-radius: 15px;
    }

    .no-border-input{
        margin-left: 10px;
        border-color: #fff !important;
        outline: none;
        font-size: 16px;font-weight: bold;
    }
    
    .filter-edit-title-div{
        flex: 1 1 0%;
        text-align: center;
        font-size: 16px;
        font-weight: bold;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        margin-left: -60px;
        .text{
            border-bottom: 1px dashed rgb(51, 51, 51);
            max-width: 350px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }

</style>