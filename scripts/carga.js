import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

const perfiles = new SharedArray('perfiles', function () {
  return JSON.parse(open('../data/users.json'));
});

export const options = {
  scenarios: {
    carga_normal: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 }, // ramp-up
        { duration: '5m', target: 20 },  // steady state
        { duration: '30s', target: 0 },  // ramp-down
      ],
    },
  },
  thresholds: {
    'http_req_duration{endpoint:home}': ['p(95)<800'],
    'http_req_duration{endpoint:pizza}': ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // 1. Visita a la página principal
  const home = http.get('https://quickpizza.grafana.com/', {
    tags: { endpoint: 'home' },
  });
  check(home, { 'home status 200': (r) => r.status === 200 });

  sleep(Math.random() * 2 + 1); // think time de navegación: 1-3s

  // 2. Solicitud de recomendación (parametrizada por perfil)
  const perfil = perfiles[Math.floor(Math.random() * perfiles.length)];

  const res = http.post(
    'https://quickpizza.grafana.com/api/pizza',
    JSON.stringify(perfil),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token abcdef0123456789', // token público de demo de QuickPizza
      },
      tags: { endpoint: 'pizza' },
    }
  );

  check(res, {
    'pizza status 200': (r) => r.status === 200,
    'respuesta contiene recomendación': (r) => r.json('pizza') !== undefined,
  });

  sleep(Math.random() * 3 + 1); // think time de decisión: 1-4s
}

export function handleSummary(data) {
  return {
    'report/carga.html': htmlReport(data),
  };
}
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';

export function handleSummary(data) {
  return {
    'report/carga.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
