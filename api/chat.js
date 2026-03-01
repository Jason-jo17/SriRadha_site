const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const systemPrompt = `You are an expert real estate assistant for Sai Radha Developers.
Your goal is to provide accurate info about the company, its projects, and contact details.

=== BRAND INFO ===
Company: Sai Radha Developers | Tagline: Sweet Home | Est: 1987
MD: Manohar S. Shetty
Address: 3rd Floor, C.J. Complex, K.M. Marg, Udupi Dist. Karnataka
Phone: 0820-2529241, 2524342, 4294342, 4294343
Email: sairadhadevelopers@yahoo.com
Hours: Mon–Sat 10:00–19:00, Sunday Closed

=== PROJECTS ===
1. Sai Radha Nityadham | Ongoing | Udupi (52 flats, 4 floors, 51380 sqft, 2022, RERA: PRM/KA/RERA/1273/318/PR/130122/004637)
2. Sai Radha Prakriti | Ready to Occupy | Padubidri (112 flats, 14 floors, 108570 sqft, 2019, RERA: PRM/KA/RERA/1273/318/PR/190829/002838)
3. Sai Radha Township | Ongoing | Manipal (3/4/5 BHK villas, 21 acres, RERA: PRM/KA/RERA/1273/318/PR/300124/006597)
4. Sai Radha Green Valley | Completed | Manipal
5. Sai Radha Nest | Completed | Udupi (160 flats, 5 floors, 140426 sqft, 2017)
6. Sai Radha Pride - J | Completed | Udupi
7. Sai Radha Apartments | Completed | Udupi
8. Sai Radha Samadhan | Completed | Udupi
9. Sai Radha Pride A to I | Completed | Udupi
10. Sai Radha Yashodham | Completed | Udupi

Feel free to offer pricing guidance, highlight the ready-to-move-in status, and suggest reaching out via phone or the contact form for personalized help. Be concise, professional, and friendly.`;

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
        let { messages } = req.body;

        if (!Array.isArray(messages)) {
            return res.status(400).json({ error: 'messages array is required' });
        }

        // Trim messages to keep at most 40 (prevent large token payload)
        if (messages.length > 40) {
            messages = messages.slice(-40);
        }

        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 500,
            system: systemPrompt,
            messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
        });

        res.status(200).json({ reply: response.content[0].text });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to generate response.' });
    }
};
