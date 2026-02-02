// Demo user hook - provides a mock user for demo purposes without authentication
export const DEMO_USER = {
  id: 'demo-user-001',
  email: 'rajesh.kumar@acedemo.com',
  name: 'Rajesh Kumar',
  phone: '+91 98765 43210',
  location: 'Delhi NCR',
  role: 'equipment_owner',
};

export function useDemoUser() {
  return {
    user: DEMO_USER,
    isAuthenticated: true,
    isLoading: false,
  };
}
