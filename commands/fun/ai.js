const { SlashCommandBuilder } = require("discord.js");
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// memory đơn giản
const memory = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ai")
        .setDescription("Chat với AI")
        .addStringOption(opt =>
            opt.setName("text")
                .setDescription("Nhập câu hỏi")
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const text = interaction.options.getString("text");

        if (!memory.has(userId)) {
            memory.set(userId, []);
        }

        const history = memory.get(userId);

        history.push({ role: "user", content: text });

        // giới hạn memory
        if (history.length > 10) history.shift();

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Bạn là một trợ lý Discord vui vẻ, nói tiếng Việt, ngắn gọn."
                    },
                    ...history
                ]
            });

            const reply = response.choices[0].message.content;

            history.push({ role: "assistant", content: reply });

            await interaction.editReply(reply);

        } catch (err) {
            console.log(err);
            await interaction.editReply("❌ Lỗi AI rồi bro");
        }
    }
};