import {NextResponse} from 'next/server';

// biome-ignore lint/style/useNamingConvention: Требование NextJS
export async function GET() {
    return new NextResponse();
}
