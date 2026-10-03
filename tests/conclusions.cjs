const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../htdocs/luci-static/resources/view/net-doctor/main.js'), 'utf8');
const verdict = new Function(source.slice(source.indexOf('function verdict'), source.indexOf('return view.extend')) + ';return verdict')();
for (const [result, expected] of [
  [{status: 'pass'}, '可访问'],
  [{code: 60}, '证书'],
  [{code: 6}, '解析'],
  [{code: 28}, '未通过'],
  [{error: 'timeout'}, '未完成']
]) assert.ok(verdict([{}, {}, {}, result]).includes(expected));
console.log('PASS: 5 frontend conclusion scenarios');
