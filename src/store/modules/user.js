import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

const user = {
    state: {
        username: null
    },
    mutations: {
        login (state, data) {
            Cookies.set('user', data.username);
            localStorage.setItem('token', data.token);
            let decoded = jwt.decode(data.token);
            localStorage.setItem('tokenTime', decoded.exp);
            localStorage.setItem('userId', decoded.uid);
        },
        logout (state, rootState) {
            Cookies.remove('user');
            Cookies.remove('access');
            Cookies.remove('allows');
            rootState.app.pageOpenedList.splice(1);
            rootState.app.menuList = [];
            // 清空打开的页面等数据，但是保存主题数据
            let theme = '';
            // let departmentNoticeFlag = '';
            if (localStorage.theme) {
                theme = localStorage.theme;
            }
            // if (localStorage.departmentNoticeFlag) {
            //     departmentNoticeFlag = localStorage.departmentNoticeFlag;
            // }
            localStorage.clear();
            if (theme) {
                localStorage.theme = theme;
            }
            // if (departmentNoticeFlag) {
            //     localStorage.departmentNoticeFlag = departmentNoticeFlag;
            // }
        },
        setAllows (state, data) {
            let allows = JSON.stringify(data.data);
            localStorage.setItem('allows', allows);
        }
    },
    actions: {
        login ({commit}, data) {
            commit('login', data);
        },
        logout ({commit, rootState}) {
            commit('logout', rootState);
        },
        setAllows ({commit}, data) {
            commit('setAllows', data);
        }
    }
};

export default user;
