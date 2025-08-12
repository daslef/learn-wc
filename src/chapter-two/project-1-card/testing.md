# Тестирование `<card-component>`

Тестирование нашего автономного пользовательского элемента позволит удостовериться, что он работает корректно в данный момент и что он продолжает корректно работать при внесении правок, рефакторинге и добавлении нового функционала. Интеграционные тесты проверяют, как различные участки кода работают вместе, а снэпшот-тесты выявляют изменения в отображении элемента.

Сейчас мы реализуем интеграционные тесты для проверки корректности работы слотов элемента с помощью `Playwright` и сгенерирует снэпшот с использованием плагина `Storybook StoryShots`.

## Интеграционные тесты

`Playwright` уже добавлен в репозиторий и готов к запуску тестов из директории `tests`. В тестах мы будем обращаться по адресу, на котором запущен `Storybook`. Стори отображаются в элементах `<iframe>` и нам важно верно обратиться к ним.

Путь к стори для `<card-component>` выглядит так: `http://localhost:6006/?path=/story/components-cardcomponent--card`. Кликом по элементу интерфейса в правом верхнем углу скопируем ссылку на изолированный `<iframe>`, где не будет ничего лишнего: `http://localhost:6006/iframe.html?globals=&args=&id=components-cardcomponent--card`. Его и будем использовать для тестов.

#### Тест на наличие элемента

Создадим файл `tests/Card.spec.ts` и опишем первый тест

```ts
// tests/Card.spec.ts

 // @ts-check
import { test, expect } from '@playwright/test';

test('component should be visible', async ({ page }) => {
  await page.goto('http://localhost:6006/iframe.html?globals=&args=&id=components-cardcomponent--card');

  await expect(page.locator('card-component')).toBeVisible()
});
```

Запустим `Playwright` в визуальном режиме: `npm run test:e2e:ui` и выполним тест вручную. Если он не проходит, убедитесь, что `Storybook` всё еще запущен.

#### Настройка базового URL

В этом и последующих тестах базовый URL будет всегда один и тот же: `http://localhost:6006`. Чтобы не указывать его всякий раз, выставим его в файле `playwright.config.ts` и удалим из первого теста эту часть.

```ts
// playwright.config.ts

  // ...
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:6006',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  //   ...
```

#### Тест на наличие слотов

*Playwright* умеет работать с теневым DOM (но только в открытом режиме). Причем работая с теневым дом, мы можем делать вид, что теневых границ не существует, обращаясь к элементам классическим образом.

```ts
// tests/Card.spec.ts

test('component should have slots', async ({ page }) => {
  await page.goto('/iframe.html?globals=&args=&id=components-cardcomponent--card');
  const cardComponent = page.locator('card-component')

  for (const name of ["header", "footer", "content"]) {
    expect(cardComponent.locator(`slot[name=${name}]`)).toBeDefined()
  }
});
```

Вновь запустим `Playwright` в визуальном режиме: `npm run test:e2e:ui` и выполним тест вручную. Если он не проходит, убедитесь, что `Storybook` всё еще запущен.

#### Тест на проецирование в слоты

Окей, слоты существуют,но теперь надо проверить, что они корректно принимают в себя элементы.

Найдем эти элементы и проверим их содержимое.

```ts
// tests/Card.spec.ts

test('component header slot should have image ', async ({ page }) => {
  await page.goto('/iframe.html?globals=&args=&id=components-cardcomponent--card');
  const cardComponent = page.locator('card-component')

  const imageElement = cardComponent.locator('img[slot="header"]')
  await expect(imageElement).toBeVisible()
  await expect(imageElement).toHaveAttribute('src')
});

test('component header slot should have headline ', async ({ page }) => {
  await page.goto('/iframe.html?globals=&args=&id=components-cardcomponent--card');
  const cardComponent = page.locator('card-component')

  const headlineElement = cardComponent.locator('h4[slot="header"]')
  await expect(headlineElement).toBeVisible()
  await expect(headlineElement).toHaveText("Food")
});

test('component content slot should have p with lorem', async ({ page }) => {
  await page.goto('/iframe.html?globals=&args=&id=components-cardcomponent--card');
  const cardComponent = page.locator('card-component')

  const pElement = cardComponent.locator('p[slot="content"]')
  await expect(pElement).toBeVisible()
  await expect(pElement).toHaveText(/^Lorem/)
});

test('component footer slot should have link', async ({ page }) => {
  await page.goto('/iframe.html?globals=&args=&id=components-cardcomponent--card');
  const cardComponent = page.locator('card-component')

  const linkElement = cardComponent.locator('a[slot="footer"]')
  await expect(linkElement).toBeVisible()
  await expect(linkElement).toHaveAttribute('href', '#')
});
```

Интеграционные тесты - важная часть тестовой стратегии, помогающая вовремя заметить изменения, меняющие логику отображения и поведения наших элементов и отреагировать на них. Такие тесты могут быть частью пайплайна `CI/CD` и выполняться в ответ на определенные события в `git`-репозитории.

## Снэпшот-тестирование

Снэпшот-тесты проверяют визуальное отображение компонентов. Они берут свежий слепок разметки и сравнивают его с предыдущим состоянием.

```ts
// tests/Card.spec.ts

test('component should match snapshot', async ({ page }) => {
  await page.goto('/iframe.html?globals=&args=&id=components-cardcomponent--card');
  const root =  page.locator('#storybook-root')
  const innerHTML = await root.innerHTML();
  expect(innerHTML).toMatchSnapshot()
});
```

При первом запуске тесты дадут ошибку, т.к. снэпшоты еще не сняты. По умолчанию они помещаются в `tests`, в отдельную директорию. При следующем запуске произойдет сравнение разметки с сохраненной.

## Скриншот-тестирование

Бывает, что нам не так важно сохранение внутреннего наполнения элемента, как то, чтобы он не потерял свой существующий внешний вид. Для этого используются скриншот-тесты.

```ts
// tests/Card.spec.ts

test('component should match screenshot', async ({ page }) => {
  await page.goto('/iframe.html?globals=&args=&id=components-cardcomponent--card');
  await expect(page).toHaveScreenshot()
});
```

Как и в предыдущем случае, при первом запуске скриншоты будут сгенерированы, и уже при последующем - проверены.

Зачастую, когда верстка или стилизация еще не утверждена, ошибки снэпшот- и скриншот-тестов бывают навязчивы. Более того, если изменения были сделаны сознательно, нам нужно вручную сообщать, что именно новую версию стоит считать за образец.

Для этого можно либо вручную удалить снэпшоты и скриншоты (они находятся в одной и той же директории), либо использовать `npx playwright test -u` для их обновления.

В любом случае, логично приступать к таким способам визуального тестирования тогда, когда общие черты элемента уже намечены и регулярных изменений не планируется.
