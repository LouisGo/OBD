import {otherRouter, appRouter} from '@/router/router';
import Util from '@/libs/util';

const app = {
    state: {
        cachePage: [],
        isFullScreen: false,
        openedSubmenuArr: [], // 要展开的菜单数组
        menuTheme: 'dark', // 主题
        themeColor: '',
        pageOpenedList: [{
            title: '首页',
            path: '',
            name: 'home_index'
        }],
        currentPageName: '',
        currentPath: [
            {
                title: '首页',
                path: '',
                name: 'home_index'
            }
        ], // 面包屑数组
        menuList: [],
        routers: [
            otherRouter,
            ...JSON.parse(JSON.stringify(appRouter)) // 记住进行深拷贝
        ],
        tagsList: [...otherRouter.children],
        dontCache: [], // 在这里定义你不想要缓存的页面的name属性值(参见路由配置router.js)
        mainHandleDataCached: {
            last36Month: [],
            last1Month: [],
            top10Class: [],
            top10Listing: []
        },
        purchaseHandleDataCached: {
            last36Month: [],
            last1Month: []
        }
    },
    mutations: {
        setTagsList (state, list) {
            state.tagsList.push(...list);
        },
        // 更新左侧菜单列表
        updateMenulist (state) {
            let allows = localStorage.getItem('allows');
            if (allows) {
                allows = JSON.parse(allows);
                let menuList = [];
                JSON.parse(JSON.stringify(appRouter)).forEach((item, index) => {
                    const permission = item.permission;
                    if (permission) {
                        let length = permission.length;
                        let available = 0;
                        for (let i = 0; i < length; i++) {
                            if (allows.includes(permission[i])) {
                                available += 1;
                            }
                        }
                        if (available > 0) {
                            if (item.children.length === 1) {
                                menuList.push(item);
                            } else {
                                let index = menuList.push(item);
                                let childrenArr = [];
                                childrenArr = item.children.filter(child => {
                                    let childP = child.permission;
                                    if (childP) {
                                        let length = childP.length;
                                        let available = 0;
                                        for (let i = 0; i < length; i++) {
                                            if (allows.includes(childP[i])) {
                                                available += 1;
                                            }
                                            if (available === length) {
                                                return child;
                                            }
                                        }
                                    } else {
                                        return child;
                                    }
                                });
                                menuList[index - 1].children = childrenArr;
                            }
                        }
                    } else {
                        if (item.children.length === 1) {
                            menuList.push(item);
                        } else {
                            let index = menuList.push(item);
                            let childrenArr = [];
                            childrenArr = item.children.filter(child => {
                                let childP = child.permission;
                                if (childP) {
                                    let length = childP.length;
                                    let available = 0;
                                    for (let i = 0; i < length; i++) {
                                        if (allows.includes(childP[i])) {
                                            available += 1;
                                        }
                                        if (available === length) {
                                            return child;
                                        }
                                    }
                                } else {
                                    return child;
                                }
                            });
                            let handledItem = JSON.parse(JSON.stringify(menuList[index - 1]));
                            handledItem.children = childrenArr;
                            menuList.splice(index - 1, 1, handledItem);
                        }
                    }
                    // if (item.access !== undefined) {
                    //     if (Util.showThisRoute(item.access, accessCode)) {
                    //         if (item.children.length === 1) {
                    //             menuList.push(item);
                    //         } else {
                    //             let len = menuList.push(item);
                    //             let childrenArr = [];
                    //             childrenArr = item.children.filter(child => {
                    //                 if (child.access !== undefined) {
                    //                     if (child.access === accessCode) {
                    //                         return child;
                    //                     }
                    //                 } else {
                    //                     return child;
                    //                 }
                    //             });
                    //             menuList[len - 1].children = childrenArr;
                    //         }
                    //     }
                    // } else {
                    //     if (item.children.length === 1) {
                    //         menuList.push(item);
                    //     } else {
                    //         let len = menuList.push(item);
                    //         let childrenArr = [];
                    //         childrenArr = item.children.filter(child => {
                    //             if (child.access !== undefined) {
                    //                 if (Util.showThisRoute(child.access, accessCode)) {
                    //                     return child;
                    //                 }
                    //             } else {
                    //                 return child;
                    //             }
                    //         });
                    //         let handledItem = JSON.parse(JSON.stringify(menuList[len - 1]));
                    //         handledItem.children = childrenArr;
                    //         menuList.splice(len - 1, 1, handledItem);
                    //     }
                    // }
                });
                state.menuList = menuList;
            } else {
                return false;
            }
        },
        changeMenuTheme (state, theme) {
            state.menuTheme = theme;
        },
        addOpenSubmenu (state, name) {
            let hasThisName = false;
            let isEmpty = false;
            if (name.length === 0) {
                isEmpty = true;
            }
            if (state.openedSubmenuArr.indexOf(name) > -1) {
                hasThisName = true;
            }
            if (!hasThisName && !isEmpty) {
                state.openedSubmenuArr.push(name);
            }
        },
        closePage (state, name) {
            state.cachePage.forEach((item, index) => {
                if (item === name) {
                    state.cachePage.splice(index, 1);
                }
            });
        },
        // 初始化存储的页面
        initCachepage (state) {
            if (localStorage.cachePage) {
                state.cachePage = JSON.parse(localStorage.cachePage);
            }
        },
        removeTag (state, name) {
            state.pageOpenedList.map((item, index) => {
                if (item.name === name) {
                    state.pageOpenedList.splice(index, 1);
                }
            });
        },
        pageOpenedList (state, get) {
            let openedPage = state.pageOpenedList[get.index];
            if (get.argu) {
                openedPage.argu = get.argu;
            }
            if (get.query) {
                openedPage.query = get.query;
            }
            state.pageOpenedList.splice(get.index, 1, openedPage);
            localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
        },
        clearAllTags (state) {
            state.pageOpenedList.splice(1);
            state.cachePage.length = 0;
            localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
        },
        clearOtherTags (state, vm) {
            let currentName = vm.$route.name;
            let currentIndex = 0;
            state.pageOpenedList.forEach((item, index) => {
                if (item.name === currentName) {
                    currentIndex = index;
                }
            });
            if (currentIndex === 0) {
                state.pageOpenedList.splice(1);
            } else {
                state.pageOpenedList.splice(currentIndex + 1);
                state.pageOpenedList.splice(1, currentIndex - 1);
            }
            let newCachepage = state.cachePage.filter(item => {
                return item === currentName;
            });
            state.cachePage = newCachepage;
            localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
        },
        // 设置打开的页面
        setOpenedList (state) {
            state.pageOpenedList = localStorage.pageOpenedList ? JSON.parse(localStorage.pageOpenedList) : [otherRouter.children[0]];
        },
        setCurrentPath (state, pathArr) {
            state.currentPath = pathArr;
        },
        setCurrentPageName (state, name) {
            state.currentPageName = name;
        },
        clearOpenedSubmenu (state) {
            state.openedSubmenuArr.length = 0;
        },
        increateTag (state, tagObj) {
            if (!Util.oneOf(tagObj.name, state.dontCache)) {
                state.cachePage.push(tagObj.name);
                localStorage.cachePage = JSON.stringify(state.cachePage);
            }
            state.pageOpenedList.push(tagObj);
            localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
        },
        // 初始化主体授信缓存
        initMainHandleDataCached (state, data) {
            let mainHandleDataCached = state.mainHandleDataCached;
            for (let i in mainHandleDataCached) {
                for (let j = 0, len = data; j < len; j++) {
                    mainHandleDataCached[i].push([]);
                }
            }
        },
        // 设置主体授信缓存
        setMainHandleDataCached (state, data) {
            let mainHandleDataCached = state.mainHandleDataCached;
            mainHandleDataCached[data.name][data.index] = data.data;
        },
        // 初始化代采授信缓存
        initPurchaseHandleDataCached (state, data) {
            let purchaseHandleDataCached = state.purchaseHandleDataCached;
            for (let i in purchaseHandleDataCached) {
                for (let j = 0, len = data; j < len; j++) {
                    purchaseHandleDataCached[i].push([]);
                }
            }
        },
        // 设置代采授信缓存
        setPurchaseHandleDataCached (state, data) {
            let purchaseHandleDataCached = state.purchaseHandleDataCached;
            purchaseHandleDataCached[data.name][data.index] = data.data;
        }
    }
};

export default app;
