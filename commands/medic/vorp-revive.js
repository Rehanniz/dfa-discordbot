const { sendLog } = require('../../Events/logFunction');

module.exports = {
    name: 'revive',
    description: 'Revive a player!',
    adminOnly: true,
    async execute(message, args) {
        if (!args[0]) {
            return message.reply(
                `❓ **Usage:** \`${config.prefix}revive [id]\`\n**Example:** \`${config.prefix}revive 1\``
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

        if (!GetPlayerName(playerId)) {
            embed.color = 0xff0000;
            embed.title = '❌ Error: Player Not Found!';
            embed.description = `The player with ID **${playerId}** is either offline or does not exist.`;
            embed.fields = [
                { name: '🛑 Action', value: 'Revive attempt **failed**!', inline: true },
            ];

            message.channel.send({ embeds: [embed] });

            sendLog(
                message.client,
                '❌ Player Not Found',
                `Attempted to revive player **${playerId}**, but the player was not found or is offline.`,
                0xff0000,
                embed.fields
            );
            return;
        }

        const character = VORPcore.getUser(playerId)?.getUsedCharacter;
        if (!character) {
            embed.color = 0xff0000;
            embed.title = '❌ Error: Character Not Found';
            embed.description = `The character for player **${playerId}** could not be retrieved.`;
            message.channel.send({ embeds: [embed] });
            return;
        }

        // Emit the revive event
        emitNet('vorp:resurrectPlayer', playerId);

        const characterName = `${character.firstname} ${character.lastname}`;
        embed.color = 0x00ff00;
        embed.title = '✨ Player Revived Successfully!';
        embed.description = `**Player:** ${characterName} (ID: **${playerId}**) has been brought back to life!`;
        embed.fields = [
            { name: '🆔 ID Static', value: `\`${character.charIdentifier}\``, inline: true },
            { name: '👤 Name', value: `\`${characterName}\``, inline: true },
            { name: '🏥 Action', value: '**Revived**', inline: true },
        ];

        message.channel.send({ embeds: [embed] });

        // Log the revival
        const fields = [
            { name: '🆔 ID Static', value: `\`${character.charIdentifier}\``, inline: true },
            { name: '👤 Name', value: `\`${characterName}\``, inline: true },
            { name: 'Command Issued By', value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
        ];

        sendLog(
            message.client,
            '🚨 Player Revived',
            `Player **${characterName}** (ID: ${playerId}) was revived successfully by <@${message.author.id}>.`,
            0x00ff00,
            fields
        );
    },
};
