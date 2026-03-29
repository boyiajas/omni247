# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Axios / OkHttp / Okio
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.squareup.okhttp.** { *; }
-keep interface com.squareup.okhttp.** { *; }
-dontwarn com.squareup.okhttp.**
-keep class okio.** { *; }
-dontwarn okio.**
-dontwarn javax.annotation.**
-keep class com.fasterxml.jackson.** { *; }
-dontwarn com.fasterxml.jackson.**

# React Native
-keep class com.facebook.react.devsupport.** { *; }
-dontwarn com.facebook.react.devsupport.**
