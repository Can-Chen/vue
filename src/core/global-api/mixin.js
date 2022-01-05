/* @flow */

import { mergeOptions } from '../util/index'

export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    // 把mixin所有成员拷贝到this.options this指向Vue 注册全局选项
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
