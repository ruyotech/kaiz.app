import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTaskStore } from '@/store/taskStore';
import { Task } from '@/types/models';
import { getWeekNumber } from '@/utils/dateHelpers';
import { sprintApi, taskApi } from '@/services/api';

interface TaskQuickPickProps {
  onSelectTask: (taskId: string | null, taskTitle: string | null, taskDetails?: { description: string; storyPoints: number; quadrant: string }) => void;
}

export default function TaskQuickPick({ onSelectTask }: TaskQuickPickProps) {
  const { tasks, fetchTasks } = useTaskStore();
  const [sprintTasks, setSprintTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSprintName, setCurrentSprintName] = useState('');

  useEffect(() => {
    loadCurrentSprintTasks();
  }, []);

  const loadCurrentSprintTasks = async () => {
    setLoading(true);
    try {
      const currentWeek = getWeekNumber(new Date());
      const currentYear = new Date().getFullYear();
      const sprints = await sprintApi.getAll(currentYear);
      const sprint = sprints.find((s: any) => s.weekNumber === currentWeek);

      if (sprint) {
        setCurrentSprintName(`Sprint ${currentWeek}`);
        await fetchTasks();
        const allTasks = await taskApi.getTasksBySprint(sprint.id);
        const filtered = (allTasks || []).filter(
          (t: any) => !t.isDraft && (t.status === 'todo' || t.status === 'in_progress')
        ) as Task[];
        setSprintTasks(filtered);
      }
    } catch (error) {
      console.error('Error loading sprint tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuadrantBadge = (quadrantId: string) => {
    switch (quadrantId) {
      case 'q1':
        return { label: 'Q1', color: '#EF4444' };
      case 'q2':
        return { label: 'Q2', color: '#10B981' };
      case 'q3':
        return { label: 'Q3', color: '#F59E0B' };
      case 'q4':
        return { label: 'Q4', color: '#6B7280' };
      default:
        return { label: 'Q?', color: '#6B7280' };
    }
  };

  const renderTask = ({ item }: { item: Task }) => {
    const quadrant = getQuadrantBadge(item.eisenhowerQuadrantId);
    
    return (
      <TouchableOpacity
        className="bg-white rounded-lg p-3 mb-2 flex-row items-start"
        onPress={() => onSelectTask(item.id, item.title, {
          description: item.description,
          storyPoints: item.storyPoints,
          quadrant: item.eisenhowerQuadrantId
        })}
      >
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View 
              className="px-2 py-0.5 rounded mr-2"
              style={{ backgroundColor: quadrant.color + '20' }}
            >
              <Text className="text-xs font-bold" style={{ color: quadrant.color }}>
                {quadrant.label}
              </Text>
            </View>
            <Text className="text-xs text-gray-500">{item.storyPoints} pts</Text>
          </View>
          <Text className="text-gray-900 font-medium mb-1" numberOfLines={2}>
            {item.title}
          </Text>
          {item.description && (
            <Text className="text-gray-500 text-xs" numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        <MaterialCommunityIcons name="play-circle" size={24} color="#10B981" />
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-gray-100 rounded-xl p-3">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-700 font-semibold">Select Task</Text>
        {currentSprintName && (
          <Text className="text-blue-600 text-xs font-medium">{currentSprintName}</Text>
        )}
      </View>

      {loading ? (
        <View className="py-8 items-center">
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text className="text-gray-500 text-sm mt-2">Loading tasks...</Text>
        </View>
      ) : sprintTasks.length > 0 ? (
        <FlatList
          data={sprintTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <View className="py-8 items-center">
          <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={48} color="#D1D5DB" />
          <Text className="text-gray-500 text-center mt-2">No tasks in current sprint</Text>
          <Text className="text-gray-400 text-xs text-center mt-1">
            Add tasks to this week's sprint to focus on them
          </Text>
        </View>
      )}
    </View>
  );
}
