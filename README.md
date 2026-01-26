# HCCS 签到系统 - 前端

基于 Vue 3 + TypeScript + Element Plus + Vite 构建的前后端分离项目。

## 技术栈

- Vue 3 (Composition API)
- TypeScript
- Element Plus UI 框架
- Pinia 状态管理
- Vue Router 4 路由
- Axios HTTP 客户端
- Vite 构建工具

## 功能特性

- ✅ 用户注册/登录
- ✅ JWT Token 认证
- ✅ 路由守卫
- ✅ Axios 请求/响应拦截器
- ✅ 用户信息管理
- ✅ 响应式布局

## 安装依赖

```bash
npm install
```

## 开发模式

```bash
npm run dev
```

访问：http://localhost:3000

## 构建生产版本

```bash
npm run build
```

## 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── api/          # API 接口
├── stores/       # Pinia 状态管理
├── router/       # 路由配置
├── views/        # 页面组件
├── utils/        # 工具函数
├── App.vue       # 根组件
└── main.ts       # 入口文件
```

## 后端 API

确保后端服务运行在 `http://localhost:5000`

主要接口：
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- GET /api/auth/me - 获取用户信息

## 配置

在 `vite.config.ts` 中可以修改代理配置：

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',  // 修改为你的后端地址
      changeOrigin: true
    }
  }
}
```
