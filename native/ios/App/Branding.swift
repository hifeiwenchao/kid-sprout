import SwiftUI
#if os(iOS)
import UIKit
import KidSproutCore
#else
import AppKit
#endif

enum Sprout {
    static func adaptive(_ light: UInt32, _ dark: UInt32) -> Color {
        #if os(iOS)
        return Color(uiColor: UIColor { $0.userInterfaceStyle == .dark ? ui(dark) : ui(light) })
        #else
        return Color(nsColor: NSColor(name: nil) { $0.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua ? ns(dark) : ns(light) })
        #endif
    }
    #if os(iOS)
    private static func ui(_ value: UInt32) -> UIColor { UIColor(red: CGFloat((value >> 16) & 255)/255, green: CGFloat((value >> 8) & 255)/255, blue: CGFloat(value & 255)/255, alpha: 1) }
    #else
    private static func ns(_ value: UInt32) -> NSColor { NSColor(red: CGFloat((value >> 16) & 255)/255, green: CGFloat((value >> 8) & 255)/255, blue: CGFloat(value & 255)/255, alpha: 1) }
    #endif
    static let background = adaptive(0xf8f8f2, 0x20261f)
    static let panel = adaptive(0xfffef9, 0x2a322a)
    static let ink = adaptive(0x344b40, 0xe7eddf)
    static let muted = adaptive(0x626f5c, 0xb2bea8)
    static let line = adaptive(0xe3e8d9, 0x46513e)
    static let green = adaptive(0x52775e, 0xa9c597)
    static let accent = green
    static let mint = adaptive(0xedf2e0, 0x34432f)
    static let yellow = adaptive(0xf6ebc9, 0x483f29)
    static let orange = adaptive(0x9b6441, 0xe5b68b)
    static let purple = adaptive(0x78608d, 0xc8aedc)
    static let purpleWash = adaptive(0xf0eaf5, 0x3a3144)
    static let gold = adaptive(0x84662a, 0xe4c87e)
    static let goldWash = adaptive(0xf8efd8, 0x443c2b)
    static let numberWashes = [0xf5e5dd,0xf8ebd0,0xf8e0e1,0xf5e3eb,0xf8efd1,0xf1dfe4,0xe6eddf,0xf5e7d6,0xeee5f4,0xe1e9f5].map { adaptive(UInt32($0), 0x354032) }
}

extension NativeSubject {
    var title: String { switch self { case .numbers: "数字乐园"; case .pinyin: "拼音天地"; case .alphabet: "字母森林" } }
    var accent: Color { switch self { case .numbers: Sprout.green; case .pinyin: Sprout.purple; case .alphabet: Sprout.gold } }
    var wash: Color { switch self { case .numbers: Sprout.mint; case .pinyin: Sprout.purpleWash; case .alphabet: Sprout.goldWash } }
    var monogram: String { switch self { case .numbers: "123"; case .pinyin: "ā"; case .alphabet: "Aa" } }
}

#if os(iOS)
typealias NativeBitmap = UIImage
#else
typealias NativeBitmap = NSImage
#endif
final class IllustrationCache {
    static let shared = IllustrationCache()
    private let images = NSCache<NSString, NativeBitmap>()
    func image(_ name: String) -> NativeBitmap? {
        if let found = images.object(forKey: name as NSString) { return found }
        guard let url = Bundle.main.url(forResource: name, withExtension: "png", subdirectory: "illustrations"), let bitmap = NativeBitmap(contentsOfFile: url.path) else { return nil }
        images.setObject(bitmap, forKey: name as NSString)
        return bitmap
    }
}
struct NativeIllustration: View {
    let name: String
    var body: some View {
        if let bitmap = IllustrationCache.shared.image(name) {
            #if os(iOS)
            Image(uiImage: bitmap).resizable().scaledToFit()
            #else
            Image(nsImage: bitmap).resizable().scaledToFit()
            #endif
        } else { Image(systemName: "leaf").resizable().scaledToFit().foregroundStyle(Sprout.muted) }
    }
}
struct Page<Content: View>: View {
    @Environment(\.dynamicTypeSize) private var typeSize
    let content: Content
    init(@ViewBuilder content: () -> Content) { self.content = content() }
    var body: some View {
        GeometryReader { geometry in
            ScrollView {
                VStack(alignment: .leading, spacing: 26) { content }
                    .padding(geometry.size.width < 500 || typeSize.isAccessibilitySize ? 18 : 28)
                    .frame(maxWidth: 1400).frame(maxWidth: .infinity)
            }.background(Sprout.background).foregroundStyle(Sprout.ink)
        }
    }
}
struct Panel<Content: View>: View {
    let content: Content
    init(@ViewBuilder content: () -> Content) { self.content = content() }
    var body: some View {
        VStack(alignment: .leading, spacing: 16) { content }.padding(22).frame(maxWidth: .infinity, alignment: .leading)
            .background(Sprout.panel, in: RoundedRectangle(cornerRadius: 22)).overlay(RoundedRectangle(cornerRadius: 22).stroke(Sprout.line))
    }
}
struct BigButton: ButtonStyle {
    var color = Sprout.green
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.font(.headline).padding(.horizontal, 19).padding(.vertical, 12).frame(minHeight: 48).frame(maxWidth: .infinity)
            .foregroundStyle(Sprout.background).background(color.opacity(configuration.isPressed ? 0.75 : 1), in: RoundedRectangle(cornerRadius: 13))
    }
}
struct SproutCardButton: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.opacity(configuration.isPressed ? 0.72 : 1).contentShape(Rectangle())
    }
}
struct SectionHeader: View {
    var eyebrow: String = ""
    let title: String
    var detail: String = ""
    var body: some View { VStack(alignment: .leading, spacing: 9) {
        if !eyebrow.isEmpty { Text(eyebrow).font(.caption2.weight(.medium)).tracking(1).foregroundStyle(Sprout.muted).accessibilityHidden(true) }
        Text(title).font(.system(.title2, design: .rounded, weight: .bold))
        if !detail.isEmpty { Text(detail).font(.subheadline).foregroundStyle(Sprout.muted).lineSpacing(5) }
    } }
}
struct SproutIllustration: View {
    var body: some View { NativeIllustration(name: "number_garden").accessibilityHidden(true) }
}
