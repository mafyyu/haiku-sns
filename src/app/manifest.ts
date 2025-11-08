import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Next.js PWA',
        short_name: 'NextPWA',
        description: 'A Progressive Web App built with Next.js',
        start_url: '/',
        display: 'standalone',
        background_color: '#2ec6fe',
        theme_color: '#8936ff',
        icons: [
            {
                purpose: "maskable",
                sizes: "512x512",
                src: "icon.png",
                type: "image/png",
            },
            {
                purpose: "any",
                sizes: "512x512",
                src: "icon_rounded.png",
                type: "image/png",
            },
        ],
    }
}

