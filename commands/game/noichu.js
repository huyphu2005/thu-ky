const { EmbedBuilder } = require("discord.js");

let game = {
    running: false,
    lastWord: null,
    usedWords: []
};

module.exports = {
    data: {
        name: "noichu",
        description: "Bắt đầu trò nối chữ"
    },

    async execute(interaction) {

        if (game.running) {
            return interaction.reply("❌ Trò chơi đang diễn ra");
        }

        game.running = true;
        game.lastWord = null;
        game.usedWords = [];

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🎮 NỐI CHỮ")
                    .setDescription(`
Người đầu tiên hãy gửi 1 cụm từ.

Ví dụ:
con mèo
cây tre
quả cam
`)
                    .setColor("Green")
            ]
        });

        const filter = m => !m.author.bot;

        const collector =
            interaction.channel.createMessageCollector({
                filter,
                time: 300000
            });

        collector.on("collect", async msg => {

            const text = msg.content
                .trim()
                .toLowerCase();

            if (game.usedWords.includes(text)) {
                return msg.reply(
                    "❌ Cụm từ đã được dùng"
                );
            }

            const words = text.split(" ");

            if (words.length < 2) {
                return msg.reply(
                    "❌ Phải có ít nhất 2 từ"
                );
            }

            if (game.lastWord) {

                const first = words[0];

                if (first !== game.lastWord) {
                    return msg.reply(
                        `❌ Phải bắt đầu bằng "${game.lastWord}"`
                    );
                }
            }

            game.usedWords.push(text);
            game.lastWord =
                words[words.length - 1];

            await msg.react("✅");
        });

        collector.on("end", async () => {

            game.running = false;

            interaction.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🏁 KẾT THÚC")
                        .setDescription(
                            `Đã dùng ${game.usedWords.length} cụm từ`
                        )
                        .setColor("Red")
                ]
            });
        });
    }
};