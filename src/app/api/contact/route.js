import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { EnquireTemplate } from '../../../../src/Components/emails/EnquireTemplate';

// 1. Force dynamic rendering
export const dynamic = 'force-dynamic';
// 2. Enforce Node.js runtime
export const runtime = 'nodejs';

export async function POST(request) {
    try {
        // Hardcoded credentials as requested by user
        const key = 're_hHrtR3yG_F9gfjtuPWud64eCYSnKuni2k';
        const recipient = 'blaupunktcontact@gmail.com';

        console.log('📝 Contact API called (Hardcoded Config)');
        // Log first 3 chars to verify keys are loaded in memory
        console.log('🔑 RESEND KEY:', key ? `Starts with ${key.substring(0, 3)}...` : 'UNDEFINED');

        const resend = new Resend(key);

        const body = await request.json();
        const { name, email, phone, message } = body;

        console.log(`📩 Processing inquiry from: ${email}`);

        const emailHtml = EnquireTemplate({
            name,
            email,
            phone,
            message
        });

        // Send email
        const data = await resend.emails.send({
            from: 'Blaupunkt Website <onboarding@resend.dev>',
            to: [recipient],
            subject: `New Contact Form Submission from ${name}`,
            html: emailHtml
        });

        if (data.error) {
            console.error('❌ Resend API Error:', data.error);
            // Return specific error from Resend
            return NextResponse.json({ success: false, error: data.error.message }, { status: 500 });
        }

        console.log('✅ Email sent successfully:', data.id);
        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('❌ Internal Server Error:', error);
        return NextResponse.json({ success: false, error: 'Email failed: ' + error.message }, { status: 500 });
    }
}

// Test endpoint (GET) to verify Resend configuration without using the form
export async function GET() {
    try {
        const key = 're_hHrtR3yG_F9gfjtuPWud64eCYSnKuni2k';
        const recipient = 'blaupunktcontact@gmail.com';
        const resend = new Resend(key);

        const data = await resend.emails.send({
            from: 'Blaupunkt Website <onboarding@resend.dev>',
            to: [recipient],
            subject: 'Test Email from Blaupunkt Backend',
            html: '<p>If you see this, the Resend configuration works!</p>'
        });

        if (data.error) {
            return NextResponse.json({ success: false, error: data.error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Test email sent!', id: data.id });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
