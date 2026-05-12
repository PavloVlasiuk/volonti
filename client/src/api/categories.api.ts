import client from './client'
import type { Category } from '../types/category.types'

export async function getCategories(): Promise<Category[]> {
  const res = await client.get('/categories')
  return res.data
}
