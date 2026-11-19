# Control de liberación AquaSeven V3

**Destino:** `/desalinizacion-zni/v3/`. Las versiones anteriores permanecen intactas.

## Criterios de aceptación
- [x] Rama independiente creada desde `master`.
- [x] Interfaz V3 sin menciones institucionales o de asignaturas en navegación, textos o cabecera.
- [x] Identidad visual caribeña inspirada en San Andrés, paleta celeste y turquesa.
- [x] Cabina de control con monitores, KPIs, alarmas y acciones de escenarios.
- [x] Arquitectura IoT gráfica con nodos y datos clicables.
- [x] 12 sensores sintéticos con tarjetas, gauges y minigráficos.
- [x] Planta WebGL avanzada con PBR, agua, costa, bombas, RO, filtros, tanque y fotovoltaica.
- [x] Motor, balances, escenarios, reportes y configuración separados.
- [ ] Pruebas automatizadas completas sobre rama actual.
- [ ] Prueba WebGL efectiva y captura de pantalla.
- [ ] Despliegue mediante PR sin modificar las V1/V2.
- [ ] Smoke test de URL pública, recursos y funcionalidad de V3.

## Restricciones
El escenario virtual no mide sensores reales, no certifica agua potable, no proporciona consignas para equipos físicos y no acredita TRL4. La geometría WebGL es una representación de alto detalle gráfico, sin ingeniería de detalle CAD/BIM ni garantía de hiperrealismo fotográfico.

## Evidencia
Revisar el workflow `AquaSeven V3 - validacion integral` en GitHub Actions y los artefactos PNG de escritorio, cabina, IoT, 3D y móvil.
