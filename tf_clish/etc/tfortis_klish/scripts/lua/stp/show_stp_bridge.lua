#!/usr/bin/lua

dofile("/etc/tfortis_klish/scripts/lua/global_function.lua")

local bridgeList = executeCommand("mstpctl showbridgelist")

print("bridgeList = " .. bridgeList)
print("size = " .. #bridgeList .. " type = " .. type(bridgeList))

-- uci set network.switch.stp='1'

-- onfig device 'switch'
-- ption name 'switch'
-- ption type 'bridge'
-- ist ports 'lan1'
-- ist ports 'lan2'
-- ist ports 'lan4'
-- ist ports 'lan5'
-- ist ports 'lan6'
-- ist ports 'lan7'
-- ist ports 'lan8'
-- ist ports 'lan9'
-- ist ports 'lan10'
-- ist port 'lan3'
-- ption macaddr 'C0:11:A6:07:00:00'
-- ption stp '1'

-- uci set mstpd.switch.hello='3'
-- uci set mstpd.lan1.bpdufilter='yes'

-- ERROR:type

-- root@TFortis:/etc/config# brctl showstp switch
-- switch
-- bridge id              7fff.c011a6070000
-- designated root        1000.ecade002b337
-- root port                 6                    path cost                  4
-- max age                  20.00                 bridge max age            20.00
-- hello time                2.00                 bridge hello time          2.00
-- forward delay            15.00                 bridge forward delay      15.00
-- ageing time             300.00
-- hello timer               0.00                 tcn timer                  0.00
-- topology change timer     0.00                 gc timer                 102.65
-- flags
-- 
-- 
-- lan8 (7)
-- port id                8007                    state                forwarding
-- designated root        1000.ecade002b337       path cost                 19
-- designated bridge      7fff.c011a6070000       message age timer          0.00
-- designated port        8007                    forward delay timer        0.00
-- designated cost           4                    hold timer                 0.00
-- flags
-- 
-- lan6 (5)
-- port id                8005                    state                  disabled
-- designated root        7fff.c011a6070000       path cost                100
-- designated bridge      7fff.c011a6070000       message age timer          0.00
-- designated port        8005                    forward delay timer        0.00
-- designated cost           0                    hold timer                 0.00
-- flags
-- 
-- lan4 (3)
-- port id                8003                    state                  disabled
-- designated root        1000.ecade002b337       path cost                100
-- designated bridge      7fff.c011a6070000       message age timer          0.00
-- designated port        8003                    forward delay timer        0.00
-- designated cost           4                    hold timer                 0.00
-- flags
-- 
-- lan2 (2)
-- port id                8002                    state                  disabled
-- designated root        7fff.c011a6070000       path cost                100
-- designated bridge      7fff.c011a6070000       message age timer          0.00
-- designated port        8002                    forward delay timer        0.00
-- designated cost           0                    hold timer                 0.00
-- flags
-- 
-- lan9 (8)
-- port id                8008                    state                  disabled
-- designated root        7fff.c011a6070000       path cost                  4
-- designated bridge      7fff.c011a6070000       message age timer          0.00
-- designated port        8008                    forward delay timer        0.00
-- designated cost           0                    hold timer                 0.00
-- flags
-- 
-- lan7 (6)
-- port id                8006                    state                forwarding
-- designated root        1000.ecade002b337       path cost                  4
-- designated bridge      1000.ecade002b337       message age timer         18.54
-- designated port        1017                    forward delay timer        0.00
-- designated cost           0                    hold timer                 0.00
-- flags
-- 
-- lan10 (9)
-- port id                8009                    state                  disabled
-- designated root        7fff.c011a6070000       path cost                  4
-- designated bridge      7fff.c011a6070000       message age timer          0.00
-- designated port        8009                    forward delay timer        0.00
-- designated cost           0                    hold timer                 0.00
-- flags
-- 
-- lan5 (4)
-- port id                8004                    state                  disabled
-- designated root        7fff.c011a6070000       path cost                100
-- designated bridge      7fff.c011a6070000       message age timer          0.00
-- designated port        8004                    forward delay timer        0.00
-- designated cost           0                    hold timer                 0.00
-- flags
-- 
-- lan3 (10)
-- port id                800a                    state                  blocking
-- designated root        1000.ecade002b337       path cost                  4
-- designated bridge      1000.ecade002b337       message age timer         18.51
-- designated port        8015                    forward delay timer        0.00
-- designated cost           0                    hold timer                 0.00
-- flags
-- 
-- lan1 (1)
-- port id                8001                    state                forwarding
-- designated root        1000.ecade002b337       path cost                 19
-- designated bridge      7fff.c011a6070000       message age timer          0.00
-- designated port        8001                    forward delay timer        0.00
-- designated cost           4                    hold timer                 0.00
-- flags
-- 
-- root@TFortis:/etc/config# mstpctl addbridge switch
-- ctl_client_init: Couldn't connect to server
-- can't setup control connection
-- root@TFortis:/etc/config# brctl stp switch yes
-- root@TFortis:/etc/config# mstpctl showbridge
-- ctl_client_init: Couldn't connect to server
-- can't setup control connection
-- root@TFortis:/etc/config# mstpctl showbridge
-- ctl_client_init: Couldn't connect to server
-- can't setup control connection
-- root@TFortis:/etc/config# mstpctl showbridge
-- ctl_client_init: Couldn't connect to server
-- can't setup control connection
-- root@TFortis:/etc/config# brctl showstp switch 
-- brctl: bridge switch  does not exist

-- Removing package luci-i18n-tn-mstpd-ru from root...
-- Removing package luci-app-tn-mstpd from root...
-- Removing package mstpd from root...

-- uci add_list mstpd.global.bridge='switch'


