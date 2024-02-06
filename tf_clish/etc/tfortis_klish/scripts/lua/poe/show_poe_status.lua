#!/usr/bin/lua

print("*************** show poe config  ver.-0.2 ***************")
local uci = require("luci.model.uci").cursor()
dofile("/etc/tfortis_klish/scripts/lua/global_function.lua")

local json = require("json")
local poeInfo = {}

function show_poe_status()
    poeInfo = colectPoeInfo("ubus call poe info")
    print("budget:     \t" .. poeInfo.budget .. " W")
    print("consumption:\t" .. poeInfo.consumption .. " W")
    uci:foreach("poe", "port",
       function(s)
       local resultLetters, resultNumbers = separateLettersAndNumbers(s[".name"])
       local portNum = ""
       print("----------------------------------------")
       print(resultLetters .. " " .. resultNumbers)
       portNum = s["name"]
       print("\tname   " .. "  \t" .. portNum)
       print("\tid     " .. "  \t" .. s["id"])
       print("\tenable " .. "  \t" .. s["enable"])
       for key, value in pairs(poeInfo.ports[portNum]) do
       print("\t" .. key .. "  \t" .. value)
       end
    end)
end

function colectPoeInfo(ubusCmd)
    local ubusRes = executeCommand(ubusCmd)
    local jsonData = json.decode(ubusRes)
    return jsonData
end

show_poe_status()


