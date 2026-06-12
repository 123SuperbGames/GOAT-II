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

const teams = [];

const commands = [
    new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your GOAT II profile'),

    new SlashCommandBuilder()
        .setName('createteam')
        .setDescription('Create a team')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Team name')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('manager')
                .setDescription('Manager')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('league')
                .setDescription('League')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('addplayer')
        .setDescription('Add a player to a team')
        .addStringOption(option =>
            option.setName('team')
                .setDescription('Team name')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('player')
                .setDescription('Player')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('roster')
        .setDescription('View a team roster')
        .addStringOption(option =>
            option.setName('team')
                .setDescription('Team name')
                .setRequired(true))
]
.map(command => command.toJSON());

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
                { name: '🏅 Rank', value: 'Bronze', inline: true },
                { name: '⭐ Points', value: '0', inline: true },
                { name: '⚽ Goals', value: '0', inline: true },
                { name: '🅰️ Assists', value: '0', inline: true },
                { name: '🧤 Clean Sheets', value: '0', inline: true }
            );

        return interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'createteam') {
        const name = interaction.options.getString('name');
        const manager = interaction.options.getString('manager');
        const league = interaction.options.getString('league');

        teams.push({
            name,
            manager,
            league,
            players: []
        });

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('✅ Team Created')
                    .setDescription(
                        `🏆 ${name}\n👔 Manager: ${manager}\n🌍 League: ${league}\n\n👥 Roster: 0/18`
                    )
            ]
        });
    }

    if (interaction.commandName === 'addplayer') {
        const teamName = interaction.options.getString('team');
        const player = interaction.options.getUser('player');

        const team = teams.find(
            t => t.name.toLowerCase() === teamName.toLowerCase()
        );

        if (!team) {
            return interaction.reply({
                content: '❌ Team not found.',
                ephemeral: true
            });
        }

        team.players.push(player.id);

        return interaction.reply(
            `✅ ${player.username} added to ${team.name}`
        );
    }

    if (interaction.commandName === 'roster') {
        const teamName = interaction.options.getString('team');

        const team = teams.find(
            t => t.name.toLowerCase() === teamName.toLowerCase()
        );

        if (!team) {
            return interaction.reply({
                content: '❌ Team not found.',
                ephemeral: true
            });
        }

        const roster =
            team.players.length > 0
                ? team.players.map(id => `<@${id}>`).join('\n')
                : 'No players yet';

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`🏆 ${team.name} Roster`)
                    .setDescription(
                        `👔 Manager: ${team.manager}\n🌍 League: ${team.league}`
                    )
                    .addFields({
                        name: `👥 Players (${team.players.length}/18)`,
                        value: roster
                    })
            ]
        });
    }
});

registerCommands()
    .then(() => client.login(process.env.TOKEN))
    .catch(console.error);
