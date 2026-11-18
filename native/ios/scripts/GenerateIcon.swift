import AppKit
let size = NSSize(width: 1024, height: 1024)
// AppKit cannot create a drawing context for a 24-bit RGB bitmap. Use a
// supported 32-bit RGB layout with an unused byte, so the icon stays opaque.
guard let context = CGContext(data: nil, width: 1024, height: 1024,
                              bitsPerComponent: 8, bytesPerRow: 4096,
                              space: CGColorSpaceCreateDeviceRGB(),
                              bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else {
    fatalError("Cannot create the app icon bitmap")
}
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(cgContext: context, flipped: false)
NSColor(calibratedRed: 0.84, green: 0.94, blue: 0.84, alpha: 1).setFill()
NSBezierPath(rect: NSRect(origin: .zero, size: size)).fill()
NSColor(calibratedRed: 1, green: 0.86, blue: 0.46, alpha: 1).setFill()
NSBezierPath(ovalIn: NSRect(x: 172, y: 160, width: 680, height: 680)).fill()
NSColor(calibratedRed: 0.16, green: 0.48, blue: 0.36, alpha: 1).setFill()
let left = NSBezierPath()
left.move(to: NSPoint(x: 519, y: 427)); left.curve(to: NSPoint(x: 258, y: 727), controlPoint1: NSPoint(x: 245, y: 387), controlPoint2: NSPoint(x: 222, y: 666));left.curve(to: NSPoint(x: 519, y: 427),controlPoint1: NSPoint(x: 473, y: 794),controlPoint2: NSPoint(x: 575, y: 613));left.fill()
NSColor(calibratedRed: 0.32, green: 0.65, blue: 0.4, alpha: 1).setFill()
let right=NSBezierPath();right.move(to: NSPoint(x: 500,y: 485));right.curve(to:NSPoint(x:765,y:754),controlPoint1:NSPoint(x:453,y:695),controlPoint2:NSPoint(x:622,y:810));right.curve(to:NSPoint(x:500,y:485),controlPoint1:NSPoint(x:820,y:568),controlPoint2:NSPoint(x:665,y:458));right.fill()
NSColor(calibratedRed:0.16,green:0.24,blue:0.21,alpha:1).setStroke()
let smile=NSBezierPath();smile.lineWidth=20;smile.lineCapStyle = .round;smile.move(to:NSPoint(x:416,y:327));smile.curve(to:NSPoint(x:608,y:327),controlPoint1:NSPoint(x:463,y:254),controlPoint2:NSPoint(x:561,y:254));smile.stroke()
NSGraphicsContext.restoreGraphicsState()
guard let image = context.makeImage(),
      let png = NSBitmapImageRep(cgImage: image).representation(using: .png, properties: [:]) else {
    fatalError("Cannot encode the app icon PNG")
}
try png.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
