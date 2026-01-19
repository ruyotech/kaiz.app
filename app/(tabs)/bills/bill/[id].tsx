import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Container } from '../../../../components/layout/Container';
import { ScreenHeader } from '../../../../components/layout/ScreenHeader';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { useBillStore } from '../../../../store/billStore';
import { useEffect, useState } from 'react';
import { mockApi } from '../../../../services/mockApi';
import { formatCurrency } from '../../../../utils/formatters';
import { formatDate } from '../../../../utils/dateHelpers';

export default function BillDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getBillById, markAsPaid } = useBillStore();
    const [bill, setBill] = useState<any>(null);
    const [category, setCategory] = useState<any>(null);

    useEffect(() => {
        const loadBill = async () => {
            const billData = await mockApi.getBillById(id);
            const categories = await mockApi.getBillCategories();
            const billCategory = categories.find(c => c.id === billData?.categoryId);

            setBill(billData);
            setCategory(billCategory);
        };

        loadBill();
    }, [id]);

    if (!bill) {
        return (
            <Container>
                <Text>Loading...</Text>
            </Container>
        );
    }

    const getStatusBadge = () => {
        switch (bill.paymentStatus) {
            case 'paid':
                return <Badge variant="success">Paid</Badge>;
            case 'overdue':
                return <Badge variant="error">Overdue</Badge>;
            default:
                return <Badge variant="warning">Unpaid</Badge>;
        }
    };

    const handleMarkAsPaid = () => {
        markAsPaid(id);
        setBill({ ...bill, paymentStatus: 'paid' });
    };

    return (
        <Container>
            <ScreenHeader
                title="Bill Details"
                showBack
            />

            <ScrollView className="flex-1 p-4">
                {/* Main Info */}
                <Card className="mb-4">
                    <View className="flex-row items-center mb-3">
                        {category && (
                            <Text className="text-4xl mr-3">{category.icon}</Text>
                        )}
                        <View className="flex-1">
                            <Text className="text-sm text-gray-600">{category?.name}</Text>
                            <Text className="text-2xl font-bold">{bill.vendorName}</Text>
                        </View>
                        {getStatusBadge()}
                    </View>

                    <View className="bg-blue-50 rounded-lg p-4 mb-3">
                        <Text className="text-sm text-gray-600 mb-1">Amount Due</Text>
                        <Text className="text-4xl font-bold text-blue-600">
                            {formatCurrency(bill.amount)}
                        </Text>
                    </View>

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">Due Date</Text>
                        <Text className="font-semibold">{formatDate(bill.dueDate)}</Text>
                    </View>

                    <View className="flex-row justify-between">
                        <Text className="text-gray-600">Billing Period</Text>
                        <Text className="font-semibold">
                            {formatDate(bill.billingPeriodStart)} - {formatDate(bill.billingPeriodEnd)}
                        </Text>
                    </View>

                    {bill.aiConfidence && (
                        <View className="mt-3 pt-3 border-t border-gray-200">
                            <Text className="text-sm text-gray-600">
                                AI Confidence: {Math.round(bill.aiConfidence * 100)}%
                            </Text>
                        </View>
                    )}
                </Card>

                {/* Actions */}
                {bill.paymentStatus !== 'paid' && (
                    <Card className="mb-4">
                        <Button onPress={handleMarkAsPaid} variant="primary">
                            Mark as Paid
                        </Button>
                    </Card>
                )}

                {/* OCR Data */}
                {bill.rawOcrData && (
                    <Card>
                        <Text className="text-lg font-semibold mb-2">Extracted Data</Text>
                        <Text className="text-sm text-gray-600 font-mono">
                            {bill.rawOcrData.extractedText}
                        </Text>
                    </Card>
                )}
            </ScrollView>
        </Container>
    );
}
