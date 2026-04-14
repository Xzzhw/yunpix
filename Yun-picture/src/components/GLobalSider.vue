<template>
  <div id="global-sider">
    <a-layout-sider
      v-if="loginUserstore.loginUser.id"
      width="200"
      style="background: #fff"
      breakpoint="lg"
      collapsed-width="0"
    >
      <a-menu
        v-model:selectedKeys="current"
        mode="inline"
        :items="menuItems"
        @click="doMenuClick"
      >
      </a-menu>
    </a-layout-sider>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, h, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PictureOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useLoginUserstore } from '@/stores/useLoginUserstore'
import { TeamOutlined } from '@ant-design/icons-vue'
import { SPACE_TYPE_ENUM } from '@/constants/sapce'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController'
const router = useRouter()
const loginUserstore = useLoginUserstore()
const current = ref<string[]>([])
const fixedMenuItems = [
  {
    key: '/',
    icon: () => h(PictureOutlined),
    label: '公共图库',
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined),
  },
  {
    key: '/add_space?type=' + SPACE_TYPE_ENUM.TEAM,
    label: '创建团队',
    icon: () => h(TeamOutlined),
  },
]
//团队列表
const teamSpaceList = ref<API.SpaceUserVO[]>([])
const menuItems = computed(() => {
  if (teamSpaceList.value.length < 1) {
    return fixedMenuItems
  }
  const teamSpaceSubMenus = teamSpaceList.value.map((SpaceUser) => {
    const space = SpaceUser.space
    return {
      key: '/space/' + SpaceUser.spaceId,
      label: space?.spaceName,
    }
  })
  const teamSpaceMenuGroip = {
    type:'group',
    label:'我的团队',
    key:'teamSpace',
    children:teamSpaceSubMenus
  }
  return [...fixedMenuItems, teamSpaceMenuGroip]
})
const fetchTeamSpaceList = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('加载我的团队空间失败，' + res.data.message)
  }
}
router.afterEach((to) => {
  current.value = [to.path]
})
const doMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}
watchEffect(()=>{
 if(loginUserstore.loginUser.id){
   fetchTeamSpaceList()
 }
})
</script>
<style scoped>
#global-sider .title-bar {
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
</style>
