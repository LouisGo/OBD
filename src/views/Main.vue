<template>
    <div class="main" :class="{'main-hide-text': shrink}">
        <div class="sidebar-menu-con" :style="{width: shrink?'60px':'200px', overflow: shrink ? 'visible' : 'auto'}">
            <shrinkable-menu 
                :shrink="shrink"
                @on-change="handleSubmenuChange"
                :theme="menuTheme" 
                :before-push="beforePush"
                :open-names="openedSubmenuArr"
                :menu-list="menuList">
                <Row slot="top" type="flex" justify="center" align="middle" class="logo-con" :style="menuTheme !== 'dark' ? 'border-bottom: 1px solid #eee' : 'border-bottom: 1px solid #565e6f'">
                    <!-- <img v-show="!shrink" src="../images/logo.jpg" key="max-logo" />
                    <img v-show="shrink" src="../images/logo-min.jpg" key="min-logo" /> -->
                    <Col class="logo" v-show="!shrink">OBD管理中心</Col>
                    <Col class="logo" v-show="shrink">OBD</Col>
                </Row>
            </shrinkable-menu>
        </div>
        <div class="main-header-con" :style="{paddingLeft: shrink?'60px':'200px'}">
            <div class="main-header">
                <div class="navicon-con">
                    <Button :style="{transform: 'rotateZ(' + (this.shrink ? '-90' : '0') + 'deg)'}" style="margin-left:5px;" type="text" @click="toggleClick">
                        <Icon type="navicon" size="28"></Icon>
                    </Button>
                </div>
                <Row type="flex" align="middle" style="float: right; width: calc(100% - 80px); height: 60px;">   
                    <Col :lg="16" :md="12" :sm="12" :xs="12" class="header-middle-con">
                        <div class="main-breadcrumb">
                            <breadcrumb-nav :currentPath="currentPath"></breadcrumb-nav>
                        </div>
                    </Col>
                    <Col :lg="8" :md="12" :sm="12" :xs="12" class="header-avator-con">
                        <theme-switch></theme-switch>
                        <div class="user-dropdown-menu-con">
                            <Row type="flex" justify="end" align="middle" class="user-dropdown-innercon">
                                <img class="avatar" src="../images/avatar-default.png" alt="avatar">
                                <Dropdown placement="bottom-end" transfer trigger="click" @on-click="handleClickUserDropdown">
                                    <a href="javascript:void(0)">
                                        <span class="main-user-name">{{ userName }}</span>
                                        <Icon type="arrow-down-b"></Icon>
                                    </a>
                                    <DropdownMenu slot="list">
                                        <DropdownItem name="ownSpace" disabled>
                                            <p style="text-align:center">
                                                <Icon type="person" size="14"></Icon>
                                                <span style="margin-left:4px;">个人中心</span>
                                            </p>
                                        </DropdownItem>
                                        <DropdownItem name="loginout" divided>
                                            <p style="text-align:center">
                                                <Icon type="power" size="14"></Icon>
                                                <span style="margin-left:4px;">退出登录</span>
                                            </p>
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>
            
            <div class="tags-con">
                <tags-page-opened :pageTagsList="pageTagsList"></tags-page-opened>
            </div>
        </div>
        <div class="single-page-con" :style="{paddingLeft: shrink?'60px':'200px'}">
            <div class="single-page">
                <keep-alive :include="cachePage">
                    <router-view></router-view>
                </keep-alive>
            </div>
        </div>
    </div>
</template>
<script>
    import shrinkableMenu from './main-components/shrinkable-menu/shrinkable-menu.vue';
    import tagsPageOpened from './main-components/tags-page-opened.vue';
    import breadcrumbNav from './main-components/breadcrumb-nav.vue';
    import themeSwitch from './main-components/theme-switch/theme-switch.vue';
    import Cookies from 'js-cookie';
    import util from '@/libs/util.js';
    import { mapState } from 'vuex';
    
    export default {
        components: {
            shrinkableMenu,
            tagsPageOpened,
            breadcrumbNav,
            themeSwitch
        },
        data () {
            return {
                shrink: false,
                userName: '',
                openedSubmenuArr: this.$store.state.app.openedSubmenuArr
            };
        },
        computed: {
            ...mapState({
                menuList: state => state.app.menuList,
                pageTagsList: state => state.app.pageOpenedList,
                currentPath: state => state.app.currentPath,
                cachePage: state => state.app.cachePage,
                menuTheme: state => state.app.menuTheme
            })
        },
        methods: {
            init () {
                let pathArr = util.setCurrentPath(this, this.$route.name);
                this.$store.commit('updateMenulist');
                if (pathArr.length >= 2) {
                    this.$store.commit('addOpenSubmenu', pathArr[1].name);
                }
                this.userName = Cookies.get('user');
                this.checkTag(this.$route.name);
            },
            toggleClick () {
                this.shrink = !this.shrink;
            },
            handleClickUserDropdown (name) {
                if (name === 'ownSpace') {
                    // util.openNewPage(this, 'ownspace_index');
                    // this.$router.push({
                    //     name: 'ownspace_index'
                    // });
                } else if (name === 'loginout') {
                    // 退出登录
                    this.$store.dispatch('logout');
                    this.$store.commit('clearOpenedSubmenu');
                    this.$router.push({
                        name: 'login'
                    });
                }
            },
            checkTag (name) {
                let openpageHasTag = this.pageTagsList.some(item => {
                    if (item.name === name) {
                        return true;
                    }
                });
                if (!openpageHasTag) { //  解决关闭当前标签后再点击回退按钮会退到当前页时没有标签的问题
                    util.openNewPage(this, name, this.$route.params || {}, this.$route.query || {});
                }
            },
            handleSubmenuChange (val) {
                // console.log(val)
            },
            beforePush (name) {
                // if (name === 'accesstest_index') {
                //     return false;
                // } else {
                //     return true;
                // }
                return true;
            }
        },
        watch: {
            '$route' (to) {
                this.$store.commit('setCurrentPageName', to.name);
                let pathArr = util.setCurrentPath(this, to.name);
                if (pathArr) {
                    if (pathArr.length > 2) {
                        this.$store.commit('addOpenSubmenu', pathArr[1].name);
                    }
                    this.checkTag(to.name);
                    localStorage.currentPageName = to.name;
                }
            },
            lang () {
                util.setCurrentPath(this, this.$route.name); // 在切换语言时用于刷新面包屑
            }
        },
        mounted () {
            this.init();
        },
        created () {
            // 显示打开的页面的列表
            this.$store.commit('setOpenedList');
        }
    };
</script>
<style lang="less">
@import '../styles/variable';

.lock-screen-back {
    border-radius: 50%;
    z-index: -1;
    box-shadow: 0 0 0 0 #667aa6 inset;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    transition: all 3s;
}

.main {
    position: absolute;
    width: 100%;
    height: 100%;
    .unlock-con {
        width: 0px;
        height: 0px;
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 11000;
    }
    .sidebar-menu-con {
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 21;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        border-right: 1px solid #dddee1;
    }
    .layout-text {
        white-space: nowrap;
    }
    .layout-text-noicon {
        padding-left: 5px;
    }
    .main-hide-text .layout-text {
        display: none;
    }
    .main-hide-text .layout-text-noicon {
        display: none;
    }
    &-content-container {
        position: relative;
    }
    &-header-con {
        box-sizing: border-box;
        position: fixed;
        display: block;
        padding-left: 200px;
        width: 100%;
        height: 100px;
        z-index: 20;
        box-shadow: 0 1px 2px rgba(0, 0, 0, .1);
        transition: padding .3s;
    }
    &-menu-left {
        background: #464c5b;
        height: 100%;
    }
    .tags-con {
        height: 40px;
        z-index: -1;
        background: #f9f9f9;
        .tags-outer-scroll-con {
            position: relative;
            box-sizing: border-box;
            padding-right: 60px;
            width: 100%;
            height: 100%;
            .tags-inner-scroll-body {
                position: absolute;
                padding: 2px 10px;
                overflow: visible;
                white-space: nowrap;
                transition: all .3s ease;
            }
            .close-all-tag-con {
                position: absolute;
                right: 0;
                top: 0;
                box-sizing: border-box;
                padding-top: 8px;
                text-align: center;
                width: 54px;
                height: 40px;
                z-index: 10;
                cursor: pointer;                
                .tags-tools {
                    position: absolute;
                    top: 34px;
                    right: 8px;
                    width: 100px;
                    margin: 5px 0;
                    padding: 5px 0;
                    background: #fff;
                    border-radius: 4px;
                    box-shadow: 0 1px 6px rgba(0,0,0,.2);
                    box-sizing: border-box;
                    li {
                        padding: 7px 16px;
                        white-space: nowrap;
                        line-height: normal;
                        cursor: pointer;
                        transition: background .2s ease-in-out;
                        &:hover {
                            background: #f3f3f3;
                        }
                    }
                }
                > i {
                    transition: all 0.3s ease;
                }
                &:hover > i {
                    color: #57a3f3;
                }
            }
        }
    }
    &-header {
        height: 60px;
        background: #fff;
        border-bottom: 1px solid #eee;
        position: relative;
        z-index: 11;
        .navicon-con {
            display: inline-block;
            width: 80px;
            line-height: 60px;
        }
        .header-middle-con {

        }
        .header-avator-con {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            .switch-theme-con {
                display: inline-block;
            }
            .message-con {
                display: inline-block;
                padding: 0 7px;
                text-align: center;
                cursor: pointer;
                i {
                    vertical-align: middle;
                }
            }
            .change-skin {
                font-size: 14px;
                font-weight: 500;
                padding-right: 5px;
            }
            .user-dropdown {
                &-menu-con {
                    display: inline-block;        
                    .main-user-name {
                        display: inline-block;
                        max-width: 140px;
                        overflow: hidden;
                        vertical-align: middle;
                        word-break: keep-all;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        text-align: right;
                    }
                }
                &-innercon {
                    padding-right: 20px;
                }
            }
            .lock-screen-btn-con {
                display: inline-block;
                padding: 0 7px;
                text-align: center;
                cursor: pointer;
                i {
                    vertical-align: middle;
                }
            }
        }
    }
    .single-page-con {
        padding-left: 200px;
        padding-top: 100px;
        background-color: #ececec;
        z-index: 1;
        transition: padding .3s;
        .single-page {
            margin: 10px;
        }
    }
    &-copy {
        text-align: center;
        padding: 10px 0 20px;
        color: #9ea7b4;
    }
}

.taglist-moving-animation-move {
    transition: transform .3s;
}

.logo-con {
    width: 100%;
    height: 60px;
    .logo {
        font-size: 20px;
        font-weight: 500;
        color: #2696ff;
    }
    img {
        height: 44px;
        width: auto;
    }
}
.avatar {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    border-radius: 12px;
    border: 1px solid #eee;
    margin: 0px 12px 0px 18px;
    text-align: center;
    color: #fff;
    white-space: nowrap;
    position: relative;
    overflow: hidden;
    vertical-align: middle;
}
</style>