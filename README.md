# 断网诊断助手 0.1.0

LuCI 菜单：状态 → 断网诊断。提供接口与路由证据、DNS、ICMP、HTTPS 检测，结果分为通过、需检查和信息。

## 构建

将本目录放入 OpenWrt 源码的 package/luci-app-net-doctor，启用 CONFIG_PACKAGE_luci-app-net-doctor，然后在源码根目录运行：

```sh
make package/luci-app-net-doctor/compile V=s
```

安装同一固件构建环境生成的包及依赖后，重启 rpcd，重新登录 LuCI。根据固件包管理器使用 apk 或 opkg 安装。不要把源码压缩包当作安装包。

## 范围

- 只读诊断，不写 UCI、不重启接口、不修改 DNS、防火墙或 OpenClash。
- 每项单独调用 RPC，网络探测限时 2–3 秒，避免长请求触发 rpcd 默认超时。
- 当前仅诊断路由器默认 IPv4 出口。未实现指定 WAN/USB 出口、IPv6、客户端路径、自动修复。
- 不使用 curl -k；证书错误单独报告。禁止环境 HTTP 代理，但透明代理仍可能介入。
- ICMP 失败不是断网结论；单站点成功不代表整个互联网正常。
- OpenClash 仅检查启用配置，不判断进程状态或规则正确性。
- 证据含本地 IP 等信息，对外分享前应脱敏。

## 验证状态

已执行源码语法、JSON/ACL 一致性及模拟诊断测试。尚未在 OpenWrt SDK 编译、真实路由器安装或浏览器验收。

协议参考：https://openwrt.org/docs/techref/rpcd

## 开发检查

需要 Node.js 22 和 Python 3。在本目录运行：

```sh
sh -n root/usr/libexec/rpcd/net.doctor
node --check htdocs/luci-static/resources/view/net-doctor/main.js
python3 tests/verify.py
node tests/conclusions.cjs
```

上述检查不替代 SDK 编译与真实设备验收。当前 GitHub 凭证缺少 workflow 权限，仓库暂未启用 Actions 自动检查。
