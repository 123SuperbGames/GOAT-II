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
            option
                .setName('name')
                .setDescription('Team name')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('manager')
                .setDescription('Manager')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('league')
                .setDescription('League')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('addplayer')
        .setDescription('Add a player to a team')
        .addStringOption(option =>
            option
                .setName('team')
                .setDescription('Team name')
                .setRequired(true)
        )
        .addUserOption(option =>
            option
                .setName('player')
                .setDescription('Player')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('roster')
        .setDescription('View a team roster')
        .addStringOption(option =>
            option
                .setName('team')
                .setDescription('Team name')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('add-result')
        .setDescription('Process a result message')
        .addStringOption(option =>
            option
                .setName('message_id')
                .setDescription('Discord message ID')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('competition')
                .setDescription('Competition name')
                .setRequired(true)
        )

].map(command => command.toJSON());

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

    // PROFILE
    if (interaction.commandName === 'profile') {

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`${interaction.user.username}'s GOAT II Profile`)
            .addFields(
                { name: '🏅 Rank', value: 'Bronze', inline: true },
                { name: '⭐ Points', value: '0', inline: true },
                { name: '⚽ Goals', value: '0', inline: true },
                { name: '🅰️ Assists', value: '0', inline: true },
                { name: '🧤 Clean Sheets', value: '0', inline: true }
            );

        return interaction.reply({
            embeds: [embed]
        });
    }

    // CREATE TEAM
    if (interaction.commandName === 'createteam') {

        const name = interaction.options.getString('name');
        const manager = interaction.options.getString('manager');
        const league = interaction.options.getString('league');

        const existing = teams.find(
            t => t.name.toLowerCase() === name.toLowerCase()
        );

        if (existing) {
            return interaction.reply({
                content: '❌ Team already exists.',
                ephemeral: true
            });
        }

        teams.push({
            name,
            manager,
            league,
            players: []
        });

        const embed = new EmbedBuilder()
            .setColor(0x00ff88)
            .setTitle('✅ Team Created')
            .setDescription(
                `🏆 **${name}**\n👔 Manager: ${manager}\n🌍 League: ${league}\n\n👥 Roster: 0/18`
            );

        return interaction.reply({
            embeds: [embed]
        });
    }

    // ADD PLAYER
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

        if (team.players.includes(player.id)) {
            return interaction.reply({
                content: '❌ Player already in team.',
                ephemeral: true
            });
        }

        team.players.push(player.id);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x00ff88)
                    .setTitle('✅ Player Added')
                    .setDescription(
                        `👤 ${player}\n🏆 ${team.name}\n\n👥 Roster: ${team.players.length}/18`
                    )
            ]
        });
    }

    // ROSTER
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

        const playerList =
            team.players.length > 0
                ? team.players.map(id => `<@${id}>`).join('\n')
                : 'No players yet';

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`🏆 ${team.name} Roster`)
            .setDescription(
                `👔 Manager: ${team.manager}\n🌍 League: ${team.league}`
            )
            .addFields({
                name: `👥 Players (${team.players.length}/18)`,
                value: playerList
            });

        return interaction.reply({
            embeds: [embed]
        });
    }

    // ADD RESULT
    if (interaction.commandName === 'add-result') {

        const messageId =
            interaction.options.getString('message_id');

        const competition =
            interaction.options.getString('competition');

        const embed = new EmbedBuilder()
            .setColor(0x00ff88)
            .setTitle('✅ Result Added')
            .setDescription(
                `📨 Message ID: ${messageId}\n🏆 Competition: ${competition}`
            );

        return interaction.reply({
            embeds: [embed]
        });
    }
});

registerCommands()
    .then(() => client.login(process.env.TOKEN))
    .catch(console.error);
