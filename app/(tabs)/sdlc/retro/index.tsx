import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { Container } from '../../../../components/layout/Container';
import { ScreenHeader } from '../../../../components/layout/ScreenHeader';
import { useState, useRef, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    type?: 'text' | 'action_items';
}

export default function RetroScreen() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm Kaizen Master, your agile guide. Ready to look back at the sprint? Let's start with a quick check-in. How are you feeling about what we accomplished?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);
    const [stage, setStage] = useState<'checkin' | 'good' | 'bad' | 'ideas'>('checkin');

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputText('');
        scrollToBottom();

        // Simulate AI logic based on stage
        setTimeout(() => {
            let aiResponseText = "";
            let nextStage = stage;

            if (stage === 'checkin') {
                aiResponseText = "Thanks for sharing. It's important to acknowledge those feelings. Let's move on to the Wins. What went really well this sprint? What are you proud of?";
                nextStage = 'good';
            } else if (stage === 'good') {
                aiResponseText = "That's great! Celebrating wins builds momentum. Now, in the spirit of continuous improvement, what didn't go as planned? Any blockers or frustrations?";
                nextStage = 'bad';
            } else if (stage === 'bad') {
                aiResponseText = "I see. Identifying these bottlenecks is the first step to fixing them. Based on everything we've discussed, what is ONE creative idea or action item we can try next sprint to improve?";
                nextStage = 'ideas';
            } else if (stage === 'ideas') {
                aiResponseText = "Excellent. I've noted that down as a key action item for the next Sprint. I've generated a summary report for you.";
                // In future: Save action item to database
            }

            const newAiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponseText,
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, newAiMsg]);
            setStage(nextStage);
            scrollToBottom();
        }, 1500);
    };

    return (
        <Container>
            <ScreenHeader title="Sprint Retrospective" subtitle="Chat with Kaizen Master" showBack />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1 px-4 py-4"
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    {messages.map((msg) => (
                        <View
                            key={msg.id}
                            className={`flex-row mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.sender === 'ai' && (
                                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2 border border-blue-200">
                                    <MaterialCommunityIcons name="robot" size={20} color="#3B82F6" />
                                </View>
                            )}

                            <View
                                className={`px-4 py-3 rounded-2xl max-w-[80%] ${msg.sender === 'user'
                                        ? 'bg-blue-600 rounded-tr-none'
                                        : 'bg-white border border-gray-200 rounded-tl-none'
                                    }`}
                            >
                                <Text className={`text-base ${msg.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                                    {msg.text}
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Input Area */}
                <View className="p-4 bg-white border-t border-gray-100">
                    <View className="flex-row items-center bg-gray-50 rounded-full border border-gray-200 px-4 py-2">
                        <TextInput
                            className="flex-1 text-base max-h-24 py-2 mr-2"
                            placeholder="Type your thoughts..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            value={inputText}
                            onChangeText={setInputText}
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!inputText.trim()}
                            className={`w-10 h-10 rounded-full items-center justify-center ${inputText.trim() ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                        >
                            <MaterialCommunityIcons name="send" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Container>
    );
}
