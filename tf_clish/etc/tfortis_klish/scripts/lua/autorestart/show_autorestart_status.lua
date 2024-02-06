#!/usr/bin/lua

print("*************** show_autorestart ver.-.0.4 ***************")
local uci = require("luci.model.uci").cursor()
dofile("/etc/tfortis_klish/scripts/lua/global_function.lua")

local text = executeCommand("tf_poe_restart_ctrl status")
local jsonText = text
local json_table = require("json").decode(jsonText)

for _, port in ipairs(json_table.port) do
    print("port:" .. port.id)
    print("     reboot count:       " ..  port.reboot_cnt)
    print("     last reboot time:   " ..  string.gsub(port.time, "\n", ""))
    print("     status:             " ..  string.gsub(port.status, "\n", ""))
    print("-----------------------------------------------")
end


