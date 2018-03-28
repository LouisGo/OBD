<template>
    <div>
        <Card shadow style="position: relative; width: 280px; float: left;">
            <p slot="title">
                部门结构
            </p>
            <!-- 暂无数据或者数据获取失败 -->
            <div v-if="departmentList.length === 0" class="no-data">
                暂无部门
            </div>
            <!-- 部门列表 -->
            <ul v-else class="department-list">
                <li v-for="(item, index) in departmentList" ref="test" >
                    <Row type="flex" justify="space-between" align="middle">
                        <Col>
                            <Input v-if="item.hasEdit && !item.toAdd" v-model.lazy="item.Name" :value="item.Name"  style="width: 160px; padding-left: 9px;" @keydown.native.esc="cancelDepartment(item, index)" @keydown.native.enter="editDepartment(item, index)"></Input>
                            <Input v-if="item.hasEdit && item.toAdd" v-model.lazy="item.Name" :value="item.Name"  style="width: 160px; padding-left: 9px;" @keydown.native.esc="cancelDepartment(item, index)" @keydown.native.enter="editDepartment(item, index, 'add')"></Input>
                            <Button v-if="!item.hasEdit" type="text" @click="showOccupation(index)" :class="currentDepartment === item.Name ? 'cur' : ''">{{ item.Name }}</Button>  
                        </Col>
                        <Col>
                            <a v-if="!item.hasEdit" v-permission="Permissions['Department_Put']" class="tools" @click="editInit(item)">
                                <Icon type="edit" size="12"></Icon>
                            </a>
                            <a v-if="item.hasEdit && !item.toAdd" class="tools" @click="editDepartment(item, index)">
                                <Icon type="checkmark" size="12"></Icon>
                                保存
                            </a>
                            <a v-if="item.hasEdit && item.toAdd" class="tools" @click="editDepartment(item, index, 'add')">
                                <Icon type="checkmark" size="12"></Icon>
                                添加
                            </a>
                            <a v-if="item.hasEdit && item.cancel" class="tools" @click="cancelDepartment(item, index)">
                                <Icon type="close" size="12"></Icon>
                                取消
                            </a>
                            <Poptip v-if="!item.cancel" v-permission="Permissions['Department_Delete']" confirm transfer title="确定要删除该部门吗？" @on-ok="deleteDepartmentOk(item, index)">
                                <a class="tools">
                                    <Icon type="android-delete" size="13"></Icon>
                                </a>
                            </Poptip>
                        </Col>
                    </Row>
                </li>
            </ul>
            <a v-permission="Permissions['Department_Post']" class="add-department" @click="addDepartment">
                <Icon type="plus-circled"></Icon>
                添加部门
            </a>
            <Spin fix v-if="loading"></Spin>
        </Card>
        <Card shadow style="position: relative; margin-left: 290px;">
            <p slot="title">
                部门职位
            </p>
            <div v-if="occupationList.length === 0" class="no-data" style="width: 490px">
                暂无职位
            </div>
            <!-- 职位列表 -->
            <ul v-else class="occupation-list">
                <li v-for="(item, index) in occupationList">
                    <Input v-if="!item.toAdd" v-model="item.Name" :value="item.Name" @on-focus="editInit(item)" style="width: 490px" @keydown.native.enter="editOccupation(item, index)" @keydown.native.esc="cancelOccupation(item, index)"></Input>
                    <Input v-if="item.toAdd" v-model="item.Name" :value="item.Name" @on-focus="editInit(item)" style="width: 490px" @keydown.native.enter="editOccupation(item, index, 'add')" @keydown.native.esc="cancelOccupation(item, index)"></Input>
                    <span>
                        <a v-permission="Permissions['Occupation_Put']" v-if="item.hasEdit && !item.toAdd" class="tools" @click="editOccupation(item, index)">
                            <Icon type="checkmark" size="12"></Icon>
                            保存
                        </a>
                        <a v-permission="Permissions['Occupation_Post']" v-if="item.hasEdit && item.toAdd" class="tools" @click="editOccupation(item, index, 'add')">
                            <Icon type="checkmark" size="12"></Icon>
                            添加
                        </a>
                        <a v-permission="Permissions['Occupation_Put']" v-if="item.hasEdit && item.cancel" class="tools" @click="cancelOccupation(item, index)">
                            <Icon type="close" size="12"></Icon>
                            取消
                        </a>
                        <Poptip v-permission="Permissions['Occupation_Delete']" v-if="!item.cancel" confirm transfer title="确定要删除该部门职位吗？" @on-ok="deleteOccupationtOk(item, index)">
                            <a class="tools">
                                <Icon type="android-delete" size="13"></Icon>
                            </a>
                        </Poptip>
                    </span>
                </li>
            </ul>
            <a v-permission="Permissions['Occupation_Post']" class="add-occupation" @click="addOccupation">
                <Icon type="plus-circled"></Icon>
                添加{{ currentDepartment }}职位
            </a>
            <Spin fix v-if="loading"></Spin>
        </Card>
    </div>
</template>

<script>
import util from '@/libs/util.js';
import Permissions from '../../../static/permissions.json';

export default {
    name: 'department-manage',
    data () {
        return {
            Permissions: Permissions,
            loading: true, // 加载状态，加载成功或失败后置为false
            departmentList: [], // 部门列表数据
            occupationList: [], // 职位列表数据
            currentDepartment: '' // 当前部门
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
            // 操作提示逻辑，首先判断localStorage里是否有不再显示flag
            // const departmentNoticeFlag = localStorage.getItem('departmentNoticeFlag');
            // // 没有则进行提醒
            // if (!departmentNoticeFlag) {
            //     this.$Notice.open({
            //         duration: 8, // 持续时间
            //         render: h => {
            //             return h('ul', [
            //                 h('li', {
            //                     style: {
            //                         margin: '2px 0 8px',
            //                         fontWeight: 'bold',
            //                         fontSize: '15px',
            //                         color: '#333'
            //                     }
            //                 }, [
            //                     '快捷操作提醒',
            //                     h('span', {
            //                         style: {
            //                             marginLeft: '15px',
            //                             fontSize: '12px',
            //                             fontWeight: 'normal',
            //                             color: '#999',
            //                             cursor: 'pointer'
            //                         },
            //                         on: {
            //                             click: () => {
            //                                 this.neverNotice();
            //                             }
            //                         }
            //                     }, '不再提醒')
            //                 ]),
            //                 h('li', {
            //                     style: {
            //                         lineHeight: '2'
            //                     }
            //                 }, [
            //                     h('strong', {
            //                         style: {
            //                             marginRight: '10px',
            //                             fontWeight: 'bold',
            //                             color: '#0084ff'
            //                         }
            //                     }, 'Esc(取消)'),
            //                     '取消当前选中的输入框'
            //                 ]),
            //                 h('li', {
            //                     style: {
            //                         lineHeight: '2'
            //                     }
            //                 }, [
            //                     h('strong', {
            //                         style: {
            //                             marginRight: '10px',
            //                             fontWeight: 'bold',
            //                             color: '#0084ff'
            //                         }
            //                     }, 'Enter(回车)'),
            //                     '保存当前选中的输入框所做的修改'
            //                 ])
            //             ]);
            //         }
            //     });
            // }
        },
        // 获取数据
        fetchData () {
            // 返回Promise状态
            return new Promise((resolve, reject) => {
                // 获取部门列表
                util.ajax.get('api/Department').then(res => {
                    if (res.data.status === 1) {
                        let data = res.data.data;
                        // 如果暂无数据，则先push一个空对象，方便后续操作
                        if (data.length === 0) {
                            data.push({});
                        }
                        data.forEach(item => {
                            this.$set(item, 'hasEdit', false); // 是否编辑标记
                            this.$set(item, 'toAdd', false); // 是否添加标记
                            this.$set(item, 'cancel', false); // 是否取消标记
                            this.$set(item, 'NameCache', item.Name); // 添加一个原始数据缓存值，方便回退
                            let occ = item.Occupations;
                            // 如果该部门不存在职位，增加一些默认值方便添加
                            if (!occ[0]) {
                                occ[0] = {};
                                occ[0].Id = item.Id;
                                occ[0].DepartmentId = item.Id;
                                occ[0].Name = '';
                                occ[0].NameCache = '';
                                occ[0].Remark = '';
                                occ[0].hasEdit = false;
                                occ[0].cancel = false;
                                occ[0].toAdd = true;
                            } else {
                                // 否则增加几个标记为
                                occ.forEach(i => {
                                    this.$set(i, 'hasEdit', false);
                                    this.$set(i, 'toAdd', false);
                                    this.$set(i, 'cancel', false);
                                    this.$set(i, 'NameCache', i.Name);
                                });
                            }
                        });
                        this.departmentList = data; // 赋值
                        this.showOccupation(0); // 默认展示第一个部门的职位
                        resolve(data);
                    } else {
                        reject(res.data);
                    }
                }).catch(error => {
                    reject(error);
                });
            });
        },
        // 显示职位方法
        showOccupation (index) {
            // 职位列表为对应索引的部门列表
            this.occupationList = this.departmentList[index].Occupations;
            // 显示部门名字方便修改
            this.currentDepartment = this.departmentList[index].Name;
        },
        // 点击编辑后的初始操作
        editInit (item) {
            item.hasEdit = true;
            item.cancel = true;
        },
        // 编辑部门方法
        editDepartment (item, index, type) {
            // 判断名称不能为空
            if (item.Name === '') {
                this.$Message.error('部门名称不能为空');
                return false;
            }
            // 如果type参数存在且为add
            if (type === 'add') {
                util.ajax.post('api/Department', {
                    Name: item.Name
                }).then(res => {
                    if (res.data.status === 1) {
                        console.log(res.data);
                        let id = res.data.data; // 得到返回的新增部门id
                        item.Id = id;
                        item.Occupations.forEach(item => {
                            item.DepartmentId = id; // 对应的职位Id更改
                        });
                        item.hasEdit = !item.hasEdit; // 状态取反
                        item.cancel = !item.cancel;
                        item.toAdd = !item.toAdd;
                        this.$Message.success('添加成功');
                        this.$Notice.warning({
                            title: '请添加至少一个职位',
                            desc: '否则后续操作将受影响'
                        });
                        this.showOccupation(index); // 添加成功后显示对应的职位
                    }
                });
            } else {
                // 进行更新操作
                util.ajax.put('api/Department', {
                    Id: item.Id,
                    Name: item.Name
                }).then(res => {
                    if (res.data.status === 1) {
                        item.hasEdit = !item.hasEdit;
                        item.cancel = !item.cancel;
                        this.$Message.success('修改成功');
                        this.showOccupation(index);
                    }
                });
            }
        },
        // 取消部门编辑方法
        cancelDepartment (item, index) {
            // 如果处于添加状态
            if (item.cancel && item.toAdd) {
                // 右侧职位展示逻辑
                if (index > 0) {
                    this.departmentList.splice(index, 1);
                    this.showOccupation(index - 1);
                } else {
                    this.departmentList.splice(index, 1);
                    // 都为空时则手动设置为空
                    if (this.departmentList.length === 0) {
                        this.occupationList = [];
                    }
                }
            } else {
                // 处于编辑状态
                item.Name = item.NameCache; // 名称重置
                item.cancel = false;
                item.hasEdit = false;
            }
        },
        // 取消职位编辑方法
        cancelOccupation (item, index) {
            if (item.cancel && item.toAdd) {
                this.occupationList.splice(index, 1);
                if (this.occupationList.length === 0) {
                    this.occupationList.push({
                        DepartmentId: item.DepartmentId,
                        Name: '',
                        Remark: '',
                        hasEdit: false,
                        cancel: false,
                        toAdd: true
                    });
                }
                return false;
            } else {
                // 处于编辑状态
                item.Name = item.NameCache; // 名称重置
                item.cancel = false;
                item.hasEdit = false;
            }
        },
        // 编辑职位方法
        editOccupation (item, index, type) {
            if (item.Name === '') {
                this.$Message.error('职位名称不能为空');
                return false;
            }
            if (type === 'add') {
                util.ajax.post('api/Occupation', {
                    DepartmentId: item.DepartmentId,
                    Name: item.Name,
                    Remark: item.Remark
                }).then(res => {
                    if (res.data.status === 1) {
                        let id = res.data.data; // 得到返回的新增部门id
                        item.Id = id;
                        item.hasEdit = !item.hasEdit;
                        item.cancel = !item.cancel;
                        item.toAdd = !item.toAdd;
                        this.$Message.success('添加成功');
                        if (index === this.occupationList.length - 1) {
                            this.addOccupation(); // 再次调用添加职位方法，方便添加多个
                        }
                    }
                });
            } else {
                util.ajax.put('api/Occupation', {
                    DepartmentId: item.DepartmentId,
                    Id: item.Id,
                    Name: item.Name,
                    Remark: item.Remark
                }).then(res => {
                    if (res.data.status === 1) {
                        item.hasEdit = !item.hasEdit;
                        item.cancel = !item.cancel;
                        this.$Message.success('修改成功');
                    }
                });
            }
        },
        // 删除部门确认回调
        deleteDepartmentOk (item, index) {
            this.departmentList.splice(index, 1);
            if (this.departmentList.length === 0) {
                this.occupationList = [];
            }
            const parmas = item.Id;
            util.ajax.delete('api/Department?id=' + parmas).then(res => {
                if (res.data.status === 1) {
                    item.hasEdit = !item.hasEdit;
                    this.$Message.success('删除成功');
                    if (index > 0) {
                        this.showOccupation(index - 1);
                    } else {
                        this.showOccupation(index);
                    }
                }
            });
        },
        // 删除职位确认回调
        deleteOccupationtOk (item, index) {
            if (item.Name === '') {
                this.occupationList.splice(index, 1);
                if (this.occupationList.length === 0) {
                    this.occupationList.push({
                        DepartmentId: item.DepartmentId,
                        Name: '',
                        Remark: '',
                        hasEdit: false,
                        cancel: false,
                        toAdd: true
                    });
                }
                return false;
            }
            let parmas = item.Id;
            util.ajax.delete('api/Occupation?id=' + parmas).then(res => {
                if (res.data.status === 1) {
                    console.log(this.occupationList);
                    this.occupationList.splice(index, 1);
                    if (this.occupationList.length === 0) {
                        this.occupationList.push({
                            DepartmentId: item.DepartmentId,
                            Name: '',
                            Remark: '',
                            hasEdit: false,
                            cancel: false,
                            toAdd: true
                        });
                    }
                    item.hasEdit = !item.hasEdit;
                    this.$Message.success('删除成功');
                }
            });
        },
        // 添加部门方法
        addDepartment () {
            // 添加一些默认属性
            this.departmentList.push({
                Name: '',
                Occupations: [
                    {
                        Name: '',
                        Remark: '',
                        hasEdit: false,
                        toAdd: true,
                        cancel: false
                    }
                ],
                Remark: '',
                hasEdit: true,
                toAdd: true,
                cancel: true
            });
            // 显示最后一个部门对应的职位
            this.showOccupation(this.departmentList.length - 1);
        },
        // 添加职位方法
        addOccupation () {
            let occ = this.occupationList[0];
            if (occ) {
                this.occupationList.push({
                    DepartmentId: occ.DepartmentId,
                    Name: '',
                    Remark: '',
                    hasEdit: false,
                    cancel: false,
                    toAdd: true
                });
            }
        },
        // 不再进行操作提醒
        neverNotice () {
            localStorage.setItem('departmentNoticeFlag', true); // 设置标记位
            this.$Notice.destroy(); // 删除提示
        }
    }
};
</script>

<style lang="less" scoped>
.department-list {
    li {
        margin-bottom: 4px;
    }
    .tools {
        color: #888;
        font-size: 10px;
        &:hover {
            color: #0084ff;
        }
    }
    .cur {
        color: #0084ff;
    }
}
.occupation-list {
    width: 580px;
    margin-top: 6px;
    li {
        margin-bottom: 10px;
    }
    .tools {
        color: #888;
        font-size: 10px;
        &:hover {
            color: #0084ff;
        }
    }
}
.add-department {
    display: block;
    margin: 15px 0 10px;
    color: #0084ff;
    text-align: center;
}
.add-occupation {
    display: block;
    width: 510px;
    margin: 15px 0 10px;
    color: #0084ff;
    text-align: center;
}
.no-data {
    line-height: 32px;
    text-align: center;
    color: #999;
}
</style>
