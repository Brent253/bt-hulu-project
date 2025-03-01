import { fetchHubData, fetchCollectionData, moveRight, moveLeft } from '../main';
import { describe, it, expect, vi, Mock, beforeEach, afterEach } from 'vitest';


beforeEach(() => {
    // Create a mock DOM element for #app
    const appElement = document.createElement('div');
    appElement.id = 'app';
    document.body.appendChild(appElement);
  });
  
  afterEach(() => {
    // Clean up the mock DOM
    const appElement = document.querySelector('#app');
    if (appElement) {
      appElement.remove();
    }
    vi.clearAllMocks(); // Clear any mocks between tests
  });
  
  
  describe('fetchHubData', () => {
    beforeEach(() => {
      global.fetch = vi.fn(); // Mock global.fetch before each test
    //   vi.spyOn(global, 'fetch');
    });
  
    afterEach(() => {
      vi.resetAllMocks(); // Reset all mocks after each test
    });
  
    it('should fetch and render hub data successfully', async () => {
      // Mocking successful fetch response
      const mockData = { components: [{ name: 'Hub Data', items: [] }] }; // Assuming the structure of the data
  
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });
  
      // Call your fetchHubData function (which should render the hub data)
      const data = await fetchHubData();
  
      // Check if the data is rendered in the #app element
      expect(global.fetch).toHaveBeenCalledTimes(2); // Ensure fetch was called once
      expect(data).toEqual(mockData); // Ensure the correct data is returned
    });
  
    it('should handle fetch failure and call renderErrorView', async () => {
      // Mocking a failed fetch response
      (global.fetch as Mock).mockRejectedValueOnce(new Error('Failed to fetch data'));
  
      // Call your function which should call renderErrorView on error
      await fetchHubData();
  
      // Check if the error handling part was triggered
      const appElement = document.querySelector('#app');
      expect(appElement?.innerHTML).toContain('Something went wrong while loading the content'); // Error message content
    });
  });
  
  describe('fetchCollectionData', () => {
    beforeEach(() => {
      global.fetch = vi.fn(); // Mock global.fetch before each test
    });
  
    afterEach(() => {
      vi.resetAllMocks(); // Reset all mocks after each test
    });
  
    it('should fetch and return collection data', async () => {
      // Mocking successful fetch response
      const mockData = { items: [{ name: 'Collection Data' }] }; // Assuming the structure of the data
  
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });
  
      // Call your fetchCollectionData function
      const data = await fetchCollectionData('https://example.com/data');
  
      // Check if the data is returned correctly
      expect(global.fetch).toHaveBeenCalledTimes(1); // Ensure fetch was called once
      expect(data).toEqual(mockData); // Ensure the correct data is returned
    });
  
    it('should throw an error on fetch failure', async ({expect}) => {
      // Mocking a failed fetch response
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
      });
  
      // Call your function which should throw an error
      await expect(() => fetchCollectionData('https://example.com/data')).rejects.toThrowError('Failed to fetch collection data');
  
      // Check if fetch was called once
      expect(global.fetch).toHaveBeenCalledTimes(1); // Ensure fetch was called once
    });
  
    it('should throw an error if response is undefined', async ({expect}) => {
      // Mocking an undefined fetch response
      (global.fetch as vi.Mock).mockResolvedValueOnce(undefined);
  
      // Call your function which should throw an error
      await expect(() => fetchCollectionData('https://example.com/data')).rejects.toThrowError('Failed to fetch collection data');
  
      // Check if fetch was called once
      expect(global.fetch).toHaveBeenCalledTimes(1); // Ensure fetch was called once
    });
  
    it('should handle unhandled rejection', async ({expect}) => {
      // Mocking a failed fetch response
      (global.fetch as vi.Mock).mockRejectedValueOnce(new Error('Network Error'));
  
      // Call your function which should throw an error
      await expect(() => fetchCollectionData('https://example.com/data')).rejects.toThrowError('Network Error');
  
      // Check if fetch was called once
      expect(global.fetch).toHaveBeenCalledTimes(1); // Ensure fetch was called once
    });
  });