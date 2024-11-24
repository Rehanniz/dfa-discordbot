RegisterNetEvent("dfa-discordbot:kill",function()
    local ped = PlayerPedId()
    SetEntityHealth(ped, 0)
end)