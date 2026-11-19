export const COMPONENTS={
  "intake": {
    "name": "Captación marina",
    "icon": "≋",
    "description": "Entrada virtual de agua de mar. El caudal y la composición se obtienen del modelo.",
    "sensors": [
      "CAU-01",
      "SAL-02",
      "TEM-01"
    ],
    "measures": [
      [
        "Caudal de entrada",
        "feedEffective",
        "m³/h",
        3,
        3
      ],
      [
        "Salinidad de entrada",
        "feedSalinity",
        "g/L",
        100,
        1
      ],
      [
        "Temperatura",
        "temperature",
        "°C",
        50,
        1
      ]
    ]
  },
  "pump": {
    "name": "Estación de bombeo",
    "icon": "◉",
    "description": "Bombas principal y de reserva. Sus estados son lógicos y no activan equipos.",
    "sensors": [
      "CAU-01",
      "PRE-01"
    ],
    "measures": [
      [
        "Caudal impulsado",
        "feedEffective",
        "m³/h",
        3,
        3
      ],
      [
        "Presión virtual",
        "tmp",
        "bar",
        100,
        1
      ],
      [
        "Modo",
        "pumpMode",
        "",
        1,
        0
      ]
    ]
  },
  "filter": {
    "name": "Pretratamiento y filtros",
    "icon": "▤",
    "description": "Filtración conceptual con pérdida de presión modelada.",
    "sensors": [
      "FILT-01",
      "PRE-01"
    ],
    "measures": [
      [
        "ΔP de filtro",
        "filterPressureDrop",
        "bar",
        10,
        2
      ],
      [
        "Presión del proceso",
        "tmp",
        "bar",
        100,
        1
      ]
    ]
  },
  "ro": {
    "name": "Ósmosis inversa",
    "icon": "◈",
    "description": "Separación modelada por recuperación y rechazo salino supuestos.",
    "sensors": [
      "CAU-02",
      "CAU-03",
      "SAL-01",
      "SAL-02"
    ],
    "measures": [
      [
        "Permeado",
        "permeate",
        "m³/h",
        2,
        3
      ],
      [
        "Rechazo",
        "brine",
        "m³/h",
        3,
        3
      ],
      [
        "Salinidad permeado",
        "permeateSalinity",
        "g/L",
        5,
        3
      ],
      [
        "Recuperación",
        "effectiveRecovery",
        "%",
        100,
        1
      ]
    ]
  },
  "tank": {
    "name": "Tanque de almacenamiento",
    "icon": "◕",
    "description": "Balance entre permeado aceptado y demanda, con límites volumétricos.",
    "sensors": [
      "NIV-01",
      "CAU-02"
    ],
    "measures": [
      [
        "Nivel final",
        "tankLevelNext",
        "%",
        100,
        1
      ],
      [
        "Volumen disponible",
        "tankVolumeNext",
        "m³",
        500,
        2
      ],
      [
        "Entrada aceptada",
        "productAccepted",
        "m³/h",
        2,
        3
      ]
    ]
  },
  "solar": {
    "name": "Parque fotovoltaico",
    "icon": "☼",
    "description": "Producción solar calculada según irradiancia y eficiencias supuestas.",
    "sensors": [
      "SOL-01",
      "POT-01"
    ],
    "measures": [
      [
        "Irradiancia",
        "irradiance",
        "W/m²",
        1400,
        0
      ],
      [
        "Potencia útil",
        "usefulPower",
        "kW",
        3,
        2
      ],
      [
        "Cobertura",
        "renewableCoverage",
        "%",
        100,
        1
      ]
    ]
  },
  "brine": {
    "name": "Salida de salmuera",
    "icon": "≋",
    "description": "Corriente salina calculada. No existe un diseño de vertimiento validado.",
    "sensors": [
      "CAU-03",
      "SAL-02"
    ],
    "measures": [
      [
        "Caudal salmuera",
        "brine",
        "m³/h",
        3,
        3
      ],
      [
        "Salinidad salmuera",
        "brineSalinity",
        "g/L",
        120,
        2
      ]
    ]
  },
  "controller": {
    "name": "Control virtual",
    "icon": "▦",
    "description": "Reglas deterministas para los estados del simulador.",
    "sensors": [
      "POT-01",
      "COM-01"
    ],
    "measures": [
      [
        "Estado",
        "state",
        "",
        1,
        0
      ],
      [
        "Acción",
        "action",
        "",
        1,
        0
      ],
      [
        "Carga",
        "loadFactor",
        "fracción",
        1,
        3
      ]
    ]
  },
  "gateway": {
    "name": "Pasarela IoT lógica",
    "icon": "⌁",
    "description": "Adquisición conceptual, sin MQTT ni gateway físico.",
    "sensors": [
      "COM-01"
    ],
    "measures": [
      [
        "Latencia",
        "latency",
        "ms",
        120000,
        0
      ],
      [
        "Completitud",
        "completeness",
        "%",
        100,
        1
      ],
      [
        "Comunicación",
        "communication",
        "",
        1,
        0
      ]
    ]
  },
  "buffer": {
    "name": "Cola de eventos",
    "icon": "▤",
    "description": "Datos pendientes de sincronización virtual conservados en el navegador.",
    "sensors": [
      "COM-01"
    ],
    "measures": [
      [
        "Eventos pendientes",
        "_queue",
        "registros",
        100,
        0
      ]
    ]
  },
  "analytics": {
    "name": "Centro de analítica",
    "icon": "▥",
    "description": "Visualización de balances y tendencias de escenarios.",
    "sensors": [
      "POT-01",
      "CAU-02"
    ],
    "measures": [
      [
        "Escenarios",
        "_runs",
        "ejecuciones",
        1000,
        0
      ],
      [
        "Permeado",
        "permeate",
        "m³/h",
        2,
        3
      ]
    ]
  },
  "alarms": {
    "name": "Eventos y alarmas",
    "icon": "◉",
    "description": "Alertas virtuales con severidad e identificación.",
    "sensors": [
      "COM-01",
      "SAL-01"
    ],
    "measures": [
      [
        "Alarmas vigentes",
        "_alarms",
        "eventos",
        30,
        0
      ],
      [
        "Pendientes",
        "_pending",
        "eventos",
        100,
        0
      ]
    ]
  },
  "storage": {
    "name": "Registro de simulaciones",
    "icon": "☷",
    "description": "Historial local del navegador, exportable en CSV y JSON.",
    "sensors": [
      "CAU-02"
    ],
    "measures": [
      [
        "Registros",
        "_runs",
        "escenarios",
        1000,
        0
      ]
    ]
  }
};
export const SENSOR_INFO={
  "SOL-01": "Irradiancia que alimenta al modelo fotovoltaico.",
  "POT-01": "Potencia solar disponible tras conversión supuesta.",
  "CAU-01": "Caudal de alimentación efectivo.",
  "CAU-02": "Caudal virtual de permeado.",
  "CAU-03": "Caudal de rechazo salino.",
  "SAL-01": "Salinidad del permeado.",
  "SAL-02": "Salinidad del rechazo.",
  "PRE-01": "Presión transmembrana supuesta.",
  "TEM-01": "Temperatura de entrada.",
  "NIV-01": "Nivel de tanque después del escenario.",
  "FILT-01": "Diferencial de presión de filtros.",
  "COM-01": "Latencia de comunicación simulada."
};
