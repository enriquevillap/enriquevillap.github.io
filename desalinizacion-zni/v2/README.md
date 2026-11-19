# Prototipo digital interactivo ZNI — V2 (rama de desarrollo)

**Estado:** versión experimental de software, motor `2.0.0-dev.3`. **No desplegada como versión oficial**. La V1 académica permanece en /desalinizacion-zni/index.html de la rama master y en https://enriquevillap.github.io/desalinizacion-zni/.

**Ubicación en rama**: \`feature/desalinizacion-zni-v2-modelo-iot\` → \`desalinizacion-zni/v2/\`.

## Propósito y alcance

Modelo conceptual exclusivamente simulado de una planta de ósmosis inversa con alimentación fotovoltaica, para Proyecto I, II y continuidad a Proyecto de Grado UNAD. No hay sensores, actuadores, PLC, telemetría real, equipos, base de datos remota ni certificación de potabilidad. No se reivindica TRL4 experimental.

## Componentes implementados en el código

1. Motor \`model.js\` con entradas validadas, balances de agua y sal, potencia FV y demanda calculada (SEC × permeado), estados deterministas y prioridades de control.
2. \`REDUCE_LOAD\` reduce el caudal virtual; \`STOP_PROCESS\` y \`SAFE_MODE\` eliminan la producción simulada. La bomba de respaldo se representa como estado lógico.
3. 12 puntos de sensores sintéticos, incluidos caudales, salinidad, energía, presión, temperatura, tanque y latencia.
4. Balance del tanque en m³ con demanda, límites, pérdidas por desborde y demanda no atendida. El permeado virtual por encima del criterio de salinidad se desvía del tanque y se documenta aparte; esto no constituye control sanitario real.
5. 10 escenarios de referencia (V01 a V10) más tanque bajo y filtro obstruido; demostración secuencial.
6. Alarmas con severidad, código y reconocimiento local.
7. Persistencia local con \`localStorage\`, exportación CSV/JSON e identificación temporal de ejecuciones y versión del modelo.
8. Cola local de eventos durante comunicación degradada y **sincronización virtual**, sin transmisión de datos.
9. Cabina y esquema 2D accesible, dashboard de energía, documentación IoT, advertencias de no potabilidad y pruebas de regresión.
10. Pruebas automáticas del motor invocables por \`node tests.mjs\` y workflow de GitHub Actions.
11. Configuración local validada de salinidad, comunicación, niveles, presión y filtros. Cada simulación guarda una copia de los umbrales realmente utilizados.
12. Reportes de escenarios simulados por fecha de ejecución (24 horas, 7 días, 30 días y total) con CSV y JSON, separando permeado aceptado, desviado, energía, eventos y estados. El módulo `reports.js` no inventa producción histórica.

## Verificación local

Abrir un servidor HTTP desde la carpeta raíz del repositorio: \`python -m http.server 8000\`, después ir a \`http://localhost:8000/desalinizacion-zni/v2/\`. No abrir mediante \`file://\` porque \`app.js\` importa módulos ES. Se recomienda usar Chrome, Firefox o Edge actuales.

Con Node.js 22: \`cd desalinizacion-zni/v2 && npm test\`.

## Modelo y jerarquía

- Área FV = 10 m², eficiencia 20 %, conversión 90 %.
- \`Ppv = G × A × etaPV / 1000\` (kW); \`Putil = Ppv × etaConv\`.
- \`Qp_diseño = Qf × recuperación\`; \`Preq_diseño = SEC × Qp_diseño\`.
- \`Cp = Cf × (1 - rechazo_salinidad)\`, aproximación didáctica; \`Cb = (Qf×Cf - Qp×Cp) / Qb\`, con protección de división por cero.
- Prioridades: bomba no disponible, comunicación, salinidad, energía, proceso y alerta de tanque bajo.
- Restricciones simultáneas: la producción nunca requiere una potencia superior a la disponible por el modelo.
- El control de recuperación de sales, la hidrodinámica y el consumo específico son simplificaciones y no sustituyen datos experimentales.

**Advertencia:** La reducción por salinidad del 50 % es una regla sintética. El caudal que exceda el criterio de salinidad del permeado no se contabiliza como alimentación al tanque. El estado de recuperación solar nominal a 800 W/m² **es ENERGY_LIMIT** con Qf=1,20 m³/h, R=35 %, SEC=3,5 kWh/m³, porque Putil=1,44 kW y Preq de diseño=1,47 kW.

## Tercera iteración: comparabilidad metodológica y calidad

- Se distingue el modo **INDEPENDIENTE** del **SECUENCIAL**. El primero reinicia el tanque con el nivel solicitado; el segundo hereda el nivel final anterior, y registra el modo empleado en el historial y CSV.
- Las secuencias demostrativas comienzan sin heredar escenarios anteriores; después sí encadenan los pasos.
- El modelo rechaza SEC igual a cero para impedir una operación con demanda energética nula incompatible con el supuesto operativo.
- Se amplió la suite a 24 controles y se agregaron **240 casos sintéticos deterministas** para verificar balances de agua y sal, límites energéticos, niveles y finitud de resultados.
- Se añadieron salto al contenido, foco visible, controles de teclado y pruebas de navegador móvil emulado. Estas mejoras no constituyen auditoría de accesibilidad completa.

## Límites de las nuevas funcionalidades

Los umbrales son supuestos didácticos, no consignas de proceso industrial. Los reportes agrupan **fechas de ejecución de escenarios**; sumar sus resultados no equivale a medir producción continua real. La vista tridimensional hiperrealista está deliberadamente excluida de esta iteración.

## Plan de implementación restante, en orden estricto

1. Validar ejecución del workflow y pruebas manuales de controles y exportaciones.
2. Ejecutar auditoría de UI, accesibilidad, responsive y regresión de los casos V01–V10.
3. Comparar funcionalidades contra simuladores de referencia con acceso a código y sesiones reproducibles.
4. Desarrollar motor modular de mayor fidelidad y protocolos de integración para futuro trabajo de grado.
5. Diseñar persistencia remota y gateway de telemetría real solo cuando exista autorización, infraestructura y requisitos verificables.
6. Preparar banco físico, calibración y protocolo experimental antes de solicitar madurez TRL4.
7. **AL FINAL: experiencia 3D hiperrealista.** Solo evaluar Three.js, modelos 3D, iluminación, navegación y optimización de rendimiento después de aprobar las fases anteriores. Ni la estética ni el 3D sustituyen la validación del modelo.

## Control de versiones

No hacer merge hacia \`master\` ni modificar la V1 hasta disponer de aceptación funcional y aprobación académica.
