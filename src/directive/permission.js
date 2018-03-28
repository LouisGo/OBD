import Vue from 'vue';

Vue.directive('permission', {
    bind: (el, binding, vnode) => {
        let value = binding.value;
        let allows = localStorage.getItem('allows'); // 获取权限数组
        if (Array.isArray(value)) {
            value.forEach(item => {
                if (!allows.includes(item)) {
                    el.style.display = 'none';
                    el.text = '';
                }
            });
        } else {
            if (!allows.includes(value)) {
                el.style.display = 'none';
                el.text = '';
            }
        }
    }
});
