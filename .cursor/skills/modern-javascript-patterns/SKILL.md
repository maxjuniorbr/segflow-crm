---
name: modern-javascript-patterns
description: Domine features do ES6+ incluindo async/await, desestruturação (destructuring), spread operators, arrow functions, promises, módulos, iterators, generators e padrões de programação funcional para escrever um código JavaScript limpo e eficiente. Use ao refatorar código legado, implementar padrões modernos ou otimizar aplicações JavaScript.
---

# Padrões do JavaScript Moderno (Modern JavaScript Patterns)

Guia abrangente para dominar os recursos do JavaScript moderno (ES6+), padrões de programação funcional e as melhores práticas para escrever código limpo, manutenível e performático.

## Quando Usar Esta Skill

- Refatorar código JavaScript legado para sintaxe moderna
- Implementar padrões de programação funcional
- Otimizar a performance do JavaScript
- Escrever código manutenível e legível
- Trabalhar com operações assíncronas
- Construir aplicações web modernas
- Migrar de callbacks para Promises/async-await
- Implementar pipelines de transformação de dados

## Funcionalidades Principais do ES6+

### 1. Arrow Functions (Funções de Seta)

**Sintaxe e Casos de Uso:**

```javascript
// Função tradicional
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// Um parâmetro (parênteses opcionais)
const double = (x) => x * 2;

// Sem parâmetros
const getRandom = () => Math.random();

// Múltiplas instruções (precisa de chaves)
const processUser = (user) => {
  const normalized = user.name.toLowerCase();
  return { ...user, name: normalized };
};

// Retornando objetos (envolva em parênteses)
const createUser = (name, age) => ({ name, age });
```

**Binding Léxico do 'this':**

```javascript
class Counter {
  constructor() {
    this.count = 0;
  }

  // Arrow function preserva o contexto do 'this'
  increment = () => {
    this.count++;
  };

  // Função tradicional perde o 'this' em callbacks
  incrementTraditional() {
    setTimeout(function () {
      this.count++; // 'this' é undefined
    }, 1000);
  }

  // Arrow function mantém o 'this'
  incrementArrow() {
    setTimeout(() => {
      this.count++; // 'this' refere-se à instância do Counter
    }, 1000);
  }
}
```

### 2. Desestruturação (Destructuring)

**Desestruturação de Objetos:**

```javascript
const user = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  address: {
    city: "Nova York",
    country: "EUA",
  },
};

// Desestruturação básica
const { name, email } = user;

// Renomear variáveis
const { name: userName, email: userEmail } = user;

// Valores padrão (default)
const { age = 25 } = user;

// Desestruturação aninhada
const {
  address: { city, country },
} = user;

// Rest operator
const { id, ...userWithoutId } = user;

// Parâmetros de função
function greet({ name, age = 18 }) {
  console.log(`Olá ${name}, você tem ${age} anos`);
}
greet(user);
```

**Desestruturação de Arrays:**

```javascript
const numbers = [1, 2, 3, 4, 5];

// Desestruturação básica
const [first, second] = numbers;

// Pular elementos
const [, , third] = numbers;

// Rest operator
const [head, ...tail] = numbers;

// Trocando variáveis (Swapping)
let a = 1,
  b = 2;
[a, b] = [b, a];

// Valores de retorno de função
function getCoordinates() {
  return [10, 20];
}
const [x, y] = getCoordinates();

// Valores padrão (default)
const [one, two, three = 0] = [1, 2];
```

### 3. Operadores Spread e Rest

**Spread Operator (Espalhamento):**

```javascript
// Espalhando arrays
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];

// Espalhando objetos
const defaults = { theme: "dark", lang: "pt-br" };
const userPrefs = { theme: "light" };
const settings = { ...defaults, ...userPrefs };

// Argumentos de função
const numbers = [1, 2, 3];
Math.max(...numbers);

// Copiando arrays/objetos (cópia rasa / shallow copy)
const copy = [...arr1];
const objCopy = { ...user };

// Adicionando itens de forma imutável
const newArr = [...arr1, 4, 5];
const newObj = { ...user, age: 30 };
```

**Parâmetros Rest (Rest Parameters):**

```javascript
// Coletar argumentos de função
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}
sum(1, 2, 3, 4, 5);

// Com parâmetros regulares
function greet(greeting, ...names) {
  return `${greeting} ${names.join(", ")}`;
}
greet("Olá", "João", "Maria", "Pedro");

// Rest em objetos
const { id, ...userData } = user;

// Rest em arrays
const [first, ...rest] = [1, 2, 3, 4, 5];
```

### 4. Template Literals

```javascript
// Uso básico
const userName = "John";
const greeting = `Olá, ${userName}!`;

// Strings multilinha
const templateHtml = `
  <div>
    <h1>${title}</h1>
    <p>${content}</p>
  </div>
`;

// Avaliação de expressão
const price = 19.99;
const total = `Total: R$${(price * 1.2).toFixed(2)}`;

// Tagged template literals (Template Literals com tags)
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] || "";
    return result + str + `<mark>${value}</mark>`;
  }, "");
}

const highlightName = "João";
const age = 30;
const highlightedHtml = highlight`Nome: ${highlightName}, Idade: ${age}`;
// Saída: "Nome: <mark>João</mark>, Idade: <mark>30</mark>"
```

### 5. Literais de Objeto Melhorados (Enhanced Object Literals)

```javascript
const personName = "John";
const personAge = 30;

// Nomes de propriedades abreviados (shorthand)
const baseUser = { name: personName, age: personAge };

// Nomes de métodos abreviados
const calculator = {
  add(a, b) {
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  },
};

// Propriedades computadas (Computed property names)
const field = "email";
const userWithComputedEmail = {
  name: "John",
  [field]: "john@example.com",
  [`get${field.charAt(0).toUpperCase()}${field.slice(1)}`]() {
    return this[field];
  },
};

// Criação dinâmica de propriedades
const buildUser = (name, ...props) => {
  return props.reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value,
    }),
    { name },
  );
};

const generatedUser = buildUser(
  "John",
  ["age", 30],
  ["email", "john@example.com"],
);
```

## Padrões Assíncronos

### 1. Promises

**Criando e Usando Promises:**

```javascript
// Criando uma promise
const fetchUser = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) {
        resolve({ id, name: "John" });
      } else {
        reject(new Error("ID Inválido"));
      }
    }, 1000);
  });
};

// Usando promises
fetchUser(1)
  .then((user) => console.log(user))
  .catch((error) => console.error(error))
  .finally(() => console.log("Pronto"));

// Encadeando promises (Chaining)
fetchUser(1)
  .then((user) => fetchUserPosts(user.id))
  .then((posts) => processPosts(posts))
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
```

**Combinadores de Promise:**

```javascript
// Promise.all - Espera por todas as promises
const promises = [fetchUser(1), fetchUser(2), fetchUser(3)];

Promise.all(promises)
  .then((users) => console.log(users))
  .catch((error) => console.error("Pelo menos uma falhou:", error));

// Promise.allSettled - Espera por todas, independente do resultado
Promise.allSettled(promises).then((results) => {
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      console.log("Sucesso:", result.value);
    } else {
      console.log("Erro:", result.reason);
    }
  });
});

// Promise.race - A primeira que finalizar (resolve ou reject)
Promise.race(promises)
  .then((winner) => console.log("Primeira:", winner))
  .catch((error) => console.error(error));

// Promise.any - A primeira a ter sucesso (resolve)
Promise.any(promises)
  .then((first) => console.log("Primeiro sucesso:", first))
  .catch((error) => console.error("Todas falharam:", error));
```

### 2. Async/Await

**Uso Básico:**

```javascript
// Função async sempre retorna uma Promise
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  return user;
}

// Tratamento de erros com try/catch
async function getUserData(id) {
  try {
    const user = await fetchUser(id);
    const posts = await fetchUserPosts(user.id);
    return { user, posts };
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    throw error;
  }
}

// Execução Sequencial vs Paralela
async function sequential() {
  const user1 = await fetchUser(1); // Espera
  const user2 = await fetchUser(2); // Depois espera
  return [user1, user2];
}

async function parallel() {
  const [user1, user2] = await Promise.all([fetchUser(1), fetchUser(2)]);
  return [user1, user2];
}
```

**Padrões Avançados:**

```javascript
// IIFE Assíncrona
(async () => {
  const result = await someAsyncOperation();
  console.log(result);
})();

// Iteração assíncrona (Async iteration)
async function processUsers(userIds) {
  for (const id of userIds) {
    const user = await fetchUser(id);
    await processUser(user);
  }
}

// Top-level await (ES2022)
const config = await fetch("/config.json").then((r) => r.json());

// Lógica de Retry
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Wrapper de Timeout
async function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), ms),
  );
  return Promise.race([promise, timeout]);
}
```

## Padrões de Programação Funcional

### 1. Métodos de Array

**Map, Filter, Reduce:**

```javascript
const users = [
  { id: 1, name: "John", age: 30, active: true },
  { id: 2, name: "Jane", age: 25, active: false },
  { id: 3, name: "Bob", age: 35, active: true },
];

// Map - Transforma array
const names = users.map((user) => user.name);
const upperNames = users.map((user) => user.name.toUpperCase());

// Filter - Seleciona elementos
const activeUsers = users.filter((user) => user.active);
const adults = users.filter((user) => user.age >= 18);

// Reduce - Agrega dados
const totalAge = users.reduce((sum, user) => sum + user.age, 0);
const avgAge = totalAge / users.length;

// Agrupar por propriedade
const byActive = users.reduce((groups, user) => {
  const key = user.active ? "active" : "inactive";
  return {
    ...groups,
    [key]: [...(groups[key] || []), user],
  };
}, {});

// Encadeando métodos (Chaining)
const result = users
  .filter((user) => user.active)
  .map((user) => user.name)
  .sort()
  .join(", ");
```

**Métodos de Array Avançados:**

```javascript
// Find - Primeiro elemento correspondente
const user = users.find((u) => u.id === 2);

// FindIndex - Índice do primeiro match
const index = users.findIndex((u) => u.name === "Jane");

// Some - Pelo menos um corresponde
const hasActive = users.some((u) => u.active);

// Every - Todos correspondem
const allAdults = users.every((u) => u.age >= 18);

// FlatMap - Faz um map e "achata" (flatten)
const userTags = [
  { name: "John", tags: ["admin", "user"] },
  { name: "Jane", tags: ["user"] },
];
const allTags = userTags.flatMap((u) => u.tags);

// From - Cria array a partir de iterável
const str = "hello";
const chars = Array.from(str);
const numbers = Array.from({ length: 5 }, (_, i) => i + 1);

// Of - Cria array a partir de argumentos
const arr = Array.of(1, 2, 3);
```

### 2. Funções de Alta Ordem (Higher-Order Functions)

**Funções como Argumentos:**

```javascript
// forEach customizado
function forEach(array, callback) {
  for (let i = 0; i < array.length; i++) {
    callback(array[i], i, array);
  }
}

// map customizado
function map(array, transform) {
  const result = [];
  for (const item of array) {
    result.push(transform(item));
  }
  return result;
}

// filter customizado
function filter(array, predicate) {
  const result = [];
  for (const item of array) {
    if (predicate(item)) {
      result.push(item);
    }
  }
  return result;
}
```

**Funções Retornando Funções:**

```javascript
// Currying
const multiply = (a) => (b) => a * b;
const double = multiply(2);
const triple = multiply(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

// Aplicação parcial (Partial application)
function partial(fn, ...args) {
  return (...moreArgs) => fn(...args, ...moreArgs);
}

const add = (a, b, c) => a + b + c;
const add5 = partial(add, 5);
console.log(add5(3, 2)); // 10

// Memoização (Memoization)
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const fibonacci = memoize((n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});
```

### 3. Composição e Piping (Composition and Piping)

```javascript
// Composição de funções
const compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((acc, fn) => fn(acc), x);

const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((acc, fn) => fn(acc), x);

// Exemplo de uso
const addOne = (x) => x + 1;
const double = (x) => x * 2;
const square = (x) => x * x;

const composed = compose(square, double, addOne);
console.log(composed(3)); // ((3 + 1) * 2)^2 = 64

const piped = pipe(addOne, double, square);
console.log(piped(3)); // ((3 + 1) * 2)^2 = 64

// Exemplo prático
const processUser = pipe(
  (user) => ({ ...user, name: user.name.trim() }),
  (user) => ({ ...user, email: user.email.toLowerCase() }),
  (user) => ({ ...user, age: parseInt(user.age) }),
);

const user = processUser({
  name: "  John  ",
  email: "JOHN@EXAMPLE.COM",
  age: "30",
});
```

### 4. Funções Puras e Imutabilidade

```javascript
// Função impura (modifica o input)
function addItemImpure(cart, item) {
  cart.items.push(item);
  cart.total += item.price;
  return cart;
}

// Função pura (sem side effects)
function addItemPure(cart, item) {
  return {
    ...cart,
    items: [...cart.items, item],
    total: cart.total + item.price,
  };
}

// Operações imutáveis em arrays
const numbers = [1, 2, 3, 4, 5];

// Adicionar ao array
const withSix = [...numbers, 6];

// Remover do array
const withoutThree = numbers.filter((n) => n !== 3);

// Atualizar elemento do array
const doubled = numbers.map((n) => (n === 3 ? n * 2 : n));

// Operações imutáveis em objetos
const user = { name: "John", age: 30 };

// Atualizar propriedade
const olderUser = { ...user, age: 31 };

// Adicionar propriedade
const withEmail = { ...user, email: "john@example.com" };

// Remover propriedade
const { age, ...withoutAge } = user;

// Deep cloning (Cópia profunda - abordagem simples)
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Deep cloning (ES2022+)
const clone = structuredClone(user);
```

## Recursos Modernos de Classes (Modern Class Features)

```javascript
// Sintaxe de classe
class User {
  // Campos privados (Private fields)
  #password;

  // Campos públicos (Public fields)
  id;
  name;

  // Campo estático (Static field)
  static count = 0;

  constructor(id, name, password) {
    this.id = id;
    this.name = name;
    this.#password = password;
    User.count++;
  }

  // Método público
  greet() {
    return `Olá, ${this.name}`;
  }

  // Método privado
  #hashPassword(password) {
    return `hashed_${password}`;
  }

  // Getter
  get displayName() {
    return this.name.toUpperCase();
  }

  // Setter
  set password(newPassword) {
    this.#password = this.#hashPassword(newPassword);
  }

  // Método estático
  static create(id, name, password) {
    return new User(id, name, password);
  }
}

// Herança (Inheritance)
class Admin extends User {
  constructor(id, name, password, role) {
    super(id, name, password);
    this.role = role;
  }

  greet() {
    return `${super.greet()}, eu sou um admin`;
  }
}
```

## Módulos (ES6)

```javascript
// Exportando (Exporting)
// math.js
export const PI = 3.14159;
export function add(a, b) {
  return a + b;
}
export class Calculator {
  // ...
}

// Export default
export default function multiply(a, b) {
  return a * b;
}

// Importando (Importing)
// app.js
import multiply, { PI, add, Calculator } from "./math.js";

// Renomear imports
import { add as sum } from "./math.js";

// Importar tudo
import * as Math from "./math.js";

// Imports dinâmicos
const module = await import("./math.js");
const { add } = await import("./math.js");

// Carregamento condicional
if (condition) {
  const module = await import("./feature.js");
  module.init();
}
```

## Iteradores e Geradores (Iterators and Generators)

```javascript
// Iterator customizado
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    return {
      current: this.from,
      last: this.to,

      next() {
        if (this.current <= this.last) {
          return { done: false, value: this.current++ };
        } else {
          return { done: true };
        }
      },
    };
  },
};

for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}

// Generator function
function* rangeGenerator(from, to) {
  for (let i = from; i <= to; i++) {
    yield i;
  }
}

for (const num of rangeGenerator(1, 5)) {
  console.log(num);
}

// Generator infinito
function* fibonacci() {
  let [prev, curr] = [0, 1];
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

// Async generator
async function* fetchPages(url) {
  let page = 1;
  while (true) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();
    if (data.length === 0) break;
    yield data;
    page++;
  }
}

for await (const page of fetchPages("/api/users")) {
  console.log(page);
}
```

## Operadores Modernos (Modern Operators)

```javascript
// Optional chaining (Encadeamento opcional)
const user = { name: "John", address: { city: "NYC" } };
const city = user?.address?.city;
const zipCode = user?.address?.zipCode; // undefined

// Chamada de função
const result = obj.method?.();

// Acesso a array
const first = arr?.[0];

// Nullish coalescing (Coalescência nula)
const defaultFromNull = null ?? "default"; // 'default'
const defaultFromUndefined = undefined ?? "default"; // 'default'
const keepZero = 0 ?? "default"; // 0 (e não 'default')
const keepEmptyString = "" ?? "default"; // '' (e não 'default')

// Logical assignment (Atribuição lógica)
let a = null;
a ??= "default"; // a = 'default'

let b = 5;
b ??= 10; // b = 5 (não modificado)

let obj = { count: 0 };
obj.count ||= 1; // obj.count = 1
obj.count &&= 2; // obj.count = 2
```

## Otimização de Performance

```javascript
// Debounce
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const searchDebounced = debounce(search, 300);

// Throttle
function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

const scrollThrottled = throttle(handleScroll, 100);

// Avaliação preguiçosa (Lazy evaluation)
function* lazyMap(iterable, transform) {
  for (const item of iterable) {
    yield transform(item);
  }
}

// Use apenas o que precisar
const numbers = [1, 2, 3, 4, 5];
const doubled = lazyMap(numbers, (x) => x * 2);
const first = doubled.next().value; // Computa apenas o primeiro valor
```

## Melhores Práticas

1. **Use `const` por padrão**: Use `let` apenas quando houver necessidade de reatribuição.
2. **Prefira arrow functions**: Especialmente em callbacks.
3. **Use template literals**: Em vez de concatenação de strings com `+`.
4. **Desestruture objetos e arrays**: Deixa o código mais limpo.
5. **Use async/await**: Em vez de correntes de Promise (`.then().catch()`).
6. **Evite mutar dados**: Use o spread operator e métodos de array.
7. **Use optional chaining (`?.`)**: Previne o erro "Cannot read property of undefined".
8. **Use nullish coalescing (`??`)**: Para estabelecer valores padrão.
9. **Prefira métodos de array (`map`, `filter`, etc.)**: Sobre loops tradicionais (`for`, `while`).
10. **Use módulos**: Para uma melhor organização de código.
11. **Escreva funções puras**: São mais fáceis de testar e raciocinar sobre.
12. **Use nomes de variáveis significativos**: Seu código documenta a si mesmo.
13. **Mantenha funções pequenas**: Princípio da responsabilidade única.
14. **Trate erros corretamente**: Use `try/catch` com async/await.
15. **Use strict mode**: `'use strict'` (Muitos frameworks modernos já ativam por padrão) para prevenir erros comuns.

## Armadilhas Comuns (Common Pitfalls)

1. **Confusão com binding do `this`**: Use arrow functions ou `bind()`.
2. **Usar Async/await sem try/catch**: Sempre tenha tratamento de erros.
3. **Criação desnecessária de Promises**: Não faça *wrap* (`new Promise`) de funções que já são assíncronas.
4. **Mutação de objetos**: Use spread operator ou `Object.assign()`.
5. **Esquecer de colocar `await`**: Funções async sempre retornam Promises.
6. **Bloquear o event loop**: Evite ao máximo operações síncronas pesadas.
7. **Memory leaks (Vazamentos de memória)**: Limpe event listeners e timers (timeouts/intervals).
8. **Rejeições de Promise não tratadas**: Use `.catch()` ou blocos try/catch.

## Recursos (Resources)

- **MDN Web Docs**: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript
- **JavaScript.info**: https://javascript.info/
- **You Don't Know JS**: https://github.com/getify/You-Dont-Know-JS
- **Eloquent JavaScript**: https://eloquentjavascript.net/
- **ES6 Features**: http://es6-features.org/
