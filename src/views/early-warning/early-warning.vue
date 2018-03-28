<template>
    <div>
        <Card class="margin-bottom-10" shadow>
            <p slot="title">
                <Icon type="gear-b"></Icon>
                预警设置（当数据高于下方任何一条数据时进行预警提示）
            </p>
            <div style="position: relative; width: 440px; min-height: 420px; height: auto; margin: 5px 0 0 20px">
                <Tabs v-if="!loading" style="min-height: 500px">
                    <TabPane label="按年环比" name="name1">
                        <Form ref="yearSqt" :model="form[0]" :label-width="120">
                            <FormItem label="订单总额降幅">
                                <Select v-model="form[0].OrderAmountDecline" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="订单总数降幅">
                                <Select v-model="form[0].OrderCountDecline" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="单均金额降幅">
                                <Select v-model="form[0].OrderAmountAvgDecline" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="好评总数降幅">
                                <Select v-model="form[0].GoodCommentCountDecline" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="差评总数升幅">
                                <Select v-model="form[0].BadCommentCountRise" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="DSR评分降幅">
                                <Select v-model="form[0].DSRGradeDecline" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                        </Form>
                        <div style="margin-left: 120px" v-permission="Permissions['AlarmConfig_Put']">
                            <Button style="margin-right: 8px" @click.native="resetForm(0)">重置</Button>
                            <Button type="primary" @click.native="commitForm(0)">保存</Button>
                        </div>
                    </TabPane>
                    <TabPane label="按月环比" name="name2">
                        <Form ref="monthSqt" :model="form[1]" :label-width="120">
                            <FormItem label="订单总额降幅">
                                <Select v-model="form[1].OrderAmountDecline" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="订单总数降幅">
                                <Select v-model="form[1].OrderCountDecline" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="单均金额降幅">
                                <Select v-model="form[1].OrderAmountAvgDecline" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="好评总数降幅">
                                <Select v-model="form[1].GoodCommentCountDecline" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="差评总数升幅">
                                <Select v-model="form[1].BadCommentCountRise" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="DSR评分降幅">
                                <Select v-model="form[1].DSRGradeDecline" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                        </Form>
                        <div style="margin-left: 120px" v-permission="Permissions['AlarmConfig_Put']">
                            <Button style="margin-right: 8px" @click.native="resetForm(1)">重置</Button>
                            <Button type="primary" @click.native="commitForm(1)">保存</Button>
                        </div>
                    </TabPane>
                    <TabPane label="按月同比" name="name3">
                        <Form ref="monthComp" :model="form[2]" :label-width="120">
                            <FormItem label="订单总额降幅">
                                <Select v-model="form[2].OrderAmountDecline" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="订单总数降幅">
                                <Select v-model="form[2].OrderCountDecline" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="单均金额降幅">
                                <Select v-model="form[2].OrderAmountAvgDecline" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="好评总数降幅">
                                <Select v-model="form[2].GoodCommentCountDecline" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="差评总数升幅">
                                <Select v-model="form[2].BadCommentCountRise" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="DSR评分降幅">
                                <Select v-model="form[2].DSRGradeDecline" style="width: 320px">
                                    <Option v-for="(item, index) in selectList" :value="item.value" :key="index">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                        </Form>
                        <div style="margin-left: 120px" v-permission="Permissions['AlarmConfig_Put']">
                            <Button style="margin-right: 8px" @click.native="resetForm(2)">重置</Button>
                            <Button type="primary" @click.native="commitForm(2)">保存</Button>
                        </div>
                    </TabPane>
                </Tabs>
                <Spin fix v-if="loading"></Spin>        
            </div>
        </Card>
    </div>
</template>

<script>
import util from '@/libs/util.js';
import Permissions from '../../../static/permissions.json';

export default {
    data () {
        return {
            Permissions: Permissions,
            form: [],
            formCopy: [],
            selectList: [
                {
                    value: 0.05,
                    label: '5%'
                },
                {
                    value: 0.1,
                    label: '10%'
                },
                {
                    value: 0.15,
                    label: '15%'
                },
                {
                    value: 0.2,
                    label: '20%'
                }
            ],
            loading: true
        };
    },
    created () {
        this.init();
    },
    methods: {
        init () {
            this.fetchData().then(() => {
                this.loading = false;
            }).catch(() => {
                this.loading = false;
            });
        },
        fetchData () {
            return new Promise((resolve, reject) => {
                util.ajax.get('api/AlarmConfig').then(res => {
                    if (res.data.status === 1) {
                        let data = res.data.data;
                        data = data.sort(this.compare('AlarmType'));
                        data.forEach(item => {
                            this.form.push(item);
                            let copy = JSON.parse(JSON.stringify(item));
                            this.formCopy.push(copy);
                        });
                        resolve(data);
                    } else {
                        reject(res.data);
                    }
                }).catch(error => {
                    console.error(error);
                    reject(error);
                });
            });
        },
        compare (property) {
            return function (obj1, obj2) {
                let value1 = obj1[property];
                let value2 = obj2[property];
                return value1 - value2;
            };
        },
        resetForm (index) {
            let form = this.form[index];
            let formCopy = this.formCopy[index];
            for (let i in form) {
                form[i] = formCopy[i];
            }
        },
        commitForm (index) {
            let form = this.form[index];
            util.ajax.put('api/AlarmConfig', {
                AlarmType: index + 1,
                Id: form.Id,
                OrderAmountDecline: form.OrderAmountDecline,
                OrderCountDecline: form.OrderCountDecline,
                OrderAmountAvgDecline: form.OrderAmountAvgDecline,
                GoodCommentCountDecline: form.GoodCommentCountDecline,
                BadCommentCountRise: form.BadCommentCountRise,
                DSRGradeDecline: form.DSRGradeDecline
            }).then(res => {
                if (res.data.status === 1) {
                    this.$Message.success('保存成功');
                    this.formCopy = JSON.parse(JSON.stringify(this.form));
                } else {
                    this.$Message.error('保存失败');
                }
            });
        }
    }
};
</script>

<style>

</style>

