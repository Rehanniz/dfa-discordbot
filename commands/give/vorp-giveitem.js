const { sendLog } = require('../../Events/logFunction');

module.exports = {
    name: 'giveitem',
    description: 'Give an item to a player!',
    adminOnly: true,
    execute(message, args) {
        if (!args[0] || !args[1] || !args[2]) {
            return message.reply(
                `❓ **Usage:** \`${config.prefix}giveitem [player_id] [item] [amount]\`\nExample: \`${config.prefix}giveitem 1 consumable_water 1\``
            );
        }

        const playerId = parseInt(args[0]);
        if (isNaN(playerId)) {
            return message.reply('❌ **Player ID must be a valid number!**');
        }

        const item = args[1].toString().toLowerCase();
        const amount = parseInt(args[2]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('❌ **Amount must be a valid positive number!**');
        }

        // Log the command execution
        sendLog(`giveitem command executed by ${message.author.tag} for Player ID: ${playerId} with Item: ${item} and Amount: ${amount}`);

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
            embed.description = `Player **${playerId}** is either offline or does not exist.`;
            embed.fields = [
                { name: '🛑 Action', value: 'Give Item **Failed**!', inline: true },
            ];
            return message.channel.send({ embeds: [embed] });
        }

        const character = VORPcore.getUser(playerId)?.getUsedCharacter;
        if (!character) {
            embed.color = 0xff0000;
            embed.title = '❌ Error: Character Not Found';
            embed.description = `The character for player **${playerId}** could not be retrieved.`;
            return message.channel.send({ embeds: [embed] });
        }

        global.exports['vorp_inventory'].addItem(playerId, item, amount, {}, (success) => {
            if (success) {
                // Log the successful item addition
                const fields = [
                    { name: '🆔 ID Static', value: `\`${character.charIdentifier}\``, inline: true },
                    { name: '👤 Name', value: `\`${character.firstname} ${character.lastname}\``, inline: true },
                    { name: 'Item', value: item.charAt(0).toUpperCase() + item.slice(1), inline: true },
                    { name: 'Amount', value: amount.toString(), inline: true },
                    { name: 'Command Issued By', value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
                ];

                sendLog(
                    message.client,
                    '🚨 Give Item',
                    `Successfully gave ${amount}x ${item.charAt(0).toUpperCase() + item.slice(1)} to Player ID: ${playerId} (${character.firstname} ${character.lastname})`,
                    0x00ff00,
                    fields
                );

                embed.color = 0x00ff00;
                embed.title = '✅ Item Given';
                embed.description = `**${amount}x ${item.charAt(0).toUpperCase() + item.slice(1)}** has been successfully added to **${character.firstname} ${character.lastname}** (ID: ${playerId}).`;
                embed.fields = fields;
            } else {
                embed.color = 0xff0000;
                embed.title = '❌ Failed to Add Item';
                embed.description = `Item **${item.charAt(0).toUpperCase() + item.slice(1)}** could not be added. Possible reasons:\n- Item does not exist.\n- Insufficient weight capacity.`;
            }

            message.channel.send({ embeds: [embed] });
        });
    },
};
