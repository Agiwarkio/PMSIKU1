import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Faculty, GraduateTracerStudy } from '../types';
import { apiClient } from '../services/apiClient';

interface AppContextType {
    allData: { iku1Data: GraduateTracerStudy[]; iku1TotalGraduates: number } | null;
    summary: any;
    universityName: string;
    faculties: Faculty[];
    refreshData: () => void;
    isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [allData, setAllData] = useState<{ iku1Data: GraduateTracerStudy[]; iku1TotalGraduates: number } | null>(null);
    const [summary, setSummary] = useState<any>({});
    const [universityName, setUniversityName] = useState('Universitas Hamzanwadi');
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshData = useCallback(async () => {
        setIsLoading(true);
        try {
            const config = await apiClient.getConfig();
            const graduates = await apiClient.getGraduates();
            const sumData = await apiClient.getSummary();

            setUniversityName(config.UniversityName);
            try {
                setFaculties(JSON.parse(config.UniversityStructure));
            } catch(e) {
                setFaculties([]);
            }

            setAllData({
                iku1Data: graduates,
                iku1TotalGraduates: config.TotalGraduates
            });

            setSummary(sumData);

        } catch (e) {
            console.error("Failed to load data from API", e);
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const value = {
        allData,
        summary,
        universityName,
        faculties,
        refreshData,
        isLoading
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};