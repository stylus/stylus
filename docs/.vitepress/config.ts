import { defineConfig } from 'vitepress'
import { version } from '../../package.json'
import {
  contributing,
  font,
  github,
  ogImage,
  ogUrl,
  releases,
  twitter,
  stylusDescription,
  stylusName,
} from './meta'

export default defineConfig({
  lang: 'en-US',
  title: stylusName,
  description: stylusDescription,
  head: [
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'alternate icon', href: '/favicon.ico', type: 'image/png', sizes: '16x16' }],
    ['meta', { name: 'author', content: `${stylusName} contributors` }],
    ['meta', { name: 'keywords', content: 'css, preprocessor, stylus, styl, stylesheet, css3' }],
    ['meta', { property: 'og:title', content: stylusName }],
    ['meta', { property: 'og:description', content: stylusDescription }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { name: 'twitter:title', content: stylusName }],
    ['meta', { name: 'twitter:description', content: stylusDescription }],
    ['meta', { name: 'twitter:image', content: ogImage }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { href: font, rel: 'stylesheet' }],
    ['link', { rel: 'mask-icon', href: '/logo.svg', color: '#ffffff' }],
    ['link', { rel: 'apple-touch-icon', href: '/stylus.png', sizes: '180x180' }],
  ],
  lastUpdated: true,
  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  },
  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      repo: 'stylus/stylus',
      branch: 'dev',
      dir: 'docs',
      text: 'Suggest changes to this page',
    },

    // algolia: {
    //   appId: '',
    //   apiKey: '',
    //   indexName: ''
    // },

    localeLinks: {
      text: 'English',
      items: [
        { text: '中文', link: 'https://www.stylus-lang.cn' },
        { text: '中文(张鑫旭)', link: 'https://www.zhangxinxu.com/jq/stylus' },
      ],
    },

    socialLinks: [
      { icon: 'twitter', link: twitter },
      { icon: 'github', link: github },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2010-PRESENT tj, iChenLei and stylus contributors',
    },

    nav: [
      { text: 'Playground', link: '/try' },
      { text: 'Features', link: '/docs/' },
      { text: 'API', link: '/docs/js' },
      { text: 'CLI', link: '/docs/executable' },
      {
        text: `v${version}`,
        items: [
          {
            text: 'Release Notes ',
            link: releases,
          },
          {
            text: 'Contributing ',
            link: contributing,
          },
        ],
      },
    ],

    sidebar: {
      '/': [
        {
          text: 'Features',
          items: [
            {
              text: 'Selectors',
              link: '/docs/selectors',
            },
            {
              text: 'Variables',
              link: '/docs/variables',
            },
            {
              text: 'Interpolation',
              link: '/docs/interpolation',
            },
            {
              text: 'Operators',
              link: '/docs/operators',
            },
            {
              text: 'Mixins',
              link: '/docs/mixins',
            },
            {
              text: 'Functions',
              link: '/docs/functions',
            },
            {
              text: 'Keyword Arguments',
              link: '/docs/kwargs',
            },
            {
              text: 'Built-in functions',
              link: '/docs/bifs',
            },
            {
              text: 'Rest params',
              link: '/docs/vargs',
            },
            {
              text: 'Comments',
              link: '/docs/comments',
            },
            {
              text: 'Conditionals',
              link: '/docs/conditionals',
            },
            {
              text: 'Hashes',
              link: '/docs/hashes',
            },
            {
              text: 'Iteration',
              link: '/docs/iteration',
            },
            {
              text: 'url()',
              link: 'docs/functions.url'
            },
            {
              text: 'css literal',
              link: 'docs/literal'
            },
            {
              text: 'css style syntax',
              link: 'docs/css-style'
            },
            {
              text: 'char escape',
              link: 'docs/escape'
            },
            {
              text: 'executable',
              link: 'docs/executable'
            },
            {
              text: 'connect middleware',
              link: 'docs/middleware'
            },
            {
              text: 'introspection api',
              link: 'docs/introspection'
            },
            {
              text: 'javascript api',
              link: 'docs/js'
            },
            {
              text: 'css3 extensions with nib',
              link: 'https://stylus.github.io/nib'
            }
          ],
        },
        {
          text: 'At Rules',
          items: [
            {
              text: '@import and @require',
              link: '/docs/import',
            },
            {
              text: '@media',
              link: '/docs/media',
            },
            {
              text: '@font-face',
              link: 'docs/font-face'
            },
            {
              text: '@keyframes',
              link: 'docs/keyframes'
            },
            {
              text: '@extend',
              link: 'docs/extend'
            },
            {
              text: '@block',
              link: 'docs/block'
            },
            {
              text: 'other @-rules',
              link: 'docs/atrules'
            }
          ],
        },
        {
          text: 'Debug',
          items: [
            {
              text: 'error-reporting',
              link: 'docs/error-reporting'
            },
            {
              text: 'sourcemaps',
              link: 'docs/sourcemaps'
            },
          ],
        },
        {
          text: 'CLI',
          items: [
            {
              text: 'cli reference',
              link: '/docs/executable',
            },
          ],
        },
        {
          text: 'IDE',
          items: [
            {
              text: 'gedit',
              link: '/docs/gedit',
            },
            {
              text: 'textmate',
              link: '/docs/textmate',
            },
          ],
        },
      ],
    },
  },
})
