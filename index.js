const { Client, Intents } = require('discord.js');
const config = require('./config.json');
const messageHandler = require('./Handler/messageHandler');
const readyEventHandler = require('./Events/ready');
const RSGCore = exports['rsg-core'].GetCoreObject();
const axios = require('axios');
const serverName = GetConvar("sv_hostname", "Set Sv Host Name in Server.CFG")
const VORPcore = exports['vorp_core'].GetCore();

// Framework detection
let framework = null;
try {
    global.exports['rsg-core'].GetCoreObject();
    framework = 'rsg-core';
    console.log("Detected RSG-Core framework.");
} catch {
    try {
        global.exports['vorp_core'].GetCore();
        framework = 'vorp-core';
        console.log("Detected VORP-Core framework.");
    } catch {
        console.error("No supported framework detected!");
    }
}

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS]
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

client.once('ready', async () => {
    try {
        await readyEventHandler(client);
        messageHandler(client, framework);
        await updatePlayerList();
        setInterval(updatePlayerList, config.AllPlayersEmbed.RefreshTime);
    } catch (error) {
        console.error('Error during bot initialization:', error);
    }
});

// All Players Info 
let players = [];
let userPages = {};

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;
    if (!userPages[userId]) {
        userPages[userId] = 0;
    }

    if (interaction.customId === 'previous') {
        userPages[userId] = Math.max(userPages[userId] - 1, 0);
        await updateEmbed(interaction, userPages[userId], true);
    } else if (interaction.customId === 'next') {
        const totalPages = Math.ceil(players.length / 10);
        userPages[userId] = Math.min(userPages[userId] + 1, totalPages - 1);
        await updateEmbed(interaction, userPages[userId], true);
    }
});

async function updatePlayerList() {
    try {
        const response = await axios.get(`http://${config.AllPlayersEmbed.ServerIP + ':' + config.AllPlayersEmbed.ServerPort}/players.json`);
        if (!response.data || !Array.isArray(response.data)) {
            throw new Error('Invalid response format');
        }
        players = response.data;
        await sendInitialEmbed();
    } catch (error) {
        console.error('Error fetching player list:', error.message);
    }
}

async function sendInitialEmbed() {
    const currentPage = 0;
    const start = currentPage * 10;
    const end = start + 10;
    const playerNames = players.slice(start, end).map(player => `💻 **${player.name}** - ID: ${player.id}`).join('\n');
    const totalPages = Math.ceil(players.length / 10);

    const embed = {
        color: 0x0099ff,
        timestamp: new Date(),
        footer: {
            text: 'DFA DEVELOPMENTS',
            icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
        },
        title: '🕹️ **Current Players**',
        description: `There are currently  **${players.length}/${config.AllPlayersEmbed.maxPlayers}**  players online. (Page: ${currentPage + 1} of ${totalPages})`
            + `\n\n${playerNames || 'No players online'}`
    };

    const row = {
        type: 1,
        components: [
            {
                type: 2,
                style: 1,
                label: '◀️ Previous',
                custom_id: 'previous',
                disabled: currentPage === 0,
            },
            {
                type: 2,
                style: 1,
                label: '➡️ Next',
                custom_id: 'next',
                disabled: currentPage === totalPages - 1,
            }
        ]
    };

    const channel = await client.channels.fetch(config.AllPlayersEmbed.channelId);
    const messages = await channel.messages.fetch({ limit: 1 });
    const lastMessage = messages.first();
    embed.thumbnail = { url: channel.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }) }
    embed.author = { name: serverName, url: `http://${config.AllPlayersEmbed.ServerIP + ':' + config.AllPlayersEmbed.ServerPort}`, icon_url: channel.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }) }
    if (lastMessage && lastMessage.author.id === client.user.id) {
        await lastMessage.edit({ embeds: [embed], components: [row] });
    } else {
        await channel.send({ embeds: [embed], components: [row] });
    }
}

async function updateEmbed(interaction, currentPage, ephemeral = false) {
    const start = currentPage * 10;
    const end = start + 10;
    const playerNames = players.slice(start, end).map(player => `💻 **${player.name}** - ID: ${player.id}`).join('\n');
    const totalPages = Math.ceil(players.length / 10);

    const embed = {
        color: 0x0099ff,
        timestamp: new Date(),
        footer: {
            text: 'DFA DEVELOPMENTS',
            icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
        },
        title: '🕹️ **Current Players**',
        description: `There are currently  **${players.length}/${config.AllPlayersEmbed.maxPlayers}**  players online. (Page: ${currentPage + 1} of ${totalPages})`
            + `\n\n${playerNames || 'No players online'}`
    };

    const row = {
        type: 1,
        components: [
            {
                type: 2,
                style: 1,
                label: '◀️ Previous',
                custom_id: 'previous',
                disabled: currentPage === 0,
            },
            {
                type: 2,
                style: 1,
                label: '➡️ Next',
                custom_id: 'next',
                disabled: currentPage === totalPages - 1,
            }
        ]
    };

    await interaction.reply({ embeds: [embed], components: [row], ephemeral });
}

client.login(config.token)
    .catch(err => console.error('Login failed:', err));
