export type EmploymentType = "employee" | "part_time" | "self_employed"
export type FamilyType = "single" | "couple" | "family_with_child"

export interface Profile {
  id: string
  user_id: string
  annual_income: number
  age: number
  employment_type: EmploymentType
  family_type: FamilyType
  has_dependent: boolean
  created_at: string
  updated_at: string
}

export interface TaxTask {
  id: string
  user_id: string
  task_type: string
  title: string
  description: string
  action_steps: string[]
  estimated_saving: number
  priority: number
  is_completed: boolean
  completed_at: string | null
  affiliate_url: string | null
  affiliate_label: string | null
  created_at: string
}

export interface DiagnosisInput {
  annual_income: number
  age: number
  employment_type: EmploymentType
  family_type: FamilyType
  has_dependent: boolean
}

export interface DiagnosisResult {
  total_saving: number
  tasks: Omit<TaxTask, "id" | "user_id" | "is_completed" | "completed_at" | "created_at">[]
}

export interface DashboardData {
  total_estimated_saving: number
  total_actual_saving: number
  completed_tasks: number
  total_tasks: number
  tasks: TaxTask[]
}
