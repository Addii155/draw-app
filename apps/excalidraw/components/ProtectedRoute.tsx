'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, user, token } = useAuth();
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);
    
    console.log("is loggedIn", isLoggedIn, "user", user, "token", token);

    useEffect(() => {
        // Mark as hydrated after first render (localStorage is loaded)
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        // Only check auth after hydration
        if (isHydrated && !isLoggedIn) {
            router.push('/signin');
        }
    }, [isHydrated, isLoggedIn, router]);

    // Show loading while hydrating (localStorage being read)
    if (!isHydrated) {
        return <div>Loading...</div>;
    }

    // Still show loading if auth is being verified
    if (!isLoggedIn) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
}
