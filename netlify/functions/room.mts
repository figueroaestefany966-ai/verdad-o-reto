import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  const store = getStore({ name: "verdadero-reto-rooms", consistency: "strong" });
  const url = new URL(req.url);

  if (req.method === "GET") {
    const code = url.searchParams.get("code");
    if (!code) {
      return new Response(JSON.stringify({ error: "missing code" }), { status: 400 });
    }
    const room = await store.get(code, { type: "json" });
    if (!room) {
      return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
    }
    return new Response(JSON.stringify(room), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "POST") {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "invalid body" }), { status: 400 });
    }
    const { code, room } = body || {};
    if (!code || !room) {
      return new Response(JSON.stringify({ error: "missing code or room" }), { status: 400 });
    }
    await store.setJSON(code, room);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/room",
};
