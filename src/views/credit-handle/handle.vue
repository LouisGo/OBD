<template>
    <div class="handle">
        <Card shadow :style="{marginBottom: '10px'}">
            <Row>
                <div class="base-info">
                    <span>评估总分：<strong>{{ total }}</strong></span>
                    <span>系数调整：<strong>{{ quota }}</strong><span>级授信</span></span>
                    <span>授信额度：<strong>{{ limit | moneyFormat }}</strong></span>
                </div>
                <div class="base-operate" v-if="query.type === 'handle'">
                    <Button type="success" style="margin-right: 8px;" @click="baseOperate.confirm = true">确认授信</Button>
                    <Modal v-model="baseOperate.confirm" title="确认授信" @on-ok="confirmOk" @on-cancel="confirmCancel" class-name="confirm" :loading="confirmLoading">
                        <div class="confirm-wrap">
                            <div class="title">
                                <span>评估总分：<strong>{{ total }}</strong></span>
                                <span>系数调整：<strong>{{ quota }}</strong><span>级授信</span></span>
                                <span>授信额度：<strong>{{ limit | moneyFormat }}</strong></span>
                            </div>
                            <Form ref="confirmForm" :model="confirmForm" :rules="confirmRules" :label-width="100" label-position="right">
                                <FormItem label="建议额度" prop="limit">
                                    <Input type="text" v-model="confirmForm.limit" style="width: 320px"></Input>
                                </FormItem>
                                <FormItem label="风控密码" prop="password">
                                    <Input type="password" v-model="confirmForm.password" style="width: 320px"></Input>
                                </FormItem>
                            </Form>
                        </div>
                    </Modal>
                    <Button type="error" style="margin-right: 8px;" @click="baseOperate.refuse = true">拒绝授信</Button>
                    <Modal v-model="baseOperate.refuse" title="拒绝授信" @on-ok="refuseOk" @on-cancel="refuseCancel" class-name="refuse" :loading="refuseLoading">
                        <div class="refuse-wrap">
                            <Form ref="refuseForm" :model="refuseForm" :rules="refuseRules" :label-width="100" label-position="right">
                                <FormItem label="拒绝理由" prop="reason">
                                    <Input type="textarea" v-model="refuseForm.reason" :autosize="{minRows: 3,maxRows: 6}" style="width: 320px"></Input>
                                </FormItem>
                                <FormItem label="风控密码" prop="password">
                                    <Input type="password" v-model="refuseForm.password" style="width: 320px"></Input>
                                </FormItem>
                            </Form>
                        </div>
                    </Modal>
                    <Button type="warning" @click="baseOperate.frozen = true">冻结授信</Button>
                </div>
                <div class="base-operate" v-else-if="query.type === 'warn'">
                    <Button type="warning" style="margin-right: 8px;" @click="baseOperate.reduce = true">降低授信</Button>
                    <Button type="error" @click="baseOperate.terminate = true">终止授信</Button>
                </div>
            </Row>
        </Card>
        <Card shadow>
            <Form :modal="filerConditions" :label-width="64" label-position="left">
                <FormItem label="展示类型">
                    <RadioGroup v-model="filerConditions.type" @on-change="showTypeChange">
                        <Radio label="chart">图表展示</Radio>
                        <Radio label="table">表格展示</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="授信店铺" style="margin-bottom: 10px">
                    <Select v-model="filerConditions.creditShop" multiple style="width: auto; min-width: 250px;">
                        <Option v-for="item in shopList" :value="item.value" :key="item.value" :label="item.label">
                            <span>{{ item.label }}</span>
                        </Option>
                    </Select>
                    <span @click="handleCommit" style="margin: 0 10px;">
                        <Button type="primary">
                            提交
                        </Button>
                    </span>
                </FormItem>
            </Form>
        </Card>
        <div class="show-area" v-if="filerConditions.type === 'chart'">
            <Card class="margin-bottom-10" shadow>
                <p slot="title">店铺数据</p>
                <Row>
                    <Form :modal="chartCycleConditions">
                        <FormItem>
                            <RadioGroup v-model="chartCycleConditions.cycle" @on-change="chartCycleChange">
                                <Radio label="last3Years">最近三年</Radio>
                                <Radio label="last1Years">最近一年</Radio>
                                <Radio label="last3Month">最近三月</Radio>
                                <Radio label="last1Month">最近一月</Radio>
                            </RadioGroup>
                        </FormItem>
                    </Form>
                </Row>
                <div v-if="chartCycleConditions.cycle === 'last3Years'" key="last3Years">
                    <Row type="flex" class="loading-wrap" style="height: 500px;" justify="space-between">
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last3YearsLoading" :bind-id="last3YearsOrderId" :type="chartType.order" :legend="orderLegend" :o-data="last3YearsTableData" :x-data="last3YearsXdata" :y-data="orderYdata"></chart>
                        </Col>
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last3YearsLoading" :bind-id="last3YearsRateId" :type="chartType.rate" :legend="rateLegend" :o-data="last3YearsTableData" :x-data="last3YearsXdata" :y-data="rateYdata"></chart>
                        </Col>
                        <Spin fix v-if="last3YearsLoading"></Spin>                            
                    </Row>
                </div>
                <div v-if="chartCycleConditions.cycle === 'last1Years'" key="last1Years">
                    <Row type="flex" class="loading-wrap" style="height: 500px;" justify="space-between">
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last1YearsLoading" :bind-id="last1YearsOrderId" :type="chartType.order" :legend="orderLegend" :o-data="last1YearsTableData" :x-data="last1YearsXdata" :y-data="orderYdata"></chart>
                        </Col>
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last1YearsLoading" :bind-id="last1YearsRateId" :type="chartType.rate" :legend="rateLegend" :o-data="last1YearsTableData" :x-data="last1YearsXdata" :y-data="rateYdata"></chart>
                        </Col>
                        <Spin fix v-if="last1YearsLoading"></Spin>                            
                    </Row>
                </div>
                <div v-if="chartCycleConditions.cycle === 'last3Month'" key="last3Month">
                    <Row type="flex" class="loading-wrap" style="height: 500px;" justify="space-between">
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last3MonthLoading" :bind-id="last3MonthOrderId" :type="chartType.order" :legend="orderLegend" :o-data="last3MonthTableData" :x-data="last3MonthXdata" :y-data="orderYdata"></chart>                            
                        </Col>
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last3MonthLoading" :bind-id="last3MonthRateId" :type="chartType.rate" :legend="rateLegend" :o-data="last3MonthTableData" :x-data="last3MonthXdata" :y-data="rateYdata"></chart>                            
                        </Col>
                        <Spin fix v-if="last3MonthLoading"></Spin>                            
                    </Row>
                </div>
                <div v-if="chartCycleConditions.cycle === 'last1Month'" key="last1Month">
                    <Row type="flex" class="loading-wrap" justify="space-between">
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last1MonthLoading" :bind-id="last1MonthOrderId" :type="chartType.order" :legend="orderLegend" :o-data="last1MonthTableData" :x-data="last1MonthXdata" :y-data="orderYdata" :need-slide="true"></chart>                                                        
                        </Col>
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last1MonthLoading" :bind-id="last1MonthRateId" :type="chartType.rate" :legend="rateLegend" :o-data="last1MonthTableData" :x-data="last1MonthXdata" :y-data="rateYdata" :need-slide="true"></chart>                                                        
                        </Col>
                        <Spin fix v-if="last1MonthLoading"></Spin>                            
                    </Row>
                </div>
            </Card>
            <Card shadow>
                <p slot="title">销售数据</p>
                <Row>
                    <Form :modal="chartSaleConditions">
                        <FormItem>
                            <RadioGroup v-model="chartSaleConditions.sale" @on-change="chartSaleChange">
                                <Radio label="class">销售前十类目</Radio>
                                <Radio label="listing">销售前十listing</Radio>
                            </RadioGroup>
                        </FormItem>
                    </Form>
                </Row>
                <div v-if="chartSaleConditions.sale === 'class'" key="class">
                    <Row class="loading-wrap" style="height: 600px;">
                        <chart v-if="!top10ClassLoading" :bind-id="top10ClassId" :type="chartType.class" :legend="saleLegend" :o-data="top10ClassTableData" :x-data="top10ClassXData" :y-data="saleYData"></chart>
                    </Row>
                    <Spin fix v-if="top10ClassLoading"></Spin>
                </div>
                <div v-if="chartSaleConditions.sale === 'listing'" key="listing">
                    <Row class="loading-wrap" style="height: 600px;">
                        <chart v-if="!top10ListingLoading" :bind-id="top10ListingId" :type="chartType.listing" :legend="saleLegend" :o-data="top10ListingTableData" :x-data="top10ListingXData" :y-data="saleYData"></chart>
                    </Row>
                    <Spin fix v-if="top10ListingLoading"></Spin>
                </div>
            </Card>
        </div>
        <div class="show-area" v-else>
            <Card class="margin-bottom-10" shadow>
                <p slot="title">最近三年</p>
                <div class="loading-wrap">
                    <Table :columns="last3YearsTableColumns" :data="last3YearsTableData"></Table>
                </div>
            </Card>
            <Card class="margin-bottom-10" shadow>
                <p slot="title">最近一年</p>
                <div class="loading-wrap">
                    <Table :columns="last1YearsTableColumns" :data="last1YearsTableData"></Table>
                    <Spin fix v-if="last1YearsLoading"></Spin>
                </div>
            </Card>
            <Card class="margin-bottom-10" shadow>
                <p slot="title">最近三个月</p>
                <div class="loading-wrap">
                    <Table :columns="last3MonthTableColumns" :data="last3MonthTableData"></Table>
                    <Spin fix v-if="last3MonthLoading"></Spin>
                </div>
            </Card>
            <Card class="margin-bottom-10" shadow>
                <p slot="title">最近一个月</p>
                <div class="loading-wrap">
                    <Table :columns="last1MonthTableColumns" :data="last1MonthTableDataSliced"></Table>
                    <div style="padding: 20px 0; overflow: hidden;">
                        <div style="float:right">
                            <Page :total="last1MonthTableData.length" size="small" show-total @on-change="changePage"></Page>
                        </div>
                    </div>
                    <Spin fix v-if="last1MonthLoading"></Spin>
                </div>
            </Card>
            <Row type="flex" justify="space-between" :gutter="10">
                <Col span="12">
                    <Card shadow>
                        <p slot="title">销售前十类目</p>
                        <Table :columns="top10ClassTableColums" :data="top10ClassTableData"></Table>                        
                    </Card>
                </Col>
                <Col span="12">
                    <Card shadow>
                        <p slot="title">销售前十listing</p>
                        <Table :columns="top10ListingTableColums" :data="top10ListingTableData"></Table>                                                
                    </Card>
                </Col>
            </Row>
        </div>
    </div>
</template>

<script>
import util from '@/libs/util.js';
import chart from './components/chart';
import qs from 'qs';
import Cookies from 'js-cookie';
import Permissions from '../../../static/permissions.json';

export default {
    name: 'handle',
    data () {
        return {
            handleType: '', // 处理类型，判断按钮类别
            query: {}, // 页面param参数
            total: '', // 评估总分
            quota: '', // 系数调整
            limit: '', // 授信额度
            baseOperate: {
                confirm: false,
                refuse: false,
                frozen: false,
                reduce: false,
                terminate: false
            },
            confirmForm: {
                limit: '',
                password: ''
            },
            confirmRules: {
                limit: [
                    {
                        required: true,
                        message: '额度不能为空',
                        trigger: 'blur'
                    },
                    {
                        whitespace: true,
                        message: '不能输入空格'
                    }
                ],
                password: [
                    {
                        required: true,
                        message: '密码不能为空',
                        trigger: 'blur'
                    },
                    {
                        type: 'string',
                        min: 6,
                        message: '密码至少为6位',
                        trigger: 'blur'
                    },
                    {
                        whitespace: true,
                        message: '请不要输入空格'
                    }
                ]
            },
            confirmLoading: true,
            refuseForm: {
                reason: '',
                password: ''
            },
            refuseRules: {
                reason: [
                    {
                        required: true,
                        message: '理由不能为空',
                        trigger: 'blur'
                    }
                ],
                password: [
                    {
                        required: true,
                        message: '密码不能为空',
                        trigger: 'blur'
                    },
                    {
                        type: 'string',
                        min: 6,
                        message: '密码至少为6位',
                        trigger: 'blur'
                    },
                    {
                        whitespace: true,
                        message: '请不要输入空格'
                    }
                ]
            },
            refuseLoading: true,
            filerConditions: { // 筛选展示类型表格
                type: 'table', // chart图表，table表格
                creditShop: [], // 授信店铺
                dataArr: []
            },
            chartCycleConditions: { // 图表展示周期选择
                cycle: 'last3Years' // 默认为最近三年
            },
            chartSaleConditions: { // 图表展示销售类型
                sale: 'class' // 默认为销售类目
            },
            shopList: [], // 获取的所有商铺列表
            chartType: { // 图表展示类型
                order: 'order',
                rate: 'rate',
                class: 'class',
                listing: 'listing'
            },
            orderLegend: ['平均订单金额', '订单总额', '订单总数'],
            rateLegend: ['差评总数', '好评总数', 'DSR'],
            saleLegend: ['订单数占比', '销售额占比'],
            orderYdata: ['平均订单金额', '订单总额', '订单总数'],
            rateYdata: ['差评总数', '好评总数', 'DSR'],
            saleYData: ['订单数占比', '销售额占比'],
            last3YearsTableColumns: [ // 最近三年表头
                {
                    title: '时间周期',
                    sortable: true,
                    key: 'Year'
                },
                {
                    title: '订单总额',
                    sortable: true,
                    key: 'Amount'
                },
                {
                    title: '平均订单总额',
                    sortable: true,
                    key: 'AvgAmount'
                },
                {
                    title: '订单总数',
                    sortable: true,
                    key: 'Total'
                },
                {
                    title: '好评总数',
                    sortable: true,
                    key: 'GoodCommentCount'
                },
                {
                    title: '差评总数',
                    sortable: true,
                    key: 'BadCommentCount'
                },
                {
                    title: 'DSR评分',
                    sortable: true,
                    key: 'DSRScore'
                }
            ],
            last3YearsTableData: [], // 最近三年表格展示数据
            last3YearsLoading: true, // 最近三年加载状态
            last3YearsOrderId: 'l3YO',
            last3YearsRateId: 'l3YR',
            last3YearsXdata: ['第1年', '第2年', '第3年'],
            last1YearsTableColumns: [ // 最近一年表头
                {
                    title: '时间周期',
                    sortable: true,
                    key: 'Year'
                },
                {
                    title: '订单总额',
                    sortable: true,
                    key: 'Amount'
                },
                {
                    title: '平均订单总额',
                    sortable: true,
                    key: 'AvgAmount'
                },
                {
                    title: '订单总数',
                    sortable: true,
                    key: 'Total'
                },
                {
                    title: '好评总数',
                    sortable: true,
                    key: 'GoodCommentCount'
                },
                {
                    title: '差评总数',
                    sortable: true,
                    key: 'BadCommentCount'
                },
                {
                    title: 'DSR评分',
                    sortable: true,
                    key: 'DSRScore'
                }
            ],
            last1YearsTableData: [], // 最近一年表格展示数据
            last1YearsLoading: true, // 最近一年加载状态
            last1YearsOrderId: 'l1YO',
            last1YearsRateId: 'l1YR',
            last1YearsXdata: ['第1季度', '第2季度', '第3季度', '第4季度'],
            last3MonthTableColumns: [ // 最近三月表头
                {
                    title: '时间周期',
                    sortable: true,
                    key: 'Month'
                },
                {
                    title: '订单总额',
                    sortable: true,
                    key: 'Amount'
                },
                {
                    title: '平均订单总额',
                    sortable: true,
                    key: 'AvgAmount'
                },
                {
                    title: '订单总数',
                    sortable: true,
                    key: 'Total'
                },
                {
                    title: '好评总数',
                    sortable: true,
                    key: 'GoodCommentCount'
                },
                {
                    title: '差评总数',
                    sortable: true,
                    key: 'BadCommentCount'
                },
                {
                    title: 'DSR评分',
                    sortable: true,
                    key: 'DSRScore'
                }
            ],
            last3MonthTableData: [], // 最近三月表格展示数据
            last3MonthLoading: true, // 最近三月加载状态
            last3MonthOrderId: 'l3MO',
            last3MonthRateId: 'l3MR',
            last3MonthXdata: ['第1月', '第2月', '第3月'],
            last1MonthTableColumns: [ // 最近一月表头
                {
                    title: '时间周期',
                    sortable: true,
                    key: 'Day'
                },
                {
                    title: '订单总额',
                    sortable: true,
                    key: 'Amount'
                },
                {
                    title: '平均订单总额',
                    sortable: true,
                    key: 'AvgAmount'
                },
                {
                    title: '订单总数',
                    sortable: true,
                    key: 'Total'
                },
                {
                    title: '好评总数',
                    sortable: true,
                    key: 'GoodCommentCount'
                },
                {
                    title: '差评总数',
                    sortable: true,
                    key: 'BadCommentCount'
                },
                {
                    title: 'DSR评分',
                    sortable: true,
                    key: 'DSRScore'
                }
            ],
            last1MonthTableData: [], // 最近一月订单类转化数组
            last1MonthTableDataSliced: [], // 最近一月裁切数组
            last1MonthLoading: true, // 最近一月加载状态
            last1MonthOrderId: 'l1MO',
            last1MonthRateId: 'l1MR',
            top10ClassTableColums: [ // 前十类目表头
                {
                    title: '类目',
                    key: 'CategoryName'
                },
                {
                    title: '销售额占比',
                    sortable: true,
                    key: 'AmountPercent'
                },
                {
                    title: '订单数占比',
                    sortable: true,
                    key: 'TotalPercent'
                }
            ],
            top10ClassTableData: [], // 前十类目表格展示数据
            top10ClassLoading: true, // 前十类目加载状态
            top10ClassId: 't10c',
            top10ListingTableColums: [ // 前十listing表头
                {
                    title: 'listing',
                    key: 'Sku'
                },
                {
                    title: '销售额占比',
                    sortable: true,
                    key: 'AmountPercent'
                },
                {
                    title: '订单数占比',
                    sortable: true,
                    key: 'TotalPercent'
                }
            ],
            top10ListingTableData: [], // 前十listing表格展示数据
            top10ListingLoading: true, // 前十listing加载状态
            top10ListingId: 't10l'
        };
    },
    computed: {
        last1MonthXdata () {
            const data = [];
            for (let i = 0, len = this.last1MonthTableData.length; i < len; i++) {
                data.push(`第${i + 1}天`);
            }
            return data;
        },
        top10ClassXData () {
            const data = [];
            for (let i = 0, len = this.top10ClassTableData.length; i < len; i++) {
                data.push(this.top10ClassTableData[i].CategoryName);
            }
            return data;
        },
        top10ListingXData () {
            const data = [];
            for (let i = 0, len = this.top10ListingTableData.length; i < len; i++) {
                data.push(this.top10ListingTableData[i].Sku);
            }
            return data;
        }
    },
    components: {
        chart
    },
    created () {
        this.init();
    },
    watch: {
        'filerConditions.creditShop' (newVal, oldVal) {
            this.filerConditions.dataArr = [];
            newVal.forEach(item => {
                this.shopList.forEach((child, index) => {
                    if (item === child.value) {
                        this.filerConditions.dataArr.push({
                            okbUserId: child.accountId,
                            platformType: child.type
                        });
                    }
                });
            });
        }
    },
    methods: {
        // 初始化
        init () {
            this.query = this.$route.query;
            this.fetchShop().then(() => {
                this.handleCommit();
            }).then(() => {
                this.handleCycleCharts(this.chartCycleConditions.cycle);
                this.handleSaleCharts(this.chartSaleConditions.sale);
            }).catch(error => {
                console.error(error);
            });
        },
        // 获取数据
        fetchShop () {
            return new Promise((resolve, reject) => {
                const userId = localStorage.getItem('userId');
                util.ajax.get('api/PlatformAccount?okbUserId=c8c68d07-8215-4201-aa1d-46fd1670289c').then(res => {
                    if (res.data.status === 1) {
                        let data = res.data.data;
                        data.forEach((item) => {
                            this.shopList.push({
                                value: item.OKBAccountId,
                                label: item.Name,
                                accountId: item.OKBUserId,
                                type: item.PlatformType,
                                hasFetched: false
                            });
                        });
                        this.filerConditions.creditShop.push(this.shopList[0].value);
                        // this.$watch('filerConditions.creditShop', this.shopChangeHandler);
                        resolve(data);
                    } else {
                        reject(res.data);
                    }
                }).catch(error => {
                    reject(error);
                });
            });
        },
        // 展示类型切换
        showTypeChange (value) {
            this.handleCycleCharts(this.chartCycleConditions.cycle);
            this.handleSaleCharts(this.chartSaleConditions.sale);
        },
        // 处理店铺条件筛选提交
        handleCommit () {
            let conditions = this.filerConditions;
            conditions.creditShop.forEach((item, index) => {
                this.fetchData(item, index);
                // this.fetchCategory(item, index);
                // this.fetchYearOrder(item, index);
                // this.fetchMonthOrder(item, index);
                // this.fetchDayOrder(item, index);
            });
        },
        fetchData (item, index) {
            let conditions = this.filerConditions;
            let dataArrThis = conditions.dataArr[index];
            const year = new Promise((resolve, reject) => {
                let params = qs.stringify({
                    okbUserId: dataArrThis.okbUserId,
                    okbAccountId: item,
                    platformType: dataArrThis.platformType,
                    timeType: 1,
                    limit: 3
                });
                if (!this.shopList[index].hasFetched) {
                    util.ajax.get('api/PlatformOrderStatistics?' + params).then(res => {
                        if (res.data.status === 1) {
                            let data = res.data.data;
                            console.log(res.data);
                            let nowYear = new Date().getFullYear();
                            this.last3YearsTableData = data;
                            this.last3YearsLoading = false;
                            data.forEach(item => {
                                if (item.Year === nowYear) {
                                    this.last1YearsTableData.splice(0, 1, item);
                                    this.last1YearsLoading = false;
                                }
                            });
                            resolve();
                        } else {
                            this.last3YearsLoading = false;
                            this.last1YearsLoading = false;
                            reject(res);
                        }
                    });
                }
            });
            const month = new Promise((resolve, reject) => {
                let params = qs.stringify({
                    okbUserId: dataArrThis.okbUserId,
                    okbAccountId: item,
                    platformType: dataArrThis.platformType,
                    timeType: 2,
                    limit: 3
                });
                if (!this.shopList[index].hasFetched) {
                    util.ajax.get('api/PlatformOrderStatistics?' + params).then(res => {
                        if (res.data.status === 1) {
                            let data = res.data.data;
                            this.last3MonthTableData = data;
                            this.last3MonthLoading = false;
                            resolve();
                        } else {
                            this.last3MonthLoading = false;
                            reject(res);
                        }
                    });
                }
            });
            const day = new Promise((resolve, reject) => {
                let params = qs.stringify({
                    okbUserId: dataArrThis.okbUserId,
                    okbAccountId: item,
                    platformType: dataArrThis.platformType,
                    timeType: 3,
                    limit: 30
                });
                if (!this.shopList[index].hasFetched) {
                    util.ajax.get('api/PlatformOrderStatistics?' + params).then(res => {
                        if (res.data.status === 1) {
                            let data = res.data.data;
                            this.last1MonthTableData = data;
                            this.last1MonthTableDataSliced = data.slice(0, 10);
                            this.last1MonthLoading = false;
                            resolve();
                        } else {
                            this.last1MonthLoading = false;
                            reject(res);
                        }
                    });
                }
            });
            this.fetchSales(item, index);
            this.fetchSales(item, index, 'listing');
        },
        fetchSales (item, index, type) {
            let conditions = this.filerConditions;
            let dataArrThis = conditions.dataArr[index];
            let params = qs.stringify({
                okbUserId: dataArrThis.okbUserId,
                okbAccountId: item,
                platformType: dataArrThis.platformType
            });
            let address;
            if (type && type === 'listing') {
                address = 'PlatformSkuStatistics';
                if (!this.shopList[index].hasFetched) {
                    util.ajax.get(`api/${address}?${params}`).then(res => {
                        if (res.data.status === 1) {
                            let data = res.data.data;
                            data.forEach(item => {
                                item.AmountPercent = (parseInt(item.AmountPercent * 10000)) / 100;
                                item.TotalPercent = (parseInt(item.TotalPercent * 10000)) / 100;
                            });
                            this.top10ListingTableData = data;
                            this.top10ListingLoading = false;
                            this.shopList[index].hasFetched = true;
                        }
                    });
                }
            }
            if (!type) {
                address = 'PlatformCategoryStatistics';
                if (!this.shopList[index].hasFetched) {
                    util.ajax.get(`api/${address}?${params}`).then(res => {
                        if (res.data.status === 1) {
                            let data = res.data.data;
                            data.forEach(item => {
                                item.AmountPercent = (parseInt(item.AmountPercent * 10000)) / 100;
                                item.TotalPercent = (parseInt(item.TotalPercent * 10000)) / 100;
                            });
                            this.top10ClassTableData = data;
                            this.top10ClassLoading = false;
                            this.shopList[index].hasFetched = true;
                        }
                    });
                }
            }
        },
        fetchYearOrder (item, index) {
            let conditions = this.filerConditions;
            let dataArrThis = conditions.dataArr[index];
            let params = qs.stringify({
                okbUserId: dataArrThis.okbUserId,
                okbAccountId: item,
                platformType: dataArrThis.platformType,
                timeType: 1,
                limit: 3
            });
            if (!this.shopList[index].hasFetched) {
                util.ajax.get('api/PlatformOrderStatistics?' + params).then(res => {
                    if (res.data.status === 1) {
                        let data = res.data.data;
                        console.log(res.data);
                        let nowYear = new Date().getFullYear();
                        this.last3YearsTableData = data;
                        this.last3YearsLoading = false;
                        data.forEach(item => {
                            if (item.Year === nowYear) {
                                this.last1YearsTableData.splice(0, 1, item);
                                this.last1YearsLoading = false;
                            }
                        });
                        // } else {
                        //     // for (let i = 0, len = data.length; i < len; i++) {
                        //     //     last3YearsTableData[i].Amount += data[i].Amount;
                        //     //     last3YearsTableData[i].AvgAmount = parseFloat((last3YearsTableData[i].AvgAmount + data[i].Amount) / conditions.creditShop.length);
                        //     //     last3YearsTableData[i].DSRScore = parseInt((last3YearsTableData[i].DSRScore + data[i].DSRScore) / conditions.creditShop.length);
                        //     //     last3YearsTableData[i].Total += data[i].Total;
                        //     //     last3YearsTableData[i].GoodCommentCount += data[i].GoodCommentCount;
                        //     //     last3YearsTableData[i].BadCommentCount += data[i].BadCommentCount;
                        //     // }
                        // }
                    } else {
                        this.last3YearsLoading = false;
                        this.last1YearsLoading = false;
                    }
                });
            }
        },
        fetchMonthOrder (item, index) {
            let conditions = this.filerConditions;
            let dataArrThis = conditions.dataArr[index];
            let params = qs.stringify({
                okbUserId: dataArrThis.okbUserId,
                okbAccountId: item,
                platformType: dataArrThis.platformType,
                timeType: 2,
                limit: 3
            });
            if (!this.shopList[index].hasFetched) {
                util.ajax.get('api/PlatformOrderStatistics?' + params).then(res => {
                    if (res.data.status === 1) {
                        let data = res.data.data;
                        this.last3MonthTableData = data;
                        this.last3MonthLoading = false;
                    }
                });
            }
        },
        fetchDayOrder (item, index) {
            let conditions = this.filerConditions;
            let dataArrThis = conditions.dataArr[index];
            let params = qs.stringify({
                okbUserId: dataArrThis.okbUserId,
                okbAccountId: item,
                platformType: dataArrThis.platformType,
                timeType: 3,
                limit: 30
            });
            if (!this.shopList[index].hasFetched) {
                util.ajax.get('api/PlatformOrderStatistics?' + params).then(res => {
                    if (res.data.status === 1) {
                        let data = res.data.data;
                        this.last1MonthTableData = data;
                        this.last1MonthTableDataSliced = data.slice(0, 10);
                        this.last1MonthLoading = false;
                    }
                });
            }
        },
        // 展示周期切换
        chartCycleChange (value) {
            switch (value) {
                case 'last3Years':
                    this.handleCycleCharts(value);
                    break;
                case 'last1Years':
                    this.handleCycleCharts(value);
                    break;
                case 'last3Month':
                    this.handleCycleCharts(value);
                    break;
                case 'last1Month':
                    this.handleCycleCharts(value);
                    break;
                default:
                    this.handleCycleCharts('last3Years');
                    break;
            }
        },
        // 销售类型切换
        chartSaleChange (value) {
            switch (value) {
                case 'class':
                    this.handleSaleCharts(value);
                    break;
                case 'listing':
                    this.handleSaleCharts(value);
                    break;
                default:
                    this.handleSaleCharts('class');
                    break;
            }
        },
        // 处理展示周期echarts数据
        handleCycleCharts (type) {
            this.$nextTick(() => {
                switch (type) {
                    case 'last3Years':
                        this.last3YearsLoading = false;
                        break;
                    case 'last1Years':
                        this.last1YearsLoading = false;
                        break;
                    case 'last3Month':
                        this.last3MonthLoading = false;
                        break;
                    case 'last1Month':
                        this.last3MonthLoading = false;
                        break;
                    default:
                        this.last3YearsLoading = false;
                        break;
                }
            });
        },
        // 处理销售类型echarts数据
        handleSaleCharts (type) {
            this.$nextTick(() => {
                switch (type) {
                    case 'class':
                        this.top10ClassLoading = false;
                        break;
                    case 'listing':
                        this.top10ListingLoading = false;
                        break;
                    default:
                        this.top10ClassLoading = false;
                        break;
                }
            });
        },
        // 周期转化方法
        transferCycle (arr, type = 1) {
            let n;
            let map = [];
            let dest = [];
            type === 3 ? n = 12 : n = 3;
            for (let i = 0; i < arr.length; i += n) {
                map.push(arr.slice(i, i + n));
            }
            map.forEach((item, index) => {
                let count = 0;
                let order = 0;
                let average = 0;
                let like = 0;
                let unlike = 0;
                let DSR = 0;
                item.forEach(i => {
                    count += i.totalCount;
                    order += i.totalOrder;
                    like += i.totalLike;
                    unlike += i.totalUnlike;
                    average += i.averageCount;
                    DSR += i.DSR;
                });
                dest[index] = {};
                if (type === 3) {
                    dest[index].cycle = `第${index + 1}年`;
                } else {
                    dest[index].cycle = `第${index + 1}季度`;
                }
                dest[index].totalCount = parseFloat((count.toFixed(2)));
                dest[index].totalOrder = order;
                dest[index].totalLike = like;
                dest[index].totalUnlike = unlike;
                dest[index].averageCount = parseFloat((average / n).toFixed(2));
                dest[index].DSR = parseFloat((DSR / n).toFixed(1));
            });
            type === 3 ? this.last3YearsLoading = false : this.last1YearsLoading = false;
            return dest;
        },
        // 表格分页切换
        changePage (page) {
            if (page === 1) {
                this.last1MonthTableDataSliced = this.last1MonthTableData.slice(0, 10);
                return;
            }
            if (page === 2) {
                this.last1MonthTableDataSliced = this.last1MonthTableData.slice(10, 20);
                return;
            }
            if (page === 3) {
                this.last1MonthTableDataSliced = this.last1MonthTableData.slice(20, 30);
                return;
            }
            if (page === 4) {
                this.last1MonthTableDataSliced = this.last1MonthTableData.slice(30, 40);
            }
        },
        // 确认授信
        confirmOk () {
            this.$refs['confirmForm'].validate(valid => {
                if (valid) {
                    util.ajax.post('/confirm', {
                        limit: this.confirmForm.limit,
                        password: this.confirmForm.password
                    }).then(res => {
                        if (res.data.status === 1) {
                            this.$Message.success(res.data.msg);
                            this.$refs['confirmForm'].resetFields();
                            this.baseOperate.confirm = false;
                        } else {
                            this.$Message.error(res.data.msg);
                            this.confirmLoading = false;
                        }
                    }).catch(error => {
                        this.confirmLoading = false;
                        this.$Message.error(error.message);
                        setTimeout(() => {
                            this.confirmLoading = true;
                        }, 0);
                    });
                } else {
                    this.confirmLoading = false;
                    setTimeout(() => {
                        this.confirmLoading = true;
                    }, 0);
                }
            });
        },
        // 确认授信
        confirmCancel () {
            this.confirmLoading = true;
            this.$refs['confirmForm'].resetFields();
        },
        // 拒绝授信
        refuseOk () {
            this.$refs['refuseForm'].validate(valid => {
                if (valid) {
                    util.ajax.post('/refuse', {
                        reason: this.refuseForm.reason,
                        password: this.refuseForm.password
                    }).then(res => {
                        if (res.data.status === 1) {
                            this.$Message.success(res.data.msg);
                            this.$refs['refuseForm'].resetFields();
                            this.baseOperate.refuse = false;
                        } else {
                            this.$Message.error(res.data.msg);
                            this.refuseLoading = false;
                        }
                    }).catch(error => {
                        this.refuseLoading = false;
                        this.$Message.error(error.message);
                        setTimeout(() => {
                            this.refuseLoading = true;
                        }, 0);
                    });
                } else {
                    this.refuseLoading = false;
                    setTimeout(() => {
                        this.refuseLoading = true;
                    }, 0);
                }
            });
        },
        refuseCancel () {
            this.refuseLoading = true;
            this.$refs['refuseForm'].resetFields();
        },
        // 冻结授信
        frozen () {
            this.$Message.warning('冻结');
        },
        // 降低授信
        reduce () {
            this.$Message.warning('降低');
        },
        // 终止授信
        terminate () {
            this.$Message.error('终止');
        }
    },
    filters: {
        // 金钱过滤器
        moneyFormat (value) {
            return '￥' + value;
        }
    }
};
</script>

<style lang="less">
.confirm {
    .confirm-wrap {
        .title {
            padding: 10px 12px 24px 0;
            text-align: center;
            >span {
                margin-right: 15px;
                >span {
                    margin-left: 5px;
                }
                >strong {
                    font-size: 16px;
                }
            }
        }
    }
}
.refuse {
    .refuse-wrap {
        padding-top: 20px;
    }
}
.handle {
    .base-info {
        display: inline-block;
        margin-right: 30px;
        font-size: 12px;
        span {
            margin-right: 15px;
            span {
                margin-left: 5px;
            }
            strong {
                font-size: 20px;
                color: #ffc000;
            }
        }
    }
    .base-operate {
        display: inline-block;
    }
    .show-area {
        position: relative;
        margin-top: 10px;
    }
    .loading-wrap {
        position: relative;
    }
   
}
</style>
