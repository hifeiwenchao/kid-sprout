import SwiftUI
#if os(iOS)
import UIKit
import KidSproutCore
#else
import AppKit
#endif

enum DrawingTool: String, Codable, CaseIterable, Identifiable {
    case pen, marker, eraser
    var id: String { rawValue }
    var title: String { switch self { case .pen: "画笔"; case .marker: "荧光笔"; case .eraser: "橡皮擦" } }
    var symbol: String { switch self { case .pen: "pencil.tip"; case .marker: "highlighter"; case .eraser: "eraser.fill" } }
}

enum DrawingPalette {
    static let hex = ["#52775E", "#91AD73", "#E2B755", "#E99958", "#DC7C79", "#E3A0B2", "#AD90C5", "#7F95C8", "#74A9BF", "#8BC5BC", "#A78265", "#414C48"]
    static let names = ["森林绿", "嫩芽绿", "阳光黄", "橘子橙", "珊瑚红", "花瓣粉", "葡萄紫", "蓝莓蓝", "天空蓝", "薄荷青", "小熊棕", "石墨黑"]
    static func color(_ hex: String) -> Color {
        let value = UInt32(hex.dropFirst(), radix: 16) ?? 0x52775E
        return Color(red: Double((value >> 16) & 255)/255, green: Double((value >> 8) & 255)/255, blue: Double(value & 255)/255)
    }
    static func hex(_ color: Color) -> String {
        #if os(iOS)
        let native = UIColor(color)
        var red: CGFloat = 0, green: CGFloat = 0, blue: CGFloat = 0, alpha: CGFloat = 0
        native.getRed(&red, green: &green, blue: &blue, alpha: &alpha)
        #else
        let native = NSColor(color).usingColorSpace(.deviceRGB) ?? .black
        let red = native.redComponent, green = native.greenComponent, blue = native.blueComponent
        #endif
        return String(format: "#%02X%02X%02X", Int((red * 255).rounded()), Int((green * 255).rounded()), Int((blue * 255).rounded()))
    }
    static func isValid(_ hex: String) -> Bool { hex.count == 7 && hex.first == "#" && UInt32(hex.dropFirst(), radix: 16) != nil }
}

enum DrawingTemplateAsset {
    static let ids = (0...10).map { "numbers:\($0)" } + (65...90).compactMap { UnicodeScalar($0).map { "alphabet:\($0)\(String($0).lowercased())" } }
    static func name(_ id: String?) -> String? {
        guard let id, ids.contains(id) else { return nil }
        let pieces = id.split(separator: ":")
        return "guide_\(pieces[0])_" + pieces[1].unicodeScalars.map { String($0.value, radix: 16) }.joined(separator: "_")
    }
}

struct DrawingToolbox: View {
    @Binding var selectedTool: DrawingTool
    @Binding var colorIndex: Int
    @Binding var customColor: Color
    @Binding var width: Double
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            HStack { Image(systemName: "paintpalette"); Text("我的小工具箱").font(.headline); Spacer(); Text("✦").foregroundStyle(Sprout.gold) }.foregroundStyle(Sprout.green)
            VStack(alignment: .leading, spacing: 10) {
                Text("选一支画笔").font(.caption.weight(.semibold)).foregroundStyle(Sprout.muted)
                HStack(spacing: 5) {
                    ForEach(DrawingTool.allCases) { tool in
                        Button { selectedTool = tool } label: {
                            VStack(spacing: 7) { Image(systemName: tool.symbol).font(.title3); Text(tool.title).font(.caption) }
                                .frame(maxWidth: .infinity, minHeight: 62).foregroundStyle(selectedTool == tool ? Sprout.green : Sprout.muted)
                                .background(selectedTool == tool ? Sprout.mint : .clear, in: RoundedRectangle(cornerRadius: 12))
                        }.buttonStyle(.plain).accessibilityIdentifier(tool == .eraser ? "eraser" : "drawingTool\(tool.rawValue)").accessibilityAddTraits(selectedTool == tool ? .isSelected : [])
                    }
                }
            }
            Divider().overlay(Sprout.line)
            VStack(alignment: .leading, spacing: 10) {
                Text("给想象一点颜色").font(.caption.weight(.semibold)).foregroundStyle(Sprout.muted)
                Text(colorIndex >= 0 && colorIndex < 12 ? DrawingPalette.names[colorIndex] : "我的专属颜色").font(.caption2).foregroundStyle(Sprout.orange)
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 7), count: 6), spacing: 9) {
                    ForEach(DrawingPalette.hex.indices, id: \.self) { index in
                        Button {
                            colorIndex = index
                            if selectedTool == .eraser { selectedTool = .pen }
                        } label: {
                            Circle().fill(DrawingPalette.color(DrawingPalette.hex[index])).frame(width: 24, height: 24).padding(4)
                                .overlay(Circle().stroke(colorIndex == index ? Sprout.green : .clear, lineWidth: 2))
                        }.buttonStyle(.plain).accessibilityLabel("\(DrawingPalette.names[index])画笔").accessibilityIdentifier("color\(index)").accessibilityAddTraits(colorIndex == index ? .isSelected : [])
                    }
                }
                ColorPicker("调一个自己的颜色", selection: $customColor, supportsOpacity: false).font(.caption).accessibilityIdentifier("customDrawingColor")
                    .onChange(of: customColor) { _, _ in colorIndex = -1; if selectedTool == .eraser { selectedTool = .pen } }
                    .simultaneousGesture(TapGesture().onEnded { colorIndex = -1; if selectedTool == .eraser { selectedTool = .pen } })
            }
            Divider().overlay(Sprout.line)
            VStack(alignment: .leading, spacing: 12) {
                HStack { Text(selectedTool == .eraser ? "橡皮大小" : "画笔粗细"); Spacer(); Text("\(Int(width))").monospacedDigit().foregroundStyle(Sprout.orange) }.font(.caption)
                Slider(value: $width, in: 2...48, step: 1).accessibilityLabel("画笔粗细").accessibilityIdentifier("drawingWidth")
                HStack(spacing: 10) {
                    Circle().fill(selectedTool == .eraser ? Color.white : colorIndex < 0 ? customColor : DrawingPalette.color(DrawingPalette.hex[min(11, colorIndex)]))
                        .opacity(selectedTool == .marker ? 0.4 : 1).frame(width: max(4, width), height: max(4, width)).overlay(Circle().stroke(Sprout.line, lineWidth: 1))
                        .frame(width: 48, height: 48)
                    Text("试试大大小小的线条").font(.caption2).foregroundStyle(Sprout.muted)
                }
            }
            Text("♡ 每一笔，都是独一无二的你。").font(.caption2).foregroundStyle(Sprout.muted).lineSpacing(5)
        }.padding(18).background(Sprout.panel, in: RoundedRectangle(cornerRadius: 20)).overlay(RoundedRectangle(cornerRadius: 20).stroke(Sprout.line))
    }
}

struct DrawingTracingPicker: View {
    let templates: [TracingTemplate]
    let selectedID: String?
    let select: (String?) -> Void
    private var current: TracingTemplate? { templates.first { $0.id == selectedID } }
    private var group: String { current?.group ?? "free" }
    private var choices: [TracingTemplate] { templates.filter { $0.group == group } }
    private var index: Int { choices.firstIndex { $0.id == selectedID } ?? 0 }
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 6) {
                ForEach([("free", "自由画画"), ("numbers", "数字 0–10"), ("alphabet", "字母 Aa–Zz")], id: \.0) { item in
                    Button { select(item.0 == "free" ? nil : templates.first { $0.group == item.0 }?.id) } label: {
                        Text(item.1).font(.caption.weight(.semibold)).padding(.horizontal, 10).frame(minHeight: 38).frame(maxWidth: .infinity)
                            .foregroundStyle(group == item.0 ? Sprout.green : Sprout.muted).background(group == item.0 ? Sprout.mint : .clear, in: RoundedRectangle(cornerRadius: 10))
                    }.buttonStyle(.plain).accessibilityIdentifier("tracingGroup\(item.0)")
                }
            }
            if let current {
                HStack {
                    Button { select(choices[index - 1].id) } label: { Image(systemName: "chevron.left").frame(width: 38, height: 38) }.disabled(index == 0).accessibilityLabel("上一个临摹字符")
                    VStack(spacing: 2) { Text("正在临摹").font(.caption2).foregroundStyle(Sprout.muted); Text(current.label).font(.title3.bold()) }
                    Button { select(choices[index + 1].id) } label: { Image(systemName: "chevron.right").frame(width: 38, height: 38) }.disabled(index >= choices.count - 1).accessibilityLabel("下一个临摹字符")
                    Spacer(minLength: 0)
                    Menu("选择字符") { ForEach(choices) { template in Button(template.label) { select(template.id) } } }.font(.caption).accessibilityIdentifier("tracingCharacter")
                }
                Text("沿着虚线描一描；切换字符会自动清空笔迹，误切可以撤销。").font(.caption2).foregroundStyle(Sprout.muted).lineSpacing(4)
            }
        }.padding(13).background(Sprout.panel, in: RoundedRectangle(cornerRadius: 14)).overlay(RoundedRectangle(cornerRadius: 14).stroke(Sprout.line))
    }
}

struct DrawingPaperMat<Content: View>: View {
    let content: Content
    init(@ViewBuilder content: () -> Content) { self.content = content() }
    var body: some View {
        content.padding(18).background(Sprout.adaptive(0xefeee3, 0x3b4033), in: RoundedRectangle(cornerRadius: 18))
            .overlay(alignment: .topLeading) { tape.rotationEffect(.degrees(-9)).padding(.leading, 35) }
            .overlay(alignment: .topTrailing) { tape.rotationEffect(.degrees(8)).padding(.trailing, 35) }
    }
    private var tape: some View { Rectangle().fill(Color(red: 0.86, green: 0.82, blue: 0.67).opacity(0.6)).frame(width: 65, height: 20).padding(.top, 5).allowsHitTesting(false).accessibilityHidden(true) }
}

struct DrawingEmptyPrompt: View {
    var body: some View {
        VStack(spacing: 10) { Image(systemName: "pencil.and.scribble").font(.system(size: 44)).foregroundStyle(Sprout.gold.opacity(0.4)); Text("这里，装得下所有奇思妙想").font(.subheadline.weight(.medium)); Text("点一点，画一画，开始你的创作吧").font(.caption) }
            .foregroundStyle(Sprout.muted.opacity(0.65)).multilineTextAlignment(.center).padding().allowsHitTesting(false).accessibilityHidden(true)
    }
}

struct DrawingWorkspaceLayout<Tools: View, Paper: View>: View {
    let tools: Tools
    let paper: Paper
    @State private var availableWidth: CGFloat = 0
    init(@ViewBuilder tools: () -> Tools, @ViewBuilder paper: () -> Paper) { self.tools = tools(); self.paper = paper() }
    var body: some View {
        Group {
            if availableWidth >= 650 { wide }
            else { VStack(alignment: .leading, spacing: 20) { tools; paper } }
        }.onGeometryChange(for: CGFloat.self) { $0.size.width } action: { availableWidth = $0 }
    }
    private var wide: some View { HStack(alignment: .top, spacing: 23) { tools.frame(width: 224); paper.frame(maxWidth: .infinity) } }
}
