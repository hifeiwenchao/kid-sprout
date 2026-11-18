/** Verify usable paper in wide and narrow compact windows; leaves app data intact. */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const sdk=process.env.ANDROID_SDK_ROOT;
const adb=sdk?path.join(sdk,'platform-tools/adb'):'adb';
const app='com.feiwenchao.kidsprout';
const run=(...a)=>execFileSync(adb,a,{encoding:'utf8'}).trim();
const shell=(...a)=>run('shell',...a);
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function dump(){
  let ready=false;
  for(let attempt=0;attempt<4;attempt++){
    await delay(300);
    if(shell('uiautomator','dump','/sdcard/compact.xml').includes('dumped to:')){ready=true;break;}
  }
  assert(ready,'uiautomator did not produce a fresh accessibility tree');
  const xml=run('exec-out','cat','/sdcard/compact.xml');
  return [...xml.matchAll(/<node\s+([^>]+)>/g)].map(m=>Object.fromEntries([...m[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]])));
}
const bounds=n=>[...n.bounds.matchAll(/\d+/g)].map(m=>Number(m[0]));
try{
  for(const [dimensions,label] of [['2100x945','800x360'],['945x945','360x360'],['840x1260','320x480']]){
  shell('wm','size',dimensions);shell('wm','density','420');
  shell('am','start','-n',app+'/.MainActivity');await delay(500);
  const nodes=await dump();const nav=nodes.find(n=>n.text==='画板');assert(nav);
  const b=bounds(nav);shell('input','tap',String((b[0]+b[2])/2),String((b[1]+b[3])/2));
  const drawing=await dump();const paper=drawing.find(n=>n['content-desc']?.includes('白色画纸'));assert(paper);
  const p=bounds(paper);const side=Math.min(p[2]-p[0],p[3]-p[1]);
  fs.mkdirSync('build/reports/qa',{recursive:true});fs.writeFileSync(`build/reports/qa/compact-drawing-${label}.png`,execFileSync(adb,['exec-out','screencap','-p']));
  assert(side>=315,`Drawing paper must be at least 120dp square; actual ${side/2.625}dp`);
  const read=()=>JSON.parse(run('exec-out','run-as',app,'cat','files/drawing-v1.json')).strokes.length;
  const before=read();
  shell('input','swipe',String(p[0]+40),String(p[1]+40),String(p[2]-40),String(p[3]-40),'350');await delay(600);
  assert.equal(read(),before+1);console.log(`PASS: ${label} compact drawing paper ${side/2.625}dp square, new stroke persisted.`);
  }
} finally {shell('wm','size','reset');shell('wm','density','reset');}
