package expo.modules.fileviewer

import android.app.ActivityOptions
import android.content.Intent
import android.net.Uri
import android.view.View
import android.view.Window
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.toCodedException
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val REQUEST_CODE = 315

class ExpoFileViewerModule : Module() {
    private var pendingPromise: Promise? = null

    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    override fun definition() = ModuleDefinition {
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('ExpoFileViewer')` in JavaScript.
        Name("ExpoFileViewer")

        // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
        AsyncFunction("openFileAsync") { uri: String, viewTag: Int?, promise: Promise ->
            var options = ActivityOptions.makeBasic()
            if (viewTag != null) {
                appContext.currentActivity?.window?.addFlags(Window.FEATURE_ACTIVITY_TRANSITIONS)
                val transitionView =
                    appContext.currentActivity?.window?.decorView?.findViewById<View>(viewTag)
                        ?: throw Error("Failed to find transition view")

                options = ActivityOptions
                    .makeScaleUpAnimation(
                        transitionView,
                        0,
                        0,
                        transitionView.width,
                        transitionView.height
                    )
            }

            try {
                appContext.throwingActivity.startActivityForResult(
                    Intent(Intent.ACTION_VIEW).apply {
                        data = Uri.parse(uri)
                        flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
                    },
                    REQUEST_CODE,
                    options.toBundle()
                )
                pendingPromise = promise
            } catch (e: Throwable) {
                promise.reject(e.toCodedException())
            }
        }.runOnQueue(Queues.MAIN)

        OnActivityResult { _, payload ->
            if (payload.requestCode != REQUEST_CODE) {
                return@OnActivityResult
            }

            pendingPromise?.resolve()
            pendingPromise = null
        }
    }
}
