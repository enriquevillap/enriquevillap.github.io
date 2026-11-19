# AquaSeven V3 · Desalinización inteligente

**Vista pública prevista:** https://enriquevillap.github.io/desalinizacion-zni/v3/

**Desarrollo aislado:** rama `feature/desalinizacion-zni-v3-caribe-premium`, directorio `desalinizacion-zni/v3/`.

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
La identidad cromática se inspira en San Andrés, Colombia. La fotografía opcional de la cabecera, si está disponible, corresponde a «San Andrés Island Colombia.JPG» de Roberto San Andrés, CC0: https://commons.wikimedia.org/wiki/File:San_Andr%C3%A9s_Island_Colombia.JPG. El resto de gráficos y geometría se generan mediante código propio.

## Pruebas
`node tests.mjs` para el motor; `node ui-tests.mjs` con Playwright instalado para la interfaz. El flujo de GitHub Actions publica evidencias de las pruebas antes de autorizar el despliegue.

## Versiones previas
Las rutas `/desalinizacion-zni/` y `/desalinizacion-zni/v2/` no se modifican por la V3.
