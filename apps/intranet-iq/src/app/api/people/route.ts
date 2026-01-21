/**
 * People API Route - OPTIMIZED
 * - Query-level filtering (department, search, limit)
 * - Pagination support
 * - Parallel queries with Promise.all()
 * - Manual join for cross-schema relationships
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cache duration in seconds
const CACHE_DURATION = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters for filtering
    const departmentId = searchParams.get('departmentId');
    const search = searchParams.get('search');
    // Default limit to 100 for performance - use limit=-1 to fetch all
    const rawLimit = searchParams.get('limit');
    const limit = rawLimit === '-1' ? 0 : parseInt(rawLimit || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build employees query with optional filtering
    // Select only needed fields for performance (exclude large profile_data unless needed)
    let employeesQuery = supabase
      .schema('diq')
      .from('employees')
      .select('id, user_id, department_id, job_title, bio, phone, location, skills, manager_id, hire_date, created_at, updated_at')
      .order('created_at', { ascending: false });

    // Apply department filter at query level
    if (departmentId) {
      employeesQuery = employeesQuery.eq('department_id', departmentId);
    }

    // Apply pagination
    if (limit > 0) {
      employeesQuery = employeesQuery.range(offset, offset + limit - 1);
    }

    // Fetch departments query (same schema - can use direct query)
    const departmentsQuery = supabase
      .schema('diq')
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    // Execute employees and departments queries in parallel
    const [employeesResult, departmentsResult] = await Promise.all([
      employeesQuery,
      departmentsQuery,
    ]);

    if (employeesResult.error) {
      console.error('Error fetching employees:', employeesResult.error);
      return NextResponse.json({ error: employeesResult.error.message }, { status: 500 });
    }

    if (departmentsResult.error) {
      console.error('Error fetching departments:', departmentsResult.error);
      return NextResponse.json({ error: departmentsResult.error.message }, { status: 500 });
    }

    const employees = employeesResult.data || [];
    const departments = departmentsResult.data || [];

    // Get unique user IDs from employees
    const userIds = [...new Set(employees.map((e: any) => e.user_id).filter(Boolean))];

    // Fetch users from public schema if we have user IDs
    let usersMap = new Map<string, any>();
    if (userIds.length > 0) {
      const usersResult = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds);

      if (!usersResult.error && usersResult.data) {
        for (const user of usersResult.data) {
          usersMap.set(user.id, user);
        }
      }
    }

    // Create departments lookup map
    const departmentsMap = new Map<string, any>();
    for (const dept of departments) {
      departmentsMap.set(dept.id, dept);
    }

    // Join data and apply search filter
    let transformedEmployees = employees.map((e: any) => {
      const user = usersMap.get(e.user_id);
      const department = departmentsMap.get(e.department_id);

      return {
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
        user: user || {
          id: e.user_id,
          full_name: 'Unknown',
          email: '',
          avatar_url: null,
        },
        department: department || {
          id: e.department_id,
          name: 'Unknown',
          slug: 'unknown',
        },
      };
    });

    // Apply search filter (name, email, job_title)
    if (search) {
      const searchLower = search.toLowerCase();
      transformedEmployees = transformedEmployees.filter((e: any) => {
        const fullName = e.user?.full_name?.toLowerCase() || '';
        const email = e.user?.email?.toLowerCase() || '';
        const jobTitle = e.job_title?.toLowerCase() || '';
        return (
          fullName.includes(searchLower) ||
          email.includes(searchLower) ||
          jobTitle.includes(searchLower)
        );
      });
    }

    const response = NextResponse.json({
      employees: transformedEmployees,
      departments,
      pagination: {
        offset,
        limit: limit || transformedEmployees.length,
        total: transformedEmployees.length,
      },
    });

    // Add cache headers
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`
    );

    return response;
  } catch (error) {
    console.error('Error in people API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
