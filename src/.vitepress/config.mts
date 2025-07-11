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
                text: 'Examples',
                items: [
                    { text: 'Markdown Examples', link: '/markdown-examples' },
                    { text: 'Runtime API Examples', link: '/api-examples' }
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
