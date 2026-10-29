import { NextResponse } from "next/server";
import { updateDraft, type Status } from "@/lib/engine/store";

export const runtime = "nodejs";

const STATUSES: Status[] = ["review", "changes", "approved", "rejected", "published"];

// The approval gate: a reviewer moves a draft between review, changes requested,
// approved, rejected and published (marked by hand once they have posted it).
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!params.id.startsWith("engineDraft.")) return NextResponse.json({ error: "not found" }, { status: 404 });
  const body = (await req.json()) as { status?: Status; note?: string | null; reviewer?: string | null; content?: object };
  if (body.status && !STATUSES.includes(body.status)) return NextResponse.json({ error: "bad status" }, { status: 400 });
  const draft = await updateDraft(params.id, {
    ...(body.status ? { status: body.status, decidedBy: body.reviewer ?? null } : {}),
    ...(body.note !== undefined ? { note: body.note } : {}),
    ...(body.content ? { content: body.content } : {}),
  });
  return NextResponse.json({ draft });
}
