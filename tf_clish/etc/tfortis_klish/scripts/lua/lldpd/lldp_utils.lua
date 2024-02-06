
id_e =
{
    type    = "type",
    value   = "value",
}

capability_e =
{
    type    = "type",
    enabled   = "enabled",
}

chassis_e = {
    id              = "id",
    name            = "name",
    descr           = "descr",
    mgmt_ip         = "mgmt-ip",
    mgmt_iface      = "mgmt-iface",
    capability      = "capability",
    id_t            = id_e,
    capability_t    = capability_e
}
function needToPrint(portStr, name)
    local isPrint = 0
    if (portStr[3] == "all") then
        isPrint = 1
    else
        local str, num =name:match("(%a+)(%d+)")
        portNumber = tonumber(num)
        local portRangeMin = tonumber(portStr[1])
        local portRangeMax = tonumber(portStr[2])
        if str == "lan" then
            if   portNumber  >= portRangeMin and portNumber <= portRangeMax then
                isPrint = 1
            end
        end
    end
    return isPrint
end




