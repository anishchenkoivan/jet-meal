//
//  JetMealWebView.swift
//  jet-meal
//

import SwiftUI
import WebKit

/// Встраивание фронтенда Jet Meal (Next.js SSR-сервисы за одним доменом) через WKWebView.
struct JetMealWebView: UIViewRepresentable {
    @ObservedObject var store: JetMealWebViewStore
    @Binding var title: String
    var initialURL: URL
    var onLoadingChange: ((Bool) -> Void)?

    func makeCoordinator() -> Coordinator {
        Coordinator(store: store, title: $title, onLoadingChange: onLoadingChange)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.defaultWebpagePreferences.preferredContentMode = .mobile
        config.allowsInlineMediaPlayback = true

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.customUserAgent = makeUserAgent(appending: webView.customUserAgent)

        context.coordinator.webView = webView
        store.webView = webView
        let request = URLRequest(url: initialURL)
        webView.load(request)
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        context.coordinator.titleBinding = $title
        context.coordinator.onLoadingChange = onLoadingChange
        store.webView = webView
    }

    private func makeUserAgent(appending base: String?) -> String {
        let tag = "JetMealWebView/1"
        if let base, !base.isEmpty {
            return "\(base) \(tag)"
        }
        return tag
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        var webView: WKWebView?
        let store: JetMealWebViewStore
        var titleBinding: Binding<String>
        var onLoadingChange: ((Bool) -> Void)?

        init(store: JetMealWebViewStore, title: Binding<String>, onLoadingChange: ((Bool) -> Void)?) {
            self.store = store
            self.titleBinding = title
            self.onLoadingChange = onLoadingChange
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            onLoadingChange?(true)
        }

        func webView(_ webView: WKWebView, didCommit navigation: WKNavigation!) {
            DispatchQueue.main.async { [store] in
                store.notifyNavigationChanged()
            }
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            onLoadingChange?(false)
            if let t = webView.title, !t.isEmpty {
                titleBinding.wrappedValue = t
            }
            DispatchQueue.main.async { [store] in
                store.notifyNavigationChanged()
            }
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            onLoadingChange?(false)
            DispatchQueue.main.async { [store] in
                store.notifyNavigationChanged()
            }
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            onLoadingChange?(false)
            DispatchQueue.main.async { [store] in
                store.notifyNavigationChanged()
            }
        }

        /// Открытие `window.open` / target=_blank в том же WebView.
        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for navigationAction: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? {
            if navigationAction.targetFrame == nil, let url = navigationAction.request.url {
                webView.load(URLRequest(url: url))
            }
            return nil
        }
    }
}
