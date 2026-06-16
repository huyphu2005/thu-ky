module.exports.data = {
    name: "avata",
    description: "Xem ảnh đại diện",
    type: 1,
    options: [
        {
            name: "user",
            description: "Người dùng",
            type: 6,
            required: false
        }
    ]
};

module.exports.execute = async (interaction) => {
    const user =
        interaction.options.getUser("user") ||
        interaction.user;

    await interaction.reply(
        user.displayAvatarURL({
            size: 1024
        })
    );
};