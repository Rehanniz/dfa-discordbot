const { sendLog } = require('../../Events/logFunction');

module.exports = {
    name: 'inventory',
    description: 'Fetches the inventory of a player!',
    adminOnly: true,
    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`⚠️ **Usage:** \`${config.prefix}inventory [id]\`\n**Example:** \`${config.prefix}inventory 1\``);
        }

        const playerId = parseInt(args[0]);
        if (isNaN(playerId)) {
            return message.reply('❌ Invalid player ID provided. Please provide a valid numeric ID.');
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
            embed.title = '❌ Error: Player Not Online';
            embed.description = `Player **${playerId}** is not online or does not exist.`;
            embed.fields = [
                { name: 'Action', value: 'Inventory fetch attempt failed', inline: true },
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

        // Fetch inventory using VORP inventory API
        global.exports['vorp_inventory'].getUserInventoryItems(playerId, (items) => {
            if (!items || Object.keys(items).length === 0) {
                embed.color = 0xffa500;
                embed.title = `📦 Inventory for ${character.firstname} ${character.lastname}`;
                embed.description = 'The inventory is empty.';
                return message.channel.send({ embeds: [embed] });
            }

            embed.color = 0x00ff00;
            embed.title = `📦 Inventory for ${character.firstname} ${character.lastname} (ID: ${playerId})`;

            const formattedItems = Object.entries(items)
                .map(([key, item]) => `**${item.count}x** - **${item.label}** (\`${item.name}\`)`)
                .join('\n');

            embed.fields = [
                {
                    name: 'Amount | Item Name | Item Label',
                    value: formattedItems || 'No items found.',
                    inline: false,
                },
            ];

            message.channel.send({ embeds: [embed] });
        });
    },
};
