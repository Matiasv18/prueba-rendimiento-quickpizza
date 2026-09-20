import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

const perfiles = new SharedArray('perfiles', function () {
  return JSON.parse(open('../data/users.json'));
});

export const options = {
  scenarios: {
    estres: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '1m', target: 40 },
        { duration: '1m', target: 60 },
        { duration: '1m', target: 80 },
        { duration: '1m', target: 100 },
        { duration: '2m', target: 0 },
      ],
    },
  },
  thresholds: {
    'http_req_duration{endpoint:home}': ['p(95)<1500'],
    'http_req_duration{endpoint:pizza}': ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const home = http.get('https://quickpizza.grafana.com/', {
    tags: { endpoint: 'home' },
  });
  check(home, { 'home status 200': (r) => r.status === 200 });

  sleep(Math.random() * 2 + 1);

  const perfil = perfiles[Math.floor(Math.random() * perfiles.length)];

  const res = http.post(
    'https://quickpizza.grafana.com/api/pizza',
    JSON.stringify(perfil),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token abcdef0123456789',
      },
      tags: { endpoint: 'pizza' },
    }
  );

  check(res, {
    'pizza status 200': (r) => r.status === 200,
    'respuesta contiene recomendación': (r) => r.json('pizza') !== undefined,
  });

  sleep(Math.random() * 3 + 1);
}

export function handleSummary(data) {
  return {
    'report/estres.html': htmlReport(data),
  };
}