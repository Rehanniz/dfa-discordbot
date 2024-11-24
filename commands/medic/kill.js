const { sendLog } = require('../../Events/logFunction');
const config = require('../../config.json'); // Adjust the path as needed

module.exports = {
    name: 'kill',
    description: 'Kill a player!',
    adminOnly: true,
    execute(message, args) {
        if (!args[0]) {
            return message.reply(
                `❓ **Usage:** \`${config.prefix}kill [id]\`\n**Example:** \`${config.prefix}kill 1\``
            );
        }

        const playerId = parseInt(args[0]);
        if (isNaN(playerId)) {
            return message.reply('❌ **Error:** Player ID must be a valid number!');
        }

        const embed = {
            color: 0x0099ff,
            timestamp: new Date(),
            footer: {
                text: 'DFA DEVELOPMENTS',
                icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
            },
        };

        const Player = RSGCore.Functions.GetPlayer(playerId);
        if (Player) {
            const PlayerData = Player.PlayerData;

            // Determine the prefix based on the QC_Medic configuration
            const medicPrefix = config.QC_Medic ? 'QC-AdvancedMedic' : 'rsg-medic';
            emitNet(`${medicPrefix}:client:KillPlayer`, playerId);

            embed.color = 0xff0000;
            embed.title = '💀 Player Eliminated!';
            embed.description = `**Player:** ${GetPlayerName(playerId)} (ID: **${playerId}**) has been successfully killed.`;
            embed.fields = [
                { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                { name: '🛑 Action', value: '**Killed**', inline: true },
            ];

            message.channel.send({ embeds: [embed] });
            const fields = [
                { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                { name: 'Command Issued By', value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
            ];

            sendLog(
                message.client,
                '🚨 Player Killed',
                `Player **${GetPlayerName(playerId)}** (ID: ${playerId}) was killed by <@${message.author.id}>.`,
                0x00ff00,
                fields
            );
        } else {
            embed.color = 0xff0000;
            embed.title = '❌ Error: Player Not Found!';
            embed.description = `The player with ID **${playerId}** is either offline or does not exist.`;
            embed.fields = [
                { name: '🛑 Action', value: 'Kill attempt **failed**!', inline: true },
            ];

            message.channel.send({ embeds: [embed] });

            sendLog(
                message.client,
                '❌ Player Not Found',
                `Attempted to kill player **${playerId}**, but the player was not found or is offline.`,
                0xff0000,
                embed.fields
            );
        }
    },
};
