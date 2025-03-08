import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json();
    if (!userInput) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    const generatedLetter = `This is a generated dispute letter for ${userInput}.`;

    return NextResponse.json({ letter: generatedLetter }, { status: 200 });
  } catch (err) {
    console.error('Error generating letter:', err);
    return NextResponse.json({ error: 'Failed to generate letter' }, { status: 500 });
  }
}
