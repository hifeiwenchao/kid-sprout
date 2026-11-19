// Rebuild the dependency-free Xcode project with `node generate-project.cjs`.
const fs = require('fs');
const path = require('path');
process.chdir(__dirname);
let serial = 1;
const objects = {};
const add = (isa, fields) => { const id = (serial++).toString(16).toUpperCase().padStart(24,'0'); objects[id] = { isa, ...fields }; return id; };
const raw = v => ({ raw: v });
const str = value => value?.raw !== undefined ? value.raw : Array.isArray(value) ? `(\n${value.map(v => `\t\t\t${str(v)},`).join('\n')}\n\t\t)` : typeof value === 'object' ? `{ ${Object.entries(value).map(([k,v])=>`${k} = ${str(v)};`).join(' ')} }` : JSON.stringify(String(value));
const ref = id => raw(id);
const file = (name, type, sourceTree='SOURCE_ROOT') => add('PBXFileReference',{lastKnownFileType:type,path:name,sourceTree});
const sourcePhase = files => add('PBXSourcesBuildPhase',{buildActionMask:2147483647,files:files.map(f=>ref(add('PBXBuildFile',{fileRef:ref(f)}))),runOnlyForDeploymentPostprocessing:0});
const phase = (isa,files=[]) => add(isa,{buildActionMask:2147483647,files,runOnlyForDeploymentPostprocessing:0});
const products=[]; const targets=[];
const mainGroup=add('PBXGroup',{children:[],sourceTree:'<group>'});
const productGroup=add('PBXGroup',{name:'Products',children:products,sourceTree:'<group>'});
const coreFiles=fs.readdirSync('Sources/KidSproutCore').filter(n=>n.endsWith('.swift')).map(p=>file('Sources/KidSproutCore/'+p,'sourcecode.swift'));
const appFiles=fs.readdirSync('App').filter(n=>n.endsWith('.swift')).map(p=>file('App/'+p,'sourcecode.swift'));
const unitFiles=[...fs.readdirSync('Tests/KidSproutCoreTests').filter(n=>n.endsWith('.swift')).map(p=>file('Tests/KidSproutCoreTests/'+p,'sourcecode.swift')),file('KidSproutTests/DrawingTests.swift','sourcecode.swift')];
const uiFiles=[file('KidSproutUITests/AppUITests.swift','sourcecode.swift')];
const curriculum=file('../shared/curriculum.json','text.json');
const activities=file('../shared/activities.json','text.json');
const illustrations=file('../shared/illustrations','folder');
const assets=file('App/Assets.xcassets','folder.assetcatalog');
objects[mainGroup].children=[...coreFiles,...appFiles,...unitFiles,...uiFiles,curriculum,activities,illustrations,assets,productGroup].map(ref);
function configList(settings) {
  return ref(add('XCConfigurationList',{buildConfigurations:['Debug','Release'].map(name=>ref(add('XCBuildConfiguration',{name,buildSettings:{...settings,...(settings.SDKROOT==='macosx'?{ENABLE_TESTABILITY:name==='Debug'?'YES':'NO',CODE_SIGN_INJECT_BASE_ENTITLEMENTS:name==='Debug'?'YES':'NO',...(name==='Debug'?{SWIFT_ACTIVE_COMPILATION_CONDITIONS:'$(inherited) DEBUG'}:{})}:{}),SWIFT_OPTIMIZATION_LEVEL:name==='Debug'?'-Onone':'-O'}}))),defaultConfigurationIsVisible:0,defaultConfigurationName:'Release'}));
}
const common={DEVELOPMENT_TEAM:'5A9Z4D7HV3',SWIFT_VERSION:'5.0',IPHONEOS_DEPLOYMENT_TARGET:'17.0',TARGETED_DEVICE_FAMILY:'1,2',SDKROOT:'iphoneos',CLANG_ENABLE_MODULES:'YES',CODE_SIGN_STYLE:'Automatic',GENERATE_INFOPLIST_FILE:'YES',CURRENT_PROJECT_VERSION:1,MARKETING_VERSION:'0.1.0'};
function target(name,type,files,settings,extraPhases=[],base=common) {
 const ext=type==='framework'?'framework':type==='application'?'app':'xctest';
 const product=add('PBXFileReference',{explicitFileType:type==='framework'?'wrapper.framework':type==='application'?'wrapper.application':'wrapper.cfbundle',path:`${name}.${ext}`,sourceTree:'BUILT_PRODUCTS_DIR'});
 products.push(ref(product));
 const id=add('PBXNativeTarget',{name,productName:name,productReference:ref(product),productType:`com.apple.product-type.${type}`,buildConfigurationList:configList({...base,PRODUCT_NAME:name,...settings}),buildPhases:[ref(sourcePhase(files)),...extraPhases],buildRules:[],dependencies:[]});
 targets.push(ref(id)); return {id,product};
}
const core=target('KidSproutCore','framework',coreFiles,{PRODUCT_BUNDLE_IDENTIFIER:'com.feiwenchao.kidsprout.core',DEFINES_MODULE:'YES',DYLIB_INSTALL_NAME_BASE:'@rpath',SKIP_INSTALL:'YES',ENABLE_TESTABILITY:'YES'},[ref(phase('PBXFrameworksBuildPhase'))]);
const linkCore=()=>ref(phase('PBXFrameworksBuildPhase',[ref(add('PBXBuildFile',{fileRef:ref(core.product)}))]));
const resource=phase('PBXResourcesBuildPhase',[curriculum,activities,illustrations,assets].map(asset=>ref(add('PBXBuildFile',{fileRef:ref(asset)}))));
const embed=add('PBXCopyFilesBuildPhase',{buildActionMask:2147483647,dstPath:'',dstSubfolderSpec:10,name:'Embed Frameworks',files:[ref(add('PBXBuildFile',{fileRef:ref(core.product),settings:{ATTRIBUTES:['CodeSignOnCopy','RemoveHeadersOnCopy']}}))],runOnlyForDeploymentPostprocessing:0});
const app=target('KidSprout','application',appFiles,{PRODUCT_BUNDLE_IDENTIFIER:'com.feiwenchao.kidsprout',ASSETCATALOG_COMPILER_APPICON_NAME:'AppIcon',ENABLE_TESTABILITY:'YES',INFOPLIST_KEY_CFBundleDisplayName:'萌呀启蒙',INFOPLIST_KEY_LSApplicationCategoryType:'public.app-category.education',INFOPLIST_KEY_UILaunchScreen_Generation:'YES',INFOPLIST_FILE:'App/Info.plist',INFOPLIST_KEY_UISupportedInterfaceOrientations:'UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight',INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad:'UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight',LD_RUNPATH_SEARCH_PATHS:'$(inherited) @executable_path/Frameworks'},[linkCore(),ref(resource),ref(embed)]);
const tests=target('KidSproutTests','bundle.unit-test',unitFiles,{PRODUCT_BUNDLE_IDENTIFIER:'com.feiwenchao.kidsprout.tests',TEST_HOST:'$(BUILT_PRODUCTS_DIR)/KidSprout.app/KidSprout',BUNDLE_LOADER:'$(TEST_HOST)',LD_RUNPATH_SEARCH_PATHS:'$(inherited) @executable_path/Frameworks @loader_path/Frameworks'},[linkCore()]);
const ui=target('KidSproutUITests','bundle.ui-testing',uiFiles,{PRODUCT_BUNDLE_IDENTIFIER:'com.feiwenchao.kidsprout.uitests',TEST_TARGET_NAME:'KidSprout'},[ref(phase('PBXFrameworksBuildPhase'))]);
const macCommon={DEVELOPMENT_TEAM:'5A9Z4D7HV3',SWIFT_VERSION:'5.0',MACOSX_DEPLOYMENT_TARGET:'14.0',SDKROOT:'macosx',SUPPORTED_PLATFORMS:'macosx',CLANG_ENABLE_MODULES:'YES',CODE_SIGN_STYLE:'Manual',CODE_SIGN_IDENTITY:'-',GENERATE_INFOPLIST_FILE:'YES',CURRENT_PROJECT_VERSION:1,MARKETING_VERSION:'0.1.0'};
const macFiles=fs.readdirSync('MacApp').filter(n=>n.endsWith('.swift')).map(p=>file('MacApp/'+p,'sourcecode.swift'));
const macUnitFiles=fs.readdirSync('MacTests').filter(n=>n.endsWith('.swift')).map(p=>file('MacTests/'+p,'sourcecode.swift'));
const macUIFiles=fs.readdirSync('MacUITests').filter(n=>n.endsWith('.swift')).map(p=>file('MacUITests/'+p,'sourcecode.swift'));
objects[mainGroup].children.push(...[...macFiles,...macUnitFiles,...macUIFiles].map(ref));
const macResource=phase('PBXResourcesBuildPhase',[curriculum,activities,illustrations,assets].map(asset=>ref(add('PBXBuildFile',{fileRef:ref(asset)}))));
const macSharedFiles=appFiles.filter(f=>objects[f].path!=='App/DrawingView.swift');
const macApp=target('KidSproutMac','application',[...macSharedFiles,...macFiles,...coreFiles],{PRODUCT_BUNDLE_IDENTIFIER:'com.feiwenchao.kidsprout.mac',INFOPLIST_KEY_CFBundleName:'萌呀启蒙',INFOPLIST_FILE:'MacApp/Info.plist',GENERATE_INFOPLIST_FILE:'NO',ASSETCATALOG_COMPILER_APPICON_NAME:'AppIcon',ENABLE_TESTABILITY:'YES',INFOPLIST_KEY_CFBundleDisplayName:'萌呀启蒙',INFOPLIST_KEY_LSApplicationCategoryType:'public.app-category.education',ENABLE_APP_SANDBOX:'YES',CODE_SIGN_ENTITLEMENTS:'Mac.entitlements',LD_RUNPATH_SEARCH_PATHS:'$(inherited) @executable_path/../Frameworks'},[ref(phase('PBXFrameworksBuildPhase')),ref(macResource)],macCommon);
const macTests=target('KidSproutMacTests','bundle.unit-test',macUnitFiles,{PRODUCT_BUNDLE_IDENTIFIER:'com.feiwenchao.kidsprout.mac.tests',TEST_HOST:'$(BUILT_PRODUCTS_DIR)/KidSproutMac.app/Contents/MacOS/KidSproutMac',BUNDLE_LOADER:'$(TEST_HOST)',LD_RUNPATH_SEARCH_PATHS:'$(inherited) @executable_path/../Frameworks @loader_path/../Frameworks'},[ref(phase('PBXFrameworksBuildPhase'))],macCommon);
const macUI=target('KidSproutMacUITests','bundle.ui-testing',macUIFiles,{PRODUCT_BUNDLE_IDENTIFIER:'com.feiwenchao.kidsprout.mac.uitests',TEST_TARGET_NAME:'KidSproutMac'},[ref(phase('PBXFrameworksBuildPhase'))],macCommon);
const project=add('PBXProject',{attributes:{LastUpgradeCheck:'2660',BuildIndependentTargetsInParallel:'YES'},buildConfigurationList:configList({CLANG_ENABLE_MODULES:'YES',ENABLE_USER_SCRIPT_SANDBOXING:'YES',GCC_C_LANGUAGE_STANDARD:'gnu17',SWIFT_VERSION:'5.0'}),compatibilityVersion:'Xcode 14.0',developmentRegion:'zh-Hans',knownRegions:['zh-Hans','en','Base'],mainGroup:ref(mainGroup),productRefGroup:ref(productGroup),projectDirPath:'',projectRoot:'',targets});
function dependency(from,to){const proxy=add('PBXContainerItemProxy',{containerPortal:ref(project),proxyType:1,remoteGlobalIDString:ref(to.id),remoteInfo:objects[to.id].name});objects[from.id].dependencies.push(ref(add('PBXTargetDependency',{target:ref(to.id),targetProxy:ref(proxy)})));}
dependency(app,core);dependency(tests,core);dependency(tests,app);dependency(ui,app);
dependency(macTests,macApp);dependency(macUI,macApp);
fs.mkdirSync('KidSprout.xcodeproj/xcshareddata/xcschemes',{recursive:true});
fs.writeFileSync('KidSprout.xcodeproj/project.pbxproj',`// !$*UTF8*$!\n{\n archiveVersion = 1; classes = {}; objectVersion = 56; objects = {\n${Object.entries(objects).map(([id,ob])=>`${id} = ${str(ob)};`).join('\n')}\n}; rootObject = ${project};\n}\n`);
const entry=(t,attributes='')=>`<BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES" ${attributes}><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${t.id}" BuildableName="${objects[t.id].name}.app" BlueprintName="${objects[t.id].name}" ReferencedContainer="container:KidSprout.xcodeproj"/></BuildActionEntry>`;
const testable=t=>`<TestableReference skipped="NO"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${t.id}" BuildableName="${objects[t.id].name}.xctest" BlueprintName="${objects[t.id].name}" ReferencedContainer="container:KidSprout.xcodeproj"/></TestableReference>`;
fs.writeFileSync('KidSprout.xcodeproj/xcshareddata/xcschemes/KidSprout.xcscheme',`<?xml version="1.0" encoding="UTF-8"?><Scheme LastUpgradeVersion="2660" version="1.7"><BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries>${entry(app)}</BuildActionEntries></BuildAction><TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES"><Testables>${testable(tests)}${testable(ui)}</Testables></TestAction><LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" debugServiceExtension="internal" allowLocationSimulation="YES"><BuildableProductRunnable runnableDebuggingMode="0"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${app.id}" BuildableName="KidSprout.app" BlueprintName="KidSprout" ReferencedContainer="container:KidSprout.xcodeproj"/></BuildableProductRunnable></LaunchAction><ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES"/><AnalyzeAction buildConfiguration="Debug"/><ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/></Scheme>`);
const macScheme=fs.readFileSync('KidSprout.xcodeproj/xcshareddata/xcschemes/KidSprout.xcscheme','utf8')
 .replace(entry(app),entry(macApp))
 .replace(`${testable(tests)}${testable(ui)}`,`${testable(macTests)}${testable(macUI)}`)
 .replace(`BlueprintIdentifier="${app.id}" BuildableName="KidSprout.app" BlueprintName="KidSprout"`,`BlueprintIdentifier="${macApp.id}" BuildableName="KidSproutMac.app" BlueprintName="KidSproutMac"`);
fs.writeFileSync('KidSprout.xcodeproj/xcshareddata/xcschemes/KidSproutMac.xcscheme',macScheme);
