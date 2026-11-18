/** Offline UI smoke test. Requires one booted emulator with the debug APK installed.
 * Run: ANDROID_SDK_ROOT=/path/to/sdk node scripts/emulator-smoke.mjs
 * This resets this debug app's data, never another app. */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const sdk=process.env.ANDROID_SDK_ROOT;
const adb=sdk?path.join(sdk,'platform-tools/adb'):'adb';
const app='com.feiwenchao.kidsprout';
const out=path.resolve('build/reports/qa');fs.mkdirSync(out,{recursive:true});
const run=(...args)=>execFileSync(adb,args,{encoding:'utf8'}).trim();
const shell=(...args)=>run('shell',...args);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let nodes=[];
const unescape=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#10;','\n');
async function dump(){
  let ready=false;
  for(let attempt=0;attempt<4;attempt++){
    await delay(250);
    const result=shell('uiautomator','dump','/sdcard/window.xml');
    if(result.includes('dumped to:')){ready=true;break;}
  }
  assert(ready,'uiautomator did not produce a fresh accessibility tree');
  const xml=run('exec-out','cat','/sdcard/window.xml');
  nodes=[...xml.matchAll(/<node\s+([^>]+)>/g)].map(match=>Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],unescape(m[2])])));
  return nodes;
}
function has(text){return nodes.some(n=>n.text?.includes(text)||n['content-desc']?.includes(text));}
function node(text){return nodes.findLast(n=>n.text===text)||nodes.find(n=>n['content-desc']?.includes(text));}
async function click(text){
  const n=node(text);assert(n,`Missing control: ${text}`);
  const b=[...n.bounds.matchAll(/\d+/g)].map(m=>Number(m[0]));
  shell('input','tap',String((b[0]+b[2])/2),String((b[1]+b[3])/2));await dump();
}
async function snap(name){fs.writeFileSync(path.join(out,name+'.png'),execFileSync(adb,['exec-out','screencap','-p']));}
function draft(){return JSON.parse(run('exec-out','run-as',app,'cat','files/drawing-v1.json'));}
function progress(){const xml=run('exec-out','run-as',app,'cat','shared_prefs/sprout-native-v1.xml');return JSON.parse(unescape(xml.match(/<string name="progress">([^<]*)<\/string>/)[1]));}
async function relaunch(){shell('am','force-stop',app);shell('am','start','-n',app+'/.MainActivity');await delay(600);await dump();}
async function solveGate(testWrongAnswer=false){
  await dump();assert(has('请家长来帮忙'));
  const prompt=nodes.find(n=>/\d+ \+ \d+ = \?/.test(n.text))?.text;
  const [a,b]=prompt.match(/\d+/g).map(Number);
  const field=nodes.find(n=>n.class==='android.widget.EditText');assert(field);
  const bounds=[...field.bounds.matchAll(/\d+/g)].map(m=>Number(m[0]));
  shell('input','tap',String((bounds[0]+bounds[2])/2),String((bounds[1]+bounds[3])/2));
  if(testWrongAnswer){
    shell('input','text','0');await dump();await click('验证并继续');
    assert(has('答案还不对，请家长再算一算。'));
    shell('input','keyevent','67');
  }
  shell('input','text',String(a+b));await dump();await click('验证并继续');
}
shell('wm','size','reset');shell('wm','density','reset');shell('cmd','uimode','night','no');
shell('pm','clear',app);await relaunch();assert(has('一起发现，小小世界'));await snap('phone-home');
await click('数字');await click('数字4，');
await click('第4个苹果');await click('第1个苹果');await click('第4个苹果');
assert(has('已经数到 2 / 4'));await snap('phone-number');
await click('我认识这个数字啦');assert.deepEqual(progress().learned,[4]);
await click('数字0，');await click('放进 1 个苹果');assert(has('现在篮子里有 1 个'));
await click('拿走苹果，变成 0');assert(has('一个苹果也没有'));
await relaunch();assert(has('1 / 11'));await click('游戏');
console.log('PASS: distinct fruit, zero basket, lesson progress relaunch');
for(const kind of ['数一数水果','寻找数字','比比多少']){
  await click('0'+(['数一数水果','寻找数字','比比多少'].indexOf(kind)+1)+'  '+kind);
  for(let round=0;round<5;round++){
    await dump();assert(has(`第 ${round+1} / 5 关`));
    let answer;
    if(kind==='寻找数字')answer=nodes.find(n=>/^\d+$/.test(n.text))?.text;
    else {
      const baskets=nodes.filter(n=>/装有\d+个苹果的篮子|空篮子，一个苹果也没有/.test(n['content-desc']));
      const counts=baskets.map(n=>Number(n['content-desc'].match(/装有(\d+)/)?.[1]||0));
      assert.equal(counts.length,kind==='比比多少'?2:1);
      answer=kind==='比比多少'?(counts[0]>counts[1]?'左边更多':'右边更多'):String(counts[0]);
    }
    if(round===0){
      const wrong=kind==='比比多少'?(answer==='左边更多'?'右边更多':'左边更多'):
        nodes.find(n=>/^\d+$/.test(n.text)&&n.text!==answer)?.text;
      await click(wrong);assert(has('再试一次，慢慢看看。'));
    }
    await click(answer);assert(has('答对啦！你观察得很仔细。'));
    if(round===0)await snap('phone-game-'+(['数一数水果','寻找数字','比比多少'].indexOf(kind)+1));
    await click(round===4?'完成挑战，收获星星':'下一关');
  }
  assert(has('五关完成，真棒！'));
  assert.equal(progress().stars,['数一数水果','寻找数字','比比多少'].indexOf(kind)+1);
  console.log('PASS: five rounds with retry and one award — '+kind);
  await click('选择其他游戏');
}
await click('画板');
await dump();const paper=node('白色画纸');assert(paper);const b=[...paper.bounds.matchAll(/\d+/g)].map(m=>Number(m[0]));
const draw=()=>shell('input','swipe',String(b[0]+120),String(b[1]+120),String(b[2]-120),String(b[3]-120),'400');
draw();await dump();assert.equal(draft().strokes.length,1);
await click('橡皮擦');
shell('input','swipe',String(b[0]+120),String((b[1]+b[3])/2),String(b[2]-120),String((b[1]+b[3])/2),'400');
await dump();assert.equal(draft().strokes.length,2);assert.equal(draft().strokes[1].eraser,true);
await click('撤销');assert.equal(draft().strokes.length,1);
await click('重做');assert.equal(draft().strokes.length,2);
await click('清空画布');await click('清空');assert.equal(draft().strokes.length,0);
await click('撤销');assert.equal(draft().strokes.length,2);await snap('phone-drawing');
await relaunch();await click('画板');assert.equal(draft().strokes.length,2);
await click('分享画作');assert(has('请家长来帮忙'));await snap('phone-parent-gate');await solveGate(true);
await delay(800);const png=execFileSync(adb,['exec-out','run-as',app,'cat','cache/artwork/萌芽小画家.png']);
assert.equal(png.subarray(1,4).toString(),'PNG');fs.writeFileSync(path.join(out,'shared-artwork.png'),png);
await dump();assert(nodes.some(n=>n.package==='com.android.intentresolver'||n.text==='分享萌芽画作'));await snap('phone-share-sheet');
shell('input','keyevent','4');await dump();
await click('家长');await click('家长验证 · 了解作者');await solveGate();assert(has('关于作者'));await snap('phone-parents');
// Tablet dimensions trigger the adaptive navigation rail while preserving this same drawing.
shell('wm','size','1600x2560');shell('wm','density','240');await delay(500);await dump();
await click('探索');await snap('tablet-home');
await click('数字');await click('数字10，');await snap('tablet-number');
await click('画板');await snap('tablet-drawing');assert.equal(draft().strokes.length,2);
shell('cmd','uimode','night','yes');await delay(500);await dump();await click('探索');await snap('tablet-dark');
shell('cmd','uimode','night','no');
shell('wm','size','2100x945');shell('wm','density','420');await delay(500);await dump();
// 800×360dp is wide but short: all five destinations must stay in the bottom bar.
const nav=['探索','数字','游戏','画板','家长'].map(label=>node(label));
assert(nav.every(Boolean));
const navTop=nav.map(n=>Number(n.bounds.match(/\[\d+,(\d+)\]/)[1]));
assert(Math.max(...navTop)-Math.min(...navTop)<10);
await click('家长');await snap('short-landscape-parents');
shell('wm','size','reset');shell('wm','density','reset');
await relaunch();assert.equal(progress().stars,3);assert.deepEqual(progress().learned,[4]);
execFileSync(process.execPath,['scripts/compact-drawing-smoke.mjs'],{stdio:'inherit'});
console.log('PASS: phone + tablet + short landscape; distinct fruit, zero basket, three 5-round games/retry, progress relaunch, drawing history/eraser/relaunch, gated PNG share/author, dark theme.');
