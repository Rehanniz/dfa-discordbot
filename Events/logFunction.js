
function sendLog(client, logTitle, logDetails, logColor, fields = []) {
    if (!client || !client.channels || !client.channels.cache) {
        return;
    }
    const logChannel = client.channels.cache.get(config.logChannelId);
    if (!logChannel) {
        console.error(`❌ Log channel with ID ${config.logChannelId} not found.`);
        return;
    }
    const embed = {
        color: 0x0099ff,
        timestamp: new Date(),
        title: logTitle,
        description: logDetails,
        fields: fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline })),
        footer: {
            text: 'DFA DEVELOPMENTS',
            icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
        },
    };
    logChannel.send({ embeds: [embed] }).catch((err) => {
        console.error('❌ Failed to send log message:', err);
    });
}

module.exports = { sendLog };
