import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url || !url.startsWith('http')) {
    return new NextResponse('Invalid or missing URL parameter', { status: 400 });
  }

  try {
    // Fetch the PDF from Cloudinary (or any other source)
    const response = await fetch(url);
    
    if (!response.ok) {
      return new NextResponse('Failed to fetch PDF from source', { status: response.status });
    }

    const buffer = await response.arrayBuffer();

    // Return the PDF with inline disposition to force the browser to render it natively
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('PDF Proxy Error:', error);
    return new NextResponse('Error proxying PDF', { status: 500 });
  }
}
