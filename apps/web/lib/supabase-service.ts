import { supabase } from './supabase'
import type { User, FamilyGroup, FamilyMember, Task, Activity } from './supabase'

// User Service
export const userService = {
  // Get current user profile
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get users in family group
  async getFamilyUsers(familyGroupId: string) {
    const { data, error } = await supabase
      .from('family_members')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email,
          phone,
          avatar_url,
          role
        )
      `)
      .eq('family_group_id', familyGroupId)

    if (error) throw error
    return data
  }
}

// Family Service
export const familyService = {
  // Create new family group
  async createFamilyGroup(name: string, custodyArrangement: any) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: familyGroup, error: familyError } = await supabase
      .from('family_groups')
      .insert({
        name,
        custody_arrangement: custodyArrangement,
        created_by: user.id
      })
      .select()
      .single()

    if (familyError) throw familyError

    // Add creator as admin family member
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_group_id: familyGroup.id,
        user_id: user.id,
        role: 'mor', // Default to 'mor' for creator
        is_admin: true
      })

    if (memberError) throw memberError

    return familyGroup
  },

  // Get user's family groups
  async getUserFamilyGroups() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('family_members')
      .select(`
        *,
        family_groups (
          id,
          name,
          custody_arrangement,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)

    if (error) throw error
    return data
  },

  // Update family group
  async updateFamilyGroup(familyGroupId: string, updates: Partial<FamilyGroup>) {
    const { data, error } = await supabase
      .from('family_groups')
      .update(updates)
      .eq('id', familyGroupId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Add family member
  async addFamilyMember(familyGroupId: string, email: string, role: 'mor' | 'far' | 'barn', address?: string) {
    // First check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError && userError.code !== 'PGRST116') throw userError

    let userId = existingUser?.id

    // If user doesn't exist, create invitation (for now just store email)
    if (!userId) {
      // In a real app, you'd send an invitation email here
      throw new Error('User must sign up first before being added to family')
    }

    const { data, error } = await supabase
      .from('family_members')
      .insert({
        family_group_id: familyGroupId,
        user_id: userId,
        role,
        address,
        is_admin: false
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Task Service
export const taskService = {
  // Create task
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get family tasks
  async getFamilyTasks(familyGroupId: string, filters?: {
    assignedTo?: string
    taskType?: string
    completed?: boolean
  }) {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:users!tasks_assigned_to_fkey (
          first_name,
          last_name
        ),
        created_user:users!tasks_created_by_fkey (
          first_name,
          last_name
        )
      `)
      .eq('family_group_id', familyGroupId)
      .order('created_at', { ascending: false })

    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo)
    }

    if (filters?.taskType) {
      query = query.eq('task_type', filters.taskType)
    }

    if (filters?.completed !== undefined) {
      query = query.eq('completed', filters.completed)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  // Update task
  async updateTask(taskId: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Toggle task completion
  async toggleTaskCompletion(taskId: string) {
    const { data: task } = await supabase
      .from('tasks')
      .select('completed')
      .eq('id', taskId)
      .single()

    if (!task) throw new Error('Task not found')

    return this.updateTask(taskId, { completed: !task.completed })
  },

  // Delete task
  async deleteTask(taskId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) throw error
  }
}

// Activity Service
export const activityService = {
  // Create activity
  async createActivity(activity: Omit<Activity, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get family activities
  async getFamilyActivities(familyGroupId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('activities')
      .select(`
        *,
        assigned_user:users!activities_assigned_to_fkey (
          first_name,
          last_name
        )
      `)
      .eq('family_group_id', familyGroupId)
      .order('start_time', { ascending: true })

    if (startDate) {
      query = query.gte('start_time', startDate)
    }

    if (endDate) {
      query = query.lte('start_time', endDate)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  // Update activity
  async updateActivity(activityId: string, updates: Partial<Activity>) {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', activityId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete activity
  async deleteActivity(activityId: string) {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId)

    if (error) throw error
  }
}

// Auth Service
export const authService = {
  // Sign up
  async signUp(email: string, password: string, userData: {
    firstName: string
    lastName: string
    role: 'parent' | 'child'
    phone?: string
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          phone: userData.phone
        }
      }
    })

    if (error) throw error
    return data
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: any, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}