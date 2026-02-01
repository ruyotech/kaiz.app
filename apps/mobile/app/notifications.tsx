import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationCenter } from '../components/notifications';
import { useThemeContext } from '../providers/ThemeProvider';

export default function NotificationsScreen() {
    const { colors } = useThemeContext();
    
    return (
        <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: colors.background }}>
            <NotificationCenter />
        </SafeAreaView>
    );
}
