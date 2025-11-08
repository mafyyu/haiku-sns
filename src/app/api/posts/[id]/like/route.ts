import { supabase } from "@/libs/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }){
    try{
        const { id } = await context.params

        const { data: postData, error: fetchError } = await supabase
            .from("posts")
            .select("like")
            .eq("id", Number(id))
            .single();
        if(fetchError) throw new Error(fetchError.message)
        
        const currentLike: number = postData.like;

        const { data: updateData, error: updateError } = await supabase
            .from("posts")
            .update({like: currentLike + 1})
            .eq("id",id)
            .select()
        if(updateError) throw new Error(updateError.message);

        return NextResponse.json(updateData, { status:200 });

    }catch(error){
        console.error(error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}