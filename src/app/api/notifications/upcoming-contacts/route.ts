import { NextResponse } from "next/server";

import { getUpcomingContacts } from "@/lib/queries/get-upcoming-contacts";

export async function GET() {
  const result = await getUpcomingContacts();

  if (result.error) {
    return NextResponse.json(
      { contacts: [], message: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json({
    contacts: result.contacts,
    count: result.contacts.length,
  });
}
