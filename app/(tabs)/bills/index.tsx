import { View, Text, FlatList } from 'react-native';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useBillStore } from '../../../store/billStore';
import { useEffect } from 'react';
import { Bill } from '../../../types/models';
import { formatCurrency } from '../../../utils/formatters';

export default function BillsScreen() {
    const { bills, loading, fetchBills } = useBillStore();

    useEffect(() => {
        fetchBills();
    }, []);

    const renderBill = ({ item }: { item: Bill }) => {
        const getStatusBadge = () => {
            switch (item.paymentStatus) {
                case 'paid':
                    return <Badge variant="success">Paid</Badge>;
                case 'overdue':
                    return <Badge variant="error">Overdue</Badge>;
                default:
                    return <Badge variant="warning">Unpaid</Badge>;
            }
        };

        return (
            <Card className="mb-3">
                <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-lg font-semibold flex-1">{item.vendorName}</Text>
                    {getStatusBadge()}
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-1">
                    {formatCurrency(item.amount)}
                </Text>
                <Text className="text-sm text-gray-600">
                    Due: {item.dueDate}
                </Text>
            </Card>
        );
    };

    return (
        <Container>
            <ScreenHeader
                title="Bills"
                subtitle="Track your payments"
            />

            <FlatList
                data={bills.filter(b => !b.isDraft)}
                renderItem={renderBill}
                keyExtractor={(item) => item.id}
                contentContainerClassName="p-4"
            />
        </Container>
    );
}
