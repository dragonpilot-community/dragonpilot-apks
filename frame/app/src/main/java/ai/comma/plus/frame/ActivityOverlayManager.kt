package ai.comma.plus.frame

import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.TextView

interface ActivityOverlayManagerDelegate {
    fun onActivityOverlayDismissed()
}

class ActivityOverlayManager(val activityOverlay: View, val delegate: ActivityOverlayManagerDelegate) {
    companion object {
        val OVERLAY_START_CAR = OverlayMessage("start_to_begin", dismiss = "go_back")
        val OVERLAY_THERMAL_WARNING = OverlayMessage("ride_completed", "continue_str", "keep_away_sunlight", timeoutMillis = 30000)
    }

    var timerHandler = Handler(Looper.getMainLooper())
    var titleText = activityOverlay.findViewById(R.id.activity_overlay_text) as TextView
    var bodyText = activityOverlay.findViewById(R.id.activity_overlay_body) as TextView
    var dismissText = activityOverlay.findViewById(R.id.activity_overlay_back) as TextView
    val context = activityOverlay.context

    init {
        dismissText.setOnClickListener {
            hide()
            delegate.onActivityOverlayDismissed()
        }
    }

    fun getStringId(resName: String): Int? {
        return context?.resources?.getIdentifier(resName, "string", context.packageName)
    }

    fun show(overlay: OverlayMessage) {
        timerHandler.removeCallbacksAndMessages(null)

        var titleId = getStringId(overlay.title)
        if (titleId != null) {
            titleText.text = context?.getString(titleId)
        } else {
            titleText.text = overlay.title
        }

        var dismissId = getStringId(overlay.dismiss)
        if (dismissId != null) {
            dismissText.text = context?.getString(dismissId)
        } else {
            dismissText.text = overlay.dismiss
        }

        if (overlay.body != null) {
            var bodyId = getStringId(overlay.body)
            if (bodyId != null) {
                bodyText.text = context?.getString(bodyId)
            } else {
                bodyText.text = overlay.body
            }
        } else {
            bodyText.text = ""
        }

        activityOverlay.visibility = View.VISIBLE
        dismissText.visibility = if (overlay.showBackButton) View.VISIBLE else View.INVISIBLE

        if (bodyText.text != "") {
          bodyText.visibility = View.VISIBLE
        } else {
          bodyText.visibility = View.GONE
        }

        if (overlay.timeoutMillis != null) {
            timerHandler.postDelayed( {
                hide()
                delegate.onActivityOverlayDismissed()
            }, overlay.timeoutMillis.toLong())
        }
    }

    fun hide() {
        timerHandler.removeCallbacksAndMessages(null)

        activityOverlay.visibility = View.INVISIBLE
    }
}

data class OverlayMessage(val title: String,
                          val dismiss: String,
                          val body: String? = null,
                          val showBackButton: Boolean = true,
                          val timeoutMillis: Int? = null)
