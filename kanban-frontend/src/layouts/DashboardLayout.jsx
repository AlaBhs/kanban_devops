import { Flex, Box, Heading, Spacer, Avatar, Menu, MenuButton, MenuList, MenuItem, Button, useColorModeValue, IconButton, Text } from '@chakra-ui/react';
import { FiLogOut, FiUser, FiHome, FiSettings, FiList, FiUsers, FiMenu } from 'react-icons/fi';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';


const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Flex minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Sidebar */}
      <Box 
        w="250px" 
        bg={bg}
        borderRight="1px" 
        borderColor={borderColor}
        p={4}
        display={{ base: 'none', md: 'block' }}
      >
        <Heading size="lg" mb={8} px={2} color="blue.600">
          TaskFlow
        </Heading>
        
        <Flex direction="column" gap={2}>
          <Button 
            as={Link}
            to={user?.role === 'admin' ? '/admin' : '/worker'}
            leftIcon={<FiHome />}
            justifyContent="flex-start"
            variant="ghost"
          >
            Dashboard
          </Button>
          
          <Button 
            as={Link}
            to={user?.role === 'admin' ? '/admin/tasks' : '/worker/tasks'}
            leftIcon={<FiList />}
            justifyContent="flex-start"
            variant="ghost"
          >
            My Tasks
          </Button>
          
          {user?.role === 'admin' && (
            <Button 
              as={Link}
              to="/admin/team"
              leftIcon={<FiUsers />}
              justifyContent="flex-start"
              variant="ghost"
            >
              Team Management
            </Button>
          )}
          
          <Button 
            leftIcon={<FiSettings />}
            justifyContent="flex-start"
            variant="ghost"
            mt={8}
          >
            Settings
          </Button>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box flex={1} overflow="auto">
        {/* Top Navigation */}
        <Flex 
          p={4} 
          bg={bg}
          borderBottom="1px"
          borderColor={borderColor}
          align="center"
        >
          <Box display={{ base: 'block', md: 'none' }}>
            <IconButton icon={<FiMenu />} variant="ghost" />
          </Box>
          
          <Spacer />
          
          <Menu>
            <MenuButton as={Button} variant="ghost">
              <Flex align="center">
                <Avatar size="sm" name={user?.username} mr={2} />
                <Box textAlign="left">
                  <Text fontWeight="medium">{user?.username}</Text>
                  <Text fontSize="sm" color="gray.500">{user?.role}</Text>
                </Box>
              </Flex>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiUser />}>Profile</MenuItem>
              <MenuItem icon={<FiSettings />}>Settings</MenuItem>
              <MenuItem icon={<FiLogOut />} onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        {/* Page Content */}
        <Box p={{ base: 4, md: 8 }} maxW="1600px" mx="auto">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default DashboardLayout;