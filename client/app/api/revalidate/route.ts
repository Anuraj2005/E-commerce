import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');

  if (!secret || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json(
      { success: false, message: 'Invalid revalidation token' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const pathToRevalidate = body?.path || '/';
    revalidatePath(pathToRevalidate);

    return NextResponse.json({
      success: true,
      revalidated: true,
      path: pathToRevalidate,
      timestamp: Date.now(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to revalidate path',
      },
      { status: 500 }
    );
  }
}
