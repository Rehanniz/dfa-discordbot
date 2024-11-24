const { sendLog } = require('../../Events/logFunction');
const config = require('../../config.json'); // Adjust the path as needed

module.exports = {
    name: 'setjob',
    description: 'Set a job for a player!',
    adminOnly: true,
    async execute(message, args) {
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

        const embed = {
            color: 0x0099ff,
            timestamp: new Date(),
            footer: {
				text: 'DFA DEVELOPMENTS',
				icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
			},
        };

        // Get player using VORP Core
        const character = VORPcore.getUser(playerId)?.getUsedCharacter;
        if (!character) {
            embed.color = 0xff0000;
            embed.title = '❌ Error: Player Not Found!';
            embed.description = `The player with ID **${playerId}** is either offline or does not exist.`;
            embed.fields = [
                { name: '🛑 Action', value: 'Set Job **Failed**!', inline: true },
            ];
            return message.channel.send({ embeds: [embed] });
        }

        try {
            // Set the job and grade
            const prevJob = character.job.name;
            const prevGrade = character.job.grade.level;

            // Change the job and grade
            character.setJob(job, true); // Set job without triggering events
            character.setJobGrade(grade, true); // Set job grade without triggering events
            character.setJobLabel(job.charAt(0).toUpperCase() + job.slice(1)); // Set job label

            embed.color = 0x00ff00;
            embed.title = '✅ Job Assigned Successfully!';
            embed.description = `**Player:** ${character.firstname} ${character.lastname} (ID: **${playerId}**) has been assigned the job **${job}** with grade **${grade}**.`;
            embed.fields = [
                { name: '🆔 Citizen ID', value: `\`${character.charIdentifier}\``, inline: true },
                { name: '👤 Name', value: `\`${character.firstname} ${character.lastname}\``, inline: true },
                { name: '💼 Job', value: `\`${job}\``, inline: true },
                { name: '📊 Grade', value: `\`${grade}\``, inline: true },
            ];

            // Log the successful job change
            const fields = [
                { name: '🆔 ID Static', value: `\`${character.charIdentifier}\``, inline: true },
                { name: '👤 Name', value: `\`${character.firstname} ${character.lastname}\``, inline: true },
                { name: '💼 Job Assigned', value: `\`${job}\``, inline: true },
                { name: '📊 Grade Assigned', value: `\`${grade}\``, inline: true },
                { name: 'Command Issued By', value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
            ];

            sendLog(
                message.client,
                '🚨 Job Assigned Successfully',
                `Job **${job}** with grade **${grade}** has been assigned to **${character.firstname} ${character.lastname}** (ID: ${playerId}).`,
                0x00ff00,
                fields
            );

            // Send confirmation to the admin
            message.channel.send({ embeds: [embed] });

        } catch (error) {
            embed.color = 0xff0000;
            embed.title = '❌ Error: Job Assignment Failed!';
            embed.description = `An error occurred while trying to assign the job **${job}** with grade **${grade}** to player **${character.firstname} ${character.lastname}** (ID: ${playerId}).`;
            embed.fields = [
                { name: '🆔 Citizen ID', value: `\`${character.charIdentifier}\``, inline: true },
                { name: '👤 Name', value: `\`${character.firstname} ${character.lastname}\``, inline: true },
                { name: '💼 Job Attempted', value: `\`${job}\``, inline: true },
                { name: '📊 Grade Attempted', value: `\`${grade}\``, inline: true },
            ];

            message.channel.send({ embeds: [embed] });
            console.error('Error assigning job:', error);
        }
    },
};
