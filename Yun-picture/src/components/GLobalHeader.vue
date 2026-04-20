#<template>
  <div id="globalHeader">
    <div class="test"></div>
    <a-row :wrap="false" :gutter="[0, 16]">
      <a-col flex="200px">
        <router-link to="/">
          <div class="title-bar">
            <img src="../assets/logo.svg" alt="logo" class="logo" />
            <div class="title">云图库</div>
          </div>
        </router-link></a-col
      >
      <!-- 桌面端菜单 - 中等及以上屏幕显示 -->
      <a-col flex="auto" class="desktop-menu">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="menuItems"
          @click="doMenuClick"
      /></a-col>
      <!-- 移动端菜单按钮 - 小屏幕显示 -->
      <a-col class="mobile-menu-toggle">
        <a-dropdown v-model:open="mobileMenuVisible" placement="bottomRight">
          <a-button type="text" size="large">
            <MenuUnfoldOutlined v-if="!mobileMenuVisible" />
            <MenuFoldOutlined v-else />
          </a-button>
          <template #overlay>
            <a-menu
              v-model:selectedKeys="current"
              mode="vertical"
              :items="menuItems"
              @click="doMenuClick"
              style="min-width: 200px;"
            />
          </template>
        </a-dropdown>
      </a-col>
      <!-- 用户信息展示 -->
      <a-col flex="120px" class="user-section">
        <div v-if="Loginstore.loginUser?.id">
          <a-dropdown>
            <a-space>
              <a-avatar :src="Loginstore.loginUser.userAvatar" />
              {{ Loginstore.loginUser?.userName }}
            </a-space>
            <template #overlay>
              <a-menu>
                <a-menu-item >
                  <LogoutOutlined />
                     <router-link to="/user/userserver">个人设置</router-link>
                </a-menu-item>
                <a-menu-item @click="doLogout">
                  <LogoutOutlined />
                  <a href="javascript:;">退出登录</a>
                </a-menu-item>
                <a-menu-item>
                  <GatewayOutlined />
                  <router-link to="/my_space">我的空间</router-link>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <div v-else class="user-login-status">
          <a-button type="primary" @click="dologin">登录</a-button>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { h, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { LogoutOutlined, GatewayOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
// ✅ 正确写法：直接指向具体的文件路径
import  message  from 'ant-design-vue/es/message'
import type { MenuProps } from 'ant-design-vue/es/menu'
import { useLoginUserstore } from '@/stores/useLoginUserstore'
import { userLogoutUsingPost } from '@/api/userController'
import ACCESS_ENUM from '@/access/accessEnum'
import checkAccess from '@/access/checkAccess'
import { getIconComponent } from '@/utils/iconUtils'

type ACCESS_ENUMType = (typeof ACCESS_ENUM)[keyof typeof ACCESS_ENUM]

const current = ref<string[]>([])
const Loginstore = useLoginUserstore()
const router = useRouter()
const mobileMenuVisible = ref(false)

// 定义扩展菜单项接口
interface ExtendedMenuItem {
  key: string
  icon?: () => unknown
  label: unknown
  title?: unknown
  access?: ACCESS_ENUMType | null
  hide?: boolean
}

const Menu = ref<ExtendedMenuItem[]>([])

onMounted(() => {
  const routeitems = router.options.routes
  // console.log(routeitems)
  Menu.value = routeitems.map((item) => {
    const iconComponent = getIconComponent(item.meta?.icon as string)
    return {
      key: item.path,
      title: item.meta?.title ?? (typeof item.name === 'string' ? item.name : undefined),
      label: item.meta?.title ?? item.name,
      icon: iconComponent ? () => h(iconComponent) : undefined,
      access: item.meta?.access ?? null,
      hide: item.meta?.hide ?? false,
    }
  })
})
// 根据用户权限过滤菜单项
const menuItems = computed<MenuProps['items']>(() => {
  const loginUser = Loginstore.loginUser
  return Menu.value.filter((item) => {
    // 过滤掉需要隐藏的菜单
    if (item.hide) return false
    const needAccess = item.access ?? ACCESS_ENUM.NOT_LOGIN
    return checkAccess(loginUser, needAccess)
  }) as MenuProps['items']
})

// 进入新路由改变高亮
router.afterEach((to) => {
  current.value = [to.path]
})

// 菜单点击回调 跳转路由
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}
const dologin = () => {
  router.push('/user/login')
}
//退出登陆
const doLogout = async () => {
  const res = await userLogoutUsingPost()
  if (res.data.code === 0) {
    Loginstore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登录成功')
    router.push('/user/login')
  } else {
    message.error(`退出登陆失败` + res.data.message)
  }
}
</script>
<style scoped>
#globalHeader {
  background: #fff;
  padding: 0 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

#globalHeader .title-bar {
  display: flex;
  align-items: center;
}

.logo {
  height: 48px;
}

.title {
  color: black;
  font-size: 18px;
  margin-left: 16px;
}

/* 桌面端菜单显示控制 */
.desktop-menu {
  display: block;
}

.mobile-menu-toggle {
  display: none;
}

.user-section {
  flex-shrink: 0;
}

/* 移动端适配 - 屏幕宽度小于 768px 时 */
@media (max-width: 768px) {
  #globalHeader {
    padding: 0 8px;
  }

  .desktop-menu {
    display: none !important;
  }

  .mobile-menu-toggle {
    display: block !important;
  }

  /* 调整用户区域在移动端的显示 */
  .user-section {
    flex: auto !important;
    text-align: right;
  }

  .logo {
    height: 36px;
  }

  .title {
    font-size: 16px;
    margin-left: 8px;
  }
}
</style>
