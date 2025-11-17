import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { userId, type, title, message, actionUrl } = await req.json();

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("user_notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        action_url: actionUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification: data });
  } catch (error: any) {
    console.error("Error in create notification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}





