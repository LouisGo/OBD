<template>
    <Row type="flex" justify="end" align="middle" class="login">
        <Col :lg="10" :sm="12" :xs="24">
            <div class="login-con">
                <Card :bordered="false">
                    <p slot="title">
                        <Icon type="log-in"></Icon>
                        欢迎登录
                    </p>
                    <div class="form-con">
                        <Form ref="loginForm" :model="form" :rules="rules" @keydown.native.enter="handleSubmit">
                            <FormItem prop="userName">
                                <Input v-model="form.userName" placeholder="请输入用户名" @on-change="triggerLoginBtn">
                                    <span slot="prepend">
                                        <Icon :size="16" type="person"></Icon>
                                    </span>
                                </Input>
                            </FormItem>
                            <FormItem prop="password">
                                <Input type="password" v-model="form.password" placeholder="请输入密码" @on-change="triggerLoginBtn">
                                    <span slot="prepend">
                                        <Icon :size="14" type="locked"></Icon>
                                    </span>
                                </Input>
                            </FormItem>
                            <FormItem>
                                <Button @click="handleSubmit" type="primary" :disabled="!loginAvailable" :loading="loading" long>登录</Button>
                            </FormItem>
                        </Form>
                        <!-- <p class="login-tip">
                            <router-link to="">忘记密码？</router-link>
                        </p> -->
                    </div>
                </Card>
            </div>
        </Col>
    </Row>
</template>

<script>
import Cookies from 'js-cookie';
import util from '@/libs/util.js';
import qs from 'qs';
import md5 from 'md5';
import Permissions from '../../static/permissions.json';

export default {
    data () {
        const validateUserName = (rule, value, callback) => {
            if (!(/^[0-9a-zA-Z_]{1,}$/.test(value) || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value))) {
                callback(new Error('请输入正确的用户名或者邮箱格式'));
            } else {
                callback();
            }
        };
        return {
            form: {
                userName: '',
                password: ''
            },
            rules: {
                userName: [
                    {
                        required: true,
                        message: '账号不能为空',
                        trigger: 'blur'
                    },
                    {
                        whitespace: true,
                        message: '不能输入空格'
                    },
                    {
                        validator: validateUserName
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
            loginAvailable: false,
            loading: false
        };
    },
    created () {
        const permissions = JSON.stringify(Permissions);
        localStorage.setItem('permissions', permissions);
    },
    methods: {
        handleSubmit () {
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    this.login().then(() => {
                        this.fetchPermission().then(() => {
                            this.$router.push({
                                name: 'home_index'
                            });
                            this.$Message.success('登录成功');
                            this.loading = false;
                        }).catch(() => {
                            this.loading = false;
                        });
                    }).catch(() => {
                        this.loading = false;
                    });
                    // 模拟登录
                    // util.ajax.post('/login', {
                    //     username: this.form.userName,
                    //     password: this.form.password,
                    //     secode: this.form.secode
                    // }).then(res => {
                    //     let data = res.data;
                    //     if (data.status === 1) {
                    //         this.loading = false;
                    //         // // 验证通过讲信息存到cookie
                    //         // Cookies.set('user', this.form.userName);
                    //         let that = this;
                    //         this.$store.dispatch('login', {
                    //             username: that.form.userName,
                    //             token: data.token
                    //         });
                    //         // Cookies.set('password', this.form.password);
                    //         // 展示设置用户头像
                    //         this.$store.commit('setAvator', 'http://i.liebao.cn/portrait/src/img/6.jpg');
                    //         // 展示判断权限功能
                    //         if (this.form.userName === 'admin') {
                    //             Cookies.set('access', 0);
                    //         } else {
                    //             Cookies.set('access', 1);
                    //         }
                    //         this.$router.push({
                    //             name: 'home_index'
                    //         });
                    //         this.$Message.success(data.msg);
                    //         return;
                    //     }
                    //     if (data.status === 0) {
                    //         this.loading = false;
                    //         this.$Message.error('请求超时');
                    //         return;
                    //     }
                    //     if (data.status === -1) {
                    //         this.loading = false;
                    //         this.$Message.error(data.msg);
                    //         return;
                    //     }
                    //     if (data.status === -2) {
                    //         this.loading = false;
                    //         this.$Message.error(data.msg);
                    //         return;
                    //     }
                    //     this.loading = false;
                    //     this.$Message.error(data.msg);
                    //     this.loginAvailable = false;
                    // }).catch(() => {
                    //     this.loading = false;
                    // });
                }
            });
        },
        login () {
            return new Promise((resolve, reject) => {
                const timestamp = (new Date()).getTime();
                const temp = md5(this.form.password + 'OBD').toUpperCase();
                const encode = md5(temp + timestamp).toUpperCase();
                const params = qs.stringify({
                    username: this.form.userName,
                    password: encode,
                    timestamp: timestamp
                });
                util.ajaxDft.get('api/Token?' + params).then(res => {
                    const data = res.data;
                    const token = data.data.Token;
                    if (data.status === 1) {
                        this.loading = false;
                        // // 验证通过讲信息存到cookie
                        Cookies.set('user', this.form.userName);
                        let that = this;
                        this.$store.dispatch('login', {
                            username: that.form.userName,
                            token: token
                        });
                        resolve(data);
                    } else {
                        this.$Message.error(data.msg);
                        reject(data);
                    }
                }).catch(error => {
                    reject(error);
                });
            });
        },
        fetchPermission () {
            return new Promise((resolve, reject) => {
                const userId = localStorage.getItem('userId');
                util.ajax.get(`api/Permissions?id=${userId}&type=User`).then(res => {
                    if (res.data.status === 1) {
                        let data = res.data.data;
                        this.$store.dispatch('setAllows', {
                            data: data
                        });
                        resolve(data);
                    } else {
                        reject(res.data);
                    }
                }).catch(error => {
                    reject(error);
                });
            });
        },
        triggerLoginBtn (event) {
            if (this.form.userName !== '' && this.form.password !== '' && this.form.secode !== '') {
                this.loginAvailable = true;
            } else {
                this.loginAvailable = false;
            }
        }
    }
};
</script>

<style lang="less">
.login {
    width: 100%;
    height: 100%;
    background-image: url(../images/bg-login.jpg);
    background-size: cover;
    background-position: center;
    position: relative;
    &-con {
        position: relative;
        width: 300px;
        margin: 0 auto;
        &-header {
            font-size: 16px;
            font-weight: 300;
            text-align: center;
            padding: 30px 0;
        }
        .form-con {
            padding: 10px 0 0;
        }
        .login-tip {
            font-size: 10px;
            text-align: center;
            color: #c3c3c3;
            >a {
                color: #c3c3c3;
                -webkit-transition: color 0.2s;
                transition: color 0.2s;
                &:hover {
                    color: #2d8cf0;
                }
            }
        }
        .secode {
            display: inline-block;
            width: 68px;
            height: 32px;
            border: 1px solid #dddee1;
            border-radius: 4px;
            cursor: pointer;
            img {
                width: 100%;
                margin-top: 4px;
            }
        }
    }
}
</style>
