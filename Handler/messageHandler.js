const fs = require('fs');

module.exports = (client, framework) => {
    client.commands = new Map();

    const commandFolders = fs.readdirSync(GetResourcePath(GetCurrentResourceName()) + '/commands');

    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(GetResourcePath(GetCurrentResourceName()) + '/commands/' + folder).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(GetResourcePath(GetCurrentResourceName()) + '/commands/' + folder + '/' + file);
            // Skip framework-specific commands if framework is not detected
            if ((file.startsWith("rsg-") && framework !== 'rsg-core') || (file.startsWith("vorp-") && framework !== 'vorp-core')) {
                continue;
            }
            client.commands.set(command.name, command);
        }
    }

    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        const prefix = '!';
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (!command) return;

        const userId = message.author.id;
        const member = await message.guild.members.fetch(userId);
        if (command.adminOnly) {
            if (!hasPermission(userId, member)) {
                const permissionEmbed = {
                    color: 0xFF0000,
                    title: '⛔ | Permission Denied',
                    description: 'You do not have permission to use this command.',
                    fields: [
                        {
                            name: 'Allowed Users:',
                            value: (config.allowedUserIds && config.allowedUserIds.length > 0)
                                ? config.allowedUserIds.map(userID => `<@${userID}>`).join(', ')
                                : 'None'
                        },
                        {
                            name: 'Allowed Roles:',
                            value: (config.allowedRoleIds && config.allowedRoleIds.length > 0)
                                ? config.allowedRoleIds.map(roleId => `<@&${roleId}>`).join(', ')
                                : 'None'
                        }
                    ],
                    footer: {
                        text: 'DFA DEVELOPMENTS',
                        icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
                    },
                    timestamp: new Date()
                };

                return message.reply({ embeds: [permissionEmbed] });
            }
        }

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('There was an error executing that command!');
        }
    });
};

function hasPermission(userId, member) {
    if (config.allowedUserIds.includes(userId)) {
        return true;
    }

    if (config.allowedRoleIds.some(roleId => member.roles.cache.has(roleId))) {
        return true;
    }

    return false;
}
