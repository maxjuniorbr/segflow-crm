import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// =============================================================================
// CONFIGURAÇÃO DO TESTE
// =============================================================================

const BASE_URL = 'http://localhost:3001/api';

// Credenciais de teste (criadas pelo seed do banco)
const TEST_USER = {
    email: 'lucas@atlasseguros.com.br',
    credential: 'lucas8bc'
};

// Métricas customizadas
const loginErrors = new Counter('login_errors');
const apiErrors = new Counter('api_errors');
const successRate = new Rate('success_rate');
const loginDuration = new Trend('login_duration');

// =============================================================================
// CENÁRIOS DE TESTE
// =============================================================================

export const options = {
    scenarios: {
        // Cenário 1: Smoke test (validação básica)
        smoke: {
            executor: 'constant-vus',
            vus: 5,
            duration: '30s',
            startTime: '0s',
            tags: { scenario: 'smoke' },
        },
        // Cenário 2: Load test (carga normal)
        load: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 20 },   // Sobe para 20 usuários
                { duration: '1m', target: 50 },    // Sobe para 50 usuários
                { duration: '1m', target: 50 },    // Mantém 50 usuários
                { duration: '30s', target: 0 },    // Desce para 0
            ],
            startTime: '35s',
            tags: { scenario: 'load' },
        },
        // Cenário 3: Stress test (encontrar limite)
        stress: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 50 },   // Rampa inicial
                { duration: '1m', target: 100 },   // Sobe para 100
                { duration: '1m', target: 150 },   // Sobe para 150
                { duration: '1m', target: 200 },   // Limite: 200 usuários
                { duration: '30s', target: 0 },    // Desce
            ],
            startTime: '4m',
            tags: { scenario: 'stress' },
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<500'],  // 95% das requisições < 500ms
        http_req_failed: ['rate<0.05'],     // Menos de 5% de falhas
        success_rate: ['rate>0.95'],        // Taxa de sucesso > 95%
    },
};

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

function login() {
    const startTime = Date.now();

    const res = http.post(BASE_URL + '/login', JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.credential,
    }), {
        headers: { 'Content-Type': 'application/json' },
    });

    loginDuration.add(Date.now() - startTime);

    const success = check(res, {
        'login successful': function (r) { return r.status === 200; },
        'user received': function (r) {
            try {
                const body = JSON.parse(r.body);
                return body.user !== undefined;
            } catch { /* non-JSON body */
                return false;
            }
        },
    });

    if (!success) {
        loginErrors.add(1);
        console.log('Login failed: ' + res.status + ' - ' + res.body);
        return null;
    }

    const cookies = res.cookies;
    const token = cookies?.['segflow_token']?.[0]?.value ?? null;

    if (!token) {
        loginErrors.add(1);
        console.log('No token cookie received');
        return null;
    }

    return token;
}

function makeAuthRequest(method, endpoint, token, body) {
    const headers = {
        'Content-Type': 'application/json',
    };

    const params = {
        headers: headers,
        cookies: {
            segflow_token: token
        }
    };

    let res;
    if (method === 'GET') {
        res = http.get(BASE_URL + endpoint, params);
    } else if (method === 'POST') {
        res = http.post(BASE_URL + endpoint, JSON.stringify(body), params);
    }

    const success = res.status >= 200 && res.status < 400;
    successRate.add(success);

    if (!success) {
        apiErrors.add(1);
    }

    return res;
}

function estimateCapacity(errorRate, p95) {
    if (errorRate < 0.01 && p95 < 200) {
        return '200+ usuarios simultaneos (excelente performance)';
    }
    if (errorRate < 0.05 && p95 < 500) {
        return '100-200 usuarios simultaneos (boa performance)';
    }
    if (errorRate < 0.1 && p95 < 1000) {
        return '50-100 usuarios simultaneos (performance aceitavel)';
    }
    if (errorRate < 0.2) {
        return '20-50 usuarios simultaneos (precisa otimizacao)';
    }
    return '<20 usuarios (problemas serios de performance)';
}

function formatMs(value) {
    return value ? value.toFixed(2) + 'ms' : 'N/A';
}

// =============================================================================
// FLUXO PRINCIPAL DO TESTE
// =============================================================================

export default function mainFlow() {
    // 1. Login
    const token = login();
    if (!token) {
        sleep(1);
        return;
    }

    // 2. Acessar Dashboard
    group('Dashboard', function () {
        const res = makeAuthRequest('GET', '/dashboard/stats', token);
        check(res, {
            'dashboard loaded': (r) => r.status === 200,
        });
    });

    sleep(Math.random() * 2 + 1); // 1-3 segundos

    // 3. Listar Clientes
    group('Clients', function () {
        const res = makeAuthRequest('GET', '/clients?page=1&limit=10', token);
        check(res, {
            'clients loaded': (r) => r.status === 200,
        });
    });

    sleep(Math.random() * 2 + 1);

    // 4. Listar Documentos
    group('Documents', function () {
        const res = makeAuthRequest('GET', '/documents?page=1&limit=10', token);
        check(res, {
            'documents loaded': (r) => r.status === 200,
        });
    });

    sleep(Math.random() * 2 + 1);

    // 5. Listar Corretores (se admin)
    group('Brokers', function () {
        const res = makeAuthRequest('GET', '/brokers', token);
        check(res, {
            'brokers loaded': (r) => r.status === 200 || r.status === 403,
        });
    });

    sleep(Math.random() * 3 + 2); // 2-5 segundos antes de próxima iteração
}

// =============================================================================
// RESUMO FINAL
// =============================================================================

export function handleSummary(data) {
    const durationValues = data.metrics.http_req_duration?.values ?? {};
    const failedValues = data.metrics.http_req_failed?.values ?? {};
    const reqsValues = data.metrics.http_reqs?.values ?? {};
    const loginErrs = data.metrics.login_errors?.values?.count ?? 0;
    const apiErrs = data.metrics.api_errors?.values?.count ?? 0;

    const errorRate = failedValues.rate ?? 0;
    const p95 = durationValues['p(95)'] ?? 0;
    const capacity = estimateCapacity(errorRate, p95);

    const summary = '\n' +
        '========================================================================\n' +
        '           RESULTADO DO TESTE DE STRESS - SEGFLOW CRM                  \n' +
        '========================================================================\n' +
        '  Requisicoes totais:     ' + (reqsValues.count ?? 0) + '\n' +
        '  Requisicoes/segundo:    ' + (reqsValues.rate ? reqsValues.rate.toFixed(2) : 'N/A') + '\n' +
        '  Taxa de erro:           ' + (errorRate * 100).toFixed(2) + '%\n' +
        '------------------------------------------------------------------------\n' +
        '  LATENCIA\n' +
        '  Media:                  ' + formatMs(durationValues.avg) + '\n' +
        '  Minima:                 ' + formatMs(durationValues.min) + '\n' +
        '  Maxima:                 ' + formatMs(durationValues.max) + '\n' +
        '  p90:                    ' + formatMs(durationValues['p(90)']) + '\n' +
        '  p95:                    ' + formatMs(p95) + '\n' +
        '------------------------------------------------------------------------\n' +
        '  ERROS\n' +
        '  Erros de login:         ' + loginErrs + '\n' +
        '  Erros de API:           ' + apiErrs + '\n' +
        '------------------------------------------------------------------------\n' +
        '  ESTIMATIVA DE CAPACIDADE\n' +
        '  ' + capacity + '\n' +
        '========================================================================\n';

    console.log(summary);

    return {
        'stdout': summary,
        'stress-test-results.json': JSON.stringify(data, null, 2),
    };
}
