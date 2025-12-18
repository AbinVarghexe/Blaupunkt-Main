import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { EnquireTemplate } from '../../../../src/Components/emails/EnquireTemplate';

export async function POST(request) {
    try {
        console.log('📝 Contact API called');

        if (!process.env.RESEND_API_KEY) {
            console.error('❌ RESEND_API_KEY is missing');
            const envStatus = {
                NODE_ENV: process.env.NODE_ENV,
                KEY_EXISTS: !!process.env.RESEND_API_KEY,
                CONTACT_EMAIL: process.env.CONTACT_EMAIL || 'missing'
            };
            return NextResponse.json({
                success: false,
                error: `Server configuration error: Missing API Key. Debug: ${JSON.stringify(envStatus)}`
            }, { status: 500 });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        const body = await request.json();
        const { name, email, phone, message } = body;

        console.log(`📩 Processing inquiry from: ${email}`);

        const emailHtml = EnquireTemplate({
            name,
            email,
            phone,
            message
        });

        const recipient = process.env.CONTACT_EMAIL || 'info@blaupunkt-ev.com';
        console.log(`📤 Sending email to: ${recipient}`);

        const data = await resend.emails.send({
            from: 'Blaupunkt Website <onboarding@resend.dev>',
            to: [recipient],
            subject: `New Contact Form Submission from ${name}`,
            html: emailHtml
        });

        if (data.error) {
            console.error('❌ Resend API Error:', data.error);
            return NextResponse.json({ success: false, error: data.error.message }, { status: 500 });
        }

        console.log('✅ Email sent successfully:', data.id);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('❌ Internal Server Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
