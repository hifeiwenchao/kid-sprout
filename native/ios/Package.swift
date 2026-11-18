// swift-tools-version: 5.9
import PackageDescription
let package = Package(name: "KidSproutCore", platforms: [.iOS(.v17), .macOS(.v13)], products: [.library(name: "KidSproutCore", targets: ["KidSproutCore"])], targets: [.target(name: "KidSproutCore"), .testTarget(name: "KidSproutCoreTests", dependencies: ["KidSproutCore"])])
