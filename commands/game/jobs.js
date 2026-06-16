// commands/jobs.js

const { getUser } = require("../data/users");

const jobs = [
    "🚕 Tài xế",
    "🍕 Giao hàng",
    "👨‍💻 Lập trình viên",
    "👮 Cảnh sát",
    "👨‍⚕️ Bác sĩ"
];

module.exports = {
    data: {
        name: "work",
        description: "Đi làm kiếm tiền"
    },

    async execute(interaction) {

        const user = getUser(interaction.user.id);

        const now = Date.now();

        if (now - user.lastWork < 300000) {
            return interaction.reply(
                "⏳ Hãy chờ 5 phút."
            );
        }

        const job =
            jobs[Math.floor(Math.random() * jobs.length)];

        const reward =
            Math.floor(Math.random() * 500) + 100;

        user.money += reward;
        user.lastWork = now;

        interaction.reply(
            `${job}\n💵 Bạn kiếm được **${reward}$**`
        );
    }
};