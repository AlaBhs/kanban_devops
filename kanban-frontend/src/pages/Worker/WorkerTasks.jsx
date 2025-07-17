// src/pages/WorkerTasks.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Text,
  Spinner,
  Flex,
  useToast,
} from "@chakra-ui/react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import api from "../../utils/api";

const columns = {
  todo: { title: "To Do", color: "gray" },
  "in progress": { title: "In Progress", color: "blue" },
  done: { title: "Done", color: "green" },
};

const WorkerTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks"); // or dummy data
      const formatted = res.data.map((t) => ({ ...t, _id: String(t._id) }));
      setTasks(formatted);
    } catch (err) {
      toast({
        title: "Failed to load tasks",
        status: "error",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const groupedTasks = {
    todo: [],
    "in progress": [],
    done: [],
  };
  tasks.forEach((task) => {
    if (groupedTasks[task.status]) groupedTasks[task.status].push(task);
  });

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    const sourceTask = tasks.find((t) => t._id === active.id);
    const targetStatus = over.data.current?.status;

    if (sourceTask && targetStatus && sourceTask.status !== targetStatus) {
      const updated = tasks.map((t) =>
        t._id === active.id ? { ...t, status: targetStatus } : t
      );
      setTasks(updated);

      api.put(`/tasks/${active.id}`, { status: targetStatus }).catch(() => {
        toast({
          title: "Failed to update",
          status: "error",
          isClosable: true,
        });
        setTasks(tasks); // revert
      });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={8}>
      <Heading mb={6}>Your Tasks</Heading>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {Object.entries(columns).map(([status, { title, color }]) => (
            <SortableColumn
              key={status}
              status={status}
              title={title}
              color={color}
              tasks={groupedTasks[status]}
            />
          ))}
        </SimpleGrid>

        <DragOverlay>
          {activeTask && (
            <Card
              p={1}
              shadow="xl"
              borderLeft="4px"
              borderLeftColor="gray.500"
              style={{
                transform: "rotate(5deg)",
              }}
            >
              <CardHeader pb={2}>
                <Heading size="sm">{activeTask.title}</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <Text fontSize="sm">Due: {new Date(activeTask.createdAt).toLocaleDateString()}</Text>
              </CardBody>
            </Card>
          )}
        </DragOverlay>
      </DndContext>
    </Box>
  );
};

const SortableColumn = ({ status, title, color, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  return (
    <Box
      ref={setNodeRef}
      bg={isOver ? `${color}.100` : "gray.50"}
      p={4}
      borderRadius="md"
      minH="250px"
      data-status={status}
      transition="background 0.2s ease"
    >
      <Heading size="md" mb={4} color={`${color}.600`}>
        {title}
      </Heading>

      <SortableContext
        items={tasks.map((t) => t._id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.length === 0 && (
          <Box
            border="2px dashed"
            borderColor="gray.300"
            borderRadius="md"
            p={4}
            textAlign="center"
            color="gray.400"
          >
            Drop tasks here
          </Box>
        )}

        {tasks.map((task) => (
          <SortableTask key={task._id} task={task} color={color} />
        ))}
      </SortableContext>
    </Box>
  );
};

const SortableTask = ({ task, color }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { status: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? -1 : "auto",
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      mb={3}
      variant="outline"
      borderLeft="4px"
      borderLeftColor={`${color}.500`}
    >
      <CardHeader pb={2}>
        <Heading size="sm">{task.title}</Heading>
      </CardHeader>
      <CardBody pt={0}>
        <Text fontSize="sm">Due: {new Date(task.createdAt).toLocaleDateString()}</Text>
      </CardBody>
    </Card>
  );
};

export default WorkerTasks;
