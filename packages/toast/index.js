import Toast from './src/index.vue'

let instance

const toast = function(options){
    options = options || {}
    instance = new Toast({
        data:options,
    })
    instance.$mount()
    document.body.appendChild(instance.$el)
}

export default toast
