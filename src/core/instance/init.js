/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

// 在Vue的源码中每一个类型的实例都会有一个唯一标识
let uid = 0

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    // 当前的vue实例
    const vm: Component = this
    // a uid
    // 唯一标识
    vm._uid = uid++ 

    // 测试性能用的，略
    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    if (options && options._isComponent) { // 是不是一个组件
      // 开始进行源码分析，一般都是使用简单的Vue实例，这里针对组件，暂时略
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions( // mergerOptions 可以简单理解为配置合并
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }



    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm) // 已经尝试使用vue3.0语法了
    } else {
      vm._renderProxy = vm
    }

    // expose real self
    vm._self = vm


    initLifecycle(vm) // 初始化生命周期的一些状态变量
    initEvents(vm) // 初始化事件的容器
    initRender(vm) // 初始化创建元素的方法
    callHook(vm, 'beforeCreate') // 调用生命周期函数
    initInjections(vm) // resolve injections before data/props // 初始化注入器
    initState(vm) // 初始化状态数据 （data，property等）
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created') // 生命周期函数的调用

    /* istanbul ignore if */
    // 又是对性能进行测试
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    // 前面的代码是组件的创建

    if (vm.$options.el) {
      vm.$mount(vm.$options.el) // 组件的挂载，将组件挂载el的元素上
      // 先调用 扩展的那个$mount 方法 ，生成render
      // 再调用原始的 $mount 方法， 获得元素，再调用mountComponent 方法
      // 这两个都定义在platform/web里面
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
