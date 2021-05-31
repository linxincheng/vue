import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// vue的构造函数
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue) // vue是不是new出来的
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 初始化
  this._init(options)
}

initMixin(Vue) // 挂载初始化方法（_init）
stateMixin(Vue) // 挂载状态处理方法
eventsMixin(Vue) // 挂载事件的方法
lifecycleMixin(Vue) // 挂载 生命周期的方法
renderMixin(Vue) // 挂载与渲染有关的方法

export default Vue
