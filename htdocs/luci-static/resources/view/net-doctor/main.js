 'use strict';
'require view';
'require rpc';
var methods = ['snapshot', 'dns', 'ping', 'https'];
var calls = methods.map(function(method) {
 return rpc.declare({ object: 'net.doctor', method: method, params: [], expect: {} });
});
function verdict(results) {
 var https = results[3];
 if (!https || https.error) return '检测未完成，请查看失败项目。';
 if (https.status === 'pass') return '当前路由器可访问测试网站。客户端连接和其他网站仍需分别验证。';
 if (https.code === 60) return 'HTTPS 证书校验失败，优先检查路由器时间和 CA 证书。';
 if (https.code === 6) return 'HTTPS 测试域名解析失败，优先检查 DNS 与出口连通性。';
 return '当前 HTTPS 检测未通过。请结合路由、DNS 和错误证据定位；暂不能确定唯一原因。';
}
return view.extend({
 render: function() {
  var output = E('div');
  var button = E('button', { 'class': 'cbi-button cbi-button-action', 'click': async function() {
   button.disabled = true;
   output.replaceChildren();
   var results = [];
   try {
    for (var i = 0; i < calls.length; i++) {
     button.textContent = '正在检测（' + (i + 1) + '/4）…';
     var result;
     try { result = await calls[i](); }
     catch (err) { result = { title: ['接口与路由','DNS 解析','IPv4 连通性','HTTPS 访问'][i], error: String(err) }; }
     results.push(result);
     var label = result.error ? '未完成' : ({pass: '通过', warn: '需检查', info: '信息'}[result.status] || '未知');
     var evidence = result.evidence || (result.routes || '') + '\n目标路由：\n' + (result.target || '') + '\n策略路由：\n' + (result.policy || '') + '\n接口：\n' + (result.interfaces || '');
     output.appendChild(E('div', { 'class': 'cbi-section' }, [
      E('h3', {}, result.title + ' · ' + label),
      E('p', {}, result.error || result.detail || ''),
      E('details', {}, [E('summary', {}, '查看检测证据'), E('pre', {'style':'white-space:pre-wrap;overflow-wrap:anywhere'}, evidence)])
     ]));
    }
    output.prepend(E('div', { 'class': 'alert-message' }, verdict(results)));
    if (results[0] && results[0].proxy_enabled === '1')
     output.appendChild(E('p', {}, '检测到 OpenClash 启用配置。透明代理可能影响测试流量，不能据此认定代理是故障原因。'));
   } finally { button.disabled = false; button.textContent = '开始检测'; }
  } }, '开始检测');
  return E('div', {}, [E('h2', {}, '断网诊断助手'),
   E('p', {}, '检查路由器当前 IPv4 出口，约需 10 秒。检测会向 openwrt.org 和 1.1.1.1 发送少量请求。'),
   button, output]);
 },
 handleSave: null, handleSaveApply: null, handleReset: null
});
