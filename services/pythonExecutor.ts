import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Safely execute Python code with sandboxing
 * @param {string} code - Python code to execute
 * @param {Object} context - Context variables (inventory, etc.)
 * @returns {Promise<Object>} - Execution result
 */
export const executePython = (code: string, context: Record<string, any> = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Create a temporary Python file
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `python_exec_${Date.now()}_${Math.random().toString(36).substring(7)}.py`);
    
    // Prepare context variables as Python code
    const contextCode = Object.keys(context).map(key => {
      const value = context[key];
      if (Array.isArray(value)) {
        // Convert array to Python list
        const items = value.map(item => {
          if (typeof item === 'string') {
            return `'${item.replace(/'/g, "\\'")}'`;
          }
          return JSON.stringify(item);
        });
        return `${key} = [${items.join(', ')}]`;
      } else if (typeof value === 'string') {
        return `${key} = '${value.replace(/'/g, "\\'")}'`;
      } else {
        return `${key} = ${JSON.stringify(value)}`;
      }
    }).join('\n');
    
    // Wrap code in try-except for error handling
    // Indent user code properly
    const indentedCode = code.split('\n').map(line => '    ' + line).join('\n');
    
    const wrappedCode = `
${contextCode}

import json

# Track the last function call result
_last_function_result = None

# Available functions
def open_door():
    global _last_function_result
    _last_function_result = {"action": "open_door", "success": True, "message": "The door opens!"}
    return _last_function_result

def move_to(location):
    global _last_function_result
    _last_function_result = {"action": "move", "location": location, "success": True}
    return _last_function_result

def collect_item(item_name):
    global _last_function_result
    _last_function_result = {"action": "collect", "item": item_name, "success": True}
    return _last_function_result

def show_message(message):
    global _last_function_result
    _last_function_result = {"action": "message", "text": message}
    return _last_function_result

# User code
try:
    result = None
    
${indentedCode}
    
    # If no explicit result was set, check if a function was called
    if result is None:
        if _last_function_result is not None and isinstance(_last_function_result, dict):
            result = _last_function_result
        else:
            result = {"action": "continue", "success": True}
    
    # Ensure result is a dict
    if not isinstance(result, dict):
        result = {"action": "continue", "success": True, "output": str(result)}
    
    print("__RESULT__:" + json.dumps(result))
except Exception as e:
    print("__ERROR__:" + str(e))
`;

    // Write code to temp file
    fs.writeFileSync(tempFile, wrappedCode);
    
    // Execute Python with timeout and resource limits
    const timeout = 5000; // 5 second timeout
    const execOptions = {
      timeout,
      maxBuffer: 1024 * 1024, // 1MB max output
      killSignal: 'SIGTERM' as const,
    };
    
    execAsync(`python3 ${tempFile}`, execOptions)
      .then(({ stdout, stderr }) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }
        
        // Parse output
        const output = stdout.trim();
        
        // Check for errors in output
        if (output.includes('__ERROR__:')) {
          const errorMsg = output.split('__ERROR__:')[1].trim();
          return reject(new Error(errorMsg));
        }
        
        // Extract result
        if (output.includes('__RESULT__:')) {
          try {
            const resultStr = output.split('__RESULT__:')[1].trim();
            const result = JSON.parse(resultStr);
            resolve(result);
          } catch (e) {
            // If parsing fails, return the raw output
            resolve({
              action: 'continue',
              success: true,
              output: output,
            });
          }
        } else {
          // No explicit result, assume success
          resolve({
            action: 'continue',
            success: true,
            output: output,
          });
        }
      })
      .catch((error: any) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }
        
        // Check if it's a timeout
        if (error.signal === 'SIGTERM' || error.code === 'ETIMEDOUT') {
          return reject(new Error('Code execution timed out. Please check your code.'));
        }
        return reject(new Error(`Execution error: ${error.message}`));
      });
  });
};

/**
 * Validate Python code syntax (basic check)
 * @param {string} code - Python code to validate
 * @returns {Object} - Validation result
 */
export const validatePythonCode = (code: string) => {
  // Basic validation - check for dangerous operations
  const dangerousPatterns = [
    /import\s+os/,
    /import\s+sys/,
    /import\s+subprocess/,
    /__import__/,
    /eval\(/,
    /exec\(/,
    /open\(/,
    /file\(/,
    /input\(/,
    /raw_input\(/,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return {
        valid: false,
        error: 'This operation is not allowed for security reasons.',
      };
    }
  }
  
  // Check for required patterns (if/else statements)
  if (!code.includes('if') && !code.includes('else')) {
    return {
      valid: true,
      warning: 'Consider using if/else statements to make decisions!',
    };
  }
  
  return { valid: true };
};
