const { EmbedBuilder } = require("discord.js");

const users = new Map();

const ITEMS = {
    cua: "🦀",
    ga: "🐔",
    ca: "🐟",
    tom: "🦐",
    bau: "🍐",
    nai: "🦌"
};

const session = {
    running: false,
    players: []
};

function getUser(id) {
    if (!users.has(id)) {
        users.set(id, {
            money: 10000
        });
    }
    return users.get(id);
}

function addBet(userId, pick, money) {

    let player = session.players.find(
        p => p.id === userId
    );

    if (!player) {

        player = {
            id: userId,
            bets: {}
        };

        session.players.push(player);
    }

    player.bets[pick] =
        (player.bets[pick] || 0) + money;
}

function renderPlayers() {

    if (!session.players.length) {
        return "Chưa có người chơi";
    }

    return session.players.map(player => {

        const total = Object.values(player.bets)
            .reduce((a, b) => a + b, 0);

        const bets = Object.entries(player.bets)
            .map(([animal, money]) =>
                `${ITEMS[animal]} ${animal}: ${money}$`
            )
            .join("\n");

        return `
👤 <@${player.id}>
${bets}

💰 Tổng: ${total}$`;

    }).join("\n━━━━━━━━━━━━\n");
}

async function spinAnimation(msg) {

    const frames = [
        "🎲 [❓] [❓] [❓]",
        "🎲 [🦀] [❓] [❓]",
        "🎲 [🦀] [🐟] [❓]",
        "🎲 [🦀] [🐟] [🐔]",
        "🎲 [🐔] [🐟] [🦀]",
        "🎲 [🦐] [🍐] [🐔]",
        "🎲 [🦌] [🐟] [🦐]",
        "🎲 [🍐] [🦀] [🦌]",
        "🎲 [🦐] [🐔] [🐟]",
        "🎲 [🦀] [🐟] [🐔]"
    ];

    for (const frame of frames) {

        await msg.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor("Orange")
                    .setTitle("🎰 ĐANG LẮC BẦU CUA")
                    .setDescription(`
${frame}

━━━━━━━━━━━━

🎲 Đang quay...
💰 Đang tính kết quả...
`)
            ]
        });

        await new Promise(r =>
            setTimeout(r, 500)
        );
    }
}

async function startRound(interaction) {

    if (session.running) return;

    session.running = true;

    let time = 120

    const msg = await interaction.channel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle("🎰 CASINO BẦU CUA")
                .setColor("Gold")
        ]
    });

    const timer = setInterval(async () => {

        let totalBet = 0;

        session.players.forEach(player => {
            totalBet += Object.values(player.bets)
                .reduce((a, b) => a + b, 0);
        });

        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle("🎰 CASINO BẦU CUA")
            .setDescription(`
╔════════════════════╗
║     🎰 BẦU CUA     ║
╚════════════════════╝

┌─────┬─────┬─────┐
│ 🦀 │ 🐟 │ 🐔 │
├─────┼─────┼─────┤
│ 🦐 │ 🍐 │ 🦌 │
└─────┴─────┴─────┘

⏳ ${time}s

👥 Người chơi: ${session.players.length}
💰 Tổng cược: ${totalBet}$

━━━━━━━━━━━━

${renderPlayers()}
`);

        await msg.edit({
            embeds: [embed]
        });

        time--;

        if (time < 0) {

            clearInterval(timer);

            await spinAnimation(msg);

            const result = [];

            const keys = Object.keys(ITEMS);

            for (let i = 0; i < 3; i++) {
                result.push(
                    keys[Math.floor(
                        Math.random() * keys.length
                    )]
                );
            }

            let resultText = "";

            for (const player of session.players) {

                const user = getUser(player.id);

                let totalWin = 0;

                for (const [animal, bet] of Object.entries(player.bets)) {

                    const count = result.filter(
                        r => r === animal
                    ).length;

                    totalWin += bet * count * 2;
                }

                if (totalWin > 0) {

                    user.money += totalWin;

                    resultText +=
                        `🟢 <@${player.id}> +${totalWin}$\n`;

                } else {

                    resultText +=
                        `🔴 <@${player.id}> thua\n`;
                }
            }

            await msg.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Green")
                        .setTitle("🎯 KẾT QUẢ")
                        .setDescription(`
🎲 [${ITEMS[result[0]]}] [${ITEMS[result[1]]}] [${ITEMS[result[2]]}]

━━━━━━━━━━━━

${resultText}
`)
                ]
            });

            session.players = [];
            session.running = false;
        }

    }, 1000);
}

module.exports = {

    data: {
        name: "baucuatc",
        description: "Casino Bầu Cua",

        options: [
            {
                name: "pick",
                description: "cua/ga/ca/tom/bau/nai",
                type: 3,
                required: true
            },
            {
                name: "money",
                description: "Tiền cược",
                type: 4,
                required: true
            }
        ]
    },

    async execute(interaction) {

        const pick =
            interaction.options.getString("pick");

        const money =
            interaction.options.getInteger("money");

        if (!ITEMS[pick]) {
            return interaction.reply({
                content: "❌ Cửa cược không hợp lệ",
                ephemeral: true
            });
        }

        if (money <= 0) {
            return interaction.reply({
                content: "❌ Tiền cược phải lớn hơn 0",
                ephemeral: true
            });
        }

        const user = getUser(
            interaction.user.id
        );

        if (user.money < money) {
            return interaction.reply({
                content: `❌ Bạn chỉ còn ${user.money}$`,
                ephemeral: true
            });
        }

        user.money -= money;

        addBet(
            interaction.user.id,
            pick,
            money
        );

        await interaction.reply({
            content:
                `🎲 Đã cược ${money}$ vào ${ITEMS[pick]} ${pick}`,
            ephemeral: true
        });

        startRound(interaction);
    }
};