# 机械刷题中心（GitHub Pages 静态版）

双科目在线刷题站：机械原理（11 章 · 3498 题）+ 机械设计（14 章 · 3088 题）。
纯静态实现，可直接托管在 GitHub Pages（或任何静态托管）上，无需服务器。

## 部署步骤

1. 在 GitHub 新建一个仓库（公开仓库才能用免费 Pages）。
2. 把本目录全部内容推送到仓库：

   ```
   cd github-pages
   git init
   git add .
   git commit -m "机械刷题中心静态版"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```

3. 仓库页面 → Settings → Pages → Branch 选 `main` + `/ (root)` → Save。
4. 一两分钟后访问 `https://<你的用户名>.github.io/<仓库名>/`。

## 文件说明

| 路径 | 内容 |
|---|---|
| `index.html` / `app.js` / `styles.css` | 单页应用（与安卓离线版同一套界面与逻辑） |
| `data/jxyl.json` `data/jxsj.json` | 两科目完整题库（题目、答案、图片引用） |
| `img/*.jpg` | 2714 张题图 / 答案图（明文） |
| `.nojekyll` | 跳过 GitHub Pages 的 Jekyll 处理 |

- 首页选科目；`index.html#/jxyl`、`#/sheji` 可直达对应科目。
- 进度/错题/试卷记录保存在浏览器 localStorage；学习记录 JSON 导入导出、错题同步码与网页服务器版/安卓离线版互通。
- Word 试卷导出在浏览器内完成（含图片）。

## 重新生成数据

题库更新后，在上级目录（融合刷题网站）运行：

```
python tools/构建GitHubPages静态版.py
```

会重新解密 `public/protected` 并覆盖本目录的 `data/` 与 `img/`。

## 注意

- 静态托管上题库与图片为**明文公开**，加密保护不适用于此版本；如需保留服务端加密架构，请使用服务器版部署。
- 本目录总大小约 109MB，符合 GitHub 仓库与 Pages 限制（单文件 <100MB，Pages ≤1GB）。
