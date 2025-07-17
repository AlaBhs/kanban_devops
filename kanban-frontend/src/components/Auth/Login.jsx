import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Flex,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../utils/api";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth(); // Now using memoized login

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/users/login", formData);
      const { token, user } = response.data;

      login(user, token); // This won't trigger unnecessary re-renders

      navigate(user.role === "admin" ? "/admin" : "/worker");

      toast({
        title: "Login successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // ... error handling ...
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Flex
      minH="100vh"
      minW={"100vw"}
      align="center"
      justify="center"
      bg="gray.50"
    >
      <Box
        p={8}
        maxWidth="500px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
      >
        <Heading mb={6} size="lg">
          Task Manager Login
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={isLoading}
              loadingText="Logging in..."
            >
              Login
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default Login;
