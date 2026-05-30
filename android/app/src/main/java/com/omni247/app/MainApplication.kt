package com.omni247.app

import android.app.Application
import android.os.Build
import android.preference.PreferenceManager
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    configureDebugServerHost()
    loadReactNative(this)
  }

  private fun configureDebugServerHost() {
    if (!BuildConfig.DEBUG) {
      return
    }

    // Always use localhost:8081 — adb reverse tcp:8081 tcp:8081 tunnels this
    // correctly for both emulators and physical devices.
    val debugHost = "localhost:8081"

    PreferenceManager.getDefaultSharedPreferences(this)
        .edit()
        .putString("debug_http_host", debugHost)
        .apply()
  }
}
