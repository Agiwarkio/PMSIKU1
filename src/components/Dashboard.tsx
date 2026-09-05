import React from 'react';
import { IKU } from '../types';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

// Dynamically import dashboards
const IKU1Dashboard = React.lazy(() => import('./IKU1Dashboard'));
const ConfigurationDashboard = React.lazy(() => import('./ConfigurationDashboard'));

interface DashboardProps {
    activeIKU: IKU;
}

const LoadingFallback: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-lg font-semibold">Memuat Dasbor...</p>
        <p className="text-sm">Menyiapkan data untuk Anda.</p>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ activeIKU }) => {
    const { isLoading } = useAppContext();
    const renderContent = () => {
        if (isLoading) return <LoadingFallback />;

        switch(activeIKU) {
            case IKU.IKU1:
                return <IKU1Dashboard />;
            case IKU.CONFIGURATION:
                return <ConfigurationDashboard />;
            default:
                return <IKU1Dashboard />;
        }
    }

    return (
        <React.Suspense fallback={<LoadingFallback />}>
            {renderContent()}
        </React.Suspense>
    );
};

export default Dashboard;