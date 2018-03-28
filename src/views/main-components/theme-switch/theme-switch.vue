<template>
    <div style="display:inline-block;padding: 0 7px;">
        <Dropdown trigger="click" @on-click="setTheme">
            <a href="javascript:void(0)">
                <Icon :style="{marginTop: '-2px', verticalAlign: 'middle'}" color="#495060" :size="18" type="paintbucket"></Icon>
                <Icon type="arrow-down-b" color="#495060"></Icon>
            </a>
            <DropdownMenu slot="list">
                <DropdownItem v-for="(item, index) in themeList" :key="index" :name="item.name">
                    <Row type="flex" justify="center" align="middle">
                        <span style="margin-right:10px;line-height:16px;">
                            <Icon :size="16" type="record" :color="item.name.substr(0, 1) === 'b' ? '#495060' : '#eaeaea'"/>
                        </span>
                        <span style="line-height:16px;">{{ item.name.substr(0, 1) === 'b' ? '静谧黑' : '清新白' }}</span>
                    </Row>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    </div>
</template>

<script>
import Cookies from 'js-cookie';
import config from '../../../../build/config.js';
export default {
    name: 'themeSwitch',
    data () {
        return {
            themeList: [
                {
                    name: 'black_b',
                    menu: '#495060',
                    element: '#2d8cf0'
                },
                {
                    name: 'light_b',
                    menu: '#495060',
                    element: '#2d8cf0'
                }
            ]
        };
    },
    methods: {
        setTheme (themeFile) {
            let menuTheme = themeFile.substr(0, 1);
            if (menuTheme === 'b') {
                // 黑色菜单
                this.$store.commit('changeMenuTheme', 'dark');
                menuTheme = 'dark';
            } else {
                this.$store.commit('changeMenuTheme', 'light');
                menuTheme = 'light';
            }
            let userName = Cookies.get('user');
            if (localStorage.theme) {
                let themeList = JSON.parse(localStorage.theme);
                let index = 0;
                let hasThisUser = themeList.some((item, i) => {
                    if (item.userName === userName) {
                        index = i;
                        return true;
                    } else {
                        return false;
                    }
                });
                if (hasThisUser) {
                    themeList[index].menuTheme = menuTheme;
                } else {
                    themeList.push({
                        userName: userName,
                        menuTheme: menuTheme
                    });
                }
                localStorage.theme = JSON.stringify(themeList);
            } else {
                localStorage.theme = JSON.stringify([{
                    userName: userName,
                    menuTheme: menuTheme
                }]);
            }
        }
    },
    created () {
        let name = Cookies.get('user');
        if (localStorage.theme) {
            let hasThisUser = JSON.parse(localStorage.theme).some(item => {
                if (item.userName === name) {
                    this.$store.commit('changeMenuTheme', item.menuTheme);
                    return true;
                } else {
                    return false;
                }
            });
            if (!hasThisUser) {
                this.$store.commit('changeMenuTheme', 'dark');
            }
        } else {
            this.$store.commit('changeMenuTheme', 'dark');
        }
    }
};
</script>
