#!/usr/bin/lua

print("*************** show port  ver. 0.2 ***************")
local uci = require("luci.model.uci").cursor()
dofile("/etc/tfortis_klish/scripts/lua/global_function.lua")


function show_port_config()
    uci:foreach("port", "lan",
    function(s)
        print(s[".name"] .. ":")
        print("\t state \t" .. s["state"])
        print("\t speed \t" .. s["speed"])
        print("\t flow  \t" .. s["flow"])
        print("\t poe   \t" .. s["poe"])
        print("----------------------------------------")
    end)
end

show_port_config()