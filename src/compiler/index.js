/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  // 把模板转换成 ast 抽象语法树
  // 为什么采用ast
  // 模板字符串转换成ast后，可以通过ast对模板做优化处理
  // 标记模板中的静态内容，在patch的时候直接跳过静态内容
  // 在patch的过程中静态内容不需要对比和重新渲染
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    // 优化抽象语法树
    optimize(ast, options)
  }
  // 把抽象语法树生成字符串字符串形式的 js 代码
  const code = generate(ast, options)
  return {
    ast,
    // 渲染函数 此时的render是字符串形式的
    render: code.render,
    // 静态渲染函数 生成静态 vnode树
    staticRenderFns: code.staticRenderFns
  }
})
