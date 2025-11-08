import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/libs/supabaseClient";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
    try{
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }
        const { content } = await request.json();
        
        if(content.trim()=="" || !content){
            return NextResponse.json(
                { error: "Content cannnot be empty" },
                { status: 400 }
            )
        }
        const { data, error } = await supabase
            .from('posts')
            .insert([{ user_id: user.id, content }])
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
        const cursorCreatedAt = searchParams.get("cursor_created_at");
        const cursorId = searchParams.get("cursor_id");


        let query = supabase
            .from('posts')
            .select("*", { count: "exact" })
            .order("created_at",{ ascending: false })
            .order("id", { ascending: false })
            .limit(limit+1)

        if(cursorId && cursorCreatedAt) {
            query = query.or(
                `and(created_at.lt.${cursorCreatedAt}),and(created_at.eq.${cursorCreatedAt},id.lt.${cursorId})`
            );
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        // まだ投稿があるか
        const hasMore = data.length >= limit;
        // 10件のみ返す
        const posts = hasMore ? data?.slice(0, limit) :data;

        const nextCursor = 
            posts.length > 0 
                ? {
                    cursor_created_at: posts.at(-1).created_at,
                    cursor_id: posts.at(-1).id
                }
            :null
        console.log("hasMore:", hasMore);
        return NextResponse.json(
            { posts, nextCursor, hasMore },
            { status:200 }
        )

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