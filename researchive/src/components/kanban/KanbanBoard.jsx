import { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Card } from '@/components/ui/card';
import KanbanColumn from './KanbanColumn';
import KanbanItem from './KanbanItem';

const defaultColumns = {
    todo: {
        id: 'todo',
        title: 'To Do',
        items: []
    },
    inProgress: {
        id: 'inProgress',
        title: 'In Progress',
        items: []
    },
    review: {
        id: 'review',
        title: 'Review',
        items: []
    },
    done: {
        id: 'done',
        title: 'Done',
        items: []
    }
};

const KanbanBoard = ({ papers, onPapersChange }) => {
    const [columns, setColumns] = useState(defaultColumns);

    const updateParentState = useCallback((newColumns) => {
        const allPapers = Object.values(newColumns).flatMap(column =>
            column.items.map(item => ({
                ...item.paper,
                status: column.id
            }))
        );
        onPapersChange?.(allPapers);
    }, [onPapersChange]);

    useEffect(() => {
        if (!papers) return;

        const initialColumns = { ...defaultColumns };
        const existingPapers = new Set(
            Object.values(columns)
                .flatMap(col => col.items)
                .map(item => item.id)
        );

        // Only add papers that aren't already in any column
        const newPapers = papers.filter(paper => !existingPapers.has(paper.paperId));

        if (newPapers.length > 0) {
            initialColumns.todo.items = [
                ...columns.todo.items,
                ...newPapers.map(paper => ({
                    id: paper.paperId,
                    content: paper.title,
                    paper: paper
                }))
            ];

            const newColumns = {
                ...columns,
                todo: initialColumns.todo
            };

            setColumns(newColumns);
            updateParentState(newColumns);
        }
    }, [papers]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragOver = ({ active, over }) => {
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find the containers
        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setColumns(prev => {
            const activeItems = prev[activeContainer].items;
            const overItems = prev[overContainer].items;

            // Find the indexes for the items
            const activeIndex = activeItems.findIndex(item => item.id === activeId);
            const overIndex = overItems.findIndex(item => item.id === overId);

            let newIndex;
            if (overId in prev) {
                // We're at the root droppable of a container
                newIndex = overItems.length + 1;
            } else {
                const isBelowLastItem = over && overIndex === overItems.length - 1;
                const modifier = isBelowLastItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            const newColumns = {
                ...prev,
                [activeContainer]: {
                    ...prev[activeContainer],
                    items: [
                        ...prev[activeContainer].items.filter(item => item.id !== active.id)
                    ]
                },
                [overContainer]: {
                    ...prev[overContainer],
                    items: [
                        ...prev[overContainer].items.slice(0, newIndex),
                        activeItems[activeIndex],
                        ...prev[overContainer].items.slice(newIndex)
                    ]
                }
            };

            // Schedule parent state update
            setTimeout(() => updateParentState(newColumns), 0);

            return newColumns;
        });
    };

    const handleDragEnd = ({ active, over }) => {
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer !== overContainer) {
            return;
        }

        const activeIndex = columns[activeContainer].items.findIndex(item => item.id === activeId);
        const overIndex = columns[overContainer].items.findIndex(item => item.id === overId);

        if (activeIndex !== overIndex) {
            setColumns(prev => {
                const newColumns = {
                    ...prev,
                    [overContainer]: {
                        ...prev[overContainer],
                        items: arrayMove(prev[overContainer].items, activeIndex, overIndex)
                    }
                };

                // Schedule parent state update
                setTimeout(() => updateParentState(newColumns), 0);

                return newColumns;
            });
        }
    };

    const findContainer = (id) => {
        if (id in columns) return id;
        return Object.keys(columns).find(key => columns[key].items.some(item => item.id === id));
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-4 gap-4">
                {Object.values(columns).map(column => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        items={column.items}
                    />
                ))}
            </div>
        </DndContext>
    );
};

export default KanbanBoard; 