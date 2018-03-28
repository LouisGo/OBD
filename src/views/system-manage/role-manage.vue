<template>
    <div>
        <Card shadow>
            <p slot="title">
                <Icon type="ios-list"></Icon>
                角色列表
            </p>
            <Row style="position: relative; margin-top: 30px">
                <Table :columns="roleColumns" :data="roleData"></Table>
                <Spin fix v-if="tableLoading"></Spin>
            </Row>
            <div style="margin: 25px 0; text-align: center">
                <Button v-permission="Permissions['Role_Post']" type="primary" @click.native="addRole">添加角色</Button>
            </div>
        </Card>
        <!-- 增加角色弹窗 -->
        <Modal v-model="addShow" title="添加角色" @on-ok="addOk" @on-cancel="addCancel" class-name="role-modal" :loading="addLoading">
            <div class="wrap">
                <Form ref="addForm" :model="addForm" :rules="addRules" :label-width="80">
                    <FormItem label="角色名称" prop="Name">
                        <Input type="text" v-model="addForm.Name" style="width: 320px"></Input>
                    </FormItem>
                    <FormItem label="角色备注" prop="Remark">
                        <Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" v-model="addForm.Remark" style="width: 320px"></Input>
                    </FormItem>
                </Form>
            </div>
        </Modal>
        <!-- 编辑角色弹窗 -->
        <Modal v-model="editShow" title="编辑角色" @on-ok="editOk" @on-cancel="editCancel" class-name="role-modal" :loading="editLoading">
            <div class="wrap">
                <Form ref="editForm" :model="editForm" :rules="editRules" :label-width="80">
                    <FormItem label="角色名称" prop="Name">
                        <Input type="text" v-model="editForm.Name" style="width: 320px"></Input>
                    </FormItem>
                    <FormItem label="角色备注" prop="Remark">
                        <Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" v-model="editForm.Remark" style="width: 320px"></Input>
                    </FormItem>
                </Form>
            </div>
        </Modal>
        <!-- 权限维护弹窗 -->
        <Modal v-model="permitShow" width="720" title="权限维护" @on-ok="permitOk" @on-cancel="permitCancel" class-name="permit-modal" :loading="permitLoading">
            <div class="wrap">
                <ul class="permisson-list">
                    <li v-for="(item, index) in permissionList">
                        <!-- {{permitForm[index].Name}} -->
                        <div class="module">
                            <Checkbox :indeterminate="permitForm[index].indeterminate" :value="permitForm[index].checkAll" @click.prevent.native="handleCheckAll(permitForm[index], index)">{{ item.Name }}</Checkbox>
                        </div>
                        <div class="method">
                            <ul>
                                <li v-for="(child, i) in item.Children">
                                    <CheckboxGroup v-model="permitForm[index].checkAllGroup" @on-change="checkAllGroupChange(index, $event)">
                                        <Checkbox :label="child.Id">{{ child.Name }}</Checkbox>
                                    </CheckboxGroup>
                                    <!-- <Checkbox v-model="permitForm[index]['Children'][i].Name">{{ child.Name }}</Checkbox> -->
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>
        </Modal>
    </div>
</template>

<script>
import util from '@/libs/util.js';
import Permissions from '../../../static/permissions.json';

export default {
    name: 'role-manage',
    data () {
        return {
            Permissions: Permissions,
            roleData: [], // 角色表格数据，其他地方修改之后记得处理映射
            roleColumns: [ // 表格header
                {
                    title: '角色名称',
                    key: 'Name',
                    width: 150
                },
                {
                    title: '角色备注',
                    key: 'Remark',
                    width: 300
                },
                {
                    title: '用户列表',
                    key: 'Users',
                    render: (h, params) => {
                        let users = params.row.Users;
                        if (users.length === 0) {
                            return h('div', {
                                style: {
                                    color: '#999'
                                }
                            }, '暂无用户');
                        } else {
                            return h('div',
                                users.map((item) => {
                                    return h('span', {
                                        style: {
                                            marginRight: '8px'
                                        }
                                    }, item.Name);
                                })
                            );
                        }
                    }
                },
                {
                    title: '操作',
                    key: 'operate',
                    width: 220,
                    // demo method
                    render: (h, params) => {
                        let _index = params.index;
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
                                        value: Permissions['Role_PermissionsBind']
                                    }
                                ],
                                on: {
                                    click: () => {
                                        this.permitMaintain(_index);
                                    }
                                }
                            }, '权限维护'),
                            h('a', {
                                style: {
                                    marginRight: '10px'
                                },
                                directives: [
                                    {
                                        name: 'permission',
                                        value: Permissions['Role_Put']
                                    }
                                ],
                                on: {
                                    click: () => {
                                        this.editForm = JSON.parse(JSON.stringify(this.roleData[_index]));
                                        this.editIndex = _index;
                                        this.editShow = true;
                                    }
                                }
                            }, '编辑角色'),
                            h('Poptip', {
                                props: {
                                    title: '确定删除该角色吗',
                                    confirm: true,
                                    transfer: true
                                },
                                on: {
                                    'on-ok': () => {
                                        this.deleteRole(_index);
                                    }
                                }
                            }, [
                                h('a', {
                                    style: {
                                        marginRight: '10px'
                                    },
                                    directives: [
                                        {
                                            name: 'permission',
                                            value: Permissions['Role_Delete']
                                        }
                                    ]
                                }, '删除角色')
                            ])
                        ]);
                    }
                }
            ],
            tableLoading: true, // 表格数据加载状态，加载成功或失败后置为false
            checkAllGroup: [], // 权限选择的所有保存数组.内为若干数组
            checkGroup: [], // 权限选择的具体保存数组，内为若干数组
            addForm: { // 添加操作对应的Form对象
                Id: '',
                Name: '',
                Remark: '',
                Users: [] // 不能忘记用户列表，否则表格不展示
            },
            addRules: { // 添加操作验证逻辑
                Name: [
                    {
                        required: true,
                        message: '请输入角色名称'
                    },
                    {
                        whitespace: true,
                        message: '请不要输入空格'
                    }
                ]
            },
            addShow: false, // 添加Modal的显示隐藏标记
            addLoading: true, // 添加Modal的loading标记
            editForm: {}, // 编辑操作对应的Form对象
            editRules: { // 编辑操作验证逻辑
                Name: [
                    {
                        required: true,
                        message: '请输入角色名称'
                    },
                    {
                        whitespace: true,
                        message: '请不要输入空格'
                    }
                ]
            },
            editShow: false, // 编辑Modal的显示隐藏标记
            editIndex: 0, // 编辑的位置标记
            editLoading: true, // 编辑Modal的loading标记
            permissionList: [], // 默认展示的权限列表
            permissionSpeList: [], // 具体需要展现的权限列表
            permitIndex: 0, // 当前权限维护的位置标记
            permitForm: [], // 权限操作对应的Form对象
            permitShow: false, // 权限Modal的显示隐藏标记
            permitLoading: true // 权限Modal的显示隐藏标记
        };
    },
    created () {
        this.init();
    },
    methods: {
        init () {
            let f = this.fetchData();
            Promise.all(f).then(() => {
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        // 获取数据
        fetchData () {
            // 获取角色列表数据
            const p1 = new Promise((resolve, reject) => {
                util.ajax.get('api/Role').then(res => {
                    if (res.data.status === 1) {
                        let data = res.data.data;
                        this.roleData = data;
                        resolve(data);
                    } else {
                        reject(res.data);
                    }
                }).catch(error => {
                    reject(error);
                });
            });
            // 获取所有权限列表
            const p2 = new Promise((resolve, reject) => {
                util.ajax.get('api/Permissions').then(res => {
                    if (res.data.status === 1) {
                        let data = res.data.data;
                        this.permissionList = data; // 赋值给所有权限列表
                        data.forEach(item => {
                            let temp1 = [];
                            let temp2 = [];
                            item.Children.forEach(i => {
                                temp1.push({
                                    Name: i.Name,
                                    Id: i.Id,
                                    Mark: i.Mark
                                });
                                temp2.push(i.Id);
                            });
                            // 初始化一些数据
                            this.permitForm.push({
                                Name: item.Name,
                                Id: item.Id,
                                Mark: item.Mark,
                                indeterminate: false, // 中间选择状态
                                checkAll: false, // 全选状态
                                checkAllGroup: [], // 已选择数据
                                Children: temp1 // 子数据初始化
                            });
                            this.checkAllGroup.push(temp2); // 获取所有数组的全选状态数组
                            this.checkGroup.push([]); // 获取相同length的具体展现数组，方便对应索引展示
                        });
                        resolve(data);
                    } else {
                        reject(res.data);
                    }
                }).catch(error => {
                    reject(error);
                });
            });
            // 将任务队列return
            return [p1, p2];
        },
        // 添加角色
        addRole () {
            this.addShow = true;
        },
        // 添加确认回调
        addOk () {
            this.$refs['addForm'].validate(valid => {
                if (valid) {
                    let addForm = this.addForm;
                    util.ajax.post('api/Role', {
                        Name: addForm.Name,
                        Remark: addForm.Remark
                    }).then(res => {
                        if (res.data.status === 1) {
                            this.$Message.success('添加成功');
                            addForm.Id = res.data.data;
                            const copy = JSON.parse(JSON.stringify(addForm)); // 深拷贝
                            this.roleData.push(copy); // 映射数据到roleData
                            this.$refs['addForm'].resetFields(); // 重置
                            this.addShow = false;
                        } else {
                            this.addLoading = false;
                            setTimeout(() => {
                                this.addLoading = true;
                            }, 0);
                        }
                    }).catch(() => {
                        this.addLoading = false;
                        setTimeout(() => {
                            this.addLoading = true;
                        }, 0);
                    });
                } else {
                    this.addLoading = false;
                    setTimeout(() => {
                        this.addLoading = true;
                    }, 0);
                }
            });
        },
        // 添加取消回调
        addCancel () {
            this.addLoading = true;
            this.$refs['addForm'].resetFields();
        },
        // 编辑确认回调
        editOk () {
            this.$refs['editForm'].validate(valid => {
                if (valid) {
                    let editForm = this.editForm;
                    util.ajax.put('api/Role', {
                        Id: editForm.Id,
                        Name: editForm.Name,
                        Remark: editForm.Remark
                    }).then(res => {
                        if (res.data.status === 1) {
                            this.$Message.success('修改成功');
                            const copy = JSON.parse(JSON.stringify(this.editForm));
                            this.roleData.splice(this.editIndex, 1, copy);
                            this.$refs['editForm'].resetFields();
                            this.editIndex = 0;
                            this.editShow = false;
                        } else {
                            this.editLoading = false;
                            setTimeout(() => {
                                this.editLoading = true;
                            }, 0);
                        }
                    }).catch(() => {
                        this.editLoading = false;
                        setTimeout(() => {
                            this.editLoading = true;
                        }, 0);
                    });
                } else {
                    this.editLoading = false;
                    setTimeout(() => {
                        this.editLoading = true;
                    }, 0);
                }
            });
        },
        // 编辑取消回调
        editCancel () {
            this.editLoading = true;
            this.$refs['editForm'].resetFields();
        },
        // 删除角色
        deleteRole (index) {
            let Id = this.roleData[index].Id; // 获取删除的id
            if (Id) {
                util.ajax.delete('api/Role?id=' + this.roleData[index].Id).then(res => {
                    if (res.data.status === 1) {
                        this.$Message.success('删除成功');
                        this.roleData.splice(index, 1);
                    }
                });
            }
        },
        // 权限维护
        permitMaintain (index) {
            this.permitShow = true;
            this.permitIndex = index;
            util.ajax.get('api/Permissions?id=' + this.roleData[this.permitIndex].Id).then(res => {
                if (res.data.status === 1) {
                    let data = res.data.data;
                    let permissionSpeList = this.permissionSpeList; // 缓存具体需要展示的权限列表
                    permissionSpeList = data;
                    let permitForm = this.permitForm;
                    let checkAllGroup = this.checkAllGroup;
                    let checkGroup = this.checkGroup;
                    // 遍历判断permissionSpeList数组里的id对应的位置，方便展示
                    checkAllGroup.forEach((group, index) => {
                        permissionSpeList.forEach(list => {
                            if (group.indexOf(list) >= 0) { // 存在即push进对应index的空数组
                                checkGroup[index].push(list);
                            }
                        });
                    });
                    // 展示逻辑
                    checkGroup.forEach((item, index) => {
                        // 有数据时才执行
                        if (item.length > 0) {
                            // 全选、单选、有选展示判断
                            if (item.length === checkAllGroup[index].length) {
                                permitForm[index].checkAll = true;
                                permitForm[index].indeterminate = false;
                            } else if (item.length === 0) {
                                permitForm[index].checkAll = false;
                                permitForm[index].indeterminate = false;
                            } else {
                                permitForm[index].checkAll = false;
                                permitForm[index].indeterminate = true;
                            }
                            // 赋值给展示form
                            permitForm[index].checkAllGroup = item;
                        }
                    });
                }
            });
        },
        permitOk () {
            // 提交时的数组
            let temp = [];
            // 遍历选择的权限ID，push
            this.permitForm.forEach(item => {
                item.checkAllGroup.forEach(i => {
                    temp.push(i);
                });
            });
            util.ajax.put('api/PermissionsBind', {
                RoleId: this.roleData[this.permitIndex].Id,
                PermissionsIds: temp
            }).then(res => {
                if (res.data.status === 1) {
                    this.$Message.success('修改成功');
                    // 以下为重置操作
                    this.permissionSpeList = [];
                    this.checkGroup.forEach(item => {
                        item.splice(0, item.length);
                    });
                    this.permitForm.forEach(item => {
                        item.checkAllGroup = [];
                        item.checkAll = false;
                        item.indeterminate = false;
                    });
                    this.permitIndex = 0;
                    this.permitShow = false;
                } else {
                    this.permitLoading = false;
                    setTimeout(() => {
                        this.permitLoading = true;
                    }, 0);
                }
            }).catch(() => {
                this.permitLoading = false;
                setTimeout(() => {
                    this.permitLoading = true;
                }, 0);
            });
        },
        // 权限取消回调
        permitCancel () {
            this.permitLoading = true;
            // 展示重置
            this.permissionSpeList = [];
            this.checkGroup.forEach(item => {
                item.splice(0, item.length);
            });
            this.permitForm.forEach(item => {
                item.checkAllGroup = [];
                item.checkAll = false;
                item.indeterminate = false;
            });
        },
        // 处理权限全选方法
        handleCheckAll (item, index) {
            if (item.indeterminate) {
                item.checkAll = false;
            } else {
                item.checkAll = !item.checkAll;
            }
            item.indeterminate = false;
            if (item.checkAll) {
                item.checkAllGroup = this.checkAllGroup[index];
            } else {
                item.checkAllGroup = [];
            }
        },
        // 处理权限module状态
        checkAllGroupChange (index, $event) {
            if ($event.length === this.checkAllGroup.length) {
                this.permitForm[index].indeterminate = false;
                this.permitForm[index].checkAll = true;
            } else if ($event.length > 0) {
                this.permitForm[index].indeterminate = true;
                this.permitForm[index].checkAll = false;
            } else {
                this.permitForm[index].indeterminate = false;
                this.permitForm[index].checkAll = false;
            }
        }
    }
};
</script>

<style lang="less">
.role-modal {
    display: flex;
    align-items: center;
    justify-content: center;
    .ivu-modal {
        top: 0;
    }
    .wrap {
        width: 450px;
        margin: 0 auto;
    }
}
.permit-modal {
    display: flex;
    align-items: center;
    justify-content: center;
    .ivu-modal {
        top: 0;
    }
    .wrap {
        width: 650px;
        max-height: 500px;
        margin: 0 auto;
        overflow: auto;
        .permisson-list {
            overflow: hidden;
            border: 1px solid #eee;
            >li {
                display: flex;
                justify-content: flex-start;
                border-bottom: 1px solid #eee;
                .module {
                    flex-basis: 120px;
                    padding: 10px 16px;
                    line-height: 2;
                    background: #fbfeff;
                }
                .method {
                    flex-basis: 530px;
                    padding: 10px 16px;
                    border-left: 1px solid #eee;
                    ul {
                        display: flex;
                        justify-content: flex-start;
                        flex-wrap: wrap;
                        li {
                            margin-right: 10px;
                        }
                    }
                }
            }
        }
    }
}
</style>
