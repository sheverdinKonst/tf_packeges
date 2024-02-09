#!/usr/bin/lua

dofile("/etc/tfortis_klish/scripts/lua/global_function.lua")

local res = executeCommand("brctl showstp switch")

print("brctl showstp switch >> ")
print(res)


