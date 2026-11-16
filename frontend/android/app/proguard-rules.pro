# ProGuard / R8 Rules for AgriShamba Android Release Build

# Keep Capacitor Core Bridge & Plugin Interfaces
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Cordova plugins if any
-keep class org.apache.cordova.** { *; }

# Keep Firebase & Local Notification Plugins
-keep class com.google.firebase.** { *; }
-keep class io.capawesome.capacitorjs.plugins.firebase.** { *; }
-keep class com.capacitorjs.plugins.localnotifications.** { *; }

# Optional Capacitor Firebase Auth handlers (Facebook, Play Games, etc.)
-dontwarn com.facebook.**
-dontwarn com.google.android.gms.games.**
-dontwarn com.google.android.play.core.**

# Keep native assets and reflection
-dontwarn com.google.android.gms.**
-dontwarn okio.**
-dontwarn javax.annotation.**

# Preserve line number information for crash diagnostics
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
