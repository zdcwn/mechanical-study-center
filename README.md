# 机械刷题中心（GitHub Pages 静态版）

双科目在线刷题站：机械原理（11 章 · 3498 题）+ 机械设计（14 章 · 3088 题）。
**与服务器版完全相同的桌面 UI**（React + Tailwind），通过 esbuild 打包为纯静态单页应用，托管在 GitHub Pages，无需服务器。

## 部署状态

- 仓库：<https://github.com/zdcwn/mechanical-study-center>
- 站点：<https://zdcwn.github.io/mechanical-study-center/>

## 更新流程

题库更新后：

1. 在上级目录（融合刷题网站）运行 `python tools/构建GitHubPages静态版.py`（重新解密生成 `data/` 与 `img/`）
2. 若界面代码有改动，重新打包：
   ```
   node tools\build_pages_css.mjs
   node_modules\.bin\esbuild.cmd pages-app/main.tsx --bundle --minify --format=iife --jsx=automatic --target=es2020 --charset=utf8 --outdir=github-pages --entry-names=app
   ```
3. 在 `github-pages` 目录 `git add . && git commit -m 更新 && git push`

## 结构

| 路径 | 内容 |
|---|---|
| `index.html` / `app.js` / `app.css` | React 单页应用（源码在上级 `pages-app/`） |
| `data/jxyl.json` `data/jxsj.json` | 两科目完整题库（题目、答案、图片路径） |
| `img/*.jpg` | 2714 张题图 / 答案图（明文） |
| `.nojekyll` | 跳过 GitHub Pages 的 Jekyll 处理 |

- 路由：`#/` 科目首页，`#/yuanli` 机械原理，`#/sheji` 机械设计
- 组卷分类器（大题方向/知识点分散）在浏览器端运行，与服务器版逐字一致
- Word 试卷导出在浏览器内完成（含图片）
- 进度/错题/试卷记录存浏览器 localStorage；同步码与服务器版、安卓离线版互通

## 注意

- 静态托管上题库与图片为**明文公开**，加密保护不适用于此版本。
- 本目录总大小约 110MB，符合 GitHub 仓库与 Pages 限制。
