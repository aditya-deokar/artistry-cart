import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define routes that do not require authentication
const publicRoutes = [
    '/',
    '/search',
    '/terms', // assumption
    '/privacy', // assumption
    '/product',
    '/shops',
]

// Define routes that are used for authentication (redirect if already logged in)
const authRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
]

// Helper function to check if a path matches a public pattern
// Handles dynamic routes like /product/123 or /shops/my-shop
const isPublicPath = (path: string) => {
    if (publicRoutes.includes(path)) return true
    if (path.startsWith('/product/')) return true
    if (path.startsWith('/shops/')) return true
    // Allow API routes to pass through (handled by simple bypass or specific logic if needed)
    // Usually we let API routes handle their own auth or use a separate middleware logic
    if (path.startsWith('/api/') || path.includes('/api/')) return true
    return false
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Check for token
    const token = request.cookies.get('access_token')?.value

    // 2. Handle Auth Routes (Login/Signup)
    // If user is already logged in, redirect them away from login/signup pages
    if (authRoutes.includes(pathname)) {
        if (token) {
            // Redirect to profile or home
            return NextResponse.redirect(new URL('/profile', request.url))
        }
        // Allow access to login/signup if not logged in
        return NextResponse.next()
    }

    // 3. Handle Protected Routes implicitly
    // If it's NOT a public path and NOT an auth route, we consider it protected by default
    // OR we can explicitly define protected routes. 
    // Given the "allowlist" approach is safer:
    // If it is NOT public and NOT auth, it effectively requires Login.

    // However, we must be careful not to block static assets (_next, images, etc.)
    // The matcher config usually handles static assets, but let's be safe.

    if (!isPublicPath(pathname)) {
        // If user is NOT logged in, redirect to login
        if (!token) {
            const loginUrl = new URL('/login', request.url)
            // Add the current path as a 'next' param to redirect back after login
            loginUrl.searchParams.set('next', pathname)
            loginUrl.searchParams.set('error', 'login_required')
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}

// Configure Matcher
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder assets checking (images, fonts, etc - assuming they are served from root or specific folders)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
