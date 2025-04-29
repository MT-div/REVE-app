import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// التكيف بناءً على تصميم iPhone 15 (المرجعي)
const BASE_WIDTH = 393; // عرض iPhone 15 Pro

export const scale = (size: number) => (width / BASE_WIDTH) * size;