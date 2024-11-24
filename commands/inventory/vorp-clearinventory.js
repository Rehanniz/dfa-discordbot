const { MessageActionRow, MessageButton } = require('discord.js');
const { sendLog } = require('../../Events/logFunction');

module.exports = {
    name: 'clearinventory',
    description: "Clear a player's inventory and weapons!",
    adminOnly: true,
    execute(message, args) {
        if (!args[0]) {
            return message.reply(`❓ Usage: \`${config.prefix}clearinventory [player_id]\`\nExample: \`${config.prefix}clearinventory 1\``);
        }

        const playerId = parseInt(args[0]);
        if (isNaN(playerId)) {
            return message.reply('❌ Invalid player ID. Please provide a valid numeric ID.');
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
                { name: '🛑 Action', value: 'Clear Inventory/Weapons Attempt **Failed**!', inline: true },
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

        embed.color = 0xffa500;
        embed.title = '⚠️ Confirm Action';
        embed.description = `What action would you like to perform for this player?`;
        embed.fields = [
            { name: '🆔 ID Static', value: `\`${character.citizenid}\``, inline: true },
            { name: '👤 Name', value: `\`${character.firstname} ${character.lastname}\``, inline: true },
        ];

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('confirm_clear_inventory')
                .setLabel('Clear Inventory')
                .setStyle('DANGER'),
            new MessageButton()
                .setCustomId('confirm_clear_weapons')
                .setLabel('Clear Weapons')
                .setStyle('DANGER'),
            new MessageButton()
                .setCustomId('cancel_clear_inventory')
                .setLabel('Cancel')
                .setStyle('SECONDARY')
        );

        message.channel.send({ embeds: [embed], components: [row] });

        const filter = i => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async interaction => {
            if (interaction.customId === 'confirm_clear_inventory') {
                // Clear Inventory
                global.exports['vorp_inventory'].getUserInventoryItems(playerId, async items => {
                    if (items && Object.keys(items).length > 0) {
                        for (const [key, item] of Object.entries(items)) {
                            await global.exports['vorp_inventory'].subItem(
                                playerId,
                                item.name,
                                item.count,
                                {},
                                success => {
                                    if (!success) {
                                        console.error(`Failed to remove ${item.count}x ${item.name} from Player ID: ${playerId}`);
                                    }
                                }
                            );
                        }
                    }
                });

                embed.color = 0x00ff00;
                embed.title = '✅ Inventory Cleared';
                embed.description = `The inventory of **${character.firstname} ${character.lastname}** (ID: ${playerId}) has been cleared.`;
                await interaction.update({ embeds: [embed], components: [] });
            } else if (interaction.customId === 'confirm_clear_weapons') {
                // Clear Weapons
                global.exports['vorp_inventory'].getUserWeapons(playerId, async weapons => {
                    if (weapons && Object.keys(weapons).length > 0) {
                        for (const weapon of weapons) {
                            await global.exports['vorp_inventory'].subWeapon(
                                playerId,
                                weapon.id,
                                success => {
                                    if (!success) {
                                        console.error(`Failed to remove weapon ${weapon.name} from Player ID: ${playerId}`);
                                    }
                                }
                            );
                        }

                        // Optional: Trigger client-side events to remove ammo
                        TriggerClientEvent('syn_weapons:removeallammo', playerId);
                        TriggerClientEvent('vorp_weapons:removeallammo', playerId);
                    }
                });

                embed.color = 0x00ff00;
                embed.title = '✅ Weapons Cleared';
                embed.description = `All weapons of **${character.firstname} ${character.lastname}** (ID: ${playerId}) have been cleared.`;
                await interaction.update({ embeds: [embed], components: [] });
            } else if (interaction.customId === 'cancel_clear_inventory') {
                embed.color = 0xff0000;
                embed.title = '❌ Action Cancelled';
                embed.description = `The inventory/weapons clearance has been cancelled.`;
                await interaction.update({ embeds: [embed], components: [] });
            }

            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                embed.color = 0xffa500;
                embed.title = '⏳ Timeout';
                embed.description = `No response received. The inventory/weapons clearance request has been cancelled.`;
                message.channel.send({ embeds: [embed] });
            }
        });
    },
};
