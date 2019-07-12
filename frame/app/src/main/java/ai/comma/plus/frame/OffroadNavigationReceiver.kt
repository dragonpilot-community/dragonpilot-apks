package ai.comma.plus.frame

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.util.Log

/**
 * Created by batman on 11/29/17.
 */
interface OffroadNavigationReceiverDelegate {
    fun onSettingsOpenedFromOffroad()
    fun onSettingsClosedFromOffroad()
    fun onDragonpilotSettingsOpenedFromOffroad()
    fun onDragonpilotSettingsClosedFromOffroad()
}

class OffroadNavigationReceiver(val delegate: OffroadNavigationReceiverDelegate) : BroadcastReceiver() {
    companion object {
        val ACTION_NAVIGATED_TO_SETTINGS = "ai.comma.plus.offroad.NAVIGATED_TO_SETTINGS"
        val ACTION_NAVIGATED_FROM_SETTINGS = "ai.comma.plus.offroad.NAVIGATED_FROM_SETTINGS"
        val ACTION_NAVIGATED_TO_DRAGONPILOT_SETTINGS = "ai.comma.plus.offroad.NAVIGATED_TO_DRAGONPILOT_SETTINGS"
        val ACTION_NAVIGATED_FROM_DRAGONPILOT_SETTINGS = "ai.comma.plus.offroad.NAVIGATED_FROM_DRAGONPILOT_SETTINGS"
        val offroadNavIntentFilter = IntentFilter()
    }

    init {
        offroadNavIntentFilter.addAction(ACTION_NAVIGATED_FROM_SETTINGS)
        offroadNavIntentFilter.addAction(ACTION_NAVIGATED_TO_SETTINGS)
        offroadNavIntentFilter.addAction(ACTION_NAVIGATED_TO_DRAGONPILOT_SETTINGS)
        offroadNavIntentFilter.addAction(ACTION_NAVIGATED_FROM_DRAGONPILOT_SETTINGS)
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        Log.d("frame", "receive broadcast ${intent?.action}")
        when (intent?.action) {
            ACTION_NAVIGATED_TO_SETTINGS ->
                delegate.onSettingsOpenedFromOffroad()
            ACTION_NAVIGATED_FROM_SETTINGS ->
                delegate.onSettingsClosedFromOffroad()
            ACTION_NAVIGATED_TO_DRAGONPILOT_SETTINGS ->
                delegate.onDragonpilotSettingsOpenedFromOffroad()
            ACTION_NAVIGATED_FROM_DRAGONPILOT_SETTINGS ->
                delegate.onDragonpilotSettingsClosedFromOffroad()
        }
    }
}
