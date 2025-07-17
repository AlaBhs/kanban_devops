import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Select,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import api from "../../utils/api";

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    assignedTo: "",
  });
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchWorkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchWorkers = async () => {
    setLoadingWorkers(true);
    try {
      const response = await api.get("/users/my-workers");
      setWorkers(response.data);
    } catch (error) {
      toast({
        title: "Failed to load workers",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingWorkers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/tasks", formData);
      toast({
        title: "Task created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      onTaskCreated();
    } catch (error) {
      toast({
        title: "Error creating task",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Task</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mb={4}>
            <FormLabel>Title</FormLabel>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Task title"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Assign To</FormLabel>
            {loadingWorkers ? (
              <Spinner size="sm" />
            ) : (
              <Select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                placeholder="Select worker"
              >
                {workers.map((worker) => (
                  <option key={worker._id} value={worker._id}>
                    {worker.username}
                  </option>
                ))}
              </Select>
            )}
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
            Create Task
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateTaskModal;
