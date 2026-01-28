/**
 * Execute a very small "Python-like" command language used by the Story Game.
 *
 * Instead of running a real Python interpreter (which isn't available in
 * serverless environments like Vercel), we parse the student's code as a
 * string and look for calls to our game functions:
 *   - move_to("location_name")
 *   - collect_item("item_name")
 *   - open_door()
 *   - show_message("some text")
 *
 * We simulate the behaviour of the original Python wrapper by returning
 * the *last* function call found in the code as the result.
 * @param {string} code - Python code to execute
 * @param {Object} context - Context variables (inventory, etc.)
 * @returns {Promise<Object>} - Execution result
 */
export const executePython = (code: string, context: Record<string, any> = {}): Promise<any> => {
  return new Promise((resolve) => {
    try {
      const source = code || '';
      const lines = source.split('\n');

      // Default result if we don't find any commands
      let result: any = { action: 'continue', success: true };

      const moveRegex = /move_to\(\s*["']([\w_]+)["']\s*\)/;
      const collectRegex = /collect_item\(\s*["']([\w_]+)["']\s*\)/;
      const openDoorRegex = /open_door\(\s*\)/;
      const messageRegex = /show_message\(\s*["']([^"']+)["']\s*\)/;

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        let match;
        if ((match = line.match(moveRegex))) {
          result = { action: 'move', location: match[1], success: true };
        } else if ((match = line.match(collectRegex))) {
          result = { action: 'collect', item: match[1], success: true };
        } else if (openDoorRegex.test(line)) {
          result = { action: 'open_door', success: true, message: 'The door opens!' };
        } else if ((match = line.match(messageRegex))) {
          result = { action: 'message', text: match[1], success: true };
        }
      }

      resolve(result);
    } catch (error: any) {
      // If anything unexpected happens, fall back to a friendly error
      resolve({
        action: 'continue',
        success: false,
        output: 'There was a problem reading your code. Please check your syntax and try again.',
      });
    }
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
