'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      if (session?.user) {
        loadUserOrganization(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        setLoading(false)

        if (event === 'SIGNED_IN' && session?.user) {
          await handleUserSignIn(session.user)
        }

        if (event === 'SIGNED_OUT') {
          setOrganization(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleUserSignIn = async (user) => {
    try {
      // Check if user profile exists
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Create profile if it doesn't exist
      if (error && error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          }])
          .select()
          .single()

        if (createError) throw createError
        profile = newProfile
      } else if (error) {
        throw error
      }

      // Check if user has an organization
      let { data: orgMember } = await supabase
        .from('organization_members')
        .select('*, organizations(*)')
        .eq('user_id', user.id)
        .single()

      // Create default organization if user doesn't have one
      if (!orgMember) {
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert([{
            name: 'My Company',
            plan: 'starter'
          }])
          .select()
          .single()

        if (orgError) throw orgError

        // Add user as owner of the organization
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert([{
            org_id: newOrg.id,
            user_id: user.id,
            role: 'owner'
          }])

        if (memberError) throw memberError

        setOrganization(newOrg)
      } else {
        setOrganization(orgMember.organizations)
      }

    } catch (error) {
      console.error('Error handling user sign in:', error)
    }
  }

  const loadUserOrganization = async (userId) => {
    try {
      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('*, organizations(*)')
        .eq('user_id', userId)
        .single()

      if (orgMember) {
        setOrganization(orgMember.organizations)
      }
    } catch (error) {
      console.error('Error loading user organization:', error)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    organization,
    loading,
    signOut,
    supabase
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}