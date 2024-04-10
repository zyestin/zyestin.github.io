---
title: "hooks开发工具"
date: 2023-11-01T12:00:11+08:00
draft: false
categories: [react]
tags: [react, tool]
---



## 常用hooks依赖检查，从源头提醒避免奇葩bug

https://github.com/facebook/react/issues/14920

ESLint提供，检查useEffect依赖 && autoFix，  

用上后 估计能大大降低 无法获取state最新值、漏掉依赖后奇怪的bug


