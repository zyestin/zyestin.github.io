---
title: "hugo + github pages usage"
date: 2023-08-24T09:11:47+08:00
# draft: true
# bookComments: false
# bookSearchExclude: false
---

 2023最新 `hugo` + `github pages` 使用方式

网上大多是hugo旧版的使用方式，有好几处明显差异的，不值得借鉴，反正我借鉴后出现各种莫名其妙问题

---

严格按照官方这两个链接，就不会出现问题:  
* hugo [quick start](https://gohugo.io/getting-started/quick-start/)
```
hugo new site quickstart
cd quickstart
git init
git submodule add https://github.com/theNewDynamic/gohugo-theme-ananke.git themes/ananke
echo "theme = 'ananke'" >> hugo.toml
hugo server

hugo new content posts/my-first-post.md
open content/posts/my-first-post.md 
//然后进行修改
hugo server -D
//观察 http://localhost:1313/
hugo
```
* [Host on GitHub Pages](https://gohugo.io/hosting-and-deployment/hosting-on-github/)

---

需要注意的地方:  
* 请先尝试 hugo文档里提供的theme，即ananke，走通一遍流程
我就采坑了，使用了另一个theme，后面在 `localhost` 一直不出现 `my-first-post.md`

* `.github/workflows/hugo.yaml` 一定要注意修改 `HUGO_VERSION` 的值

* `my-first-post.md` 注意删掉/注释掉 draft:true
这样 push到github时，`public/index.html`等几个文件中才包含了 `my-first-post.md`的内容，访问 `https://zyestin.github.io` 时才能找到 `my-first-post.md`入口

