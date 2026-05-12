package com.mobilenext.milliways

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import com.mobilenext.milliways.ui.MilliwaysRoot
import io.testchimp.rum.TestChimpRum

class MainActivity : ComponentActivity() {

    companion object {
        private const val TAG = "MilliwaysTC"
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        deliverTruecoverageAutomation(intent)
        enableEdgeToEdge()
        setContent {
            val vm: AppViewModel = viewModel()
            MilliwaysRoot(vm)
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        deliverTruecoverageAutomation(intent)
    }

    override fun onResume() {
        super.onResume()
        deliverTruecoverageAutomation(intent)
    }

    /**
     * `adb shell am start -a VIEW -d …` sometimes leaves [Intent.getData] null while [Intent.getDataString] is set.
     * TestChimpRum reads [Intent.getData] only; resolve both so TrueCoverage `ci_test_info` is not dropped.
     */
    private fun deliverTruecoverageAutomation(intent: Intent?) {
        if (intent == null) return
        val data = intent.data
        val fromString =
            intent.dataString
                ?.trim()
                ?.takeIf { it.isNotEmpty() }
                ?.let { runCatching { Uri.parse(it) }.getOrNull() }
        val uri = data ?: fromString
        if (uri != null) {
            val handled = TestChimpRum.handleAutomationUri(uri)
            logTrueCoverageAutomation(uri, handled)
        }
    }

    private fun isTrueCoverageAutomationUri(uri: Uri): Boolean =
        uri.scheme?.equals("testchimp-rum", ignoreCase = true) == true &&
            uri.host?.equals("truecoverage", ignoreCase = true) == true

    /** Log SET/CLEAR for TrueCoverage troubleshooting (logcat: `MilliwaysTC`). */
    private fun logTrueCoverageAutomation(uri: Uri, handled: Boolean) {
        if (!isTrueCoverageAutomationUri(uri)) return
        val path = uri.path?.lowercase().orEmpty()
        when (path) {
            "/v1/clear" ->
                Log.i(
                    TAG,
                    "TrueCoverage: CI context CLEAR handled=$handled (emits will omit ci_test_info until SET)",
                )
            "/v1/set" -> {
                val pLen = uri.getQueryParameter("p")?.length ?: 0
                val hasCi = TestChimpRum.hasCiTestInfo()
                Log.i(
                    TAG,
                    "TrueCoverage: CI context SET handled=$handled p_len=$pLen hasCiPeekAfterHandle=$hasCi",
                )
            }
            else ->
                Log.i(TAG, "TrueCoverage: automation uri path=$path handled=$handled")
        }
    }
}
