import { 
  Box, Heading, Button, Table, Thead, Tbody, Tr, Th, Td, 
  Avatar, Badge, useDisclosure, Spinner, Flex, useToast,
  Tag, Icon, Text
} from '@chakra-ui/react';
import { FiUsers, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import CreateWorkerModal from '../../components/Admin/CreateWorkerModal';

const DisplayWorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/my-workers');
      setWorkers(response.data);
    } catch (error) {
      toast({
        title: 'Failed to load team',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workerId) => {
    setDeletingId(workerId);
    try {
      await api.delete(`/users/${workerId}`);
      toast({
        title: 'Worker removed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchWorkers();
    } catch (error) {
      toast({
        title: 'Failed to remove worker',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchWorkers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box p={8}>
      <Flex justify="space-between" align="center" mb={8}>
        <Flex align="center">
          <Icon as={FiUsers} boxSize={6} mr={3} color="blue.500" />
          <Heading size="xl">Team Management</Heading>
        </Flex>
        <Button 
          leftIcon={<FiPlus />} 
          colorScheme="blue"
          onClick={onOpen}
        >
          Add Worker
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" mt={12}>
          <Spinner size="xl" thickness="4px" />
        </Flex>
      ) : (
        <Box 
          borderWidth="1px" 
          borderRadius="lg" 
          overflow="hidden"
          boxShadow="sm"
        >
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Worker</Th>
                <Th>Username</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {workers.map(worker => (
                <Tr key={worker._id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <Flex align="center">
                      <Avatar 
                        name={worker.username} 
                        size="sm" 
                        mr={3} 
                        bg="blue.500" 
                        color="white" 
                      />
                      <Text fontWeight="medium">Worker #{worker.username.slice(-1)}</Text>
                    </Flex>
                  </Td>
                  <Td>
                    <Tag colorScheme="blue">{worker.username}</Tag>
                  </Td>
                  <Td>
                    <Badge colorScheme="green" px={2} py={1} borderRadius="full">
                      Active
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      isLoading={deletingId === worker._id}
                      onClick={() => handleDelete(worker._id)}
                    >
                      <FiTrash2 />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <CreateWorkerModal 
        isOpen={isOpen} 
        onClose={onClose} 
        onWorkerCreated={fetchWorkers} 
      />
    </Box>
  );
};

export default DisplayWorkersPage;