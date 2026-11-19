# AquaSeven V3 · Desalinización inteligente

**Versión pública desplegada y verificada:** https://enriquevillap.github.io/desalinizacion-zni/v3/

**Rama de desarrollo conservada:** rama `feature/desalinizacion-zni-v3-caribe-premium`, directorio `desalinizacion-zni/v3/`.

## Componentes
- Interfaz premium inspirada en los colores del mar de San Andrés.
- Cabina virtual con monitores, KPIs, alarmas y escenarios rápidos.
- Arquitectura IoT visual por capas con sensores y equipos clicables; fichas, indicadores y trazas.
- Doce sensores virtuales con representación numérica y gráfica, dependientes del modelo.
- Simulador hídrico-energético validado con escenarios, balances y umbrales.
- Historial local, reportes y exportación CSV/JSON.
- Escena 3D WebGL con materiales PBR, proyección de luces, agua animada, instalaciones, equipos seleccionables, zoom y órbita. Es una **visualización industrial conceptual** con mayor fidelidad gráfica, **no** una reconstrucción hiperrealista validada mediante CAD/BIM.
- PWA para las funciones locales, con precarga del shell. La biblioteca Three.js se carga inicialmente desde esm.sh y puede quedar en caché tras la primera ejecución con conexión.

## Restricciones
No hay sensores, telemetría, bombas ni tanques reales conectados. El permeado modelado no equivale a agua potable certificada. El simulador no acredita TRL4 ni sirve para operar instalaciones físicas.

## Fuentes gráficas
La identidad cromática se inspira en San Andrés, Colombia. Las once imágenes originales dentro de assets/ se generaron para esta instalación ficticia y se comprimieron a WebP. La interfaz ya no depende de fotografías externas de terceros.

## Pruebas
`node tests.mjs` para el motor; `node ui-tests.mjs` con Playwright instalado para la interfaz. El flujo de GitHub Actions publica evidencias de las pruebas antes de autorizar el despliegue.

## Versiones previas
Las rutas `/desalinizacion-zni/` y `/desalinizacion-zni/v2/` no se modifican por la V3.

## Evidencias de liberación

- URL pública: https://enriquevillap.github.io/desalinizacion-zni/v3/
- Pull Request: https://github.com/enriquevillap/enriquevillap.github.io/pull/2
- CI funcional y WebGL: https://github.com/enriquevillap/enriquevillap.github.io/actions/runs/44459432362
- GitHub Pages: https://github.com/enriquevillap/enriquevillap.github.io/actions/runs/44459623173
- Verificación HTTP: https://github.com/enriquevillap/enriquevillap.github.io/actions/runs/44459622851

## Actualización educativa e inmersiva del 19 de noviembre de 2026

- Ayuda contextual para principiantes: qué es, para qué sirve y por qué importa cada componente, sensor o indicador.
- Siete paisajes originales que se alternan automáticamente cada 15 segundos y al regresar al panorama.
- Planta inmersiva con vista general generada y ojo de águila con puntos de interés, además del modelo WebGL.
- Arquitectura IoT en cuatro vistas: diagrama lógico, mapa de red, 3D esquemático y recreación hiperrealista. Mensajes de datos simulados en cada modalidad.
- Once escenas originales WebP versionadas en assets/ y cacheadas por PWA.
- Pruebas integrales satisfactorias: https://github.com/enriquevillap/enriquevillap.github.io/actions/runs/44468747805.
- Pull Request de integración: https://github.com/enriquevillap/enriquevillap.github.io/pull/3, commit 5ca00b4e36d180d1820d812c023db429f741db5a.

Las escenas no representan una instalación real, no acreditan protección de arrecifes y no son planos de ingeniería. Las comunicaciones IoT son animaciones ficticias sin tráfico real.
