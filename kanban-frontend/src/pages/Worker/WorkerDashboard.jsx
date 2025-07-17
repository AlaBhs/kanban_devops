import {
  Box,
  Heading,
  Text,
} from "@chakra-ui/react";


const WorkerDashboard = () => {
  return (
    <Box p={{ base: 4, md: 8 }} maxW="1600px" mx="auto">
      <Heading size="xl" mb={6}>
        Worker Dashboard
      </Heading>
      <Text fontSize="lg" mb={4}>
        Welcome to your dashboard! Here you can view your tasks and manage your
        work.
      </Text>
    </Box>
  );
};

export default WorkerDashboard;
