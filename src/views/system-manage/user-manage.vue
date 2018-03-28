<template>
    <div>
        <Card shadow>
            <p slot="title">
                <Icon type="ios-list"></Icon>
                用户列表
            </p>
            <Row style="position: relative; margin-top: 30px">
                <Table :columns="userColumns" :data="userData"></Table>
                <Spin fix v-if="tableLoading"></Spin>
            </Row>
            <div style="margin: 25px 0; text-align: center">
                <Button v-permission="Permissions['User_Post']" type="primary" @click.native="addShow = true">添加用户</Button>
            </div>
        </Card>
        <!-- 修改信息弹窗 -->
        <Modal v-model="editShow" title="修改用户" @on-ok="editOk" @on-cancel="editCancel" class-name="user-modal" :loading="editLoading">
            <div class="wrap">
                <Form ref="editForm" :model="editForm" :rules="editRules" :label-width="80">
                    <FormItem label="账户" prop="Name">
                        <Input type="text" v-model="editForm.Name" style="width: 320px"></Input>
                    </FormItem>
                    <FormItem label="真实姓名" prop="RealName">
                        <Input type="text" v-model="editForm.RealName" style="width: 320px"></Input>
                    </FormItem>
                    <FormItem label="用户状态" prop="Status">
                        <RadioGroup v-model="editForm.Status" style="width: 320px">
                            <Radio label="正常">正常</Radio>
                            <Radio label="冻结">冻结</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="角色" prop="RoleId">
                        <Select v-model="editForm.RoleId" style="width: 320px">
                            <Option v-for="item in roleList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="部门" prop="DepartmentId">
                        <Select v-model="editForm.DepartmentId" style="width: 320px" @on-change="departmentChange">
                            <Option v-for="item in departmentList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="职位" prop="OccupationId">
                        <Select v-model="editForm.OccupationId" style="width: 320px">
                            <Option v-for="item in occupationList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="密码修改" prop="Password">
                        <Input type="password" v-model="editForm.Password" placeholder="" style="width: 320px"></Input>
                    </FormItem>
                </Form>
            </div>
        </Modal>
        <!-- 添加用户弹窗 -->
        <Modal v-model="addShow" title="添加用户" @on-ok="addOk" @on-cancel="addCancel" class-name="user-modal" :loading="addLoading">
            <div class="wrap">
                <Form ref="addForm" :model="addForm" :rules="addRules" :label-width="80">
                    <FormItem label="账户" prop="Name">
                        <Input type="text" v-model="addForm.Name" style="width: 320px"></Input>
                    </FormItem>
                    <FormItem label="真实姓名" prop="RealName">
                        <Input type="text" v-model="addForm.RealName" style="width: 320px"></Input>
                    </FormItem>
                    <FormItem label="用户状态" prop="Status">
                        <RadioGroup v-model="addForm.Status" style="width: 320px">
                            <Radio label="正常">正常</Radio>
                            <Radio label="冻结">冻结</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="角色" prop="RoleId">
                        <Select v-model="addForm.RoleId" style="width: 320px">
                            <Option v-for="item in roleList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="部门" prop="DepartmentId">
                        <Select v-model="addForm.DepartmentId" style="width: 320px" @on-change="departmentChange('add')">
                            <Option v-for="item in departmentList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="职位" prop="OccupationId">
                        <Select v-model="addForm.OccupationId" style="width: 320px">
                            <Option v-for="item in occupationList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="密码" prop="Password">
                        <Input type="password" v-model="addForm.Password" style="width: 320px"></Input>
                    </FormItem>
                </Form>
            </div>
        </Modal>
    </div>
</template>

<script>
import util from '@/libs/util.js';
import md5 from 'md5';
import Permissions from '../../../static/permissions.json';

export default {
    name: 'user-manage',
    data () {
        const validateUserName = (rule, value, callback) => {
            if (!(/^[0-9a-zA-Z_]{1,}$/.test(value) || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value))) {
                callback(new Error('请输入正确的用户名或者邮箱格式'));
            } else {
                callback();
            }
        };
        return {
            Permissions: Permissions,
            tableLoading: true, // 展示表格加载状态，加载成功或失败后置为false
            userData: [], // 表格展示数据，其他地方修改之后记得处理映射
            userColumns: [ // 表格header
                {
                    title: '账户',
                    key: 'Name'
                },
                {
                    title: '真实姓名',
                    key: 'RealName'
                },
                {
                    title: '用户状态',
                    key: 'Status'
                },
                {
                    title: '角色',
                    key: 'RoleName'
                },
                {
                    title: '部门',
                    key: 'DepartmentName'
                },
                {
                    title: '职位',
                    key: 'OccupationName'
                },
                {
                    title: '操作',
                    key: 'operate',
                    width: 180,
                    //
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
                                        value: Permissions['User_Put']
                                    }
                                ],
                                on: {
                                    click: () => {
                                        this.editForm = JSON.parse(JSON.stringify(this.userData[_index]));
                                        this.editIndex = _index;
                                        this.editShow = true;
                                    }
                                }
                            }, '修改信息'),
                            h('Poptip', {
                                props: {
                                    transfer: true,
                                    confirm: true,
                                    title: '确定删除该用户吗'
                                },
                                on: {
                                    'on-ok': () => {
                                        this.deleteUser(_index);
                                    }
                                }
                            }, [
                                h('a', {
                                    style: {
                                        textAlign: 'left'
                                    },
                                    directives: [
                                        {
                                            name: 'permission',
                                            value: Permissions['User_Delete']
                                        }
                                    ]
                                }, '删除用户')
                            ])
                        ]);
                    }
                }
            ],
            roleList: [], // 角色Select数据
            departmentList: [], // 部门Select数据
            occupationList: [], // 职位Select数据
            editForm: {}, // 编辑操作对应的Form对象
            editRules: { // 编辑操作的表单验证逻辑
                Name: [
                    {
                        required: true,
                        message: '请输入账户'
                    },
                    {
                        validator: validateUserName
                    }
                ],
                RealName: [
                    {
                        required: true,
                        message: '请输入真实姓名'
                    }
                ],
                RoleId: [
                    {
                        required: true,
                        message: '请选择角色'
                    }
                ],
                DepartmentId: [
                    {
                        required: true,
                        message: '请选择部门'
                    }
                ],
                OccupationId: [
                    {
                        required: true,
                        message: '请选择职位'
                    }
                ],
                Password: [
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
            editIndex: 0, // 编辑的位置标记，反馈在编辑完成后对应的userData更新操作
            editShow: false, // 编辑Modal的显示隐藏标记
            editLoading: true, // 编辑Modal的loading标记
            addForm: { // 添加操作对应的Form对象
                DepartmentId: '',
                DepartmentName: '',
                Id: '',
                Name: '',
                OccupationId: '',
                OccupationName: '',
                RealName: '',
                RoleId: '',
                Status: '',
                Password: ''
            },
            addRules: { // 添加操作的表单验证逻辑
                Name: [
                    {
                        required: true,
                        message: '请输入账户'
                    },
                    {
                        validator: validateUserName
                    }
                ],
                RealName: [
                    {
                        required: true,
                        message: '请输入真实姓名'
                    }
                ],
                Status: [
                    {
                        required: true,
                        message: '请选择状态'
                    }
                ],
                RoleId: [
                    {
                        required: true,
                        message: '请选择角色'
                    }
                ],
                DepartmentId: [
                    {
                        required: true,
                        message: '请选择部门'
                    }
                ],
                OccupationId: [
                    {
                        required: true,
                        message: '请选择职位'
                    }
                ],
                Password: [
                    {
                        required: true,
                        message: '请输入密码'
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
            addShow: false, // 添加Modal的显示隐藏标记
            addLoading: true // 添加Modal的loading标记
        };
    },
    mounted () {
        this.$nextTick(() => {
            this.init();
        });
    },
    methods: {
        // 初始化方法
        init () {
            // 确保数据加载之后再更改loading状态
            let complete = this.fetchData(); // 接受任务队列用于Promise
            Promise.all(complete).then(() => {
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        // 获取数据
        fetchData () {
            // 获取用户列表数据
            const p1 = new Promise((resolve, reject) => {
                util.ajax.get('api/User').then(res => {
                    if (res.data.status === 1) {
                        let data = res.data.data;
                        data.forEach(item => {
                            this.userData.push({
                                DepartmentId: item.DepartmentId,
                                DepartmentName: item.DepartmentName,
                                Id: item.Id,
                                Name: item.Name,
                                OccupationId: item.OccupationId,
                                OccupationName: item.OccupationName,
                                RealName: item.RealName,
                                RoleName: item.RoleName,
                                RoleId: item.RoleId,
                                Status: item.Status === 1 ? '正常' : '冻结', // 状态值暂时只有正常1和冻结2
                                Password: ''
                            });
                        });
                        resolve(data);
                    } else {
                        reject(res.data);
                    }
                }).catch(error => {
                    reject(error);
                });
            });
            // 获取部门列表数据
            const p2 = new Promise((resolve, reject) => {
                util.ajax.get('api/Department').then(res => {
                    if (res.data.status === 1) {
                        let data = res.data.data;
                        data.forEach(item => {
                            this.departmentList.push({
                                value: item.Id,
                                label: item.Name
                            });
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
            // 获取角色列表数据
            const p3 = new Promise((resolve, reject) => {
                util.ajax.get('api/Role').then(res => {
                    if (res.data.status === 1) {
                        let data = res.data.data;
                        data.forEach(item => {
                            this.roleList.push({
                                value: item.Id,
                                label: item.Name
                            });
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
            // 将任务队列return
            return [p1, p2, p3];
        },
        // 编辑确认回调
        editOk () {
            this.$refs['editForm'].validate(valid => {
                // 表单验证通过后
                if (valid) {
                    let editForm = this.editForm;
                    // 加密逻辑
                    let encoded;
                    if (editForm.Password) {
                        encoded = md5(editForm.Password + 'OBD').toUpperCase();
                    }
                    util.ajax.put('api/User', {
                        DepartmentId: editForm.DepartmentId,
                        OccupationId: editForm.OccupationId,
                        Name: editForm.Name,
                        Id: editForm.Id,
                        RoleId: editForm.RoleId,
                        Status: editForm.Status === '正常' ? 1 : 2,
                        RealName: editForm.RealName,
                        Password: encoded || '' // 不传即为不添加
                    }).then(res => {
                        if (res.data.status === 1) {
                            this.setSelectName(editForm, this.roleList, {
                                Id: 'RoleId',
                                Name: 'RoleName'
                            });
                            this.setSelectName(editForm, this.departmentList, {
                                Id: 'DepartmentId',
                                Name: 'DepartmentName'
                            });
                            this.setSelectName(editForm, this.occupationList, {
                                Id: 'OccupationId',
                                Name: 'OccupationName'
                            });
                            const copy = JSON.parse(JSON.stringify(editForm)); // 深拷贝，否则失效
                            this.userData.splice(this.editIndex, 1, copy); // 通过splice操作动态更改userData
                            this.$Message.success('修改成功');
                            this.$refs['editForm'].resetFields(); // 表格重置
                            this.editIndex = 0;
                            this.editShow = false;
                        } else {
                            this.editLoading = false; // 更新失败时将按钮loading状态置为false，作终止loading动画用
                            setTimeout(() => { // 之后应将loading重新置为true，否则关闭之后再打开Modal无loading状态
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
            this.$refs['editForm'].resetFields(); // 取消时表格重置
        },
        // 部门变更
        departmentChange (type) {
            // change时
            if (type) {
                let params;
                // 判断部门Select为添加或者编辑，方便展示
                if (type === 'add') {
                    params = this.addForm.DepartmentId;
                } else {
                    params = this.editForm.DepartmentId;
                }
                if (params) {
                    util.ajax.get('api/Occupation?departmentId=' + params).then(res => {
                        if (res.data.status === 1) {
                            let data = res.data.data;
                            this.occupationList = [];
                            data.forEach(item => {
                                this.occupationList.push({
                                    value: item.Id,
                                    label: item.Name
                                });
                            });
                            if (type === 'add') {
                                this.addForm.OccupationId = this.occupationList[0].value;
                            }
                        }
                    }).catch(error => {
                        console.error(error);
                    });
                }
            }
        },
        // 添加确认回调
        addOk () {
            this.$refs['addForm'].validate(valid => {
                if (valid) {
                    let addForm = this.addForm;
                    const encoded = md5(addForm.Password + 'OBD').toUpperCase();
                    util.ajax.post('api/User', {
                        DepartmentId: addForm.DepartmentId,
                        OccupationId: addForm.OccupationId,
                        Name: addForm.Name,
                        RoleId: addForm.RoleId,
                        Status: addForm.Status === '正常' ? 1 : 2,
                        RealName: addForm.RealName,
                        Password: encoded
                    }).then(res => {
                        if (res.data.status === 1) {
                            this.setSelectName(addForm, this.roleList, {
                                Id: 'RoleId',
                                Name: 'RoleName'
                            });
                            this.setSelectName(addForm, this.departmentList, {
                                Id: 'DepartmentId',
                                Name: 'DepartmentName'
                            });
                            this.setSelectName(addForm, this.occupationList, {
                                Id: 'OccupationId',
                                Name: 'OccupationName'
                            });
                            addForm.Id = res.data.data;
                            const copy = JSON.parse(JSON.stringify(addForm));
                            this.userData.push(copy);
                            this.$Message.success('添加成功');
                            this.$refs['addForm'].resetFields();
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
        // 确认取消回调
        addCancel () {
            this.addLoading = true;
            this.$refs['addForm'].resetFields();
        },
        // 删除用户
        deleteUser (index) {
            util.ajax.delete('api/User?id=' + this.userData[index].Id).then(res => {
                if (res.data.status === 1) {
                    this.$Message.success('删除成功');
                    this.userData.splice(index, 1);
                }
            });
        },
        // 用于修改信息后，Select组件的ID和Name同步以及后续映射到userData
        setSelectName (form, target, terms) {
            target.forEach(item => {
                // 在目标数组里进行遍历判断
                if (item.value === form[terms.Id]) {
                    // 如果匹配到对应ID，则将当前Name赋给form
                    form[terms.Name] = item.label;
                }
            });
        }
    }
};
</script>

<style lang="less">
.user-modal {
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
</style>
