
local dkjson = require("dkjson")
local uci = require("luci.model.uci").cursor()

function executeCommand(command)
    local handle = io.popen(command)
    local result = handle:read("*a")
    handle:close()
    return result
end

function separateLettersAndNumbers(inputString)
    local letters = ""
    local numbers = ""
    for i = 1, #inputString do
        local char = inputString:sub(i, i)

        if tonumber(char) ~= nil then
            numbers = numbers .. char
        else
            letters = letters .. char
        end
    end
    return letters, tonumber(numbers)
end

function collectJsonTable(ubusCmd)
    local ubusRes = executeCommand(ubusCmd)
    local jsonData = dkjson.decode(ubusRes,1)
    return jsonData
end

function convertSeconds(seconds)
    local date = {}
    date.days = math.floor(seconds / 86400)
    seconds = seconds % 86400
     date.hours = math.floor(seconds / 3600)
    seconds = seconds % 3600
    date.minutes = math.floor(seconds / 60)
    date.sec = seconds % 60
    return date
end

function getUciBridgeVlanList()
    local brVlanList = {}
    uci:foreach("network", "bridge-vlan",
            function(v)
                local vlan = {}
                if v.ports ~= nil then
                    local portNumber = 0
                    vlan.ports  =  v.ports
                    vlan.id     = v[".name"]
                    vlan.num    = v.vlan
                    vlan.device = v.device

                    if (v.state ~= nil) then
                        vlan.state  = v.state
                    else
                        print("vlan.state is empty")
                    end

                    if (v.descr ~= nil) then
                        vlan.descr  = v.descr
                    else
                        print("vlan.descr is empty")
                    end

                    vlan.index  = v[".index"]
                    brVlanList[v.vlan] = vlan

                elseif v.ports == nil then
                    print("bridge-vlan *", v[".name"] .. "* not have any port was deleted")
                    local res = uci:delete("network", v[".name"])
                    print("res = ", res)
                end
            end)
    if (brVlanList ~= nil) then
        return brVlanList
    elseif (brVlanList == nil) then
        return nil
    end
end

function checkPortRange(range)
    local result = {}
    if (range == "all") then
        result[1] = 1
        result[2] = 1
        result[3] = "all"
    else
        for value in string.gmatch(range, "[^-]+") do
            value = tonumber(value)
            table.insert(result, value)
            result[3] = 0
        end

        if result[2] == nil then
            result[2] = result[1]
            result[3] = 1
        end
        if result[1] > result[2] then
            result = nil
        end
    end
    return result
end