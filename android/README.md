# App Android (Trusted Web Activity)

App de Google Play que abre descargoycargo.com a pantalla completa. Generada con
[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) a partir de
`app/public/manifest.webmanifest`. Identificador: `com.descargoycargo.app`.

Requisitos locales: JDK 17 y Android SDK (platform 36, build-tools 36).

## Compilar

```powershell
$env:JAVA_HOME = "<ruta JDK 17>"; $env:ANDROID_HOME = "<ruta Android SDK>"
# android/local.properties: sdk.dir=<ruta Android SDK>
java -classpath gradle/wrapper/gradle-wrapper.jar org.gradle.wrapper.GradleWrapperMain bundleRelease assembleRelease
```

## Firmar

La llave de carga (`upload.jks`) y su contraseña están fuera del repositorio.

```powershell
jarsigner -sigalg SHA256withRSA -digestalg SHA-256 -keystore upload.jks app-release.aab upload
zipalign -f -p 4 app-release-unsigned.apk alineado.apk
apksigner sign --ks upload.jks --ks-key-alias upload --out app.apk alineado.apk
```

## Nueva versión

Subir `appVersionCode` y `appVersionName` en `twa-manifest.json` y en
`app/build.gradle` antes de compilar.

## Digital Asset Links

`app/public/.well-known/assetlinks.json` debe incluir la huella SHA-256 de la
llave de carga **y** la de la llave de firma de Google Play (Play Console →
Integridad de la app), o la app mostrará la barra del navegador.
