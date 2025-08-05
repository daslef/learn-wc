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
                            { text: '1.1 О курсе', link: '/course' },
                            { text: '1.2 Веб Компоненты', link: '/intro' },
                            { text: '1.3 Custom Elements', link: '/custom-elements' },
                            { text: '1.4 HTML Templates', link: '/template' },
                            { text: '1.5 Shadow DOM', link: '/shadow-dom' }
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
