# Control de liberación AquaSeven V3

**Destino:** `/desalinizacion-zni/v3/`. Las versiones anteriores permanecen intactas.

## Criterios de aceptación
- [x] Rama independiente creada desde `master`.
- [x] Interfaz V3 con identidad comercial neutra en navegación, textos y cabecera.
- [x] Identidad visual caribeña inspirada en San Andrés, paleta celeste y turquesa.
- [x] Cabina de control con monitores, KPIs, alarmas y acciones de escenarios.
- [x] Arquitectura IoT gráfica con nodos y datos clicables.
- [x] 12 sensores sintéticos con tarjetas, gauges y minigráficos.
- [x] Planta WebGL avanzada con PBR, agua, costa, bombas, RO, filtros, tanque y fotovoltaica.
- [x] Motor, balances, escenarios, reportes y configuración separados.
- [x] Pruebas automatizadas completas: GitHub Actions 44459432362.
- [x] Render WebGL PBR, interacción de componentes y capturas de escritorio/móvil: GitHub Actions 44459432362.
- [x] Despliegue mediante PR #2, preservando V1 y V2; commit de publicación a7abd679d74085f09b802bc1cbf3f9f67e9ab55b.
- [x] Smoke test HTTP de URL pública y recursos V3: GitHub Actions 44459622851.

## Restricciones
El escenario virtual no mide sensores reales, no certifica agua potable, no proporciona consignas para equipos físicos y no acredita TRL4. La geometría WebGL es una representación de alto detalle gráfico, sin ingeniería de detalle CAD/BIM ni garantía de hiperrealismo fotográfico.

## Evidencia
Revisar el workflow `AquaSeven V3 - validacion integral` en GitHub Actions y los artefactos PNG de escritorio, cabina, IoT, 3D y móvil.

## Ampliación V3 educativa y IoT

- [x] Panel explicativo sencillo para componentes, sensores e indicadores.
- [x] Siete fondos originales y cambio de imagen al regresar al panorama.
- [x] Temporizador de 15 segundos configurado en el código.
- [x] Vista general e imagen aérea con puntos seleccionables.
- [x] Arquitectura IoT con diagrama, mapa, vista isométrica 3D y escena realista.
- [x] Paquetes simulados y eventos de interrupción en todas las modalidades.
- [x] Once archivos WebP versionados y precargados en el shell PWA.
- [x] CI matemático, navegador y WebGL completado: ejecución 44468747805.
- [x] PR #3 fusionado en master sin alterar V1 ni V2.
- [ ] Validación HTTP de la totalidad de assets pendiente de la próxima ejecución pública.

La vista 3D de red es esquemática; no existe conexión a sensores físicos ni tráfico real de red.
