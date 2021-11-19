import wjButton from './button/src/index.vue'
import wjToast from './toast/index'

//以数组的结构保存组件，便于遍历
const components = [
   wjButton
]

const install = function (Vue) {
    //判断是否安装
    if (install.installed) return
    install.installed = true
    //遍历注册全局组件
    components.map(component => {
        Vue.component(component.name, component)
    })
    Vue.prototype.$wjToast = wjToast
}

//自动注册
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue)
}

export default {
    //导出的对象必须有install，才能被Vue.use()安装
    install,
    ...components,
    wjToast
}