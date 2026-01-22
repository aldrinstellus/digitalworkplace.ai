/**
 * Celebrations API Route
 * Handles birthdays, work anniversaries, and other celebrations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Celebration {
  id: string;
  user_id: string;
  type: 'birthday' | 'work_anniversary' | 'promotion' | 'new_hire' | 'custom';
  title?: string;
  message?: string;
  date: string;
  recurring: boolean;
  visibility: 'public' | 'department' | 'private';
  notification_sent: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  employee?: {
    department_id: string;
    job_title: string;
    hire_date: string;
  };
  days_until?: number;
  wishes_count?: number;
}

// GET - Fetch celebrations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const upcoming = searchParams.get('upcoming') === 'true';
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get upcoming celebrations
    if (upcoming) {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + days);

      const todayStr = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      let query = supabase
        .schema('diq')
        .from('celebrations')
        .select(`
          *,
          user:user_id(id, full_name, avatar_url)
        `)
        .gte('date', todayStr)
        .lte('date', endDateStr)
        .eq('visibility', 'public')
        .order('date', { ascending: true })
        .limit(limit);

      if (type) {
        query = query.eq('type', type);
      }

      const { data: celebrations, error } = await query;

      if (error) {
        console.error('Error fetching celebrations:', error);
        return NextResponse.json({ error: 'Failed to fetch celebrations' }, { status: 500 });
      }

      // Add days_until calculation
      const enrichedCelebrations = celebrations?.map(c => ({
        ...c,
        days_until: Math.ceil(
          (new Date(c.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        ),
      }));

      return NextResponse.json({ celebrations: enrichedCelebrations || [] });
    }

    // Get celebrations for a specific user
    if (userId) {
      const { data: celebrations, error } = await supabase
        .schema('diq')
        .from('celebrations')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching user celebrations:', error);
        return NextResponse.json({ error: 'Failed to fetch celebrations' }, { status: 500 });
      }

      return NextResponse.json({ celebrations: celebrations || [] });
    }

    // Get all celebrations
    let query = supabase
      .schema('diq')
      .from('celebrations')
      .select(`
        *,
        user:user_id(id, full_name, avatar_url)
      `)
      .order('date', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('type', type);
    }

    const { data: celebrations, error } = await query;

    if (error) {
      console.error('Error fetching celebrations:', error);
      return NextResponse.json({ error: 'Failed to fetch celebrations' }, { status: 500 });
    }

    return NextResponse.json({ celebrations: celebrations || [] });
  } catch (error) {
    console.error('Celebrations API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create celebration or send wish
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Send a celebration wish
    if (action === 'wish') {
      const { celebrationId, userId, message, emoji } = body;

      if (!celebrationId || !userId) {
        return NextResponse.json(
          { error: 'celebrationId and userId are required' },
          { status: 400 }
        );
      }

      const { data: wish, error } = await supabase
        .schema('diq')
        .from('celebration_wishes')
        .insert({
          celebration_id: celebrationId,
          user_id: userId,
          message,
          emoji,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending wish:', error);
        return NextResponse.json({ error: 'Failed to send wish' }, { status: 500 });
      }

      // Create notification for the celebrant
      const { data: celebration } = await supabase
        .schema('diq')
        .from('celebrations')
        .select('user_id, type')
        .eq('id', celebrationId)
        .single();

      if (celebration && celebration.user_id !== userId) {
        await supabase
          .schema('diq')
          .from('notifications')
          .insert({
            user_id: celebration.user_id,
            type: 'reaction',
            entity_type: 'celebration',
            entity_id: celebrationId,
            actor_id: userId,
            title: `Someone wished you on your ${celebration.type.replace('_', ' ')}!`,
            message: message || emoji || '🎉',
          });
      }

      return NextResponse.json({ wish });
    }

    // Create a celebration
    const {
      userId,
      type,
      title,
      message,
      date,
      recurring = false,
      visibility = 'public',
    } = body;

    if (!userId || !type || !date) {
      return NextResponse.json(
        { error: 'userId, type, and date are required' },
        { status: 400 }
      );
    }

    const { data: celebration, error } = await supabase
      .schema('diq')
      .from('celebrations')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        date,
        recurring,
        visibility,
        metadata: {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating celebration:', error);
      return NextResponse.json({ error: 'Failed to create celebration' }, { status: 500 });
    }

    return NextResponse.json({ celebration });
  } catch (error) {
    console.error('Celebrations API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Generate upcoming celebrations from employee data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, days = 30 } = body;

    if (action === 'generateBirthdays') {
      // Get employees with birth dates
      const { data: employees, error: empError } = await supabase
        .schema('diq')
        .from('employees')
        .select(`
          id,
          user_id,
          birth_date,
          user:user_id(id, full_name)
        `)
        .not('birth_date', 'is', null);

      if (empError) {
        console.error('Error fetching employees:', empError);
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
      }

      const today = new Date();
      const thisYear = today.getFullYear();
      const celebrations: { user_id: string; type: string; date: string; recurring: boolean; title: string }[] = [];

      for (const emp of employees || []) {
        if (!emp.birth_date) continue;

        // Create this year's birthday date
        const birthDate = new Date(emp.birth_date);
        let nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());

        // If birthday has passed this year, use next year
        if (nextBirthday < today) {
          nextBirthday = new Date(thisYear + 1, birthDate.getMonth(), birthDate.getDate());
        }

        // Check if within range
        const daysUntil = Math.ceil(
          (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntil <= days) {
          celebrations.push({
            user_id: emp.user_id,
            type: 'birthday',
            date: nextBirthday.toISOString().split('T')[0],
            recurring: true,
            title: `${(emp.user as { full_name: string })?.full_name || 'Team member'}'s Birthday`,
          });
        }
      }

      // Upsert celebrations (avoid duplicates)
      if (celebrations.length > 0) {
        const { error: insertError } = await supabase
          .schema('diq')
          .from('celebrations')
          .upsert(celebrations, {
            onConflict: 'user_id,type,date',
            ignoreDuplicates: true,
          });

        if (insertError) {
          console.error('Error inserting celebrations:', insertError);
        }
      }

      return NextResponse.json({
        success: true,
        generated: celebrations.length,
      });
    }

    if (action === 'generateAnniversaries') {
      // Get employees with hire dates
      const { data: employees, error: empError } = await supabase
        .schema('diq')
        .from('employees')
        .select(`
          id,
          user_id,
          hire_date,
          user:user_id(id, full_name)
        `)
        .not('hire_date', 'is', null);

      if (empError) {
        console.error('Error fetching employees:', empError);
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
      }

      const today = new Date();
      const thisYear = today.getFullYear();
      const celebrations: { user_id: string; type: string; date: string; recurring: boolean; title: string; metadata: { years: number } }[] = [];

      for (const emp of employees || []) {
        if (!emp.hire_date) continue;

        const hireDate = new Date(emp.hire_date);
        let nextAnniversary = new Date(thisYear, hireDate.getMonth(), hireDate.getDate());

        // If anniversary has passed this year, use next year
        if (nextAnniversary < today) {
          nextAnniversary = new Date(thisYear + 1, hireDate.getMonth(), hireDate.getDate());
        }

        // Skip if this would be year 0
        const years = nextAnniversary.getFullYear() - hireDate.getFullYear();
        if (years < 1) continue;

        // Check if within range
        const daysUntil = Math.ceil(
          (nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntil <= days) {
          celebrations.push({
            user_id: emp.user_id,
            type: 'work_anniversary',
            date: nextAnniversary.toISOString().split('T')[0],
            recurring: true,
            title: `${(emp.user as { full_name: string })?.full_name || 'Team member'}'s ${years}-Year Work Anniversary`,
            metadata: { years },
          });
        }
      }

      // Insert celebrations
      if (celebrations.length > 0) {
        const { error: insertError } = await supabase
          .schema('diq')
          .from('celebrations')
          .upsert(celebrations, {
            onConflict: 'user_id,type,date',
            ignoreDuplicates: true,
          });

        if (insertError) {
          console.error('Error inserting celebrations:', insertError);
        }
      }

      return NextResponse.json({
        success: true,
        generated: celebrations.length,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Celebrations API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
