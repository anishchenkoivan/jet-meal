package ru.jet_meal

import android.content.Context
import android.content.pm.PackageManager
import android.webkit.URLUtil

/**
 * Точка входа в веб-приложение: один origin, разные пути (как у dev-gateway / прод-прокси).
 * Порядок разрешения URL совпадает с iOS `JetMealAppConfiguration`: meta-data → `JET_MEAL_BASE_URL` → дефолт debug/release.
 *
 * Debug по умолчанию: `http://10.0.2.2:7080/` — на **эмуляторе** `127.0.0.1` это сам эмулятор, не хост;
 * `10.0.2.2` — адрес loopback машины с точки зрения AVD (как `127.0.0.1` у iOS Simulator для dev-gateway на Mac).
 * На **физическом устройстве** задайте `JetMealWebBaseURL` / `JET_MEAL_BASE_URL` на `http://<IP-вашего-Mac>:7080/`
 * или выполните `adb reverse tcp:7080 tcp:7080` и используйте `http://127.0.0.1:7080/`.
 */
object JetMealAppConfiguration {
    /** Аналог ключа `JetMealWebBaseURL` в Info.plist iOS — meta-data у `<application>`. */
    private const val META_DATA_KEY = "JetMealWebBaseURL"

    private const val ENV_KEY = "JET_MEAL_BASE_URL"

    fun webEntryUrl(context: Context): String {
        metaDataBaseUrl(context)?.let { return ensureTrailingSlash(it) }
        System.getenv(ENV_KEY)?.takeIf { it.isNotBlank() }?.let { return ensureTrailingSlash(it) }
        return if (BuildConfig.DEBUG) {
            // Порт как у `frontend/services/dev-gateway` (7080); хост 10.0.2.2 — loopback хоста с эмулятора.
            "http://10.0.2.2:7080/"
        } else {
            "https://jet.meal/"
        }
    }

    private fun metaDataBaseUrl(context: Context): String? {
        return try {
            val appInfo = context.packageManager.getApplicationInfo(
                context.packageName,
                PackageManager.GET_META_DATA,
            )
            val raw = appInfo.metaData?.getString(META_DATA_KEY) ?: return null
            if (raw.isBlank()) null else raw
        } catch (_: PackageManager.NameNotFoundException) {
            null
        }
    }

    private fun ensureTrailingSlash(url: String): String {
        val trimmed = url.trimEnd()
        return if (trimmed.endsWith("/")) trimmed else "$trimmed/"
    }

    fun isHttpOrHttps(url: String): Boolean =
        URLUtil.isHttpUrl(url) || URLUtil.isHttpsUrl(url)
}
