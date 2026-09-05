// Data UMP 2024, disederhanakan. Sumber: CNBC, etc.
// Dalam aplikasi nyata, ini harus berasal dari database yang dapat diperbarui.
export const umpData: Record<string, { province: string, value: number }> = {
    'AC': { province: 'Aceh', value: 3460672 },
    'SU': { province: 'Sumatera Utara', value: 2809915 },
    'SB': { province: 'Sumatera Barat', value: 2811449 },
    'RI': { province: 'Riau', value: 3294625 },
    'KR': { province: 'Kepulauan Riau', value: 3402492 },
    'JA': { province: 'Jambi', value: 3037121 },
    'SS': { province: 'Sumatera Selatan', value: 3456874 },
    'BB': { province: 'Bangka Belitung', value: 3640000 },
    'BE': { province: 'Bengkulu', value: 2507079 },
    'LA': { province: 'Lampung', value: 2716497 },
    'JK': { province: 'DKI Jakarta', value: 5067381 },
    'JB': { province: 'Jawa Barat', value: 2057495 },
    'BT': { province: 'Banten', value: 2727812 },
    'JT': { province: 'Jawa Tengah', value: 2036947 },
    'YO': { province: 'DI Yogyakarta', value: 2125897 },
    'JI': { province: 'Jawa Timur', value: 2165244 },
    'BA': { province: 'Bali', value: 2813671 },
    'NB': { province: 'Nusa Tenggara Barat', value: 2444067 },
    'NT': { province: 'Nusa Tenggara Timur', value: 2186826 },
    'KB': { province: 'Kalimantan Barat', value: 2702616 },
    'KT': { province: 'Kalimantan Tengah', value: 3261616 },
    'KS': { province: 'Kalimantan Selatan', value: 3282812 },
    'KI': { province: 'Kalimantan Timur', value: 3360858 },
    'KU': { province: 'Kalimantan Utara', value: 3361653 },
    'SA': { province: 'Sulawesi Utara', value: 3545000 },
    'ST': { province: 'Sulawesi Tengah', value: 2736698 },
    'SG': { province: 'Sulawesi Tenggara', value: 2885964 },
    'SN': { province: 'Sulawesi Selatan', value: 3434298 },
    'SR': { province: 'Sulawesi Barat', value: 2914958 },
    'GO': { province: 'Gorontalo', value: 3025100 },
    'MA': { province: 'Maluku', value: 2919331 },
    'MU': { province: 'Maluku Utara', value: 3200000 },
    'PA': { province: 'Papua', value: 4024270 },
    'PB': { province: 'Papua Barat', value: 3393000 },
    'LN': { province: 'Luar Negeri', value: 0 },
};

export const getUMP = (provinceCode: string): number => {
    return umpData[provinceCode]?.value ?? umpData['JB'].value; // Default to Jawa Barat if not found
};

export const provinceOptions = Object.entries(umpData).map(([code, {province}]) => ({
    value: code,
    label: province,
}));
