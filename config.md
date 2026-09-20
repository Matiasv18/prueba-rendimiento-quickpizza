# Modelo de carga

## Sistema bajo prueba (SUT)
https://quickpizza.grafana.com  (sitio de prueba oficial de Grafana/k6)

## Escenario de negocio simulado
El usuario visita la página principal (GET /) y luego solicita una
recomendación de pizza personalizada (POST /api/pizza), variando sus
restricciones (calorías máximas por porción, si debe ser vegetariana),
simulando distintos perfiles de usuario reales.

## Tipos de prueba ejecutados
1. Carga (load): 20 usuarios virtuales concurrentes, 5 min sostenidos.
2. Estrés (stress): incremento escalonado de 10 en 10 VUs hasta 100, buscando el punto de quiebre.
3. Resistencia (soak): 15 VUs sostenidos durante 30 minutos.

## SLA/SLO objetivo
- P95 de tiempo de respuesta del endpoint de recomendación (POST /api/pizza) < 2000 ms
- P95 de tiempo de respuesta de la página principal (GET /) < 800 ms
- Tasa de error < 1%
- Throughput sostenido ≥ 15 req/s

## Datos de prueba
Archivo data/users.json con 10 registros simulados, usados para
parametrizar variabilidad en los requests (no se hardcodea nada).
