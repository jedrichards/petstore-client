/** Domain types for the Petstore v3 API, normalised for the app. */

export const petStatuses = ['available', 'pending', 'sold'] as const
export type PetStatus = (typeof petStatuses)[number]

export const orderStatuses = ['placed', 'approved', 'delivered'] as const
export type OrderStatus = (typeof orderStatuses)[number]

export interface Category {
  id: number
  name: string
}

export interface Tag {
  id: number
  name: string
}

export interface Pet {
  id: number
  name: string
  category: Category | undefined
  photoUrls: string[]
  tags: Tag[]
  status: PetStatus | undefined
}

/** A pet as the client sends it. The API expects the client to choose the id. */
export type PetInput = Pet

export interface Order {
  id: number
  petId: number
  quantity: number
  shipDate: string | undefined
  status: OrderStatus | undefined
  complete: boolean
}

export interface User {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  userStatus: number
}

/** A user as the client sends it. The API never returns a real password. */
export interface UserInput extends User {
  password?: string
}

export interface LoginResult {
  /** The opaque session token the API returns in its message. */
  token: string
}

export type Inventory = Record<PetStatus, number>
