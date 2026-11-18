// Reuse the locally drawn brand icon; macOS requires its own asset sizes.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const folder = path.resolve(__dirname, '../App/Assets.xcassets/AppIcon.appiconset');
const images = [{ filename: 'icon.png', idiom: 'universal', platform: 'ios', size: '1024x1024' }];
for (const size of [16, 32, 128, 256, 512]) {
  for (const scale of [1, 2]) {
    const filename = `mac-${size}@${scale}x.png`;
    execFileSync('/usr/bin/sips', ['-z', String(size * scale), String(size * scale), path.join(folder, 'icon.png'), '--out', path.join(folder, filename)], { stdio: 'ignore' });
    images.push({ filename, idiom: 'mac', size: `${size}x${size}`, scale: `${scale}x` });
  }
}
fs.writeFileSync(path.join(folder, 'Contents.json'), `${JSON.stringify({ images, info: { author: 'xcode', version: 1 } }, null, 2)}\n`);
