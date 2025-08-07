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
                    {
                        text: "1. Введение", items: [
                            { text: '1.1 О курсе', link: '/chapter-one/course' },
                            { text: '1.2 Веб Компоненты', link: '/chapter-one/intro' },
                            { text: '1.3 Custom Elements', link: '/chapter-one/custom-elements' },
                            { text: '1.4 Shadow DOM', link: '/chapter-one/shadow-dom' },
                            { text: '1.5 HTML Templates', link: '/chapter-one/template' },
                            { text: '1.6 Slots API', link: '/chapter-one/slots' },
                        ]
                    },
                    {
                        text: "X. Дополнительные главы", items: [
                            { text: 'X.1 Shadow DOM', link: '/additional-chapters/shadow-dom' },
                        ]
                    }

                ]
            },
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
