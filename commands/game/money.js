// commands/money.js

const { getUser } = require("../data/users");

module.exports = {
    data: {
        name: "money",
        description: "Xem tiền",

        options: [
            {
                name: "balance",
                type: 1,
                description: "Xem số dư"
            },
            {
                name: "daily",
                type: 1,
                description: "Nhận thưởng hằng ngày"
            }
        ]
    },

    async execute(interaction) {

        const sub = interaction.options.getSubcommand();
        const user = getUser(interaction.user.id);

        if (sub === "balance") {
            return interaction.reply(
                `💰 Bạn có **${user.money}$**`
            );
        }

        if (sub === "daily") {

            const now = Date.now();

            if (now - user.lastDaily < 86400000) {
                return interaction.reply(
                    "⏳ Bạn đã nhận daily hôm nay."
                );
            }

            const reward =
                Math.floor(Math.random() * 500) + 500;

            user.money += reward;
            user.lastDaily = now;

            return interaction.reply(
                `🎁 Nhận được **${reward}$**`
            );
        }
    }
};