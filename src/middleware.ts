export { auth as middleware } from '@/auth';

export const config = {
    matcher: [
        '/feed/:path*',
        '/post/:path*',
        '/profile/:path*'
    ]
}