export { auth as proxy } from '@/auth';

export const config = {
    matcher: [
        '/feed/:path*',
        '/post/:path*',
        '/profile/:path*'
    ]
}