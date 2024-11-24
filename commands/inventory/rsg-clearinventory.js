const { MessageActionRow, MessageButton } = require('discord.js');
const { sendLog } = require('../../Events/logFunction');  // Assuming sendLog is defined elsewhere for logging

module.exports = {
    name: 'clearinventory',
    description: "Clear a player's inventory!",
    adminOnly: true,
    execute(message, args) {
        if (!args[0]) {
            return message.reply(`❓ Usage: \`${config.prefix}clearinventory [player_id]\`\nExample: \`${config.prefix}clearinventory 1\``);
        }

        const player = parseInt(args[0]);
        const Player = RSGCore.Functions.GetPlayer(player);

        const embed = {
            color: 0x0099ff,
            timestamp: new Date(),
            footer: {
                text: 'DFA DEVELOPMENTS',
                icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
            },
        };

        // Log the clear inventory command execution
        sendLog(`ClearInventory command invoked by ${message.author.tag} for Player ID: ${player}`);

        if (Player) {
            const PlayerData = Player.PlayerData;
            embed.color = 0xffa500;
            embed.title = '⚠️ Confirm Inventory Clearance';
            embed.description = `Are you sure you want to clear the inventory of this player?`;
            embed.fields = [
                { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
            ];

            // Action buttons
            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('confirm_clear_inventory')
                    .setLabel('Yes, Clear')
                    .setStyle('DANGER'), // Red button for danger
                new MessageButton()
                    .setCustomId('cancel_clear_inventory')
                    .setLabel('No, Cancel')
                    .setStyle('SECONDARY') // Gray button for cancel
            );

            // Send the confirmation message
            message.channel.send({ embeds: [embed], components: [row] });

            // Button interaction handler
            const filter = i => i.user.id === message.author.id; // Filter for button clicks by the command sender
            const collector = message.channel.createMessageComponentCollector({ filter, time: 15000 }); // 15 seconds timeout

            collector.on('collect', async interaction => {
                if (interaction.customId === 'confirm_clear_inventory') {
                    // Execute inventory clear logic
                    Player.Functions.ClearInventory();

                    // Log the inventory clearance
                    const fields = [
                        { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                        { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                        { name: 'Command Issued By', value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
                    ];

                    sendLog(
                        message.client,
                        '🚨 Clear Inventory',
                        `Inventory of Player ID: ${player} cleared by ${message.author.tag}`,
                        0x00ff00,
                        fields
                    );
                    embed.color = 0x00ff00;
                    embed.title = '✅ Inventory Cleared';
                    embed.description = `The inventory of **${GetPlayerName(player)}** (ID: ${player}) has been cleared.`;
                    embed.fields = [
                        { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                        { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                        { name: 'Action', value: 'Inventory Cleared', inline: true },
                    ];
                    await interaction.update({ embeds: [embed], components: [] });
                    collector.stop();
                } else if (interaction.customId === 'cancel_clear_inventory') {
                    embed.color = 0xff0000;
                    embed.title = '❌ Action Cancelled';
                    embed.description = `The inventory clearance has been cancelled.`;
                    await interaction.update({ embeds: [embed], components: [] });
                    collector.stop();
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    embed.color = 0xffa500;
                    embed.title = '⏳ Timeout';
                    embed.description = `No response received. The inventory clearance request has been cancelled.`;
                    message.channel.send({ embeds: [embed] });
                }
            });
        } else {
            embed.color = 0xff0000;
            embed.title = '❌ Error: Player Not Found!';
            embed.description = `The player with ID **${player}** is either offline or does not exist.`;
            embed.fields = [
                { name: '🛑 Action', value: 'Clear Inventory Attempt **Failed**!', inline: true },
            ];

            message.channel.send({ embeds: [embed] });
        }
    },
};
