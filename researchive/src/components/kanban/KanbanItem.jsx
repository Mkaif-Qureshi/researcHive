import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical } from 'lucide-react';

const KanbanItem = ({ id, item }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <Card className="hover:border-primary cursor-grab active:cursor-grabbing">
                <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                        <button
                            className="mt-1 text-muted-foreground/50 hover:text-muted-foreground"
                            {...listeners}
                        >
                            <GripVertical className="h-4 w-4" />
                        </button>
                        <div className="flex-1 space-y-2">
                            <p className="text-sm font-medium">{item.content}</p>
                            {item.paper && (
                                <div className="flex flex-wrap gap-1">
                                    {item.paper.authors?.slice(0, 2).map((author, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {author.name}
                                        </Badge>
                                    ))}
                                    {item.paper.authors?.length > 2 && (
                                        <Badge variant="secondary" className="text-xs">
                                            +{item.paper.authors.length - 2} more
                                        </Badge>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {item.paper?.year && (
                                    <span>{item.paper.year}</span>
                                )}
                                {item.paper?.citationCount !== undefined && (
                                    <>
                                        <span>•</span>
                                        <span>{item.paper.citationCount} citations</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default KanbanItem; 