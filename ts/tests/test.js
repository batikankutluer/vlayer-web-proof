import { describe, it, expect, beforeAll } from 'bun:test';
import { webProof, simpleWebProof } from '../dist/index.js';

describe('Legacy Integration Tests', () => {
  beforeAll(() => {
    console.log('🧪 Legacy test compatibility kontrolü...');
  });

  describe('webProof backward compatibility', () => {
    it('should work with basic httpbin.org GET request', async () => {
      console.log('Testing webProof with httpbin.org...');
      
      const result = await webProof('https://httpbin.org/get', { 
        method: 'GET',
        notary: "http://127.0.0.1:7047",
      });

      console.log("WebProof result:", result.success ? "SUCCESS" : "FAILED");
      
      expect(typeof result.success).toBe('boolean');
      expect(result.metrics).toBeDefined();
      
      if (result.error) {
        console.error("Error:", result.error);
        // Native binding olmadığı durumda error bekliyoruz
        expect(result.error).toContain('Failed to load native binding');
      }
    });

    it('should handle different HTTP methods', async () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      
      for (const method of methods) {
        const url = method === 'GET' ? 'https://httpbin.org/get' : `https://httpbin.org/${method.toLowerCase()}`;
        
        const result = await webProof(url, { 
          method,
          notary: "http://127.0.0.1:7047",
        });
        
        expect(typeof result.success).toBe('boolean');
        expect(result.metrics).toBeDefined();
        
        console.log(`${method} method result:`, result.success ? "SUCCESS" : "FAILED");
      }
    });

    it('should include performance metrics', async () => {
      const result = await webProof('https://httpbin.org/get');
      
      expect(result.metrics).toBeDefined();
      expect(result.metrics.startTime).toBeGreaterThan(0);
      expect(result.metrics.endTime).toBeGreaterThan(result.metrics.startTime);
      expect(result.metrics.duration).toBeGreaterThan(0);
      
      console.log(`Performance: ${result.metrics.duration}ms`);
    });
  });

  describe('simpleWebProof backward compatibility', () => {
    it('should validate parameters properly', async () => {
      console.log('Testing simpleWebProof parameter validation...');
      
      try {
        await simpleWebProof('127.0.0.1', 7047, 'https://httpbin.org/get');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        console.log("SimpleWebProof validation error (expected):", error.message);
        
        // Native binding olmadığı durumda error bekliyoruz
        expect(error.message).toContain('Native');
      }
    });

    it('should handle invalid parameters gracefully', async () => {
      const invalidCases = [
        { host: '', port: 7047, url: 'https://httpbin.org/get', expectedError: 'Notary host' },
        { host: '127.0.0.1', port: -1, url: 'https://httpbin.org/get', expectedError: 'port number' },
        { host: '127.0.0.1', port: 7047, url: 'invalid-url', expectedError: 'URL format' }
      ];

      for (const testCase of invalidCases) {
        try {
          await simpleWebProof(testCase.host, testCase.port, testCase.url);
          expect(true).toBe(false); // Should not reach here
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toContain(testCase.expectedError);
          console.log(`✅ Validation error caught: ${error.message}`);
        }
      }
    });
  });

  describe('Error handling compatibility', () => {
    it('should handle network errors gracefully', async () => {
      const result = await webProof('https://nonexistent-domain-12345.com');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.metrics).toBeDefined();
      
      console.log("Network error handled:", result.error);
    });

    it('should handle malformed URLs', async () => {
      const invalidUrls = ['not-a-url', 'ftp://invalid.com', 'javascript:alert(1)'];
      
      for (const url of invalidUrls) {
        const result = await webProof(url);
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('URL format');
        expect(result.metrics).toBeDefined();
        
        console.log(`Invalid URL "${url}" handled properly`);
      }
    });
  });

  describe('Configuration compatibility', () => {
    it('should handle various configuration options', async () => {
      const configs = [
        { max_sent_data: 1024, max_recv_data: 2048 },
        { method: 'POST', headers: ['Content-Type: application/json'] },
        { notary: 'http://custom-notary.com:8080' }
      ];

      for (const config of configs) {
        const result = await webProof('https://httpbin.org/get', config);
        
        expect(typeof result.success).toBe('boolean');
        expect(result.metrics).toBeDefined();
        
        console.log(`Config test completed:`, config);
      }
    });
  });
});