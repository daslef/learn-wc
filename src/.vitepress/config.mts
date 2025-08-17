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
                        text: '1. Card', items: [
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
                        text: '2. Button', items: [
                            { text: 'О проекте', link: '/chapter-two/project-2-button/about' },
                            { text: 'Базовая реализация', link: '/chapter-two/project-2-button/implementation' },
                            {
                                text: 'Варианты и состояния', items: [
                                    { text: 'Стилизация', link: '/chapter-two/project-2-button/variants/styling-basics' },
                                    { text: 'Текстовые варианты', link: '/chapter-two/project-2-button/variants/text-variants' },
                                    { text: 'Вариант с иконкой', link: '/chapter-two/project-2-button/variants/icon-variant' },
                                    { text: 'Состояния', link: '/chapter-two/project-2-button/variants/states' },
                                    { text: 'Практическое задание', link: '/chapter-two/project-2-button/variants/task' },
                                ]
                            },
                            { text: 'Тестирование', link: '/chapter-two/project-2-button/testing' },
                            { text: 'Практическое задание', link: '/chapter-two/project-2-button/task' },
                            { text: 'Итоги', link: '/chapter-two/project-2-button/summary' },
                        ]
                    },
                    {
                        text: '3. Input', items: [
                            { text: 'О проекте', link: '/chapter-two/project-3-input/about' },
                            { text: 'Подготовка окружения', link: '/chapter-two/project-3-input/setup' },
                            { text: 'Базовая структура', link: '/chapter-two/project-3-input/basic-structure' },
                            { text: 'Связь с формой', link: '/chapter-two/project-3-input/form-associated' },
                            { text: 'Валидация', link: '/chapter-two/project-3-input/validation' },
                            { text: 'Отслеживание атрибутов', link: '/chapter-two/project-3-input/listening' },
                            { text: 'Валидация #2', link: '/chapter-two/project-3-input/validation-2' },
                            { text: 'Альтернативные состояния', link: '/chapter-two/project-3-input/disabled-state' },
                            {
                                text: "Стилизация и стори", items: [
                                    { text: 'Стилизация', link: '/chapter-two/project-3-input/styling-and-stories/styling' },
                                    { text: 'Стори', link: '/chapter-two/project-3-input/styling-and-stories/stories' },
                                    { text: 'Практическое задание', link: '/chapter-two/project-3-input/styling-and-stories/task' },
                                ]
                            },
                            {
                                text: "Тестирование и документирование", items: [
                                    { text: 'Тестирование', link: '/chapter-two/project-3-input/tests-and-docs/testing' },
                                    { text: 'Документирование', link: '/chapter-two/project-3-input/tests-and-docs/documenting' },
                                    { text: 'Практическое задание', link: '/chapter-two/project-3-input/tests-and-docs/task' },
                                ]
                            },
                            { text: 'Итоги', link: '/chapter-two/project-3-input/summary' },
                        ]
                    },
                    {
                        text: "4. Micro-library", items: [
                            { text: 'О проекте', link: '/chapter-two/project-4-library/about' },
                            { text: 'Декоратор @Component', link: '/chapter-two/project-4-library/class-decorator' },
                            { text: 'Функция attachShadow', link: '/chapter-two/project-4-library/attach-shadow' },
                            { text: 'Практическое задание 1', link: '/chapter-two/project-4-library/task-1' },
                            { text: 'Встроенные элементы', link: '/chapter-two/project-4-library/custom-builtins' },
                            { text: 'Практическое задание 2', link: '/chapter-two/project-4-library/task-2' },
                            { text: 'Функция attachTemplate', link: '/chapter-two/project-4-library/attach-template' },
                            { text: 'Декоратор @Listen', link: '/chapter-two/project-4-library/listen-decorator' },
                            { text: 'Практическое задание 3', link: '/chapter-two/project-4-library/task-3' },
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
