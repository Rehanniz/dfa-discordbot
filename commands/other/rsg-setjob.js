const { sendLog } = require('../../Events/logFunction');
const config = require('../../config.json'); // Adjust the path as needed

module.exports = {
    name: 'setjob',
    description: 'Set a job for a player!',
    adminOnly: true,
    execute(message, args) {
        if (args.length < 3) {
            return message.reply(
                `❓ **Usage:** \`${config.prefix}setjob [id] [job] [grade]\`\n` +
                `**Example:** \`${config.prefix}setjob 1 vallaw 1\``
            );
        }

        const playerId = parseInt(args[0]);
        if (isNaN(playerId)) {
            return message.reply('❌ **Error:** Player ID must be a valid number!');
        }

        const job = args[1].toLowerCase(); // Job name in lowercase for consistency
        const grade = parseInt(args[2]);
        if (isNaN(grade) || grade < 0) {
            return message.reply('❌ **Error:** Grade must be a valid non-negative number!');
        }

        const Player = RSGCore.Functions.GetPlayer(playerId);
        const embed = {
            color: 0x0099ff,
            timestamp: new Date(),
            footer: {
                text: 'DFA DEVELOPMENTS',
                icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
            },
        };

        if (Player) {
            const PlayerData = Player.PlayerData;

            // Attempt to set the job
            try {
                Player.Functions.SetJob(job, grade);

                // Verify if the job was set correctly
                if (PlayerData.job.name !== job) {
                    embed.color = 0xff0000;
                    embed.title = '❌ Error: Job Assignment Failed!';
                    embed.description = `The job **${job}** does not exist or could not be assigned.`;
                    embed.fields = [
                        { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                        { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                        { name: '💼 Job Attempted', value: `\`${job}\``, inline: true },
                        { name: '📊 Grade Attempted', value: `\`${grade}\``, inline: true },
                    ];
                    message.channel.send({ embeds: [embed] });

                    // Log the failed attempt
                    sendLog(
                        message.client,
                        '❌ Job Assignment Failed',
                        `Attempted to assign job **${job}** with grade **${grade}** to player **${GetPlayerName(playerId)}**.`,
                        0xff0000,
                        embed.fields
                    );
                    return;
                }

                embed.color = 0x00ff00;
                embed.title = '✅ Job Assigned Successfully!';
                embed.description = `**Player:** ${GetPlayerName(playerId)} (ID: **${playerId}**) has been assigned the job **${job}** with grade **${grade}**.`;
                embed.fields = [
                    { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                    { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                    { name: '💼 Job', value: `\`${job}\``, inline: true },
                    { name: '📊 Grade', value: `\`${grade}\``, inline: true },
                ];
                message.channel.send({ embeds: [embed] });

                const fields = [
                    { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                    { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                    { name: '💼 Job Attempted', value: `\`${job}\``, inline: true },
                    { name: '📊 Grade Attempted', value: `\`${grade}\``, inline: true },
                    { name: 'Command Issued By', value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
                ];

                sendLog(
                    message.client,
                    '🚨 Job Assigned Successfully',
                    `Job **${job}** with grade **${grade}** has been assigned to **${GetPlayerName(playerId)}**.`,
                    0x00ff00,
                    fields
                );

            } catch (error) {
                embed.color = 0xff0000;
                embed.title = '❌ Error: Job Assignment Failed!';
                embed.description = `An error occurred while trying to assign the job **${job}** with grade **${grade}** to player **${GetPlayerName(playerId)}**.`;
                embed.fields = [
                    { name: '🆔 Citizen ID', value: `\`${PlayerData.citizenid}\``, inline: true },
                    { name: '👤 Name', value: `\`${PlayerData.charinfo.firstname} ${PlayerData.charinfo.lastname}\``, inline: true },
                    { name: '💼 Job Attempted', value: `\`${job}\``, inline: true },
                    { name: '📊 Grade Attempted', value: `\`${grade}\``, inline: true },
                ];
                message.channel.send({ embeds: [embed] });
                console.error('Error assigning job:', error);
            }
        } else {
            embed.color = 0xff0000;
            embed.title = '❌ Error: Player Not Found!';
            embed.description = `The player with ID **${playerId}** is either offline or does not exist.`;
            embed.fields = [
                { name: '🛑 Action', value: 'Set Job **Failed**!', inline: true },
            ];
            message.channel.send({ embeds: [embed] });


        }
    },
};
