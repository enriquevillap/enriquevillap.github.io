# AquaSeven V3 · Registro de publicación

**Estado:** publicado y verificado mediante GitHub Actions.

- **Simulador:** https://enriquevillap.github.io/desalinizacion-zni/v3/
- **Repositorio:** https://github.com/enriquevillap/enriquevillap.github.io
- **PR #2:** https://github.com/enriquevillap/enriquevillap.github.io/pull/2
- **Commit de despliegue:** `a7abd679d74085f09b802bc1cbf3f9f67e9ab55b`.
- **Pruebas de interfaz y motor:** https://github.com/enriquevillap/enriquevillap.github.io/actions/runs/44459432362
- **Publicación GitHub Pages:** https://github.com/enriquevillap/enriquevillap.github.io/actions/runs/44459623173
- **Comprobación HTTP de portada y módulos:** https://github.com/enriquevillap/enriquevillap.github.io/actions/runs/44459622851

## Controles aprobados
- 24/24 pruebas de regresión del modelo y 240 condiciones sintéticas deterministas.
- Cabina de control, arquitectura IoT, doce tarjetas de sensores, navegación por componentes, gauges y minigráficos.
- Simulación con estados, historiales, reportes y exportaciones.
- Planta WebGL Three.js con materiales PBR, iluminación, mar animado, equipos y controles de cámara.
- Modelo 3D, vista general generada de la planta ficticia y vista aérea con puntos de interés.
- Layout responsive probado en navegador móvil emulado.
- Retiro de referencias institucionales del producto V3.
- Conservación de V1 y V2: no se modificaron sus rutas en el PR de V3.

## Limitaciones
Los indicadores son virtuales. No se ha realizado validación en planta, calibración de sensores, certificación de potabilidad o ensayo TRL4. La escena WebGL es un modelo ilustrativo avanzado, no un modelo BIM/CAD fotográficamente verificado. Las once imágenes son ilustraciones originales generadas para AquaSeven, alojadas dentro del propio repositorio. No representan una instalación real. El motor Three.js sigue dependiendo de una carga inicial de biblioteca externa.

## Actualización del 19 de noviembre de 2026 · Experiencia educativa

- **PR #3:** https://github.com/enriquevillap/enriquevillap.github.io/pull/3
- **Commit de integración:** 5ca00b4e36d180d1820d812c023db429f741db5a
- **Pruebas de motor y navegador:** https://github.com/enriquevillap/enriquevillap.github.io/actions/runs/44468747805, satisfactorias.
- **Despliegue Pages:** https://github.com/enriquevillap/enriquevillap.github.io/actions/runs/44469129594, satisfactorio.
- **Verificación HTTP de once imágenes y módulos:** https://github.com/enriquevillap/enriquevillap.github.io/actions/runs/44469130040, satisfactoria.

Se habilitaron fichas educativas para componentes y sensores, siete panoramas originales, una vista exterior, ojo de águila y modos IoT lógico, mapa, isométrico y realista. Se visualizan paquetes ficticios que responden al estado de conectividad calculado por el motor. Los controles no constituyen validación experimental ni pruebas con hardware real.
