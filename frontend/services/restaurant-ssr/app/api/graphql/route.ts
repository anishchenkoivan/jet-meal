import { NextResponse } from "next/server";

type GraphqlBody = {
  query?: string;
};

/** Минимальная заглушка под Apollo: ответ в формате GraphQL JSON. */
export async function POST(req: Request) {
  let body: GraphqlBody;
  try {
    body = (await req.json()) as GraphqlBody;
  } catch {
    return NextResponse.json(
      { errors: [{ message: "Invalid JSON body" }] },
      { status: 400 },
    );
  }

  const q = body.query ?? "";
  if (q.includes("restaurants")) {
    return NextResponse.json({
      data: {
        restaurants: [
          {
            id: "demo-1",
            name: "Демо-ресторан",
            city: "Москва",
            description: "Заглушка из /api/graphql",
          },
        ],
      },
    });
  }

  return NextResponse.json(
    { errors: [{ message: "Unknown or unsupported operation" }] },
    { status: 400 },
  );
}
