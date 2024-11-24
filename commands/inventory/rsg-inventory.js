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
            const Inventory = Player.PlayerData.items;

            embed.color = 0x00ff00;
            embed.title = `📦 Inventory for ${Player.PlayerData.charinfo.firstname} ${Player.PlayerData.charinfo.lastname} (ID: ${playerId}, Citizen ID: ${Player.PlayerData.citizenid})`;

            const formattedItems = Inventory.map(item =>
                `**${item.amount}x** | \`${item.name}\` | ${item.label || "Unknown"}`).join('\n');

            embed.fields = [
                {
                    name: 'Amount | Item Name | Item Label',
                    value: formattedItems || 'No items found.',
                    inline: false
                }
            ];

            message.channel.send({ embeds: [embed] });
        } else {
            embed.color = 0xff0000;
            embed.title = '❌ Error: Player Not Online';
            embed.description = `Player **${playerId}** is not online or does not exist.`;
            embed.fields = [
                { name: 'Action', value: 'Inventory fetch attempt failed', inline: true },
            ];

            message.channel.send({ embeds: [embed] });
        }
    }
};
