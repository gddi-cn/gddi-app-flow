export type Point = {
  x: number
  y: number
}

export type Polygon = {
  id: number
  points: Point[]
  isRay?: boolean
  labelName?: string
}
