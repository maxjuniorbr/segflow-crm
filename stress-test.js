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
    password: 'lucas8bc'
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
    var startTime = new Date();

    var res = http.post(BASE_URL + '/login', JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
    }), {
        headers: { 'Content-Type': 'application/json' },
    });

    loginDuration.add(new Date() - startTime);

    var success = check(res, {
        'login successful': function (r) { return r.status === 200; },
        'user received': function (r) {
            try {
                var body = JSON.parse(r.body);
                return body.user !== undefined;
            } catch (e) {
                return false;
            }
        },
    });

    if (!success) {
        loginErrors.add(1);
        console.log('Login failed: ' + res.status + ' - ' + res.body);
        return null;
    }

    var cookies = res.cookies;
    var token = null;
    if (cookies && cookies['segflow_token'] && cookies['segflow_token'][0]) {
        token = cookies['segflow_token'][0].value;
    }

    if (!token) {
        loginErrors.add(1);
        console.log('No token cookie received');
        return null;
    }

    return token;
}

function makeAuthRequest(method, endpoint, token, body) {
    var headers = {
        'Content-Type': 'application/json',
    };

    var params = {
        headers: headers,
        cookies: {
            segflow_token: token
        }
    };

    var res;
    if (method === 'GET') {
        res = http.get(BASE_URL + endpoint, params);
    } else if (method === 'POST') {
        res = http.post(BASE_URL + endpoint, JSON.stringify(body), params);
    }

    var success = res.status >= 200 && res.status < 400;
    successRate.add(success);

    if (!success) {
        apiErrors.add(1);
    }

    return res;
}

// =============================================================================
// FLUXO PRINCIPAL DO TESTE
// =============================================================================

export default function () {
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
    var duration = data.metrics.http_req_duration || {};
    var failed = data.metrics.http_req_failed || {};
    var reqs = data.metrics.http_reqs || {};
    var durationValues = duration.values || {};
    var failedValues = failed.values || {};
    var reqsValues = reqs.values || {};
    var loginErrs = (data.metrics.login_errors && data.metrics.login_errors.values) ? data.metrics.login_errors.values.count : 0;
    var apiErrs = (data.metrics.api_errors && data.metrics.api_errors.values) ? data.metrics.api_errors.values.count : 0;

    var errorRate = failedValues.rate || 0;
    var p95 = durationValues['p(95)'] || 0;

    var capacity = '';
    if (errorRate < 0.01 && p95 < 200) {
        capacity = '200+ usuarios simultaneos (excelente performance)';
    } else if (errorRate < 0.05 && p95 < 500) {
        capacity = '100-200 usuarios simultaneos (boa performance)';
    } else if (errorRate < 0.10 && p95 < 1000) {
        capacity = '50-100 usuarios simultaneos (performance aceitavel)';
    } else if (errorRate < 0.20) {
        capacity = '20-50 usuarios simultaneos (precisa otimizacao)';
    } else {
        capacity = '<20 usuarios (problemas serios de performance)';
    }

    var summary = '\n' +
        '========================================================================\n' +
        '           RESULTADO DO TESTE DE STRESS - SEGFLOW CRM                  \n' +
        '========================================================================\n' +
        '  Requisicoes totais:     ' + (reqsValues.count || 0) + '\n' +
        '  Requisicoes/segundo:    ' + (reqsValues.rate ? reqsValues.rate.toFixed(2) : 'N/A') + '\n' +
        '  Taxa de erro:           ' + (errorRate * 100).toFixed(2) + '%\n' +
        '------------------------------------------------------------------------\n' +
        '  LATENCIA\n' +
        '  Media:                  ' + (durationValues.avg ? durationValues.avg.toFixed(2) : 'N/A') + 'ms\n' +
        '  Minima:                 ' + (durationValues.min ? durationValues.min.toFixed(2) : 'N/A') + 'ms\n' +
        '  Maxima:                 ' + (durationValues.max ? durationValues.max.toFixed(2) : 'N/A') + 'ms\n' +
        '  p90:                    ' + (durationValues['p(90)'] ? durationValues['p(90)'].toFixed(2) : 'N/A') + 'ms\n' +
        '  p95:                    ' + (p95 ? p95.toFixed(2) : 'N/A') + 'ms\n' +
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
