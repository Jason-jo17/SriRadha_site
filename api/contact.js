const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { name, phone, email, message } = req.body;
        const errors = {};

        // Validation
        if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
        if (!phone || !/^\+?[0-9\s\-()]{7,15}$/.test(phone.trim())) errors.phone = 'Valid phone number required.';
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Valid email address required.';
        if (!message || message.trim().length < 10) errors.message = 'Message must be at least 10 characters.';

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ error: 'Validation failed', fields: errors });
        }

        // SMTP check
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587', 10),
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            // Send to internal team
            await transporter.sendMail({
                from: `"Website Contact" <${process.env.SMTP_USER}>`,
                to: process.env.CONTACT_EMAIL_TO || 'sairadhadevelopers@yahoo.com',
                subject: `New Inquiry from ${name}`,
                text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nMessage:\n${message}`,
                html: `<h3>New Contact Request</h3>
               <p><strong>Name:</strong> ${name}</p>
               <p><strong>Phone:</strong> ${phone}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>`
            });

            // Confirmation to user
            await transporter.sendMail({
                from: `"Sai Radha Developers" <${process.env.SMTP_USER}>`,
                to: email,
                subject: `Thank You for Contacting Sai Radha Developers`,
                text: `Dear ${name},\n\nThank you for exploring our projects. We have received your inquiry and our team will get back to you shortly.\n\nBest Regards,\nSai Radha Developers`,
                html: `<p>Dear ${name},</p>
               <p>Thank you for exploring our projects. We have received your inquiry and our team will get back to you shortly.</p>
               <p>Best Regards,<br/><strong>Sai Radha Developers</strong></p>`
            });
        } else {
            // Fallback if SMTP not configured
            console.log('--- Mock SMTP Output ---');
            console.log(`To Admin: Name: ${name}, Phone: ${phone}, Email: ${email}, Message: ${message}`);
            console.log(`To User: Confirmation email scheduled for ${email}`);
            console.log('------------------------');
        }

        res.status(200).json({ success: true, message: 'Your message has been sent successfully!' });
    } catch (error) {
        console.error('Contact Form Delivery Error:', error);
        res.status(500).json({ error: 'Something went wrong while sending your message. Please try again later.' });
    }
};
