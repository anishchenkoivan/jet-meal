package ru.jet_meal

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import ru.jet_meal.ui.theme.JetmealTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            JetmealTheme {
                val store = remember { JetMealWebViewStore() }
                val entryUrl = remember { JetMealAppConfiguration.webEntryUrl(this@MainActivity) }
                JetMealWebView(
                    store = store,
                    initialUrl = entryUrl,
                    onLoadingChange = null,
                    modifier = Modifier.fillMaxSize(),
                )
            }
        }
    }
}
