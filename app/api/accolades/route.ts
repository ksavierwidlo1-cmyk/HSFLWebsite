import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all accolades
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('accolades')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching accolades:', error);
    return NextResponse.json({ error: 'Failed to fetch accolades' }, { status: 500 });
  }
}

// POST - Create new accolade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, abbreviation, description, displayOrder } = body;

    if (!name || !abbreviation) {
      return NextResponse.json(
        { error: 'Name and abbreviation are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('accolades')
      .insert([
        {
          name,
          abbreviation,
          description: description || null,
          display_order: displayOrder || 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, accolade: data });
  } catch (error: any) {
    console.error('Error creating accolade:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create accolade' },
      { status: 500 }
    );
  }
}

// PUT - Update accolade
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, abbreviation, description, displayOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Accolade ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('accolades')
      .update({
        name,
        abbreviation,
        description,
        display_order: displayOrder,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, accolade: data });
  } catch (error: any) {
    console.error('Error updating accolade:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update accolade' },
      { status: 500 }
    );
  }
}

// DELETE - Delete accolade
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Accolade ID is required' }, { status: 400 });
    }

    const { error } = await supabase.from('accolades').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting accolade:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete accolade' },
      { status: 500 }
    );
  }
}
