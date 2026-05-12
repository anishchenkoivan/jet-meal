//
//  JetMealAppConfiguration.swift
//  jet-meal
//

import Foundation

/// Точка входа в веб-приложение: один origin, разные пути (как у dev-gateway / прод-прокси).
enum JetMealAppConfiguration {
    /// Ключ в Info.plist; если нет — смотрим переменную окружения `JET_MEAL_BASE_URL`, затем значение по умолчанию.
    private static let infoPlistURLKey = "JetMealWebBaseURL"

    static var webEntryURL: URL {
        if let url = urlFromInfoPlist() {
            return url
        }
        if let env = ProcessInfo.processInfo.environment["JET_MEAL_BASE_URL"],
           let url = URL(string: env), !env.isEmpty {
            return url
        }
        #if DEBUG
        /// Совпадает с `frontend/services/dev-gateway` (`PORT` по умолчанию 7080).
        /// С симулятора при необходимости подставьте IP хоста или домен из `/etc/hosts` и задайте `JET_MEAL_BASE_URL` в схеме Xcode.
        return URL(string: "http://127.0.0.1:7080/")!
        #else
        return URL(string: "https://jet.meal/")!
        #endif
    }

    private static func urlFromInfoPlist() -> URL? {
        guard let s = Bundle.main.object(forInfoDictionaryKey: infoPlistURLKey) as? String,
              !s.isEmpty,
              let url = URL(string: s) else {
            return nil
        }
        return url
    }
}
