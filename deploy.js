const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

module.exports = async (client) => {
    const commands = [];

    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            if (command.data && command.execute) {
              
                commands.push(
                    typeof command.data.toJSON === "function"
                        ? command.data.toJSON()
                        : command.data
                );
            }
        }
    }
    const rest = new REST({ version: '10' })
        .setToken(process.env.TOKEN);

    try {
        console.log(`🚀 Deploying ${commands.length} commands...`);

        const data = await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );

        console.log(`✅ Successfully deployed ${data.length} commands`);
    } catch (err) {
        console.error("❌ Deploy error:", err);
    }
};