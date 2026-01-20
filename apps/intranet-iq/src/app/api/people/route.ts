/**
 * People API Route
 * Fetches employees with user and department data
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // Fetch employees with joined user and department data via RPC
    const { data: employeesRaw, error: empError } = await supabase.rpc('get_employees_with_details');

    if (empError) {
      console.error('Error fetching employees:', empError);
      return NextResponse.json({ error: empError.message }, { status: 500 });
    }

    // Fetch departments via RPC
    const { data: departments, error: deptError } = await supabase.rpc('get_departments_list');

    if (deptError) {
      console.error('Error fetching departments:', deptError);
      return NextResponse.json({ error: deptError.message }, { status: 500 });
    }

    // Transform employees to match expected format
    const employees = (employeesRaw || []).map((e: any) => ({
      id: e.id,
      user_id: e.user_id,
      department_id: e.department_id,
      job_title: e.job_title,
      bio: e.bio,
      phone: e.phone,
      location: e.location,
      skills: e.skills,
      manager_id: e.manager_id,
      hire_date: e.hire_date,
      profile_data: e.profile_data,
      created_at: e.created_at,
      updated_at: e.updated_at,
      user: {
        id: e.user_id,
        full_name: e.user_full_name,
        email: e.user_email,
        avatar_url: e.user_avatar_url,
      },
      department: {
        id: e.department_id,
        name: e.department_name,
        slug: e.department_slug,
      },
    }));

    return NextResponse.json({
      employees,
      departments: departments || [],
    });
  } catch (error) {
    console.error('Error in people API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
