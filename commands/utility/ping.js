module.exports.data = {
    name: "ping",
    description: "Kiểm tra ping",
    type: 1,
    options: []
};

module.exports.execute = async (interaction) => {
    const ping = interaction.client.ws.ping;

    await interaction.reply(
        `🏓 Pong! ${ping}ms`
    );
};