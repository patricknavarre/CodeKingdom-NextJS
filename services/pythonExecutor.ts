/**
 * Get indentation level of a line (number of leading spaces)
 */
const getIndent = (line: string): number => {
  let indent = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === ' ') indent++;
    else if (line[i] === '\t') indent += 4; // Treat tab as 4 spaces
    else break;
  }
  return indent;
};

/**
 * Evaluate a Python-like condition
 */
const evaluateCondition = (condition: string, context: Record<string, any>): boolean => {
  const trimmed = condition.trim();
  
  // Handle: "item" in inventory
  const inMatch = trimmed.match(/["']([\w_]+)["']\s+in\s+inventory/);
  if (inMatch) {
    const item = inMatch[1];
    const inventory = context.inventory || [];
    return inventory.includes(item);
  }
  
  // Handle: current_location == "location_name"
  const locationMatch = trimmed.match(/current_location\s*==\s*["']([\w_]+)["']/);
  if (locationMatch) {
    const location = locationMatch[1];
    return context.currentLocation === location;
  }
  
  // Handle: len(inventory) > 0
  const lenGtMatch = trimmed.match(/len\(inventory\)\s*>\s*(\d+)/);
  if (lenGtMatch) {
    const threshold = parseInt(lenGtMatch[1]);
    const inventory = context.inventory || [];
    return inventory.length > threshold;
  }
  
  // Handle: len(inventory) == 0
  const lenEqMatch = trimmed.match(/len\(inventory\)\s*==\s*(\d+)/);
  if (lenEqMatch) {
    const value = parseInt(lenEqMatch[1]);
    const inventory = context.inventory || [];
    return inventory.length === value;
  }
  
  // Handle: len(inventory) >= X
  const lenGeMatch = trimmed.match(/len\(inventory\)\s*>=\s*(\d+)/);
  if (lenGeMatch) {
    const threshold = parseInt(lenGeMatch[1]);
    const inventory = context.inventory || [];
    return inventory.length >= threshold;
  }
  
  // Default: return false for unknown conditions
  return false;
};

/**
 * Parse and execute a code block (lines with same or greater indentation)
 */
const executeCodeBlock = (
  lines: string[],
  startIndex: number,
  baseIndent: number,
  context: Record<string, any>
): { result: any; nextIndex: number } => {
  const moveRegex = /move_to\(\s*["']([\w_]+)["']\s*\)/;
  const collectRegex = /collect_item\(\s*["']([\w_]+)["']\s*\)/;
  const openDoorRegex = /open_door\(\s*\)/;
  const messageRegex = /show_message\(\s*["']([^"']+)["']\s*\)/;
  const choosePathRegex = /choose_path\(\s*["']([\w_]+)["']\s*\)/;
  
  let result: any = { action: 'continue', success: true };
  let i = startIndex;
  
  while (i < lines.length) {
    const line = lines[i];
    const indent = getIndent(line);
    const trimmed = line.trim();
    
    // If we've gone back to base indent or less, we're done with this block
    if (trimmed && indent <= baseIndent && !trimmed.startsWith('else:')) {
      break;
    }
    
    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }
    
    // Check for function calls
    let match;
    if ((match = trimmed.match(moveRegex))) {
      result = { action: 'move', location: match[1], success: true };
    } else if ((match = trimmed.match(collectRegex))) {
      result = { action: 'collect', item: match[1], success: true };
    } else if (openDoorRegex.test(trimmed)) {
      result = { action: 'open_door', success: true, message: 'The door opens!' };
    } else if ((match = trimmed.match(messageRegex))) {
      result = { action: 'message', text: match[1], success: true };
    }
    
    i++;
  }
  
  return { result, nextIndex: i };
};

/**
 * Execute a very small "Python-like" command language used by the Story Game.
 *
 * Supports if/else statements with proper indentation parsing.
 * @param {string} code - Python code to execute
 * @param {Object} context - Context variables (inventory, currentLocation, etc.)
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
      const choosePathRegex = /choose_path\(\s*["']([\w_]+)["']\s*\)/;

      let i = 0;
      while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Skip empty lines
        if (!trimmed) {
          i++;
          continue;
        }
        
        // Check for if statement
        const ifMatch = trimmed.match(/if\s+(.+?):\s*(.*)/);
        if (ifMatch) {
          const condition = ifMatch[1];
          const sameLineCode = ifMatch[2] || ''; // Code on the same line after the colon
          const conditionResult = evaluateCondition(condition, context);
          const baseIndent = getIndent(line);
          
          if (conditionResult) {
            // Check if there's code on the same line
            if (sameLineCode.trim()) {
              // Execute the code on the same line
              const sameLineTrimmed = sameLineCode.trim();
              let match;
              if ((match = sameLineTrimmed.match(moveRegex))) {
                result = { action: 'move', location: match[1], success: true };
              } else if ((match = sameLineTrimmed.match(collectRegex))) {
                result = { action: 'collect', item: match[1], success: true };
              } else if (openDoorRegex.test(sameLineTrimmed)) {
                result = { action: 'open_door', success: true, message: 'The door opens!' };
              } else if ((match = sameLineTrimmed.match(messageRegex))) {
                result = { action: 'message', text: match[1], success: true };
              } else if ((match = sameLineTrimmed.match(choosePathRegex))) {
                result = { action: 'choose_path', choiceId: match[1], success: true };
              }
              i++; // Move to next line
            } else {
              // Execute if block from next line
              const blockResult = executeCodeBlock(lines, i + 1, baseIndent, context);
              result = blockResult.result;
              i = blockResult.nextIndex;
            }
            
            // Check for else on same indent level
            if (i < lines.length) {
              const nextLine = lines[i];
              const nextTrimmed = nextLine.trim();
              const nextIndent = getIndent(nextLine);
              
              if (nextTrimmed.startsWith('else:') && nextIndent === baseIndent) {
                // Skip else block since if was true
                const elseBlockResult = executeCodeBlock(lines, i + 1, baseIndent, context);
                i = elseBlockResult.nextIndex;
              }
            }
          } else {
            // Skip if block, look for else
            const ifBlockResult = executeCodeBlock(lines, i + 1, baseIndent, context);
            i = ifBlockResult.nextIndex;
            
            // Check for else
            if (i < lines.length) {
              const nextLine = lines[i];
              const nextTrimmed = nextLine.trim();
              const nextIndent = getIndent(nextLine);
              
              if (nextTrimmed.startsWith('else:') && nextIndent === baseIndent) {
                // Execute else block
                const elseBlockResult = executeCodeBlock(lines, i + 1, baseIndent, context);
                result = elseBlockResult.result;
                i = elseBlockResult.nextIndex;
              }
            }
          }
          continue;
        }
        
        // Check for else without if (shouldn't happen, but handle gracefully)
        if (trimmed.startsWith('else:')) {
          i++;
          continue;
        }
        
        // Regular line - execute function calls (backward compatibility)
        let match;
        if ((match = trimmed.match(moveRegex))) {
          result = { action: 'move', location: match[1], success: true };
        } else if ((match = trimmed.match(collectRegex))) {
          result = { action: 'collect', item: match[1], success: true };
        } else if (openDoorRegex.test(trimmed)) {
          result = { action: 'open_door', success: true, message: 'The door opens!' };
        } else if ((match = trimmed.match(messageRegex))) {
          result = { action: 'message', text: match[1], success: true };
        } else if ((match = trimmed.match(choosePathRegex))) {
          result = { action: 'choose_path', choiceId: match[1], success: true };
        }
        
        i++;
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
  
  // Check for spaces in location/item names (should use underscores)
  // Check move_to("location with spaces") or collect_item("item with spaces")
  const spaceInQuotesPattern = /(move_to|collect_item|choose_path)\(["']([^"']*\s[^"']*)["']\)/;
  if (spaceInQuotesPattern.test(code)) {
    return {
      valid: false,
      error: 'Location and item names should use underscores instead of spaces. For example: use "forest_clearing" instead of "forest clearing". This follows Python naming conventions!',
    };
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
