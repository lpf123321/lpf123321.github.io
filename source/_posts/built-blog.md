---
title: 从零开始：用 GitHub Pages + Hexo 搭建个人博客
date: 2026-02-09 13:00:00
tags:
  - 教程
  - Hexo
categories:
  - 技术分享
#index_img: /img/hexo-cover.jpg  # 这里记得换成你自己 source/img 里的图片路径
excerpt: 零基础小白也能拥有自己的网站？手把手教你使用 Hexo + GitHub Actions 搭建完全免费、自动部署的个人博客。
---
不需要购买服务器，不需要备案，甚至不需要懂复杂的编程，只要你有一个 GitHub 账号，就能免费搭建一个高颜值的网站！

## 为什么要用 Hexo + GitHub Pages？

*   **免费**：GitHub Pages 提供免费的静态网页托管服务。
*   **快速**：Hexo 是基于 Node.js 的静态博客框架，生成页面的速度极快。
*   **好看**：有海量的主题（Theme）可供选择，比如我现在用的这款 Fluid 主题。
*   **极客范**：支持 Markdown 写作，像写代码一样写文章，非常适合记录学习笔记。

---

## 第一步：环境准备（磨刀不误砍柴工）

在开始之前，我们需要安装三个必备工具。

### 1. 安装 Node.js
Hexo 是基于 Node.js 运行的。
*   前往 [Node.js 官网](https://nodejs.org/) 下载 **LTS (长期支持版)**。
*   安装后，打开终端（Win+R 输入 cmd），输入 `node -v`，如果出现版本号说明安装成功。

### 2. 安装 Git
Git 是用来把你的本地代码“推”到 GitHub 上的工具。
*   前往 [Git 官网](https://git-scm.com/) 下载对应系统的安装包。
*   安装时一路“下一步”即可。
*   安装后在终端输入 `git --version` 验证。

### 3. 安装 VS Code (推荐)
虽然记事本也能写代码，但 [VS Code](https://code.visualstudio.com/) 能让你事半功倍，它有很好的终端集成和代码高亮。

---

## 第二步：GitHub 仓库配置

1.  登录 [GitHub](https://github.com/)。
2.  点击右上角的 **+** 号，选择 **New repository**。
3.  **仓库名（Repository name）非常重要**：必须是 `<你的用户名>.github.io`。
    *   比如我的用户名是 `lpf123321`，仓库名就是 `lpf123321.github.io`。
4.  选择 **Public**（公开）。
5.  点击 **Create repository**。

---

## 第三步：本地安装 Hexo

在你的电脑上找一个风水宝地（比如 D 盘的 Blog 文件夹），右键选择“在终端中打开”或者 Git Bash Here。

依次输入以下命令：

```bash
# 1. 安装 Hexo 全局工具并验证
npm install -g hexo-cli
hexo -v

# 2. 初始化博客文件夹（blog 是文件夹名，可以自己改）
hexo init blog

# 3. 进入文件夹
cd blog

# 4. 安装依赖
npm install
```
此时，你的博客雏形已经诞生了！输入 `hexo s`，然后在浏览器访问 `http://localhost:4000`，你应该能看到 Hexo 的默认页面。

---

## 第四步：配置自动化部署 (GitHub Actions)

这是最关键的一步。传统的 Hexo 部署需要复杂的密钥配置，而使用 **GitHub Actions**，我们只需要推送代码，GitHub 就会自动帮我们生成网页并发布。

1.  在博客根目录下新建文件夹 `.github`，在里面建 `workflows` 文件夹。
2.  新建文件 `pages.yml`，填入以下内容：

```yaml
name: Deploy Hexo Site to Pages

on:
  push:
    branches:
      - main  # 注意这里：如果你是 master 分支，请改成 master

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive # 如果用了主题，这行很重要
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm install

      - name: Build Hexo
        run: npx hexo generate

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3.  修改根目录下的 `_config.yml`，找到 URL 部分：
    ```yaml
    url: https://<你的用户名>.github.io
    root: /
    ```

---

## 第五步：推送到 GitHub

回到终端，我们将本地的代码关联到远程仓库。

> **注意**：如果你在国内，可能会遇到 `Connection refused` 报错。建议开启加速器，或者配置 Git 代理。

```bash
# 初始化 Git
git init

# 添加所有文件
git add .

# 提交（这一步只是提交到本地记录）
git commit -m "Initial commit"

# 关联远程仓库（把链接换成你自己的）
git remote add origin https://github.com/<你的用户名>/<你的仓库名>.git

# 推送到 GitHub (第一次可能需要验证账号密码)
git push -u origin main
```

推送成功后，去 GitHub 仓库的 **Actions** 标签页，你会看到一个黄色的圆圈在转。等它变成**绿色对号**，你的博客就正式上线了！

---
## 第六步：写新文章
只需要在终端输入：
```bash
hexo new "文章标题"
```
然后在 `source/_posts` 下找到对应的 `.md` 文件，用 Markdown 语法愉快地写作吧！
写完后，**一定**要在本地先看看效果，避免排版错误直接发到网上。

在终端执行：
```powershell
hexo clean   # 清除缓存（防止旧样式残留）
hexo s       # 启动本地服务器
```

打开浏览器访问 `http://localhost:4000`。确认本地效果满意后，按下 `Ctrl + C` 停止本地服务器，然后执行 `git add .` -> `git commit` -> `git push` 三连即可。

推送成功后，去 GitHub 仓库的 **Actions** 栏看看。你会发现一个新的 workflow 正在运行，等它变绿（Success），刷新你的博客网址，文章就上线了！

---

## 常见坑点 & 避雷指南

### 1. 网络连接失败 (Port 443 Timed out)
这是最常见的问题。如果你有科学上网工具，记得给 Git 设置代理：
```bash
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```
*(注意：端口号 7890 要看你自己的软件设置)*

### 2. 主题文件夹为空
如果你下载了第三方主题（如 Fluid），**千万记得删除主题文件夹里的 `.git` 隐藏目录**！否则 GitHub 无法识别主题文件，导致页面一片空白。

### 3. 怎么写新文章？
只需要在终端输入：
```bash
hexo new "文章标题"
```
然后在 `source/_posts` 下找到对应的 `.md` 文件，用 Markdown 语法愉快地写作吧！写完后执行 `git add .` -> `git commit` -> `git push` 三连即可。

### 小技巧：如何写草稿？

如果你有一篇文章写了一半不想发，但又想把其他改动推送到 GitHub 备份，可以使用草稿功能：

1.  **新建草稿**：
    ```powershell
    hexo new draft "未完成的草稿"
    ```
    *   文件会生成在 `source/_drafts/` 目录下。
    *   普通的 `hexo g` 或 GitHub Actions **不会**把草稿渲染到正式网站上。

2.  **本地预览草稿**：
    如果你想在本地预览草稿，命令要加参数：
    ```powershell
    hexo s --draft
    ```

3.  **正式发布草稿**：
    写完后，执行以下命令，它会把文件从 `_drafts` 移到 `_posts`：
    ```powershell
    hexo publish "未完成的草稿"
    ```
    然后推送到 GitHub 即可。
---

## 结语

搭建博客只是第一步，坚持写作才是最难的。希望大家都能在这个喧嚣的互联网中，拥有一个属于自己的安静角落。

如果你在搭建过程中遇到问题，欢迎联系我！