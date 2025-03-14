import React, { useState } from 'react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from 'react-beautiful-dnd';
import CreateHandoverItemForm from '../components/handoveritem/CreateHandoverItemForm';
import { IoAdd, IoCheckmark, IoTime, IoWarning, IoChatbubble, IoAttach } from 'react-icons/io5';

interface HandoverItem {
  id: string;
  name: string;
  assignee: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  attachments: number;
  comments: number;
  tags: string[];
  template?: boolean;
}

interface Column {
  id: string;
  title: string;
  items: HandoverItem[];
}

export default function HandoverItem() {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 模擬數據 - 看板列
  const [columns, setColumns] = useState<{ [key: string]: Column }>({
    'internal-tasks': {
      id: 'internal-tasks',
      title: '內部交辦任務',
      items: [
        {
          id: 'HO-001',
          name: '系統管理權限交接',
          assignee: '王小明',
          dueDate: '2024/03/20',
          status: 'in_progress',
          progress: 75,
          category: '系統管理',
          description: '完成系統管理員權限的交接和文檔整理',
          priority: 'high',
          attachments: 3,
          comments: 5,
          tags: ['交接', '重要', '帳號相關']
        },
        {
          id: 'HO-002',
          name: '客戶資料交接',
          assignee: '李小華',
          dueDate: '2024/03/22',
          status: 'pending',
          progress: 0,
          category: '客戶管理',
          description: '整理並移交重要客戶聯繫資訊和歷史記錄',
          priority: 'medium',
          attachments: 2,
          comments: 1,
          tags: ['交接', '客戶']
        }
      ]
    },
    'daily-handover': {
      id: 'daily-handover',
      title: '每日交接簽閱',
      items: [
        {
          id: 'HO-003',
          name: '專案文件移交',
          assignee: '張小美',
          dueDate: '2024/03/25',
          status: 'completed',
          progress: 100,
          category: '文件管理',
          description: '移交所有進行中專案的相關文件和進度報告',
          priority: 'high',
          attachments: 8,
          comments: 12,
          tags: ['交接', '重要', '文件']
        }
      ]
    },
    'test-resources': {
      id: 'test-resources',
      title: '測試資源',
      items: [
        {
          id: 'HO-004',
          name: '設備清單確認',
          assignee: '陳大文',
          dueDate: '2024/03/21',
          status: 'in_progress',
          progress: 45,
          category: '資產管理',
          description: '確認並更新公司設備清單和使用狀態',
          priority: 'low',
          attachments: 1,
          comments: 3,
          tags: ['設備']
        }
      ]
    }
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId) {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems
        }
      });
    } else {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      });
    }
  };

  const getCompletedTasksCount = (columnId: string) => {
    return columns[columnId].items.filter(item => item.status === 'completed').length;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-600';
      case 'medium':
        return 'bg-yellow-100 text-yellow-600';
      case 'low':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex-1 bg-gray-100 p-8">
      {/* 頁面標題與操作按鈕 */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-blue-600 transition-colors duration-150">首頁</Link>
          <svg className="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700">每日交接</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              每日交接
            </h1>
            <p className="text-gray-600 mt-1">管理和追蹤所有交接任務的進度</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <IoAdd className="h-5 w-5 mr-2" />
              新增每日交接
            </button>
          </div>
        </div>
      </div>

      {/* 統計概覽 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: '待處理項目', value: '5', color: 'yellow', icon: <IoTime className="w-6 h-6" /> },
          { title: '進行中項目', value: '8', color: 'blue', icon: <IoWarning className="w-6 h-6" /> },
          { title: '已完成項目', value: '12', color: 'green', icon: <IoCheckmark className="w-6 h-6" /> },
          { title: '即將到期', value: '3', color: 'red', icon: <IoWarning className="w-6 h-6" /> },
        ].map((stat) => (
          <div
            key={stat.title}
            className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border-l-4 ${
              stat.color === 'blue' ? 'border-blue-500' :
              stat.color === 'yellow' ? 'border-yellow-500' :
              stat.color === 'green' ? 'border-green-500' :
              'border-red-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
              </div>
              <span className="text-gray-600">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 看板視圖 */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-6 overflow-x-auto pb-8">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="flex-shrink-0 w-80">
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">{column.title}</h3>
                  <span className="text-sm text-gray-500">
                    {getCompletedTasksCount(columnId)}/{column.items.length}
                  </span>
                </div>
                <Droppable droppableId={columnId}>
                  {(provided: DroppableProvided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {column.items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided: DraggableProvided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className={`h-2 w-2 rounded-full ${getStatusColor(item.status)}`} />
                                  <span className="text-sm text-gray-500">{item.id}</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(item.priority)}`}>
                                  {item.priority === 'high' ? '高優先級' :
                                   item.priority === 'medium' ? '中優先級' :
                                   '低優先級'}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-800 mb-2">{item.name}</h4>
                              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {item.tags.map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center space-x-4">
                                  <span className="flex items-center">
                                    <IoAttach className="w-4 h-4 mr-1" />
                                    {item.attachments}
                                  </span>
                                  <span className="flex items-center">
                                    <IoChatbubble className="w-4 h-4 mr-1" />
                                    {item.comments}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="h-6 w-6 rounded bg-blue-100 flex items-center justify-center text-blue-600 text-xs">
                                    {item.assignee.slice(0, 2)}
                                  </div>
                                  <span className="text-xs">{item.dueDate}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* 新增交接項目表單 */}
      <CreateHandoverItemForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          // TODO: 重新載入資料
        }}
      />
    </div>
  );
}
