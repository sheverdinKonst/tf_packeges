#
# Copyright (c) 2018, Tano Systems. All Rights Reserved.
# Anton Kikin <a.kikin@tano-systems.com>
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for LLDP daemon
LUCI_DEPENDS:=+lldpd +rpcd-mod-ucode
DEFAULT:=y
PKG_LICENSE:=MIT

#include $(TOPDIR)/feeds/luci/luci.mk
include ../../luci.mk
# call BuildPackage - OpenWrt buildroot signature
