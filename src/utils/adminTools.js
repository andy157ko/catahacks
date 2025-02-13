// Production version - no actual admin functionality
export const generateAuthCode = () => {
  console.warn('Admin tools are not available in production');
  return null;
};

// Export any other functions that your code expects, but as no-op versions
export default {
  generateAuthCode,
  // Add other functions as needed
}; 