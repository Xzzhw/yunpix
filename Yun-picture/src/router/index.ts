import ACCESS_ENUM from '@/access/accessEnum'
import { createRouter, createWebHistory } from 'vue-router'
import type { Component } from 'vue'

// 扩展路由 meta 类型
declare module 'vue-router' {
  interface RouteMeta {
    access?: (typeof ACCESS_ENUM)[keyof typeof ACCESS_ENUM] | null
    hide?: boolean
    icon?: string
    title?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '首页',
      component: () => import('@/pages/HomePage.vue'),
      meta: {
        icon: 'HomeOutlined',
        title: '主页',
      },
    },
    {
      path: '/user/login',
      name: '登录',
      component: () => import('@/pages/user/UserLoginPage.vue'),
      meta: {
        hide: true,
      },
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: () => import('@/pages/user/UserResgiterPage.vue'),
      meta: {
        hide: true,
      },
    },
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: () => import('@/pages/admin/UserManagePage.vue'),
      meta: {
        access: ACCESS_ENUM.ADMIN,
        icon: 'UserOutlined',
        title: '用户管理',
      },
    },
    {
      path: '/user/userserver',
      name: '用户页面',
      component: () => import('@/pages/user/UserServerPage.vue'),
      meta: {
        hide: true,
      },
    },
    {
      path: '/add_picture',
      name: '添加图片',
      component: () => import('@/pages/AddPicturePage.vue'),
      meta: {
        icon: 'PlusOutlined',
        title: '添加图片',
      },
    },
    {
      path: '/add_space',
      name: '添加空间',
      component: () => import('@/pages/AddSapcePage.vue'),
      meta: {
        icon: 'FolderAddOutlined',
        title: '添加空间',
      },
    },
    {
      path: '/admin/pictureManage',
      name: '图片管理',
      component: () => import('@/pages/admin/PictureManagePage.vue'),
      meta: {
        access: ACCESS_ENUM.ADMIN,
        icon: 'PictureOutlined',
        title: '图片管理',
      },
    },
    {
      path: '/picture/:id',
      name: '图片详细',
      component: () => import('@/pages/PictureDetailPage.vue'),
      props: true,
      meta: {
        hide: true,
      },
    },
    {
      path: '/add_picture/batch',
      name: '批量创建图片',
      component: () => import('@/pages/AddPictureBatchPage.vue'),
      meta: {
        hide: true,
      },
    },
    {
      path: '/admin/spaceManage',
      name: '空间管理',
      component: () => import('@/pages/admin/SpaceManagePage.vue'),
      meta: {
        access: ACCESS_ENUM.ADMIN,
        icon: 'AppstoreOutlined',
        title: '空间管理',
      },
    },
    {
      path: '/spaceUserManage/:spaceId',
      name: '团队空间用户管理',
      component: () => import('@/pages/admin/SpaceUserManagePage.vue'),
      meta: {
        hide: true,
      },
      props: true,
    },
    {
      path: '/my_space',
      name: '我的空间',
      component: () => import('@/pages/MySpacePage.vue'),
      meta: {
        title: '我的空间',
        hide: true,
      },
    },
    {
      path: '/space/:id',
      name: '空间详情',
      component: () => import('@/pages/SpaceDetailPage.vue'),
      props: true,
      meta: {
        title: '空间详细',
        hide: true,
      },
    },
    {
      path: '/search_picture',
      name: '图片搜索',
      component: () => import('@/pages/SearchPicturePage.vue'),
      meta: {
        title: '图片搜索',
        hide: true,
      },
    },
    {
      path: '/space_analyze',
      name: '空间分析',
      component: () => import('@/pages/SpaceAnalyzePage.vue'),
      props: true,
      meta: {
        title: '空间分析',
        hide: true,
      },
    },
  ],
})

export default router
