const {
    Client,
    Events,
    GatewayIntentBits,
    Collection
} = require("discord.js");

const fs = require("fs");
const path = require("path");

require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();

// =====================
// LOAD COMMANDS
// =====================

const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {

    const folderPath = path.join(
        commandsPath,
        folder
    );

    const commandFiles = fs
        .readdirSync(folderPath)
        .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {

        const filePath = path.join(
            folderPath,
            file
        );

        const command = require(filePath);

        if (
            command.data &&
            command.execute
        ) {

            client.commands.set(
                command.data.name,
                command
            );

            console.log(
                `✅ Loaded command: ${command.data.name}`
            );
        }
    }
}

// =====================
// READY
// =====================

client.once(
    Events.ClientReady,
    async readyClient => {

        console.log(
            `🤖 Logged in as ${readyClient.user.tag}`
        );

        try {

            await require("./deploy")(
                readyClient
            );

            console.log(
                "🚀 Commands deployed!"
            );

        } catch (err) {

            console.error(
                "Deploy Error:",
                err
            );
        }
    }
);

// =====================
// INTERACTIONS
// =====================

client.on(
    Events.InteractionCreate,
    async interaction => {

        try {

            // =====================
            // BUTTONS
            // =====================

            if (interaction.isButton()) {

                const ticket =
                    client.commands.get(
                        "ticket"
                    );

                if (
                    ticket &&
                    ticket.button
                ) {
                    return ticket.button(
                        interaction
                    );
                }

                return;
            }

            // =====================
            // SLASH COMMANDS
            // =====================

            if (
                !interaction.isChatInputCommand()
            ) return;

            const command =
                client.commands.get(
                    interaction.commandName
                );

            if (!command) return;

            await command.execute(
                interaction
            );

        } catch (error) {

            console.error(
                "Interaction Error:",
                error
            );

            try {

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction.followUp({
                        content:
                            "❌ Có lỗi xảy ra!",
                        ephemeral: true
                    });

                } else {

                    await interaction.reply({
                        content:
                            "❌ Có lỗi xảy ra!",
                        ephemeral: true
                    });
                }

            } catch {}
        }
    }
);

// =====================
// LOGIN
// =====================

client.login(process.env.TOKEN);