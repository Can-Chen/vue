/* @flow */

// 打包完整版本文件
// 运行时和编译器

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

// 保留vue实例的$mount方法
const mount = Vue.prototype.$mount

/**
 * 如果同时传递template和render会执行谁？
 * 从下面的if语句中可以看到，很显然执行render函数
 */

// call stack 调用堆栈

// 匿名函数(script) -- new Vue  -- Vue._init -- Vue.$mount

Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {

  // 获取el对象 如果传了el 使用query处理el
  el = el && query(el)

  /* istanbul ignore if */
  // el不能是 body 或 html
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function

  // options是否存在render
  if (!options.render) {
    // 如果没有render会去取template编译成render
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {

          // 如果是id选择器，就去获取入口下面所有标签innerHTML当作模板返回
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        // 否则返回实例
        return this
      }
    } else if (el) {
      // 渲染DOM
      // 如果没有template 获取el的outerHTML作为模板
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      // 帮助生成render函数
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }

  // 调用 mount 方法 渲染DOM
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

// 编译 把html字符串编译成render函数
Vue.compile = compileToFunctions

export default Vue
