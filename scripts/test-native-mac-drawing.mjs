import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

if (process.platform !== 'darwin') {
  console.error('Mac 画板模型测试需要 macOS 和 Xcode 命令行工具。');
  process.exit(1);
}

// Build the real model and its tests without the executable App target.
// SwiftPM runs XCTest directly; no window, simulator or UI automation starts.
const root = fileURLToPath(new URL('..', import.meta.url));
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'kid-sprout-mac-model-'));
try {
  const sources = path.join(temporary, 'Sources/MacDrawing');
  const tests = path.join(temporary, 'Tests/MacDrawingTests');
  fs.mkdirSync(sources, { recursive: true });
  fs.mkdirSync(tests, { recursive: true });
  for (const source of [
    'App/Branding.swift',
    'App/DrawingWorkspace.swift',
    'MacApp/DrawingModel.swift',
    'Sources/KidSproutCore/CurriculumContent.swift',
  ]) {
    fs.copyFileSync(path.join(root, 'native/ios', source), path.join(sources, path.basename(source)));
  }
  const testSource = fs.readFileSync(path.join(root, 'native/ios/MacTests/MacDrawingTests.swift'), 'utf8');
  fs.writeFileSync(path.join(tests, 'MacDrawingTests.swift'), testSource.replace('@testable import KidSproutMac', '@testable import MacDrawing'));
  fs.writeFileSync(path.join(temporary, 'Package.swift'), `// swift-tools-version: 5.9
import PackageDescription
let package = Package(name: "MacDrawing", platforms: [.macOS(.v14)], targets: [
    .target(name: "MacDrawing"),
    .testTarget(name: "MacDrawingTests", dependencies: ["MacDrawing"])
])
`);
  const result = spawnSync('swift', ['test', '--package-path', temporary], { stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
