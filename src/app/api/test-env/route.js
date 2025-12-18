import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const vars = {
        NODE_ENV: process.env.NODE_ENV,
        RESEND_API_KEY_EXISTS: !!process.env.RESEND_API_KEY,
        RESEND_API_KEY_LENGTH: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
        RESEND_API_KEY_PREFIX: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 3) : 'N/A',
        CONTACT_EMAIL: process.env.CONTACT_EMAIL,
    };

    return NextResponse.json(vars);
}
