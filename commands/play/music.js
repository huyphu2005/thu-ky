module.exports.data = {
    name: "play",
    description: "Phát nhạc",
    type: 1,
    options: []
};

module.exports.execute = async (interaction) => {
    await interaction.reply(
        "🎵 Chức năng phát nhạc đang phát triển"
    );
};