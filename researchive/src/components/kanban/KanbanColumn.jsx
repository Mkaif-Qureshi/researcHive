import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import KanbanItem from './KanbanItem';

const KanbanColumn = ({ id, title, items }) => {
    const { setNodeRef } = useDroppable({
        id
    });

    return (
        <Card className="h-full">
            <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                        {items.length}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-2">
                <div
                    ref={setNodeRef}
                    className="flex flex-col gap-2 min-h-[500px]"
                >
                    <SortableContext
                        id={id}
                        items={items}
                        strategy={verticalListSortingStrategy}
                    >
                        {items.map((item) => (
                            <KanbanItem
                                key={item.id}
                                id={item.id}
                                item={item}
                            />
                        ))}
                    </SortableContext>
                </div>
            </CardContent>
        </Card>
    );
};

export default KanbanColumn; 