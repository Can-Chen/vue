/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  // 给vue挂载一个 use方法
  Vue.use = function (plugin: Function | Object) {
    // this指向vue构造函数
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))

    // 判断注册的插件是否存在
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    // 把数组中的第一个参数（plugin）去除
    const args = toArray(arguments, 1)

    // 把this插入到数组第一位
    args.unshift(this)

    // 执行插件
    // 传对象
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    // 传函数
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }

    // 保存已安装的插件
    installedPlugins.push(plugin)
    return this
  }
}
