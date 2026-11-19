# Matriz de comprobación · Digital Twin ZNI V2
Fecha de creación: 2026-11-18 (America/Bogota)
Repositorio: enriquevillap/enriquevillap.github.io
Rama: feature/desalinizacion-zni-v2-modelo-iot
Ruta: desalinizacion-zni/v2/

| ID | Control | Estado | Evidencia | Pendiente |
|---|---|---|---|---|
| C-01 | Rama aislada de master | CUMPLE | Rama creada desde master; V1 original conserva index.html | No fusionar sin aprobación |
| C-02 | Motor de potencia y balances reproducible | CUMPLE | model.js; tests.mjs | Validación física no aplicable en prototipo |
| C-03 | Actuación hidráulica virtual de REDUCE_LOAD/STOP_PROCESS | CUMPLE en modelo | Regresiones automatizadas | Pruebas con hardware: no aplica |
| C-04 | Criterio de salinidad y desviación de producto virtual | CUMPLE en modelo | runRegressionTests y pruebas V04 | No acredita potabilidad |
| C-05 | Protección numérica y entradas inválidas | CUMPLE | pruebas de no NaN y rechazo de valores | Completar evaluación de frontera |
| C-06 | Sensores sintéticos y balance de tanque | CUMPLE en código | model.js y UI | Integración con sensor real futura |
| C-07 | Alarmas, severidad y reconocimiento | CUMPLE en código | app.js y prueba Chromium | Verificación de UX por usuarios pendiente |
| C-08 | Historial local CSV/JSON | CUMPLE en código | app.js y prueba Chromium de CSV | No sincroniza entre dispositivos |
| C-09 | Cola local durante desconexión | CUMPLE en código | app.js | Transmisión real MQTT/TLS: no implementada |
| C-10 | 12 escenarios incluyendo tanque y filtro | CUMPLE en código | SCENARIOS y pruebas de escenarios | Completar inspección manual de UI |
| C-11 | Perfil solar temporal y recuperación por escalones | CUMPLE en código | app.js | Test manual de experiencia temporal |
| C-12 | Navegador Chromium end-to-end | CUMPLE en ejecución previa | GitHub Actions run 44448044973; versión posterior en verificación | Repetir al modificar código |
| C-13 | Captura automática y persistencia tras recarga | EN VERIFICACIÓN | GitHub Actions, ui-tests.mjs y upload-artifact | Revisar último run |
| C-14 | Prueba en otro dispositivo físico | NO VERIFICABLE | No se aportó evidencia | Ejecutar y documentar |
| C-15 | Calidad real, validación experimental y TRL4 | NO APLICA A ESTA VERSIÓN | Alcance del README y guías | Diseñar protocolo posterior |
| C-16 | Vista 3D hiperrealista | PENDIENTE POR DISEÑO | Hoja de ruta y README | SOLO DESPUÉS de los demás controles |

Los estados anteriores corresponden a verificación del software o del código, nunca a certificación de desempeño de una planta física. La última ejecución de CI define la aceptación del commit vigente.
