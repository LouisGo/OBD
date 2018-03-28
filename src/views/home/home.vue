<style lang="less">
    @import "../../styles/common.less";
</style>
<template>
    <div class="home-main">
        <Card v-permission="Permissions['AlarmStatistics']" class="margin-bottom-10" shadow>
            <p slot="title">
                <Icon type="android-warning"></Icon>
                数据预警
            </p>
            <Row style="position: relative; margin: 20px 0;">
                <Table :columns="warningColumns" :data="warningTableData"></Table>
                <Spin fix v-if="warningLoading"></Spin>
                <div style="padding: 20px 0; overflow: hidden;">
                    <div style="float:right">
                        <Page :total="warnPageSize" size="small" show-total @on-change="changeWarnPage"></Page>
                    </div>
                </div>
            </Row>
        </Card>
        <Card v-permission="Permissions['CreditList']" shadow>
            <p slot="title">
                <Icon type="ios-list"></Icon>
                授信处理
            </p>
            <Row style="position: relative; margin: 20px 0;">
                <Table :columns="creditTableColumns" :data="creditTableData"></Table>
                <Spin fix v-if="creditLoading"></Spin>
            </Row>
        </Card>
    </div>
</template>

<script>
import util from '@/libs/util.js';
import Permissions from '../../../static/permissions.json';
import qs from 'qs';

export default {
    data () {
        return {
            Permissions: Permissions,
            creditTableData: [],
            // demo method
            warningTableData: [],
            warningTableDataOrigin: [],
            warningColumns: [
                {
                    title: '用户',
                    key: 'OKBUserName'
                },
                {
                    title: '预警类型',
                    key: 'AlarmType',
                    render: (h, params) => {
                        let type = params.row.AlarmType;
                        let map = ['按年环比', '按月环比', '按月同比', '按年环比'];
                        return h('span', map[type - 1]);
                    }
                },
                {
                    title: '时间周期',
                    key: 'timeCycle',
                    render: (h, params) => {
                        let type = params.row.AlarmType;
                        let year = params.row.Year;
                        let month = params.row.Month;
                        let map = [`${year}年`, `${year}年${month}月`, `${year}年${month}月`, `${year}年`];
                        return h('span', map[type - 1]);
                    }
                },
                {
                    title: '订单总额波幅',
                    key: 'OrderAmountDecline',
                    render: (h, params) => {
                        let OrderAmountDecline = params.row.OrderAmountDecline;
                        let IsOrderAmountAlarm = params.row.IsOrderAmountAlarm;
                        let OrderAmountDeclineShow = (parseInt(OrderAmountDecline * 10000)) / 100 + '%';
                        if (IsOrderAmountAlarm) {
                            return h('span', {
                                style: {
                                    color: '#ed3f14'
                                }
                            }, OrderAmountDeclineShow);
                        } else {
                            if (OrderAmountDecline > 0) {
                                return h('span', {
                                    style: {
                                        color: '#19be6b'
                                    }
                                }, OrderAmountDeclineShow);
                            } else if (OrderAmountDecline < 0) {
                                return h('span', {
                                    style: {
                                        color: '#ff9900'
                                    }
                                }, OrderAmountDeclineShow);
                            } else {
                                return h('span', OrderAmountDeclineShow);
                            }
                        }
                    }
                },
                {
                    title: '订单总数波幅',
                    key: 'OrderCountDecline',
                    render: (h, params) => {
                        let OrderCountDecline = params.row.OrderCountDecline;
                        let IsOrderCountAlarm = params.row.IsOrderCountAlarm;
                        let OrderCountDeclineShow = (parseInt(OrderCountDecline * 10000)) / 100 + '%';
                        if (IsOrderCountAlarm) {
                            return h('span', {
                                style: {
                                    color: '#ed3f14'
                                }
                            }, OrderCountDeclineShow);
                        } else {
                            if (OrderCountDecline > 0) {
                                return h('span', {
                                    style: {
                                        color: '#19be6b'
                                    }
                                }, OrderCountDeclineShow);
                            } else if (OrderCountDecline < 0) {
                                return h('span', {
                                    style: {
                                        color: '#ff9900'
                                    }
                                }, OrderCountDeclineShow);
                            } else {
                                return h('span', OrderCountDeclineShow);
                            }
                        }
                    }
                },
                {
                    title: '单均金额波幅',
                    key: 'OrderAmountAvgDecline',
                    render: (h, params) => {
                        let OrderAmountAvgDecline = params.row.OrderAmountAvgDecline;
                        let IsOrderAmountAvgAlarm = params.row.IsOrderAmountAvgAlarm;
                        let OrderAmountAvgDeclineShow = (parseInt(OrderAmountAvgDecline * 10000)) / 100 + '%';
                        if (IsOrderAmountAvgAlarm) {
                            return h('span', {
                                style: {
                                    color: '#ed3f14'
                                }
                            }, OrderAmountAvgDeclineShow);
                        } else {
                            if (OrderAmountAvgDecline > 0) {
                                return h('span', {
                                    style: {
                                        color: '#19be6b'
                                    }
                                }, OrderAmountAvgDeclineShow);
                            } else if (OrderAmountAvgDecline < 0) {
                                return h('span', {
                                    style: {
                                        color: '#ff9900'
                                    }
                                }, OrderAmountAvgDeclineShow);
                            } else {
                                return h('span', OrderAmountAvgDeclineShow);
                            }
                        }
                    }
                },
                {
                    title: '好评总数波幅',
                    key: 'GoodCommentCountDecline',
                    render: (h, params) => {
                        let GoodCommentCountDecline = params.row.GoodCommentCountDecline;
                        let IsGoodCommentCountAlarm = params.row.IsGoodCommentCountAlarm;
                        let GoodCommentCountDeclineShow = (parseInt(GoodCommentCountDecline * 10000)) / 100 + '%';
                        if (IsGoodCommentCountAlarm) {
                            return h('span', {
                                style: {
                                    color: '#ed3f14'
                                }
                            }, GoodCommentCountDeclineShow);
                        } else {
                            if (GoodCommentCountDecline > 0) {
                                return h('span', {
                                    style: {
                                        color: '#19be6b'
                                    }
                                }, GoodCommentCountDeclineShow);
                            } else if (GoodCommentCountDecline < 0) {
                                return h('span', {
                                    style: {
                                        color: '#ff9900'
                                    }
                                }, GoodCommentCountDeclineShow);
                            } else {
                                return h('span', GoodCommentCountDeclineShow);
                            }
                        }
                    }
                },
                {
                    title: '差评总数波幅',
                    key: 'BadCommentCountRise',
                    render: (h, params) => {
                        let BadCommentCountRise = params.row.BadCommentCountRise;
                        let IsBadCommentCountAlarm = params.row.IsBadCommentCountAlarm;
                        let BadCommentCountRiseShow = (parseInt(BadCommentCountRise * 10000)) / 100 + '%';
                        if (IsBadCommentCountAlarm) {
                            return h('span', {
                                style: {
                                    color: '#ed3f14'
                                }
                            }, BadCommentCountRiseShow);
                        } else {
                            if (BadCommentCountRise > 0) {
                                return h('span', {
                                    style: {
                                        color: '#19be6b'
                                    }
                                }, BadCommentCountRiseShow);
                            } else if (BadCommentCountRise < 0) {
                                return h('span', {
                                    style: {
                                        color: '#ff9900'
                                    }
                                }, BadCommentCountRiseShow);
                            } else {
                                return h('span', BadCommentCountRiseShow);
                            }
                        }
                    }
                },
                {
                    title: 'DSR评分波幅',
                    key: 'DSRGradeDecline',
                    render: (h, params) => {
                        let DSRGradeDecline = params.row.DSRGradeDecline;
                        let IsDSRGradeAlarm = params.row.IsDSRGradeAlarm;
                        let DSRGradeDeclineShow = (parseInt(DSRGradeDecline * 10000)) / 100 + '%';
                        if (IsDSRGradeAlarm) {
                            return h('span', {
                                style: {
                                    color: '#ed3f14'
                                }
                            }, DSRGradeDeclineShow);
                        } else {
                            if (DSRGradeDecline > 0) {
                                return h('span', {
                                    style: {
                                        color: '#19be6b'
                                    }
                                }, DSRGradeDeclineShow);
                            } else if (DSRGradeDecline < 0) {
                                return h('span', {
                                    style: {
                                        color: '#ff9900'
                                    }
                                }, DSRGradeDeclineShow);
                            } else {
                                return h('span', DSRGradeDeclineShow);
                            }
                        }
                    }
                },
                {
                    title: '操作',
                    key: 'operate',
                    // demo method
                    render: (h, params) => {
                        return h('div', {
                            style: {
                                textAlign: 'left'
                            }
                        }, [
                            h('a', {
                                style: {
                                    marginRight: '10px'
                                },
                                directives: [
                                    {
                                        name: 'permission',
                                        value: Permissions['CreditList']
                                    }
                                ],
                                on: {
                                    click: () => {
                                        let query = {
                                            okbUserId: params.row.OKBUserId,
                                            type: 'warn'
                                        };
                                        this.$router.push({
                                            name: 'credit-list',
                                            query: query
                                        });
                                        util.title(params.row.shop);
                                    }
                                }
                            }, '查看')
                        ]);
                    }
                }
            ],
            warningLoading: true,
            // demo method
            creditTableColumns: [
                {
                    title: '授信编号',
                    sortable: true,
                    width: 320,
                    key: 'Id'
                },
                {
                    title: '授信类型',
                    key: 'Type',
                    render: (h, params) => {
                        let type = params.row.Type;
                        let map = ['主体授信', '代采授信'];
                        return h('span', map[type - 1]);
                    }
                },
                {
                    title: '授信状态',
                    key: 'Status',
                    render: (h, params) => {
                        let status = params.row.Status;
                        const statusMap = ['已申请', '已授信', '已拒绝', '已冻结'];
                        const colorsMap = ['#2d8cf0', '#19be6b', '#ed3f14', '#ff9900'];
                        return h('span', {
                            style: {
                                color: colorsMap[status - 1]
                            }
                        }, statusMap[status - 1]);
                    }
                },
                {
                    title: '申请额度',
                    sortable: true,
                    key: 'ApplyAmount',
                    render: (h, params) => {
                        return h('span', `$${params.row.ApplyAmount}`);
                    }
                },
                {
                    title: '授信额度',
                    sortable: true,
                    key: 'CreditAmount',
                    render: (h, params) => {
                        return h('span', `$${params.row.CreditAmount}`);
                    }
                },
                {
                    title: '操作',
                    key: 'operate',
                    render: (h, params) => {
                        let type = params.row.Type;
                        return h('div', {
                            style: {
                                textAlign: 'left'
                            }
                        }, [
                            h('a', {
                                style: {
                                    marginRight: '10px'
                                },
                                directives: [
                                    {
                                        name: 'permission',
                                        value: Permissions['CreditHandle']
                                    }
                                ],
                                on: {
                                    click: () => {
                                        let query = {
                                            id: params.row.Id
                                        };
                                        if (type === 1) {
                                            this.$router.push({
                                                name: 'main-handle',
                                                query: query
                                            });
                                        }
                                        if (type === 2) {
                                            this.$router.push({
                                                name: 'purchase-handle',
                                                query: query
                                            });
                                        }
                                        // util.title(params.row.shop);
                                    }
                                }
                            }, '查看'),
                            h('a', {
                                style: {
                                    marginRight: '10px'
                                },
                                directives: [
                                    {
                                        name: 'permission',
                                        value: Permissions['CreditHandle']
                                    }
                                ],
                                on: {
                                    click: () => {
                                        let query = {
                                            id: params.row.Id,
                                            type: 'handle'
                                        };
                                        if (type === 1) {
                                            this.$router.push({
                                                name: 'main-handle',
                                                query: query
                                            });
                                        }
                                        if (type === 2) {
                                            this.$router.push({
                                                name: 'purchase-handle',
                                                query: query
                                            });
                                        }
                                        // util.title(params.row.shop);
                                    }
                                }
                            }, '处理')
                        ]);
                    }
                }
            ],
            creditLoading: true,
            warnPageIndex: 0,
            warnPageSize: 0,
            creditPageIndex: 1,
            creditPageSize: 0
        };
    },
    created () {
        this.init();
    },
    methods: {
        init () {
            this.fetchWarnData();
            this.fetchCreditData();
        },
        fetchWarnData () {
            let params = qs.stringify({
                pageIndex: this.warnPageIndex
            });
            util.ajax.get(`api/AlarmStatistics?${params}`).then((res) => {
                if (res.data.status === 1) {
                    let data = res.data.data;
                    this.warningTableData = data.Items;
                    this.warnPageSize = data.TotalItems;
                    this.warningLoading = false;
                }
            }).catch(() => {
                this.warningLoading = false;
            });
        },
        fetchCreditData () {
            let params = qs.stringify({
                pageIndex: this.creditPageIndex
            });
            util.ajax.get(`api/Credit?${params}`).then(res => {
                if (res.data.status === 1) {
                    let data = res.data.data;
                    this.creditTableData = data.Items.slice(0, 10);
                    this.creditPageSize = data.TotalItems;
                    this.creditLoading = false;
                }
            }).catch(() => {
                this.creditLoading = false;
            });
        },
        // demo method
        changeWarnPage (page) {
            this.warnPageIndex = page;
            this.fetchWarnData();
        }
    }
};
</script>
