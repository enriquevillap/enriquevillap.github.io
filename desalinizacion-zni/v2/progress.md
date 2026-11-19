# Registro de avance · Desarrollo V2
Fecha: 2026-11-18 (America/Bogota)

## Decisión arquitectónica
Se identificó el repositorio que realmente contiene la V1: enriquevillap/enriquevillap.github.io, rama master, directorio desalinizacion-zni. Se creó una rama independiente feature/desalinizacion-zni-v2-modelo-iot. La nueva versión está aislada en desalinizacion-zni/v2/.

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

## Pendientes por prioridad
1. Revisar visualmente la captura automática y ejecutar un ensayo manual de los controles en navegador local o Codespaces.
2. Validar manualmente en navegador y móvil, usabilidad, persistencia y accesibilidad.
3. Ampliar parámetros configurables y reportes temporales a partir de pruebas verificadas.
4. Investigar previsualizaciones Lovable privadas y Streamlit cuando haya acceso verificable.
5. Preparar evolución Python/IoT MQTT/TLS/base de datos real como trabajo posterior, sin fingir infraestructura.
6. Preparar un banco experimental y metodología de validación si se pretende TRL4.
7. ÚLTIMA ETAPA: experiencia 3D hiperrealista, únicamente cuando el núcleo funcional y la evidencia estén estabilizados.

## Restricciones
No fusionar ni cambiar master ni modificar la aplicación original. No publicar como V2 final hasta evaluación integral. No llamar potable al permeado virtual y no declarar operación en campo.
