import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useUserRole() {
  const { userRole, userProfile } = useAuth();
  const [isReporter, setIsReporter] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [isViewer, setIsViewer] = useState(false);

  useEffect(() => {
    if (userRole) {
      setIsReporter(userRole === 'reporter');
      setIsSupervisor(userRole === 'supervisor');
      setIsViewer(userRole === 'viewer');
    }
  }, [userRole]);

  return {
    userRole,
    userProfile,
    isReporter,
    isSupervisor,
    isViewer,
    canReport: isReporter || isSupervisor,
    canApprove: isSupervisor,
    canView: isViewer || isSupervisor || isReporter,
  };
}