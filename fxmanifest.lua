fx_version 'cerulean'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'
game 'rdr3'
lua54 'yes'

author 'dfa-discordbot | DFA Development'
description 'Integrates RedM server with Dfa-DiscordBot for admin commands.'
version '1.3'

client_scripts {
    'client.lua',
}

server_scripts {
    '*.js',
}

dependencies {
    'rsg-core',
    'rsg-medic',
    'rsg-adminmenu',
    'weathersync',
}
