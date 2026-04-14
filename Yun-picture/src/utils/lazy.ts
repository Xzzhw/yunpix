import type { Directive, DirectiveBinding } from 'vue'
interface LazyOptions {
  src: string
  rootMargin?: string
  threshold?: number | number[]
}
// 1. 定义全局默认配置（这里就是你要统一控制的地方！）
const GLOBAL_DEFAULTS: Omit<LazyOptions, 'src'> = {
  rootMargin: '100px', // 统一触发间距
  threshold: 0.05, // 统一阈值
}

const observerPool = new Map<string, IntersectionObserver>()

const getObserver = (rootMargin: string = '100px') => {
  if (observerPool.has(rootMargin)) {
    return observerPool.get(rootMargin)!
  }

  const newObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.getAttribute('data-src')
          if (src) {
            const realImg = new Image()
            realImg.src = src
            realImg.onload = () => {
              img.src = src
              img.style.opacity = '1'
              img.classList.add('loaded')
            }
            realImg.onerror = () => {
              img.classList.add('error')
            }
            newObserver.unobserve(img)
          }
        }
      })
    },
    { rootMargin, threshold: GLOBAL_DEFAULTS.threshold },
  )
  observerPool.set(rootMargin, newObserver)
  return newObserver
}

const lazyDirective: Directive = {
  mounted(el: HTMLImageElement, binding: DirectiveBinding) {
    let options: LazyOptions

    if (typeof binding.value === 'string') {
      // 如果是字符串，直接使用全局默认配置合并
      options = { src: binding.value, ...GLOBAL_DEFAULTS }
    } else {
      // 如果是对象，优先使用传入的配置，没有的字段回退到全局默认
      options = { ...GLOBAL_DEFAULTS, ...binding.value }
    }

    if (!options.src) return

    el.setAttribute('data-src', options.src)
    el.src = '/placeholder.png'
    el.style.opacity = '0.5'
    const margin = options.rootMargin || '100px'
    const observer = getObserver(margin)
    observer.observe(el)
    ;(el as any)._usedObserver = observer
  },
  updated(el: HTMLImageElement, binding: DirectiveBinding) {
    if (binding.value !== binding.oldValue) {
      let options: LazyOptions
      if (typeof binding.value === 'string') {
        options = { src: binding.value, ...GLOBAL_DEFAULTS }
      } else {
        options = { ...GLOBAL_DEFAULTS, ...binding.value }
      }

      const observer = (el as any)._usedObserver as IntersectionObserver | undefined
      if (observer) {
        observer.unobserve(el)
      }

      el.setAttribute('data-src', options.src)
      el.src = '/placeholder.png'
      el.style.opacity = '0.5'
      const margin = options.rootMargin || '100px'
      const newObserver = getObserver(margin)
      newObserver.observe(el)
      ;(el as any)._usedObserver = newObserver
    }
  },
  unmounted(el: HTMLImageElement) {
    const observer = (el as any)._usedObserver as IntersectionObserver | undefined
    if (observer) {
      observer.unobserve(el)
    }
  },
}

export default lazyDirective
