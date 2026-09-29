import { Client, type StompSubscription } from '@stomp/stompjs'
import { accessTokenStore } from '@/shared/api'
import { env } from '@/shared/config'

/**
 * Một kết nối STOMP dùng chung cho cả app (TV2 sở hữu hạ tầng realtime phía backend).
 * Quy ước use-case-api.md mục 5.2: sau reconnect phải tải lại dữ liệu qua REST vì có thể đã lỡ sự kiện.
 */

interface Entry {
  destination: string
  onMessage: (body: string) => void
  subscription: StompSubscription | null
}

const entries = new Set<Entry>()
const reconnectListeners = new Set<() => void>()
let hasConnectedBefore = false

function resolveWsUrl(path: string) {
  if (/^wss?:\/\//.test(path)) return path
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${protocol}://${window.location.host}${path}`
}

let client: Client | null = null

function getClient() {
  if (client) return client
  const instance = new Client({
    brokerURL: resolveWsUrl(env.wsUrl),
    reconnectDelay: 3_000,
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
    beforeConnect: async () => {
      const token = accessTokenStore.get()
      instance.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {}
    },
    onConnect: () => {
      entries.forEach((entry) => {
        entry.subscription = instance.subscribe(entry.destination, (message) => entry.onMessage(message.body))
      })
      if (hasConnectedBefore) reconnectListeners.forEach((listener) => listener())
      hasConnectedBefore = true
    },
  })
  client = instance
  return instance
}

/** Đăng ký topic; tự kết nối khi có subscriber đầu tiên, tự ngắt khi không còn ai. */
export function subscribeTopic<T>(destination: string, onMessage: (payload: T) => void) {
  const stomp = getClient()
  const entry: Entry = {
    destination,
    onMessage: (body) => onMessage(JSON.parse(body) as T),
    subscription: null,
  }
  entries.add(entry)

  if (stomp.connected) {
    entry.subscription = stomp.subscribe(destination, (message) => entry.onMessage(message.body))
  } else if (!stomp.active) {
    stomp.activate()
  }

  return () => {
    entry.subscription?.unsubscribe()
    entries.delete(entry)
    if (entries.size === 0) {
      hasConnectedBefore = false
      void stomp.deactivate()
    }
  }
}

/** Gọi lại khi kết nối được khôi phục, dùng để invalidate query liên quan. */
export function onRealtimeReconnect(listener: () => void) {
  reconnectListeners.add(listener)
  return () => {
    reconnectListeners.delete(listener)
  }
}
