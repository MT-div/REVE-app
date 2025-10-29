// src/components/BackButtonHandler.tsx
import { useEffect, useState } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const BackButtonHandler = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [backPressCount, setBackPressCount] = useState(0);

    // إعادة العدّاد إلى الصفر عند تغيير الشاشة
    useEffect(() => {
        setBackPressCount(0);
    }, [pathname]);

    useEffect(() => {
        const backAction = () => {
            if (pathname === '/gallary') {
                // حالة الشاشة الحالية هي Gallery
                if (backPressCount === 0) {
                    setBackPressCount(1);
                    setTimeout(() => setBackPressCount(0), 2000);
                    return true; // منع السلوك الافتراضي
                } else if (backPressCount === 1) {
                    Alert.alert(
                        'إغلاق التطبيق',
                        'هل أنت متأكد من رغبتك في الخروج؟',
                        [
                            { text: 'إلغاء', style: 'cancel' },
                            { text: 'نعم', onPress: () => BackHandler.exitApp() }
                        ]
                    );
                    setBackPressCount(0);
                    return true;
                }
            } else {
                // حالة الشاشات الأخرى
                if (backPressCount === 0) {
                    setBackPressCount(1);
                    setTimeout(() => setBackPressCount(0), 2000);
                    return false; // السماح بالسلوك الافتراضي
                } else if (backPressCount === 1) {
                    router.push('/gallary');
                    setBackPressCount(2);
                    setTimeout(() => setBackPressCount(0), 2000);
                    return true; // منع السلوك الافتراضي
                } else {
                    Alert.alert(
                        'إغلاق التطبيق',
                        'هل أنت متأكد من رغبتك في الخروج؟',
                        [
                            { text: 'إلغاء', style: 'cancel' },
                            { text: 'نعم', onPress: () => BackHandler.exitApp() }
                        ]
                    );
                    setBackPressCount(0);
                    return true;
                }
            }
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [backPressCount, router, pathname]);

    return null;
};

export default BackButtonHandler;