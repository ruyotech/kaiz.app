import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationCenter } from '../../../components/notifications/NotificationCenter';

export default function NotificationsScreen() {
    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-gray-100">
            <NotificationCenter />
        </SafeAreaView>
    );
}
