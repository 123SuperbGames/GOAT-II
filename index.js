require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const commands = [
    new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your GOAT II profile')
        .toJSON()
];

async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
    );

    console.log('✅ Commands registered');
}

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'profile') {
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s GOAT II Profile`)
            .addFields(
                { name: 'Rank', value: 'Bronze', inline: true },
                { name: 'Points', value: '0', inline: true },
                { name: 'Goals', value: '0', inline: true },
                { name: 'Assists', value: '0', inline: true },
                { name: 'Clean Sheets', value: '0', inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    }
});

registerCommands()
    .then(() => client.login(process.env.TOKEN))
    .catch(console.error);