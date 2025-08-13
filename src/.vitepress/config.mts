import { defineConfig } from 'vitepress'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import type { ShikiTransformer, LanguageInput } from '@shikijs/types'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "wc course accompany",
    description: "ithub spb. web components course accompany",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Examples', link: '/markdown-examples' }
        ],

        sidebar: [
            {
                text: 'Лонгриды', items: [
                    { text: '1.1 О курсе', link: '/chapter-one/course' },
                    { text: '1.2 Веб Компоненты', link: '/chapter-one/intro' },
                    {
                        text: "1.3 Пользовательские компоненты", items: [
                            { text: '1.3.1 Обзор', link: '/chapter-one/custom-elements/overview' },
                            { text: '1.3.2 Встроенные компоненты', link: '/chapter-one/custom-elements/built-in' },
                            { text: '1.3.3 Автономные компоненты', link: '/chapter-one/custom-elements/autonomous' },
                            { text: '1.3.4 Спецификация и примечания', link: '/chapter-one/custom-elements/spec-and-notes' },
                        ]
                    },
                    { text: '1.4 Shadow DOM', link: '/chapter-one/shadow-dom' },
                    { text: '1.5 Шаблоны', link: '/chapter-one/template' },
                    { text: '1.6 Слоты', link: '/chapter-one/slots' },
                    { text: '1.7 События', link: '/chapter-one/events' },
                    {
                        text: "X. Дополнительные главы", items: [
                            { text: 'X.1 Стилизация', link: '/additional-chapters/styling' },
                            { text: 'X.2 Библиотеки', link: '/additional-chapters/libraries' },
                        ]
                    }
                ]
            },
            {
                text: 'Проекты', items: [
                    {
                        text: 'Card', items: [
                            { text: 'О проекте', link: '/chapter-two/project-1-card/about' },
                            { text: 'Флоу', link: '/chapter-two/project-1-card/dev-flow' },
                            { text: 'Имплементация', link: '/chapter-two/project-1-card/implementation' },
                            { text: 'Контролы', link: '/chapter-two/project-1-card/controls' },
                            { text: 'Стилизация', link: '/chapter-two/project-1-card/styling' },
                            { text: 'Тестирование', link: '/chapter-two/project-1-card/testing' },
                            { text: 'Итоги', link: '/chapter-two/project-1-card/summary' },
                        ]
                    },
                    {
                        text: 'Input', items: [
                            { text: 'О проекте', link: '/chapter-two/project-2-input/about' },
                            { text: 'Подготовка окружения', link: '/chapter-two/project-2-input/setup' },
                            { text: 'Базовая структура', link: '/chapter-two/project-2-input/basic-structure' },
                            { text: 'Связь с формой', link: '/chapter-two/project-2-input/form-associated' },
                            { text: 'Валидация', link: '/chapter-two/project-2-input/validation' },
                            { text: 'Отслеживание атрибутов', link: '/chapter-two/project-2-input/listening' },
                            { text: 'Валидация #2', link: '/chapter-two/project-2-input/validation-2' },
                            { text: 'Альтернативные состояния', link: '/chapter-two/project-2-input/disabled-state' },
                            { text: 'Стилизация', link: '/chapter-two/project-2-input/styling' },
                            // { text: 'Тестирование', link: '/chapter-two/project-2-input/testing' },
                            // { text: 'Итоги', link: '/chapter-two/project-2-input/summary' },
                        ]
                    },
                    {
                        text: 'Form', items: [
                            { text: 'О проекте', link: '/chapter-two/about' },
                            { text: 'Подготовка окружения', link: '/chapter-two/setup' }
                        ]
                    }
                ]
            }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
        ]
    },
    markdown: {
        codeTransformers: [
            transformerTwoslash() as ShikiTransformer
        ],
        // Explicitly load these languages for types hightlighting
        languages: ['js', 'jsx', 'ts', 'tsx'] as unknown as LanguageInput[]
    }
})
