import { api } from '@/lib/axios'

export interface Counter {
  id: number
  key: string
  value: number
  modifiedAt: string
}

export const getCounter = async (): Promise<Counter> => {
  const response = await api.get('/counter')
  return response.data
}

export const incrementCounter = async (): Promise<Counter> => {
  const response = await api.post('/counter')
  return response.data
}

export const updateCounter = async (value: number): Promise<Counter> => {
  const response = await api.patch('/counter', { value })
  return response.data
}
