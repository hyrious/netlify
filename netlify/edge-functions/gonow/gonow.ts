import type { Context } from "https://edge.netlify.com";

export default async (_request: Request, _context: Context) => {
  const accessKey = Deno.env.get("JSONBIN_GONOW_KEY");
  if (!accessKey) {
    return new Response("null", {
      headers: { "content-type": "application/json" },
    });
  }

  const res1 = await fetch(
    "https://api.jsonbin.io/v3/b/5d1ec090beda8445769e5649",
    {
      headers: {
        "X-Access-Key": accessKey,
        "X-Bin-Meta": "false",
        "X-JSON-Path": "value",
      },
    },
  );

  if (!res1.ok) {
    return res1;
  }

  const value: number = await res1.json();

  const newValue = value + 1;

  const res2 = await fetch(
    "https://api.jsonbin.io/v3/b/5d1ec090beda8445769e5649",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Key": accessKey,
      },
      body: JSON.stringify({ value: newValue }),
    },
  );

  if (!res2.ok) {
    return res2;
  }

  return new Response(String(newValue), {
    headers: { "Content-Type": "application/json" },
  });
};
