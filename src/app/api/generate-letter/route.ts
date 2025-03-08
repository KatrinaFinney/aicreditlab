import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic"; // 🚀 Prevent static caching
export async function POST(request: Request) {
  try {
    // Parse the JSON body from the request
    const { userInput } = await request.json();

    // Generate a dispute letter using the provided input.
    // Later, you can replace this static content with a call to your OpenAI GPT API.
    const letter = `Dear Creditor,

I am writing to dispute the accuracy of the credit information related to ${userInput}. Please investigate and correct any errors at your earliest convenience.

Thank you,
[Your Name]`;

    // Return the generated letter as a JSON response.
    return NextResponse.json({ letter });
  } catch (error) {
    // Return an error response in case of any failure
    return NextResponse.json({ error: 'Failed to generate dispute letter' }, { status: 500 });
  }
}
