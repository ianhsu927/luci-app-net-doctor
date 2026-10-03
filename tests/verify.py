import json,subprocess,tempfile,os
from pathlib import Path
p=Path(__file__).resolve().parent.parent
acl=json.loads((p/'root/usr/share/rpcd/acl.d/luci-app-net-doctor.json').read_text())
backend=p/'root/usr/libexec/rpcd/net.doctor'
methods=json.loads(subprocess.check_output(['sh',str(backend),'list']))
assert set(methods)==set(acl['luci-app-net-doctor']['read']['ubus']['net.doctor'])
for f in p.rglob('*.json'): json.loads(f.read_text())
with tempfile.TemporaryDirectory() as tmp:
 t=Path(tmp)
 (t/'jshn.sh').write_text('''json_init() { RECORDS=''; }
json_add_string() { RECORDS="$RECORDS
$1=$2"; }
json_add_int() { json_add_string "$@"; }
json_dump() { printf '%s\\n' "$RECORDS"; }
''')
 for name,content in {
 'curl':'echo "HTTP 200"; exit "${CURL_RC:-0}"',
 'nslookup':'echo "Name: openwrt.org"; exit "${DNS_RC:-0}"',
 'ping':'echo "packet evidence"; exit "${PING_RC:-0}"',
 'timeout':'shift; exec "$@"',
 'ip':'echo "default via 192.0.2.1 dev eth0"',
 'ubus':'echo "{}"',
 'uci':'echo 1'}.items():
  f=t/name; f.write_text('#!/bin/sh\n'+content+'\n'); f.chmod(0o755)
 code=backend.read_text().replace('PATH=/usr/sbin:/usr/bin:/sbin:/bin',f'PATH={tmp}:/usr/bin:/bin').replace('/usr/share/libubox/jshn.sh',str(t/'jshn.sh'))
 test=t/'backend'; test.write_text(code)
 cases=[('snapshot',{},'status=info'),('dns',{},'status=pass'),('dns',{'DNS_RC':'1'},'status=warn'),('ping',{'PING_RC':'1'},'不能据此判定断网'),('https',{},'status=pass'),('https',{'CURL_RC':'6'},'解析失败'),('https',{'CURL_RC':'28'},'访问超时'),('https',{'CURL_RC':'60'},'证书验证失败'),('https',{'CURL_RC':'7'},'无法建立连接')]
 for method,env,want in cases:
  out=subprocess.check_output(['sh',str(test),'call',method],env={**os.environ,**env},text=True)
  assert want in out,(method,out)
 print(f'PASS: {len(cases)} simulated backend scenarios; JSON and ACL agreement')
