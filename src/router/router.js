import main from '@/views/main.vue';
import Permissions from '../../static/permissions.json';

// 不作为main组件的子页面展示的页面单独写，如下
export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: 'OBD-登录',
        requireAuth: false
    },
    component: resolve => {
        require(['@/views/login.vue'], resolve);
    }
};

export const page404 = {
    path: '/*',
    name: 'error-404',
    meta: {
        title: '404-页面不存在',
        requireAuth: false
    },
    component: resolve => {
        require(['@/views/error-page/404.vue'], resolve);
    }
};

export const page403 = {
    path: '/403',
    meta: {
        title: '403-权限不足',
        requireAuth: false
    },
    name: 'error-403',
    component: resolve => {
        require(['@//views/error-page/403.vue'], resolve);
    }
};

export const page500 = {
    path: '/500',
    meta: {
        title: '500-服务端错误',
        requireAuth: false
    },
    name: 'error-500',
    component: resolve => {
        require(['@/views/error-page/500.vue'], resolve);
    }
};

// 作为main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    redirect: '/home',
    component: main,
    children: [
        {
            path: 'home',
            title: '首页',
            name: 'home_index',
            meta: { requiresAuth: true },
            component: resolve => {
                require(['@/views/home/home.vue'], resolve);
            }
        },
        {
            path: 'ownspace',
            title: '个人中心',
            name: 'ownspace_index',
            meta: { requiresAuth: true },
            component: resolve => {
                require(['@/views/own-space/own-space.vue'], resolve);
            }
        },
        {
            path: 'main-handle',
            title: '主体授信',
            name: 'main-handle',
            permission: Permissions.CreditHandle,
            meta: { requiresAuth: true },
            component: resolve => {
                require(['@/views/credit-handle/main-handle.vue'], resolve);
            }
        },
        {
            path: 'purchase-handle',
            title: '代采授信',
            name: 'purchase-handle',
            permission: Permissions.CreditHandle,
            meta: { requiresAuth: true },
            component: resolve => {
                require(['@/views/credit-handle/purchase-handle.vue'], resolve);
            }
        }
    ]
};

// 作为main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
export const appRouter = [
    {
        path: '/early-warning',
        icon: 'android-warning',
        title: '预警设置',
        name: 'early-warning',
        permission: Permissions.AlarmConfig,
        component: main,
        children: [{
            path: 'index',
            title: '预警设置',
            name: 'early-warning-settings',
            permission: Permissions.AlarmConfig,
            meta: { requiresAuth: true },
            component: resolve => {
                require(['@/views/early-warning/early-warning.vue'], resolve);
            }
        }]
    },
    {
        path: '/credit-manage',
        icon: 'social-buffer',
        title: '授信管理',
        permission: Permissions.Credit,
        name: 'credit-manage',
        component: main,
        children: [
            {
                path: 'index',
                title: '授信列表',
                name: 'credit-list',
                permission: Permissions.CreditList,
                meta: { requiresAuth: true },
                component: resolve => {
                    require(['@/views/credit-manage/credit-list.vue'], resolve);
                }
            }
        ]
    },
    {
        path: '/system-manage',
        icon: 'gear-a',
        title: '系统管理',
        name: 'system-manage',
        permission: Permissions.System,
        component: main,
        children: [
            {
                path: 'user-manage',
                title: '用户管理',
                name: 'user-manage',
                permission: Permissions.User,
                meta: { requiresAuth: true },
                component: resolve => {
                    require(['@/views/system-manage/user-manage.vue'], resolve);
                }
            },
            {
                path: 'department-manage',
                title: '部门管理',
                name: 'department-manage',
                permission: Permissions.Department,
                meta: { requiresAuth: true },
                component: resolve => {
                    require(['@/views/system-manage/department-manage.vue'], resolve);
                }
            },
            {
                path: 'role-manage',
                title: '角色管理',
                name: 'role-manage',
                permission: Permissions.Role,
                meta: { requiresAuth: true },
                component: resolve => {
                    require(['@/views/system-manage/role-manage.vue'], resolve);
                }
            }
        ]
    }
];

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
    loginRouter,
    otherRouter,
    ...appRouter,
    page500,
    page403,
    page404
];
