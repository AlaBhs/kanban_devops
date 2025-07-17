import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, FormControl,
  FormLabel, Input, Button, useToast, 
} from '@chakra-ui/react';
import { useState } from 'react';
import api from '../../utils/api';

const CreateWorkerModal = ({ isOpen, onClose, onWorkerCreated }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/users/create-worker', formData);
      toast({
        title: 'Worker created',
        description: `${formData.username} has been added to your team`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setFormData({ username: '', password: '' });
      onWorkerCreated();
    } catch (error) {
      toast({
        title: 'Failed to create worker',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Worker</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mb={4} isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="worker5"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!formData.username || formData.password.length < 6}
          >
            Create Worker
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateWorkerModal;