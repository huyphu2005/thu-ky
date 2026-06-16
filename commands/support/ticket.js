const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");

const CONFIG_FILE = "./ticket-config.json";

// =====================
// CONFIG
// =====================

function saveConfig(data) {
    fs.writeFileSync(
        CONFIG_FILE,
        JSON.stringify(data, null, 2)
    );
}

function loadConfig() {

    if (!fs.existsSync(CONFIG_FILE)) {
        return {};
    }

    return JSON.parse(
        fs.readFileSync(CONFIG_FILE)
    );
}

// =====================
// COMMAND
// =====================

module.exports = {

    data: {
        name: "ticket",
        description: "Hệ thống ticket",

        options: [
            {
                name: "action",
                description: "setup hoặc panel",
                type: 3,
                required: true,

                choices: [
                    {
                        name: "setup",
                        value: "setup"
                    },
                    {
                        name: "panel",
                        value: "panel"
                    }
                ]
            }
        ]
    },

    async execute(interaction) {

        const action =
            interaction.options.getString("action");

        // =====================
        // SETUP
        // =====================

        if (action === "setup") {

            if (
                !interaction.member.permissions.has(
                    PermissionFlagsBits.Administrator
                )
            ) {
                return interaction.reply({
                    content:
                        "❌ Chỉ Admin mới dùng được.",
                    ephemeral: true
                });
            }

            const category =
                await interaction.guild.channels.create({

                    name: "📩 TICKETS",

                    type:
                        ChannelType.GuildCategory
                });

            saveConfig({
                categoryId: category.id
            });

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Green")
                        .setTitle("✅ Setup Thành Công")
                        .setDescription(`
📂 Category:
${category.name}

🆔 ID:
${category.id}
`)
                ]
            });
        }

        // =====================
        // PANEL
        // =====================

        if (action === "panel") {

            const config =
                loadConfig();

            if (!config.categoryId) {
                return interaction.reply({
                    content:
                        "❌ Hãy dùng /ticket action:setup trước.",
                    ephemeral: true
                });
            }

            const row =
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(
                                "create_ticket"
                            )
                            .setLabel(
                                "🎫 Tạo Ticket"
                            )
                            .setStyle(
                                ButtonStyle.Success
                            )
                    );

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Blue")
                        .setTitle(
                            "🎫 HỆ THỐNG HỖ TRỢ"
                        )
                        .setDescription(
                            "Nhấn nút bên dưới để tạo ticket."
                        )
                ],
                components: [row]
            });
        }
    },

    // =====================
    // BUTTON HANDLER
    // =====================

    async button(interaction) {

        const config =
            loadConfig();

        // =====================
        // CREATE TICKET
        // =====================

        if (
            interaction.customId ===
            "create_ticket"
        ) {

            const exist =
                interaction.guild.channels.cache.find(
                    c =>
                        c.name ===
                        `ticket-${interaction.user.id}`
                );

            if (exist) {
                return interaction.reply({
                    content:
                        `❌ Bạn đã có ticket: ${exist}`,
                    ephemeral: true
                });
            }

            const channel =
                await interaction.guild.channels.create({

                    name:
                        `ticket-${interaction.user.id}`,

                    type:
                        ChannelType.GuildText,

                    parent:
                        config.categoryId,

                    permissionOverwrites: [

                        {
                            id:
                                interaction.guild.id,

                            deny: [
                                PermissionFlagsBits.ViewChannel
                            ]
                        },

                        {
                            id:
                                interaction.user.id,

                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        }
                    ]
                });

            const row =
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(
                                "close_ticket"
                            )
                            .setLabel(
                                "🔒 Đóng Ticket"
                            )
                            .setStyle(
                                ButtonStyle.Danger
                            )
                    );

            await channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Green")
                        .setTitle(
                            "🎫 Ticket Hỗ Trợ"
                        )
                        .setDescription(`
Xin chào ${interaction.user}

Vui lòng mô tả vấn đề của bạn.
`)
                ],
                components: [row]
            });

            return interaction.reply({
                content:
                    `✅ Ticket đã được tạo: ${channel}`,
                ephemeral: true
            });
        }

        // =====================
        // CLOSE TICKET
        // =====================

        if (
            interaction.customId ===
            "close_ticket"
        ) {

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setTitle(
                            "🔒 Đang Đóng Ticket"
                        )
                        .setDescription(
                            "Kênh sẽ bị xóa sau 5 giây..."
                        )
                ]
            });

            setTimeout(async () => {

                try {
                    await interaction.channel.delete();
                } catch {}
            }, 5000);
        }
    }
};