import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/libs/supabaseClient";

export async function POST(request: NextRequest) {
    try{
        const { user_id, content } = await request.json();
        const { data, error } = await supabase
            .from('posts')
            .insert([{ user_id, content }])
            .select()

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json(data,{ status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Internal Server Error'
            },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest){
    try{
        const { searchParams }  = new URL(request.url);
        const limit = Number(searchParams.get("limit") || 10)
        const cursor = searchParams.get("cursor");

        let query = supabase
            .from('posts')
            .select("*")
            .order("created_at",{ ascending: false })
            .order("id", { ascending: false })
            .limit(limit)

        if(cursor && cursor.trim() !="" ) {
            query = query.lt('created_at',cursor)
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);

        return NextResponse.json(data, { status:200 })

    } catch(error){
        console.error(error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Internal Server Error'
            },
            { status: 500 }
        )
    }
}