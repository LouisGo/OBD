<template>
    <div>
        <Card shadow>
            <p slot="title">
                <Icon type="ios-list"></Icon>
                授信列表
            </p>
            <Row @keyup.enter.native="handleSearch">
                <Input v-model="searchVal" placeholder="请输入对应的授信编号" style="width: 300px"/>
                <span @click="handleSearch" style="margin: 0 10px;">
                    <Button type="primary">
                        搜索
                    </Button>
                </span>
            </Row>
            <Row style="position: relative; margin-top: 30px">
                <Table :columns="creditTableColumns" :data="creditTableData"></Table>
                <div style="padding: 30px 0; overflow: hidden;">
                    <div style="float:right">
                        <Page :total="creditPageSize" size="small" show-total @on-change="changePage"></Page>
                    </div>
                </div>
                <Spin fix v-if="loading"></Spin>
            </Row>
        </Card>
    </div>
</template>

<script>
import util from '@/libs/util.js';
import qs from 'qs';
import Permissions from '../../../static/permissions.json';

export default {
    data () {
        return {
            Permissions: Permissions,
            query: '',
            searchVal: '',
            creditTableData: [],
            creditPageIndex: 1,
            creditPageSize: 0,
            creditTableDataOrigin: [],
            creditTableDataTemp: [],
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
                                        console.log(params);
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
                                on: {
                                    click: () => {
                                        console.log(params.row);
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
            loading: true
        };
    },
    mounted () {
        this.init();
    },
    methods: {
        init () {
            this.query = this.$route.query;
            if (this.query.id) {
                this.fetchWarnData(this.query.id);
            } else {
                this.fetchData();
            }
        },
        fetchData () {
            let okbUserId = this.query.okbUserId;
            let params = qs.stringify({
                pageIndex: this.creditPageIndex,
                okbUserId: okbUserId ? okbUserId : ''
            });
            util.ajax.get(`api/Credit?${params}`).then(res => {
                if (res.data.status === 1) {
                    let data = res.data.data;
                    console.log(data);
                    this.creditTableData = data.Items;
                    this.creditTableDataTemp = data.Items;
                    this.creditPageSize = data.TotalItems;
                    this.loading = false;
                }
            }).catch(error => {
                console.log(error);
                this.loading = false;
            });
        },
        fetchWarnData (id) {
            let params = qs.stringify({
                pageIndex: this.creditPageIndex,
                okbUserId: id
            });
            util.ajax.get(`api/Credit?${params}`).then(res => {
                if (res.data.status === 1) {
                    let data = res.data.data;
                    console.log(data);
                    this.creditTableData = data.Items;
                    this.creditTableDataTemp = data.Items;
                    this.creditPageSize = data.TotalItems;
                    this.loading = false;
                }
            }).catch(error => {
                console.log(error);
                this.loading = false;
            });
        },
        handleSearch () {
            if (this.searchVal) {
                let filtered = this.creditTableDataTemp.filter(item => {
                    return item.Id.indexOf(this.searchVal) > -1;
                });
                this.creditTableData = filtered;
            } else {
                this.creditTableData = this.creditTableDataTemp;
            }
        },
        // demo method
        changePage (page) {
            this.creditPageIndex = page;
            this.fetchData();
        }
    }
};
</script>

<style>

</style>
