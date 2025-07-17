import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Text,
  Spinner,
  Tag,
  Flex,
  Badge,
  Button,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { FiUser, FiCalendar, FiEdit2, FiTrash2 } from "react-icons/fi";
import CreateTaskModal from "../../components/Admin/CreateTaskModal";

const statusColors = {
  todo: "gray",
  "in progress": "blue",
  done: "green",
};
const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [refreshKey, setRefreshKey] = useState(0);
  const toast = useToast();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (taskId) => {
    setDeletingId(taskId);
    try {
      await api.delete(`/tasks/${taskId}`);
      toast({
        title: "Task deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setRefreshKey((prev) => prev + 1); // Refresh the task list
    } catch (error) {
      toast({
        title: "Failed to delete task",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks/assigned");
        setTasks(response.data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [refreshKey]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1600px" mx="auto">
      <Flex justify="space-between" align="center" mb={8}>
        <Heading size="xl" fontWeight="600">
          Task Management
        </Heading>
        <Button leftIcon={<FiEdit2 />} colorScheme="blue" onClick={onOpen}>
          Create Task
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
        {tasks.map((task) => (
          <Card
            key={task._id}
            borderLeft="4px"
            borderColor={statusColors[task.status] || "gray.200"}
            boxShadow="md"
            _hover={{
              transform: "translateY(-4px)",
              transition: "transform 0.2s",
            }}
          >
            <CardHeader pb={2}>
              <Flex justify="space-between" align="center">
                <Tag colorScheme={statusColors[task.status]} size="sm">
                  {task.status}
                </Tag>
              </Flex>
              <Heading size="md" mt={3} h={"48px"}>
                {task.title}
              </Heading>
            </CardHeader>

            <CardBody pt={0}>

              <Flex align="center" mb={2}>
                <FiUser color="#718096" />
                <Text ml={2} fontSize="sm">
                  {task.assignedTo?.username || "Unassigned"}
                </Text>
              </Flex>

              <Flex align="center">
                <FiCalendar color="#718096" />
                <Text ml={2} fontSize="sm">
                  Due: {new Date(task.createdAt).toLocaleDateString()}
                </Text>
              </Flex>

              <Flex mt={4} justify="space-between" align="center">
                {task.labels?.length > 0 && (
                  <Flex wrap="wrap" gap={2}>
                    {task.labels.map((label) => (
                      <Badge key={label} colorScheme="purple" variant="subtle">
                        {label}
                      </Badge>
                    ))}
                  </Flex>
                )}
                 <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  leftIcon={<FiTrash2 />}
                  onClick={() => handleDelete(task._id)}
                  isLoading={deletingId === task._id}
                  loadingText="Deleting"
                >
                  Delete
                </Button>
              </Flex>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <CreateTaskModal
        isOpen={isOpen}
        onClose={onClose}
        onTaskCreated={() => setRefreshKey((prev) => prev + 1)}
      />
    </Box>
  );
};

export default Tasks;
