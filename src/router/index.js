import Vue from 'vue';
import iView from 'iview';
import util from '../libs/util';
import VueRouter from 'vue-router';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';
import {routers, otherRouter, appRouter} from './router';

Vue.use(VueRouter);

// 路由配置
const RouterConfig = {
    // mode: 'history',
    routes: routers
};

export const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    let token = localStorage.getItem('token');
    let nowTime = parseInt((new Date()).getTime() / 1000); // 确保跟后台date格式一样
    let tokenTime = parseInt(localStorage.getItem('tokenTime'));
    let allows = localStorage.getItem('allows');
    if (allows) {
        allows = JSON.parse(allows);
    }
    iView.LoadingBar.start();
    util.title(to.meta.title);
    if (to.matched.some(record => record.meta.requiresAuth)) { // 判断router meta对象里是否有requiresAuth属性，无则直接跳转
        // 路由需要登录权限，否则重定向到登录页
        if (!token) {
            next({
                replace: true,
                name: 'login'
            });
            iView.LoadingBar.finish();
        } else {
            if ((tokenTime - nowTime) > 0) {
                if ((tokenTime - nowTime) < 600) {
                    // 在距离token过期还有10分钟内，如果用户发生路由跳转行为，则重新请求一次token进行持久化
                    util.ajax.post('api/Token').then((res) => {
                        let data = res.data.data;
                        localStorage.setItem('token', data.Token);
                        let decoded = jwt.decode(data.Token);
                        localStorage.setItem('tokenTime', decoded.exp);
                        localStorage.setItem('userId', decoded.uid);
                        util.toDefaultPage([...routers], to.name, router, next);
                    }).catch(() => {
                        iView.Message.warning('登录过期，请重新登录');
                        next({
                            replace: true,
                            name: 'login'
                        });
                    });
                } else {
                    if (!Cookies.get('user') && to.name !== 'login') {
                        next({
                            replace: true,
                            name: 'login'
                        });
                    } else if (Cookies.get('user') && to.name === 'login') {
                        util.title();
                        next({
                            name: 'home_index'
                        });
                    } else {
                        // 进行权限判定拦截
                        const curRouterObj = util.getRouterObjByName([otherRouter, ...appRouter], to.name);
                        const permission = curRouterObj.permission;
                        if (permission) {
                            let length = permission.length;
                            let available = 0; // 采用计数方法进行比对
                            for (let i = 0; i < length; i++) {
                                if (allows.includes(permission[i])) {
                                    available += 1;
                                }
                            }
                            if (available === length) {
                                util.toDefaultPage([otherRouter, ...appRouter], to.name, router, next);
                            } else {
                                // 无权限
                                next({
                                    name: 'error-403'
                                });
                                iView.LoadingBar.finish();
                            }
                        } else {
                            util.toDefaultPage([...routers], to.name, router, next);
                        }
                    }
                }
            } else {
                iView.Message.warning('登录过期，请重新登录');
                next({
                    replace: true,
                    name: 'login'
                });
                iView.LoadingBar.finish();
            }
        }
    } else {
        util.toDefaultPage([...routers], to.name, router, next);
    }
});

router.afterEach((to) => {
    util.openNewPage(router.app, to.name, to.params, to.query); // 打开新页面
    iView.LoadingBar.finish();
    window.scrollTo(0, 0); // 页面拉回顶部
});
