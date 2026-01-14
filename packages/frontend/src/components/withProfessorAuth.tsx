// packages/frontend/src/components/withProfessorAuth.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const withProfessorAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const WithProfessorAuthComponent = (props: P) => {
        const { user, loading } = useAuth();
        const router = useRouter();
        const [isProfessor, setIsProfessor] = useState(false);
        const [authChecked, setAuthChecked] = useState(false);

        useEffect(() => {
            if (!loading) {
                if (!user) {
                    router.push('/login');
                } else {
                    user.getIdTokenResult().then(idTokenResult => {
                        if (idTokenResult.claims.professor) {
                            setIsProfessor(true);
                        } else {
                            router.push('/login'); // Or a dedicated '/unauthorized' page
                        }
                        setAuthChecked(true);
                    });
                }
            }
        }, [user, loading, router]);

        if (loading || !authChecked || !isProfessor) {
            return <p>Loading and verifying access...</p>;
        }

        return <WrappedComponent {...props} />;
    };
    return WithProfessorAuthComponent;
};

export default withProfessorAuth;
