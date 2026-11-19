# Acta técnica de preparación para publicación · Digital Twin ZNI V2

## Identidad
- Proyecto: Diseño de una arquitectura IoT para el control y monitoreo de sistemas híbridos de desalinización en Zonas No Interconectadas de Colombia.
- Institución: Universidad Nacional Abierta y a Distancia (UNAD), continuidad Proyecto de Ingeniería I, II y Proyecto de Grado.
- Aplicación: simulador académico, **no** sistema de control físico, ni modelo calibrado, ni certificación de potabilidad.
- Código fuente: rama \`feature/desalinizacion-zni-v2-modelo-iot\`, carpeta \`desalinizacion-zni/v2/\`.
- Ruta objetivo independiente de producción: \`https://enriquevillap.github.io/desalinizacion-zni/v2/\`.
- La V1 original se conserva en \`https://enriquevillap.github.io/desalinizacion-zni/\`.

## Componentes de la aplicación
| Módulo | Descripción | Carácter |
|---|---|---|
| model.js | Proceso hidráulico, solar, salino, tanque, estados y umbrales | Modelo matemático simplificado |
| app.js | Interfaz, escenarios, alarmas, sensores sintéticos, historial y cola | Simulador de navegador |
| reports.js | Agregación por fechas de ejecución, volúmenes virtuales y consumos | Reportes de escenarios |
| plant3d.js | Escena procedural espacial, órbita y equipos | Representación 3D conceptual; NO BIM/CAD |
| sw.js | Precarga offline del shell V2 | Función local, no infraestructura IoT |
| ui-tests.mjs / tests.mjs | Pruebas de navegador, balances y casos deterministas | Evidencia automatizada |

## Criterios de aceptación previos al despliegue
- [x] Código aislado de la V1, sin modificar \`desalinizacion-zni/index.html\`.
- [x] El motor registra escenarios independientes o encadenados.
- [x] Configuración de umbrales y historial local, con resultados trazables.
- [x] Advertencia explícita sobre datos sintéticos y falta de certificación sanitaria.
- [x] Navegación por teclado, pantalla móvil emulada, CSV y JSON.
- [x] Propuesta de experiencia espacial 3D colocada **después** de las funciones anteriores.
- [ ] Validar toda la suite del commit de release, incluido 3D y prueba offline.
- [ ] Integrar V2 a la rama que publica GitHub Pages, **sin sustituir la V1**.
- [ ] Confirmar HTTP 200 y carga de todos los módulos en la URL pública.
- [ ] Repetir smoke tests sobre el despliegue y verificar PWA.

## Limitaciones no negociables
1. Los parámetros FV (10 m², 20 % de eficiencia, 90 % de conversión) y los resultados de SEC son supuestos. No hay validación experimental de una planta real.
2. Las alarmas, sensores, bomba de reserva, tanque y cola de comunicación están modelados o emulados. No existe conexión con equipos.
3. El producto aceptado por criterio de salinidad simulado **no debe denominarse agua potable certificada**.
4. Sumar varios escenarios independientes no equivale a un balance temporal de operación continua.
5. La escena 3D utiliza superficies sintéticas con iluminación y proyección: no es representación hiperrealista verificada ni modelo de ingeniería de detalle. Fotorrealismo industrial posterior requeriría referencias, materiales, geometrías y planos validados.
6. Publicar el simulador no certifica TRL4 ni autoriza uso para control de bombas de un sistema real.

## Política de despliegue
Publicar solamente la carpeta \`/desalinizacion-zni/v2/\`, como ruta independiente bajo el sitio GitHub Pages existente. No cambiar ni borrar la V1. La aceptación del software se limita a ensayos sintéticos de navegador y motor; la validación en dispositivos físicos es una actividad posterior.
