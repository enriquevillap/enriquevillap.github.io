# Evidencia del despliegue · Digital Twin ZNI V2

**Estado:** desplegado y verificado mediante GitHub Actions y consulta HTTP automatizada.

**URL pública:** https://enriquevillap.github.io/desalinizacion-zni/v2/

**Repositorio:** https://github.com/enriquevillap/enriquevillap.github.io

**PR de publicación:** https://github.com/enriquevillap/enriquevillap.github.io/pull/1

**Commit de integración:** `57091628ce7c665e8651ee7d045e89341588ef8d`

**Build y deploy GitHub Pages:** https://github.com/enriquevillap/enriquevillap.github.io/actions/runs/44453927145 (success)

**Smoke test de URL y assets:** https://github.com/enriquevillap/enriquevillap.github.io/actions/runs/44453927957 (success)

**Pruebas de motor/interfaz/PWA/3D:** https://github.com/enriquevillap/enriquevillap.github.io/actions/runs/44453685877 (success)

**Cobertura de verificación:** 24 pruebas del motor, 240 casos sintéticos deterministas, Chromium, móvil 390 px emulado, modos independiente/secuencial, persistencia local, exportación CSV, alertas, configuración, reportes, conexión offline y renderizado/interacción de la escena tridimensional.

**Integridad de la V1:** archivo `desalinizacion-zni/index.html` SHA `8d1926b1b61b0a70ec4fa552aa1b16644e97efab` sin modificaciones en master.

**Limitaciones:** simulación académica sin planta física, potabilidad certificada, telemetría real ni TRL4 validado. La escena 3D es procedural conceptual, no reconstrucción hiperrealista CAD/BIM; su fotorrealismo requeriría geometría y materiales técnicos verificables. PWA probada en laboratorio Chromium local, no auditada en dispositivo físico.

**Garantía editorial:** los indicadores son sintéticos, los reportes agregan ejecuciones y no datos de producción real.
