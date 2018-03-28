<template>
    <div class="handle">
        <Card shadow :style="{marginBottom: '10px'}">
            <Row>
                <div class="base-info">
                    <span v-permission="Permissions['CreditAssess']">评估总分：<strong>{{ total }}</strong></span>
                    <span>授信类型：{{ type === 1 ? '主体授信' : '代采授信' }}</span>
                    <span v-permission="Permissions['CreditAssess']">申请额度：<strong>{{ applyLimit | moneyFormat }}</strong></span>
                    <span v-if="creditStatus === 2">授信额度：<strong>{{ creditLimit | moneyFormat }}</strong></span>
                </div>
                <div class="base-operate" v-if="query.type === 'handle'">
                    <Button v-permission="Permissions['Credit_Put']" v-if="creditStatus === 1 || creditStatus === 2" type="success" style="margin-right: 8px;" @click="baseOperate.confirm = true">{{ creditStatus === 2 ? '修改授信' : '确认授信' }}</Button>
                    <Button v-permission="Permissions['Credit_Put']" v-if="creditStatus === 1" type="error" style="margin-right: 8px;" @click="baseOperate.refuse = true">拒绝授信</Button>
                    <Button v-permission="Permissions['Credit_Put']" v-if="creditStatus === 2" type="warning" @click="baseOperate.frozen = true">冻结授信</Button>
                    <Modal v-model="baseOperate.confirm" :title="creditStatus === 2 ? '修改授信' : '确认授信'" @on-ok="confirmOk" @on-cancel="confirmCancel" class-name="confirm" :loading="confirmLoading">
                        <div class="confirm-wrap">
                            <div class="title">
                                <span>评估总分：<strong>{{ total }}</strong></span>
                                <span>授信类型：<strong>{{ type === 1 ? '主体授信' : '代采授信' }}</strong></span>
                                <span v-if="creditStatus === 1">申请额度：<strong>{{ applyLimit | moneyFormat }}</strong></span>
                                <span v-if="creditStatus === 2">授信额度：<strong>{{ creditLimit | moneyFormat }}</strong></span>
                            </div>
                            <Form ref="confirmForm" :model="confirmForm" :rules="confirmRules" :label-width="100" label-position="right">
                                <FormItem label="授信额度" prop="limit">
                                    <Input type="text" v-model="confirmForm.limit" style="width: 320px"></Input>
                                </FormItem>
                                <FormItem label="风控密码" prop="password">
                                    <Input type="password" v-model="confirmForm.password" style="width: 320px"></Input>
                                </FormItem>
                            </Form>
                        </div>
                    </Modal>
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
                    <Modal v-model="baseOperate.frozen" title="冻结授信" @on-ok="frozenOk" @on-cancel="frozenCancel" class-name="confirm" :loading="frozenLoading">
                        <div class="confirm-wrap">
                            <div class="title">
                                <span>评估总分：<strong>{{ total }}</strong></span>
                                <span>授信类型：<strong>{{ type === 1 ? '主体授信' : '代采授信' }}</strong></span>
                                <span>授信额度：<strong>{{ creditLimit | moneyFormat }}</strong></span>
                            </div>
                            <Form ref="frozenForm" :model="frozenForm" :rules="frozenRules" :label-width="100" label-position="right">
                                <FormItem label="冻结理由" prop="reason">
                                    <Input type="textarea" v-model="frozenForm.reason" :autosize="{minRows: 3,maxRows: 6}" style="width: 320px"></Input>
                                </FormItem>
                                <FormItem label="风控密码" prop="password">
                                    <Input type="password" v-model="frozenForm.password" style="width: 320px"></Input>
                                </FormItem>
                            </Form>
                        </div>
                    </Modal>
                </div>
                <div class="base-operate" v-else-if="query.type === 'warn'">
                    <Button type="warning" style="margin-right: 8px;" @click="baseOperate.reduce = true">降低授信</Button>
                    <Button type="error" @click="baseOperate.terminate = true">终止授信</Button>
                </div>
            </Row>
        </Card>
        <Card shadow>
            <Form :modal="filterConditions" :label-width="64" label-position="left">
                <FormItem label="授信编号">
                    <span style="font-size: 14px">{{ query.id }}</span>
                </FormItem>
                <FormItem label="展示类型">
                    <RadioGroup v-model="filterConditions.type" @on-change="showTypeChange">
                        <Radio label="chart">图表展示</Radio>
                        <Radio label="table">表格展示</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="授信店铺" style="display: none; margin-bottom: 10px">
                    <Select v-model="filterConditions.creditShop" multiple style="width: auto; min-width: 250px;">
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
        <div class="show-area" v-if="filterConditions.type === 'chart'" key="chart">
            <Card v-permission="Permissions['PlatformOrderStatistics']" class="margin-bottom-10" shadow>
                <p slot="title">店铺数据</p>
                <Row>
                    <Form :modal="chartCycleConditions">
                        <FormItem>
                            <RadioGroup v-model="chartCycleConditions.cycle" @on-change="chartCycleChange">
                                <Radio label="last3Years">最近三年</Radio>
                                <Radio label="last1Years">最近一年</Radio>
                                <Radio label="last3Month">最近三月</Radio>
                                <!-- <Radio label="last1Month">最近一月</Radio> -->
                            </RadioGroup>
                        </FormItem>
                    </Form>
                </Row>
                <div v-if="chartCycleConditions.cycle === 'last3Years'" key="last3Years">
                    <Row type="flex" class="loading-wrap" style="min-height: 450px" justify="space-between">
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last3YearsLoading" :bind-id="last3YearsOrderId" :type="chartType.order" :legend="orderLegend" :o-data="last3YearsShowData" :x-data="last3YearsXdata" :y-data="orderYdata"></chart>
                        </Col>
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last3YearsLoading" :bind-id="last3YearsRateId" :type="chartType.rate" :legend="rateLegend" :o-data="last3YearsShowData" :x-data="last3YearsXdata" :y-data="rateYdata"></chart>
                        </Col>
                        <Spin fix v-if="last3YearsLoading"></Spin>                            
                    </Row>
                </div>
                <div v-if="chartCycleConditions.cycle === 'last1Years'" key="last1Years">
                    <Row type="flex" class="loading-wrap" style="min-height: 450px" justify="space-between">
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last1YearsLoading" :bind-id="last1YearsOrderId" :type="chartType.order" :legend="orderLegend" :o-data="last1YearsShowData" :x-data="last1YearsXdata" :y-data="orderYdata"></chart>
                        </Col>
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last1YearsLoading" :bind-id="last1YearsRateId" :type="chartType.rate" :legend="rateLegend" :o-data="last1YearsShowData" :x-data="last1YearsXdata" :y-data="rateYdata"></chart>
                        </Col>
                        <Spin fix v-if="last1YearsLoading"></Spin>                            
                    </Row>
                </div>
                <div v-if="chartCycleConditions.cycle === 'last3Month'" key="last3Month">
                    <Row type="flex" class="loading-wrap" style="min-height: 450px" justify="space-between">
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last3MonthLoading" :bind-id="last3MonthOrderId" :type="chartType.order" :legend="orderLegend" :o-data="last3MonthShowData" :x-data="last3MonthXdata" :y-data="orderYdata"></chart>                            
                        </Col>
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last3MonthLoading" :bind-id="last3MonthRateId" :type="chartType.rate" :legend="rateLegend" :o-data="last3MonthShowData" :x-data="last3MonthXdata" :y-data="rateYdata"></chart>                            
                        </Col>
                        <Spin fix v-if="last3MonthLoading"></Spin>                            
                    </Row>
                </div>
                <!-- <div v-if="chartCycleConditions.cycle === 'last1Month'" key="last1Month">
                    <Row type="flex" class="loading-wrap" style="min-height: 450px" justify="space-between">
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last1MonthLoading" :bind-id="last1MonthOrderId" :type="chartType.order" :legend="orderLegend" :o-data="last1MonthShowData" :x-data="last1MonthXdata" :y-data="orderYdata" :need-slide="true"></chart>                                                        
                        </Col>
                        <Col :lg="12" :sm="24" :xs="24">
                            <chart v-if="!last1MonthLoading" :bind-id="last1MonthRateId" :type="chartType.rate" :legend="rateLegend" :o-data="last1MonthShowData" :x-data="last1MonthXdata" :y-data="rateYdata" :need-slide="true"></chart>                                                        
                        </Col>
                        <Spin fix v-if="last1MonthLoading"></Spin>
                    </Row>
                </div> -->
            </Card>
        </div>
        <div v-permission="Permissions['PlatformSkuStatistics']" class="show-area" v-else key="table">
            <Card class="margin-bottom-10" shadow>
                <p slot="title">最近三年</p>
                <div class="loading-wrap">
                    <Table :columns="last3YearsTableColumns" :data="last3YearsShowData"></Table>
                </div>
            </Card>
            <Card class="margin-bottom-10" shadow>
                <p slot="title">最近一年</p>
                <div class="loading-wrap">
                    <Table :columns="last1YearsTableColumns" :data="last1YearsShowData"></Table>
                    <Spin fix v-if="last1YearsLoading"></Spin>
                </div>
            </Card>
            <Card class="margin-bottom-10" shadow>
                <p slot="title">最近三个月</p>
                <div class="loading-wrap">
                    <Table :columns="last3MonthTableColumns" :data="last3MonthShowData"></Table>
                    <Spin fix v-if="last3MonthLoading"></Spin>
                </div>
            </Card>
            <!-- <Card class="margin-bottom-10" shadow>
                <p slot="title">最近一个月</p>
                <div class="loading-wrap">
                    <Table :columns="last1MonthTableColumns" :data="last1MonthTableDataSliced"></Table>
                    <div style="padding: 20px 0; overflow: hidden;">
                        <div style="float:right">
                            <Page :total="last1MonthShowData.length" size="small" show-total @on-change="changePage"></Page>
                        </div>
                    </div>
                    <Spin fix v-if="last1MonthLoading"></Spin>
                </div>
            </Card> -->
            </Row>
        </div>
    </div>
</template>

<script>
import util from '@/libs/util.js';
import chart from './components/chart';
import qs from 'qs';
import Permissions from '../../../static/permissions.json';
import { mapState } from 'vuex';
import md5 from 'md5';

export default {
    data () {
        const validateIsInteger = (rule, value, callback) => {
            value = parseInt(value);
            if (!Number.isInteger(value)) {
                callback(new Error('请输入整数格式额度'));
            } else {
                if (value <= 0) {
                    callback(new Error('额度请大于0'));
                } else {
                    callback();
                }
            }
        };
        return {
            Permissions: Permissions,
            handleType: '', // 处理类型，判断按钮类别
            query: {}, // 页面param参数
            total: '', // 评估总分
            type: '', // 系数调整
            applyLimit: '', // 申请额度
            creditLimit: '', // 申请额度
            creditStatus: null,
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
                    },
                    {
                        validator: validateIsInteger
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
            frozenForm: {
                reason: '',
                password: ''
            },
            frozenRules: {
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
            frozenLoading: true,
            filterConditions: { // 筛选展示类型表格
                type: 'table', // chart图表，table表格
                creditShop: [], // 授信店铺
                oldCreditShop: [], // 授信店铺
                dataArr: []
            },
            chartCycleConditions: { // 图表展示周期选择
                cycle: 'last3Years' // 默认为最近三年
            },
            shopList: [], // 获取的所有商铺列表
            chartType: { // 图表展示类型
                order: 'order',
                rate: 'rate'
            },
            orderLegend: ['平均订单金额', '订单总额', '订单总数'],
            rateLegend: ['差评总数', '好评总数', 'DSR'],
            orderYdata: ['平均订单金额', '订单总额', '订单总数'],
            rateYdata: ['差评总数', '好评总数', 'DSR'],
            last3YearsTableColumns: [ // 最近三年表头
                {
                    title: '时间周期',
                    sortable: true,
                    key: 'Year',
                    render: (h, params) => {
                        let year = params.row.Year;
                        return h('span', `${year + 1}年-${year}年`);
                    }
                },
                {
                    title: '订单总额',
                    sortable: true,
                    key: 'Amount',
                    render: (h, params) => {
                        let amount = params.row.Amount;
                        let currency = params.row.Currency;
                        switch (currency) {
                            case 'USD':
                                currency = '$';
                                break;
                            case 'CNY':
                                currency = '￥';
                                break;
                            default:
                                break;
                        }
                        return h('span', `${currency}${amount}`);
                    }
                },
                {
                    title: '平均订单总额',
                    sortable: true,
                    key: 'AvgAmount',
                    render: (h, params) => {
                        let avgAmount = params.row.AvgAmount;
                        let currency = params.row.Currency;
                        switch (currency) {
                            case 'USD':
                                currency = '$';
                                break;
                            case 'CNY':
                                currency = '￥';
                                break;
                            default:
                                break;
                        }
                        return h('span', `${currency}${avgAmount}`);
                    }
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
            last1YearsTableColumns: [ // 最近一年表头
                {
                    title: '时间周期',
                    sortable: true,
                    key: 'TimeType',
                    render: (h, params) => {
                        let type = params.row.TimeType;
                        let year = params.row.Year;
                        switch (type) {
                            case 1:
                                return h('span', `${year}年第${type}季度`);
                                break;
                            case 2:
                                return h('span', `${year}年第${type}季度`);
                                break;
                            case 3:
                                return h('span', `${year}年第${type}季度`);
                                break;
                            case 4:
                                return h('span', `${year}年第${type}季度`);
                                break;
                            default:
                                return h('span', `${year}年第${type}季度`);
                                break;
                        }
                    }
                },
                {
                    title: '订单总额',
                    sortable: true,
                    key: 'Amount',
                    render: (h, params) => {
                        let amount = params.row.Amount;
                        let currency = params.row.Currency;
                        switch (currency) {
                            case 'USD':
                                currency = '$';
                                break;
                            case 'CNY':
                                currency = '￥';
                                break;
                            default:
                                break;
                        }
                        return h('span', `${currency}${amount}`);
                    }
                },
                {
                    title: '平均订单总额',
                    sortable: true,
                    key: 'AvgAmount',
                    render: (h, params) => {
                        let avgAmount = params.row.AvgAmount;
                        let currency = params.row.Currency;
                        switch (currency) {
                            case 'USD':
                                currency = '$';
                                break;
                            case 'CNY':
                                currency = '￥';
                                break;
                            default:
                                break;
                        }
                        return h('span', `${currency}${avgAmount}`);
                    }
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
            last3MonthTableColumns: [ // 最近三月表头
                {
                    title: '时间周期',
                    sortable: true,
                    key: 'Month',
                    render: (h, params) => {
                        let month = params.row.Month;
                        let year = params.row.Year;
                        return h('span', `${year}年${month}月`);
                    }
                },
                {
                    title: '订单总额',
                    sortable: true,
                    key: 'Amount',
                    render: (h, params) => {
                        let amount = params.row.Amount;
                        let currency = params.row.Currency;
                        switch (currency) {
                            case 'USD':
                                currency = '$';
                                break;
                            case 'CNY':
                                currency = '￥';
                                break;
                            default:
                                break;
                        }
                        return h('span', `${currency}${amount}`);
                    }
                },
                {
                    title: '平均订单总额',
                    sortable: true,
                    key: 'AvgAmount',
                    render: (h, params) => {
                        let avgAmount = params.row.AvgAmount;
                        let currency = params.row.Currency;
                        switch (currency) {
                            case 'USD':
                                currency = '$';
                                break;
                            case 'CNY':
                                currency = '￥';
                                break;
                            default:
                                break;
                        }
                        return h('span', `${currency}${avgAmount}`);
                    }
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
            last1MonthTableColumns: [ // 最近一月表头
                {
                    title: '时间周期',
                    sortable: true,
                    key: 'Day',
                    render: (h, params) => {
                        let day = params.row.Day;
                        let month = params.row.Month;
                        return h('span', `${month}月${day}日`);
                    }
                },
                {
                    title: '订单总额',
                    sortable: true,
                    key: 'Amount',
                    render: (h, params) => {
                        let amount = params.row.Amount;
                        let currency = params.row.Currency;
                        switch (currency) {
                            case 'USD':
                                currency = '$';
                                break;
                            case 'CNY':
                                currency = '￥';
                                break;
                            default:
                                break;
                        }
                        return h('span', `${currency}${amount}`);
                    }
                },
                {
                    title: '平均订单总额',
                    sortable: true,
                    key: 'AvgAmount',
                    render: (h, params) => {
                        let avgAmount = params.row.AvgAmount;
                        let currency = params.row.Currency;
                        switch (currency) {
                            case 'USD':
                                currency = '$';
                                break;
                            case 'CNY':
                                currency = '￥';
                                break;
                            default:
                                break;
                        }
                        return h('span', `${currency}${avgAmount}`);
                    }
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
            last36MonthTableData: [],
            nowShopArrCopy: [], // 相当于nowShopArr
            last36MonthCount: 0,
            last1MonthCount: 0
        };
    },
    computed: {
        last3YearsShowData () {
            let dataComputed = [];
            let copy = this.last36MonthTableData;
            let last3Years = this.tranferTo3Year(copy, 3);
            last3Years.forEach(item => {
                if (item.Amount !== 0 && item.Total !== 0) {
                    dataComputed.push(item);
                }
            });
            dataComputed.forEach(item => {
                item.Amount = parseFloat(item.Amount.toFixed(2));
                item.DSRScore = parseFloat(item.DSRScore.toFixed(2));
                item.AvgAmount = parseFloat(item.AvgAmount.toFixed(2));
            });
            return dataComputed;
        },
        last1YearsShowData () {
            let dataComputed = [];
            let data = this.last36MonthTableData.slice(0, 12);
            let nowYear = new Date().getFullYear();
            let nowMonth = new Date().getMonth() + 1;
            let left = nowMonth % 3;
            let monthReduce;
            left === 0 ? monthReduce = 3 : monthReduce = left;
            data.forEach((item, index) => {
                let dataMonth = item.Month;
                if (item.Year === nowYear && dataMonth > nowMonth - monthReduce) {
                    data.splice(index, 1);
                }
            });
            let map1Year = [];
            let last1Years = [];
            for (let i = 0; i < 4; i++) {
                map1Year.push([]);
            }
            data.forEach((item, index) => {
                let dataMonth = item.Month;
                if (dataMonth >= 1 && dataMonth <= 3) {
                    map1Year[0].push(item);
                }
                if (dataMonth >= 4 && dataMonth <= 6) {
                    map1Year[1].push(item);
                }
                if (dataMonth >= 7 && dataMonth <= 9) {
                    map1Year[2].push(item);
                }
                if (dataMonth >= 10 && dataMonth <= 12) {
                    map1Year[3].push(item);
                }
            });
            map1Year.forEach((item, index) => {
                let BadCommentCount = 0;
                let DSRScore = 0;
                let GoodCommentCount = 0;
                let Amount = 0;
                let Total = 0;
                let AvgAmount = 0;
                let AccountId, Currency, Day, Month, PlatformType, TimeType, UserId, Year;
                let length = item.length;
                if (length > 0) {
                    item.forEach((v, i) => {
                        BadCommentCount += v.BadCommentCount;
                        DSRScore += v.DSRScore;
                        GoodCommentCount += v.GoodCommentCount;
                        Amount += v.Amount;
                        Total += v.Total;
                        AvgAmount += v.AvgAmount;
                        AccountId = v.AccountId;
                        Currency = v.Currency;
                        Day = v.Day;
                        Month = v.Month;
                        PlatformType = v.PlatformType;
                        TimeType = index + 1;
                        UserId = v.UserId;
                        Year = v.Year;
                    });
                    last1Years.push({
                        AccountId: AccountId,
                        BadCommentCount: BadCommentCount,
                        Currency: Currency,
                        Day: Day,
                        DSRScore: DSRScore / length,
                        GoodCommentCount: GoodCommentCount,
                        Month: Month,
                        PlatformType: PlatformType,
                        TimeType: TimeType,
                        UserId: UserId,
                        Amount: Amount,
                        Total: Total,
                        AvgAmount: Amount / Total,
                        Year: Year
                    });
                }
            });
            last1Years = last1Years.reverse();
            last1Years.forEach(item => {
                if (item.Amount !== 0 && item.Total !== 0) {
                    dataComputed.push(item);
                }
            });
            dataComputed.forEach(item => {
                item.Amount = parseFloat(item.Amount.toFixed(2));
                item.AvgAmount = parseFloat(item.AvgAmount.toFixed(2));
                item.DSRScore = parseFloat(item.DSRScore.toFixed(2));
            });
            return dataComputed;
        },
        last3MonthShowData () {
            let dataComputed = [];
            this.last36MonthTableData.forEach(item => {
                if (item.Amount !== 0 && item.Total !== 0) {
                    dataComputed.push(item);
                }
            });
            dataComputed.forEach(item => {
                item.Amount = parseFloat(item.Amount.toFixed(2));
                item.DSRScore = parseFloat(item.DSRScore.toFixed(2));
                item.AvgAmount = parseFloat(item.AvgAmount.toFixed(2));
            });
            return dataComputed.slice(1, 4);
        },
        // last1MonthShowData () {
        //     let dataComputed = [];
        //     this.last1MonthTableData.forEach(item => {
        //         if (item.Amount !== 0 && item.Total !== 0) {
        //             dataComputed.push(item);
        //         }
        //     });
        //     dataComputed.forEach(item => {
        //         item.Amount = parseFloat(item.Amount.toFixed(2));
        //         item.DSRScore = parseFloat(item.DSRScore.toFixed(2));
        //         item.AvgAmount = parseFloat(item.AvgAmount.toFixed(2));
        //     });
        //     this.last1MonthTableDataSliced = dataComputed.slice(0, 10);
        //     return dataComputed;
        // },
        last3YearsXdata () {
            const data = [];
            let temp = this.last3YearsShowData;
            for (let i = 0, len = temp.length; i < len; i++) {
                data.push(`${temp[i].Year + 1}年-${temp[i].Year}年`);
            }
            return data;
        },
        last1YearsXdata () {
            const data = [];
            let temp = this.last1YearsShowData;
            for (let i = 0, len = temp.length; i < len; i++) {
                data.push(`${temp[i].Year}年${temp[i].TimeType}季度`);
            }
            return data;
        },
        last3MonthXdata () {
            const data = [];
            let temp = this.last3MonthShowData;
            for (let i = 0, len = temp.length; i < len; i++) {
                data.push(`${temp[i].Year}年${temp[i].Month}月`);
            }
            return data;
        },
        // last1MonthXdata () {
        //     const data = [];
        //     let temp = this.last1MonthShowData;
        //     for (let i = 0, len = temp.length; i < len; i++) {
        //         data.push(`${temp[i].Month}月${temp[i].Day}日`);
        //     }
        //     return data;
        // },
        ...mapState({
            purchaseHandleDataCached: state => state.app.purchaseHandleDataCached
        })
    },
    components: {
        chart
    },
    created () {
        this.init();
    },
    methods: {
        // 初始化
        init () {
            this.query = this.$route.query;
            this.fetchCredit().then(() => {
                this.handleCommit().then(() => {
                    this.handleCycleCharts(this.chartCycleConditions.cycle);
                });
            });
        },
        // 展示类型切换
        showTypeChange (value) {
            this.handleCycleCharts(this.chartCycleConditions.cycle);
        },
        // 处理店铺条件筛选提交
        handleCommit () {
            return new Promise((resolve, reject) => {
                let conditions = this.filterConditions;
                let shopList = this.shopList;
                let oldCreditShop = conditions.oldCreditShop;
                let oSet = new Set(oldCreditShop);
                let nSet = new Set(conditions.creditShop);
                let difference = Array.from(new Set(oldCreditShop.concat(conditions.creditShop).filter(item => !oSet.has(item) || !nSet.has(item))));
                let inter = Array.from(new Set(oldCreditShop.filter(item => nSet.has(item))));
                let nowShopArr = [];
                if (difference.length !== 0) {
                    conditions.creditShop.forEach((item) => {
                        shopList.forEach((value, index) => {
                            if (item === value.value) {
                                nowShopArr.push({
                                    okbUserId: value.accountId,
                                    okbAccountId: value.value,
                                    platformType: value.type,
                                    sku: value.sku,
                                    index: index,
                                    name: value.label
                                });
                            }
                        });
                    });
                    let task = this.fetchData(nowShopArr);
                    Promise.all(task).then(() => {
                        this.last36MonthCount = 0;
                        // this.last1MonthCount = 0;
                        this.nowShopArrCopy = JSON.parse(JSON.stringify(nowShopArr));
                        resolve();
                    });
                    this.filterConditions.oldCreditShop = JSON.parse(JSON.stringify(conditions.creditShop));
                }
            });
        },
        fetchCredit () {
            return new Promise((resolve, reject) => {
                let id = this.query.id;
                util.ajax.get(`api/Credit?id=${id}`).then(res => {
                    if (res.data.status === 1) {
                        let data = res.data.data;
                        this.applyLimit = data.ApplyAmount;
                        if (data.CreditAmount) {
                            this.creditLimit = data.CreditAmount;
                        }
                        this.type = data.Type;
                        this.creditStatus = data.Status;
                        let shopData = data.Data.Skus;
                        let len = shopData.length;
                        shopData.forEach(item => {
                            this.shopList.push({
                                value: item.OKBAccountId,
                                label: item.Name,
                                accountId: data.OKBUserId,
                                type: item.PlatformType,
                                sku: item.Sku
                            });
                        });
                        for (let i = 0; i < this.shopList.length; i++) {
                            this.filterConditions.creditShop.push(this.shopList[i].value);
                        }
                        this.$store.commit('initPurchaseHandleDataCached', len);
                        // this.$watch('filterConditions.creditShop', this.shopChangeHandler);
                        resolve(data);
                    } else {
                        reject(res.data);
                    }
                });
                util.ajax.get(`api/CreditAssess?creditId=${id}`).then(res => {
                    if (res.data.status === 1) {
                        let data = res.data.data;
                        this.total = data.Score;
                    }
                });
            });
        },
        fetchData (nowShopArr) {
            let p1 = this.fetch36MonthData(nowShopArr, 'last36Month');
            // let p2 = this.fetch1MonthData(nowShopArr, 'last1Month');
            p1.then(() => {
                this.last3YearsLoading = true;

                setTimeout(() => {
                    this.last3YearsLoading = false;
                }, 0);

                this.last1YearsLoading = true;

                setTimeout(() => {
                    this.last1YearsLoading = false;
                }, 0);

                this.last3MonthLoading = true;
                
                setTimeout(() => {
                    this.last3MonthLoading = false;
                }, 0);

                this.showOrderData(nowShopArr, 'last36Month');
            });
            // p2.then(() => {
            //     this.last1MonthLoading = true;

            //     setTimeout(() => {
            //         this.last1MonthLoading = false;
            //     }, 0);

            //     this.showOrderData(nowShopArr, 'last1Month');
            // });
            return [p1];
        },
        fetch36MonthData (value, name) {
            return new Promise((resolve, reject) => {
                let purchaseHandleDataCached = this.purchaseHandleDataCached;
                purchaseHandleDataCached[name].forEach((item, num) => {
                    value.forEach((v, i) => {
                        if (item.length === 0 && num === v.index) {
                            let params = qs.stringify({
                                okbUserId: v.okbUserId,
                                sku: v.sku,
                                okbAccountId: v.okbAccountId,
                                platformType: v.platformType,
                                timeType: 2,
                                limit: 36
                            });
                            util.ajax.get('api/PlatformOrderStatistics?' + params).then(res => {
                                if (res.data.status === 1) {
                                    let data = res.data.data;
                                    this.$store.commit('setPurchaseHandleDataCached', {
                                        data: data,
                                        index: v.index,
                                        name: name
                                    });
                                    this.last36MonthCount++;
                                    if (this.last36MonthCount >= value.length) {
                                        resolve();
                                    }
                                } else {
                                    this.last3YearsLoading = false;
                                    this.last1YearsLoading = false;
                                    this.last3MonthLoading = false;
                                    reject(res);
                                }
                            }).catch(error => {
                                reject(error);
                            });
                        }
                        if (item.length > 0 && num === v.index) {
                            this.last36MonthCount++;
                            if (this.last36MonthCount >= value.length) {
                                resolve();
                            }
                        }
                    });
                });
            });
        },
        // fetch1MonthData (value, name) {
        //     return new Promise((resolve, reject) => {
        //         let purchaseHandleDataCached = this.purchaseHandleDataCached;
        //         purchaseHandleDataCached[name].forEach((item, num) => {
        //             value.forEach((v, i) => {
        //                 if (item.length === 0 && num === v.index) {
        //                     let params = qs.stringify({
        //                         okbUserId: v.okbUserId,
        //                         okbAccountId: v.okbAccountId,
        //                         platformType: v.platformType,
        //                         timeType: 3,
        //                         limit: 30
        //                     });
        //                     util.ajax.get('api/PlatformOrderStatistics?' + params).then(res => {
        //                         if (res.data.status === 1) {
        //                             let data = res.data.data;
        //                             this.$store.commit('setPurchaseHandleDataCached', {
        //                                 data: data,
        //                                 index: v.index,
        //                                 name: name
        //                             });
        //                             this.last1MonthCount++;
        //                             if (this.last1MonthCount >= value.length) {
        //                                 resolve();
        //                             }
        //                         } else {
        //                             this.last1MonthLoading = false;
        //                             reject(res);
        //                         }
        //                     }).catch(error => {
        //                         reject(error);
        //                     });
        //                 }
        //                 if (item.length > 0 && num === v.index) {
        //                     this.last1MonthCount++;
        //                     if (this.last1MonthCount >= value.length) {
        //                         resolve();
        //                     }
        //                 }
        //             });
        //         });
        //     });
        // },
        showOrderData (nowShopArr, name) {
            let iLength = nowShopArr.length;
            if (iLength === 1) {
                this[`${name}TableData`] = JSON.parse(JSON.stringify(this.purchaseHandleDataCached[name][nowShopArr[0].index]));
            } else {
                this[`${name}TableData`] = JSON.parse(JSON.stringify(this.purchaseHandleDataCached[name][nowShopArr[0].index]));
                let dLength = this[`${name}TableData`].length;
                let purchaseHandleDataCached = JSON.parse(JSON.stringify(this.purchaseHandleDataCached));
                let temp = [];
                for (let i = 0; i < dLength; i++) {
                    temp.push({
                        BadCommentCount: 0,
                        DSRScore: 0,
                        GoodCommentCount: 0,
                        Amount: 0,
                        Total: 0,
                        AvgAmount: 0
                    });
                }
                nowShopArr.forEach((value, i) => {
                    if (purchaseHandleDataCached[name][value.index].length !== 0) {
                        temp.forEach((item, num) => {
                            temp[num].BadCommentCount += purchaseHandleDataCached[name][value.index][num].BadCommentCount;
                            temp[num].GoodCommentCount += purchaseHandleDataCached[name][value.index][num].GoodCommentCount;
                            temp[num].Amount += purchaseHandleDataCached[name][value.index][num].Amount;
                            temp[num].Total += purchaseHandleDataCached[name][value.index][num].Total;
                            temp[num].DSRScore += purchaseHandleDataCached[name][value.index][num].DSRScore;
                            temp[num].AvgAmount += purchaseHandleDataCached[name][value.index][num].AvgAmount;
                        });
                    }
                });
                this[`${name}TableData`].forEach((item, i) => {
                    item.BadCommentCount = temp[i].BadCommentCount;
                    item.GoodCommentCount = temp[i].GoodCommentCount;
                    item.Amount = temp[i].Amount;
                    item.Total = temp[i].Total;
                    item.DSRScore = temp[i].DSRScore / iLength;
                    item.AvgAmount = temp[i].AvgAmount / iLength;
                });
            }
        },
        // 周期转化方法
        tranferTo3Year (target) {
            let n = 12;
            let arr = JSON.parse(JSON.stringify(target));
            let map = [];
            let dest = [];
            let nowYear = new Date().getFullYear();
            let count = 0;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].Year === nowYear) {
                    count++;
                }
            }
            for (let i = 0; i < 12 - count; i++) {
                arr.unshift({
                    Amount: 0,
                    AvgAmount: 0,
                    BadCommentCount: 0,
                    Currency: 'USD',
                    GoodCommentCount: 0,
                    Total: 0,
                    DSRScore: 100,
                    Year: nowYear
                });
            }
            for (let i = 0; i < arr.length; i += n) {
                map.push(arr.slice(i, i + n));
            }
            map.forEach((item, index) => {
                let Amount = 0;
                let Total = 0;
                let AvgAmount = 0;
                let GoodCommentCount = 0;
                let BadCommentCount = 0;
                let DSRScore = 0;
                let avail = 0;
                let Currency;
                item.forEach(i => {
                    if (i.Amount !== 0 && i.Total !== 0) {
                        avail++;
                        Amount += i.Amount;
                        Total += i.Total;
                        GoodCommentCount += i.GoodCommentCount;
                        BadCommentCount += i.BadCommentCount;
                        AvgAmount += i.AvgAmount;
                        DSRScore += i.DSRScore;
                        Currency = i.Currency;
                    }
                });
                dest[index] = {};
                dest[index].Amount = Amount;
                dest[index].Total = Total;
                dest[index].GoodCommentCount = GoodCommentCount;
                dest[index].BadCommentCount = BadCommentCount;
                dest[index].AvgAmount = dest[index].Amount / dest[index].Total;
                if (index === 0) {
                    dest[index].DSRScore = DSRScore / count;
                } else {
                    if (avail === 0) {
                        avail = 1;
                    }
                    dest[index].DSRScore = DSRScore / avail;
                }
                dest[index].Currency = 'USD';
                dest[index].Year = item[0].Year;
            });
            return dest;
        },
        // 展示周期切换
        chartCycleChange (value) {
            this.handleCycleCharts(value);
        },
        // 销售类型切换
        chartSaleChange (value) {
            this.handleSaleCharts(value);
        },
        // 处理展示周期echarts数据
        handleCycleCharts (type) {
            this.$nextTick(() => {
                this[`${type}Loading`] = false;
            });
        },
        // 表格分页切换
        // changePage (page) {
        //     this.last1MonthTableDataSliced = this.last1MonthShowData.slice((page - 1) * 10, page * 10);
        // },
        // 确认授信
        confirmOk () {
            this.$refs['confirmForm'].validate(valid => {
                if (valid) {
                    const confirmForm = this.confirmForm;
                    const Id = this.query.id;
                    const Timestamp = (new Date()).getTime();
                    const temp = md5(confirmForm.password + 'OBD').toUpperCase();
                    const encode = md5(temp + Timestamp).toUpperCase();
                    util.ajax.put('api/Credit', {
                        Id: Id, // 授信编号Id
                        Value: confirmForm.limit, // 授信额度
                        Timestamp: Timestamp, // 时间戳
                        Type: 2, // 授信额度2，更新状态3
                        Sign: encode // 密码
                    }).then(res => {
                        if (res.data.status === 1) {
                            this.creditLimit = confirmForm.limit;
                            this.$Message.success('操作成功');
                            this.creditStatus = 2;
                            this.$refs['confirmForm'].resetFields();
                            this.baseOperate.confirm = false;
                        } else {
                            if (res.data.msg) {
                                this.$Message.error(res.data.msg);
                            } else {
                                this.$Message.error('操作失败');
                            }
                            this.confirmLoading = false;
                            setTimeout(() => {
                                this.confirmLoading = true;
                            }, 0);
                        }
                    }).catch(() => {
                        this.confirmLoading = false;
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
                    const refuseForm = this.refuseForm;
                    const Id = this.query.id;
                    const Remark = refuseForm.reason;
                    const Timestamp = (new Date()).getTime();
                    const temp = md5(refuseForm.password + 'OBD').toUpperCase();
                    const encode = md5(temp + Timestamp).toUpperCase();
                    util.ajax.put('api/Credit', {
                        Id: Id, // 授信编号Id
                        Remark: Remark,
                        Value: 3, // 授信额度
                        Timestamp: Timestamp, // 时间戳
                        Type: 3, // 授信额度2，更新状态3
                        Sign: encode // 密码
                    }).then(res => {
                        if (res.data.status === 1) {
                            this.$Message.success('操作成功');
                            this.$refs['refuseForm'].resetFields();
                            this.creditStatus = 3;
                            this.baseOperate.refuse = false;
                        } else {
                            if (res.data.msg) {
                                this.$Message.error(res.data.msg);
                            } else {
                                this.$Message.error('操作失败');
                            }
                            this.refuseLoading = false;
                            setTimeout(() => {
                                this.refuseLoading = true;
                            }, 0);
                        }
                    }).catch(() => {
                        this.refuseLoading = false;
                        setTimeout(() => {
                            this.refuseLoading = true;
                        }, 0);
                    });
                } else {
                    this.frozenLoading = false;
                    setTimeout(() => {
                        this.frozenLoading = true;
                    }, 0);
                }
            });
        },
        refuseCancel () {
            this.refuseLoading = true;
            this.$refs['refuseForm'].resetFields();
        },
        // 冻结授信
        frozenOk () {
            this.$refs['frozenForm'].validate(valid => {
                if (valid) {
                    const frozenForm = this.frozenForm;
                    const Remark = frozenForm.reason;
                    const Id = this.query.id;
                    const Timestamp = (new Date()).getTime();
                    const temp = md5(frozenForm.password + 'OBD').toUpperCase();
                    const encode = md5(temp + Timestamp).toUpperCase();
                    util.ajax.put('api/Credit', {
                        Id: Id, // 授信编号Id
                        Value: 4, // 授信额度
                        Remark: Remark,
                        Timestamp: Timestamp, // 时间戳
                        Type: 3, // 授信额度2，更新状态3
                        Sign: encode // 密码
                    }).then(res => {
                        if (res.data.status === 1) {
                            this.$Message.success('操作成功');
                            this.$refs['frozenForm'].resetFields();
                            this.creditStatus = 4;
                            this.baseOperate.frozen = false;
                        } else {
                            if (res.data.msg) {
                                this.$Message.error(res.data.msg);
                            } else {
                                this.$Message.error('操作失败');
                            }
                            this.frozenLoading = false;
                            setTimeout(() => {
                                this.frozenLoading = true;
                            }, 0);
                        }
                    }).catch(() => {
                        this.frozenLoading = false;
                        setTimeout(() => {
                            this.frozenLoading = true;
                        }, 0);
                    });
                } else {
                    this.frozenLoading = false;
                    setTimeout(() => {
                        this.frozenLoading = true;
                    }, 0);
                }
            });
        },
        frozenCancel () {
            this.frozenLoading = true;
            this.$refs['frozenForm'].resetFields();
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
            return '$' + value;
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
