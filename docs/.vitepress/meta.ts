// noinspection ES6PreferShortImport: IntelliJ IDE hint to avoid warning to use `~/contributors`, will fail on build if changed

/* Texts */
export const stylusName = 'Stylus'
export const stylusShortName = 'Stylus'
export const stylusDescription = 'Expressive, robust, feature-rich CSS language built for nodejs'

/* CDN fonts and styles */
export const googleapis = 'https://fonts.googleapis.com'
export const gstatic = 'https://fonts.gstatic.com'
export const font = `${googleapis}/css2?family=Readex+Pro:wght@200;400;600&display=swap`

/* vitepress head */
export const ogUrl = 'https://www.stylus-lang.com/'
export const ogImage = `${ogUrl}og.png`

/* GitHub and social links */
export const github = 'https://github.com/stylus/stylus'
export const releases = 'https://github.com/stylus/stylus/releases'
export const contributing = 'https://github.com/stylus/stylus/blob/dev/Contributing.md'
export const twitter = 'https://www.twitter.com/s_chenlei'

/* Avatar/Image/Sponsors servers */
export const preconnectLinks = [googleapis, gstatic]
export const preconnectHomeLinks = [googleapis, gstatic]

/* PWA runtime caching urlPattern regular expressions */
export const pwaFontsRegex = new RegExp(`^${googleapis}/.*`, 'i')
export const pwaFontStylesRegex = new RegExp(`^${gstatic}/.*`, 'i')
