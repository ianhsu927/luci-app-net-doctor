include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI network diagnosis assistant
LUCI_DEPENDS:=+rpcd +libubox +ubus +ip-full +curl +ca-bundle
LUCI_PKGARCH:=all
PKG_VERSION:=0.1.0
PKG_RELEASE:=1
PKG_LICENSE:=MIT

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
