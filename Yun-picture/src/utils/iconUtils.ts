import {
  HomeOutlined,
  UserOutlined,
  PlusOutlined,
  FolderAddOutlined,
  PictureOutlined,
  AppstoreOutlined,
} from '@ant-design/icons-vue'
import type { Component } from 'vue'

// 图标映射表
export const iconMap: Record<string, Component> = {
  HomeOutlined,
  UserOutlined,
  PlusOutlined,
  FolderAddOutlined,
  PictureOutlined,
  AppstoreOutlined,
}

/**
 * 根据图标名称获取图标组件
 * @param iconName 图标名称
 * @returns 图标组件或 undefined
 */
export function getIconComponent(iconName?: string): Component | undefined {
  if (!iconName) return undefined
  return iconMap[iconName]
}