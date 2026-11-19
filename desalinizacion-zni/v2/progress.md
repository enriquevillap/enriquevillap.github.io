# Registro de avance y despliegue · Digital Twin ZNI V2
Fecha: 2026-11-18 (America/Bogota)

## Decisión arquitectónica
Se identificó el repositorio que realmente contiene la V1: enriquevillap/enriquevillap.github.io, rama master, directorio desalinizacion-zni. Se creó una rama independiente feature/desalinizacion-zni-v2-modelo-iot. La V2 fue implementada de forma aislada en desalinizacion-zni/v2/ y publicada luego en master sin modificar la V1.

## Implementado
- Motor matemático determinista con potencia requerida variable, balances hídricos/salinos y prioridades de control.
- Ejecución de acciones lógicas sobre caudal virtual y desvío de permeado fuera de criterio.
- Bomba principal/reserva, tanque con consumo y niveles, criterios de presión y filtro, doce sensores sintéticos.
- Escenarios V01–V10, casos adicionales, serie temporal de irradiancia, recuperación gradual virtual.
- Cabina modular HTML/CSS, planta conceptual 2D interactiva, indicadores y serie energética.
- Alarmas y reconocimiento, almacenamiento local, CSV/JSON, cola offline y sincronización simulada.
- Tests unitarios en Node, flujo de CI, pruebas e2e Chromium y captura de interfaz.

## Resultado de control disponible
18/18 comprobaciones básicas pasaron en GitHub Actions. El flujo Chromium, la prueba de persistencia y la captura automática finalizaron con éxito en el run 44448345825 para el commit 3017af338dafcc330294633822e5d264bc22a65e. Ese flujo incluye las últimas modificaciones funcionales.

## Segunda iteración (2026-11-18, hora Colombia)
- Módulo separado `reports.js` con agregados de consumo y volumen de escenarios sintéticos, serie por fecha de ejecución y exportación.
- Panel de umbrales configurables con validación, almacenamiento local e incorporación al resultado de cada ejecución.
- Umbral alto de tanque y evento `HIGH_TANK` simulados.
- Pruebas ampliadas para reportes, umbrales, persistencia y CSV.
- Se debe comprobar el pipeline del commit más reciente antes de aceptar estos cambios como validados.

## Tercera iteración: comparabilidad y auditoría automática

- Los ensayos manuales independientes ya no heredan el nivel del tanque; las simulaciones encadenadas requieren activación explícita. Cada registro señala su modalidad.
- Se añadió distinción del modo de simulación a las exportaciones y a los contadores del informe.
- El motor exige un consumo energético específico positivo. Su versión actual es `2.0.0-dev.3`.
- Los controles automáticos completaron **24/24**, y 240 casos de propiedades reproducibles superaron balances, límites y finitud, según GitHub Actions 44451394759.
- La emulación móvil de 390 px pasó en ese mismo run; la verificación del enlace de salto y la selección del esquema con teclado ya obtuvo un flujo completo satisfactorio en GitHub Actions 44451496925.
- La experiencia 3D hiperrealista continúa expresamente **pospuesta hasta el final**.

## Optimización CI

Se incorporó un filtro de archivos para evitar ejecutar Chromium ante cambios exclusivamente documentales, y concurrencia con cancelación de ejecuciones anteriores de la misma rama. Esta modificación del pipeline aún debe comprobarse en el siguiente flujo.

## Hito de publicación completado

- PR #1 fusionado en master mediante commit `57091628ce7c665e8651ee7d045e89341588ef8d`.
- GitHub Pages completó compilación y despliegue: ejecución 44453927145.
- Verificación HTTP pública aprobada: ejecución 44453927957.
- Pruebas finales del motor y navegador, incluida la PWA y la escena 3D, aprobadas: ejecución 44453685877.
- La escena tridimensional procedural fue incorporada **después del motor y las demás funciones**. No se reivindica hiperrealismo fotorrealista validado.

## Pendientes de evolución fuera de la publicación
1. Revisar visualmente la captura automática y ejecutar un ensayo manual de los controles en navegador local o Codespaces.
2. Validar manualmente en navegador y móvil, usabilidad, persistencia y accesibilidad.
3. Ampliar parámetros configurables y reportes temporales a partir de pruebas verificadas.
4. Investigar previsualizaciones Lovable privadas y Streamlit cuando haya acceso verificable.
5. Preparar evolución Python/IoT MQTT/TLS/base de datos real como trabajo posterior, sin fingir infraestructura.
6. Preparar un banco experimental y metodología de validación si se pretende TRL4.
7. ÚLTIMA ETAPA: experiencia 3D hiperrealista, únicamente cuando el núcleo funcional y la evidencia estén estabilizados.

## Restricciones
La aplicación V2 ya está publicada en su ruta independiente. La V1 académica original permanece inalterada. No llamar potable al permeado virtual y no declarar operación en campo.
