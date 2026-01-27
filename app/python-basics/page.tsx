'use client';

import React from 'react';
import Navigation from '@/components/Navigation';

export default function PythonBasicsPage() {
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <Navigation />
      <div style={{ 
        padding: 'clamp(12px, 4vw, 20px)',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: 'clamp(14px, 2.5vw, 16px)',
        lineHeight: '1.6'
      }}>
        <h1 style={{ 
          color: '#3776ab', 
          borderBottom: '3px solid #ffd43b',
          paddingBottom: '10px',
          fontSize: 'clamp(24px, 5vw, 36px)',
          marginBottom: 'clamp(20px, 4vw, 30px)',
          fontWeight: 700
        }}>
          Python Basics for Cool Kids!
        </h1>
        
        <section style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
          <h2 style={{ 
            color: '#4b8bbe',
            fontSize: 'clamp(18px, 4vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            fontWeight: 600
          }}>What is Coding? (The Super Simple Explanation) 💡</h2>
          <p>
            Imagine you have a super smart robot friend, but it only speaks a special language. Coding is like learning that language so you can tell your robot friend what to do!
          </p>
          <p>
            <strong>Think of it this way:</strong>
          </p>
          <ul style={{ 
            lineHeight: '1.8', 
            backgroundColor: '#f0f8ff', 
            padding: 'clamp(12px, 3vw, 20px)', 
            borderRadius: '10px',
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}>
            <li>📝 <strong>Writing code</strong> = Writing instructions for the computer</li>
            <li>🤖 <strong>The computer</strong> = Your robot friend who follows instructions</li>
            <li>✅ <strong>Running code</strong> = The computer reading and doing what you told it</li>
            <li>🎮 <strong>Programming</strong> = The whole process of telling computers what to do</li>
          </ul>
          <p>
            Just like you follow a recipe to bake cookies, computers follow code to do things like play games, show websites, or solve math problems!
          </p>
        </section>
        
        <section style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
          <h2 style={{ 
            color: '#4b8bbe',
            fontSize: 'clamp(18px, 4vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            fontWeight: 600
          }}>What is Python? 🐍</h2>
          <p>
            Python is a super friendly computer language that helps you tell computers what to do!
            It's named after the funny British comedy group "Monty Python," not the snake. 
            But we use the snake as its symbol because it's cool!
          </p>
          <div style={{ 
            backgroundColor: '#f0f8ff', 
            padding: 'clamp(12px, 3vw, 15px)', 
            borderRadius: '10px',
            border: '1px solid #ccc',
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}>
            <p><strong>Fun Fact:</strong> Python was created by Guido van Rossum in 1991. That's probably before you were born!</p>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#4b8bbe' }}>Why Learn Python? 🚀</h2>
          <ul style={{ lineHeight: '1.6' }}>
            <li>It's easy to read and write - almost like English!</li>
            <li>You can make games, websites, robots, and more!</li>
            <li>It's used by NASA, Google, YouTube, and even in movies like Star Wars!</li>
            <li>It's great for beginners but also powerful enough for experts</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#4b8bbe' }}>How Do I Write Python Code? 🖥️</h2>
          <p>
            <strong>Good news!</strong> You don't need to install anything special to start learning Python here in CodeKingdom! 
            You can practice right in our games and see your code work immediately.
          </p>
          <div style={{ 
            backgroundColor: '#fff9e6', 
            padding: '15px', 
            borderRadius: '10px',
            border: '2px solid #ffd43b',
            marginTop: '15px'
          }}>
            <p><strong>💡 Where to Practice:</strong></p>
            <ul style={{ lineHeight: '1.8' }}>
              <li>🎮 <strong>Story Adventure Game:</strong> Write Python code to move your character and solve puzzles!</li>
              <li>📝 <strong>Code Editor:</strong> Type your code in the editor, then click "Run Code" to see what happens</li>
              <li>✅ <strong>See Results:</strong> Watch your character move, collect items, and complete quests based on your code!</li>
            </ul>
            <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
              It's like having a magic notebook where whatever you write comes to life!
            </p>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#4b8bbe' }}>Understanding Code Like a Recipe 📖</h2>
          <p>
            Code is like a recipe, but for computers! Let's break down what makes code work:
          </p>
          <div style={{ 
            backgroundColor: '#f0f8ff', 
            padding: '20px', 
            borderRadius: '10px',
            border: '1px solid #4b8bbe'
          }}>
            <h3 style={{ color: '#5a9fd4', marginTop: '0' }}>1. Instructions (Lines of Code)</h3>
            <p>
              Each line of code is like one step in a recipe. The computer reads them one by one, from top to bottom.
            </p>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginTop: '10px'
            }}>
              print("Step 1: Say hello")<br/>
              print("Step 2: Count to 3")<br/>
              print("Step 3: Done!")
            </div>
            
            <h3 style={{ color: '#5a9fd4', marginTop: '20px' }}>2. Commands (Functions)</h3>
            <p>
              Commands are special words that tell the computer to do something specific. <code>print()</code> is a command that makes the computer show text on the screen.
            </p>
            
            <h3 style={{ color: '#5a9fd4', marginTop: '20px' }}>3. Data (Information)</h3>
            <p>
              Data is the information your code works with - like numbers, words, or lists. Think of it as the ingredients in your recipe!
            </p>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#4b8bbe' }}>Your Very First Python Program! 🎉</h2>
          <p>
            Let's write your first program! This is like saying "Hello!" to the computer world.
          </p>
          <div style={{ 
            backgroundColor: '#2b2b2b', 
            color: '#ffffff',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '16px',
            marginBottom: '10px'
          }}>
            print("Hello, World!")
          </div>
          <p><strong>What this does:</strong> The computer reads this line and shows "Hello, World!" on the screen.</p>
          <p><strong>Try it:</strong> Copy this code into the Story Adventure game's code editor and click "Run Code"!</p>
          <div style={{ 
            backgroundColor: '#e6f7ff', 
            padding: '15px', 
            borderRadius: '10px',
            border: '2px dashed #4b8bbe',
            marginTop: '15px'
          }}>
            <p><strong>🎯 Your Mission:</strong> Try changing "Hello, World!" to your own message, like "Hello, I'm learning Python!"</p>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#4b8bbe' }}>Let's Start Coding! 💻</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#5a9fd4' }}>Printing Messages</h3>
            <p>
              <strong>What is print()?</strong> It's like telling the computer to write something on the screen. 
              Think of it as a magic pen that writes whatever you tell it!
            </p>
            <p>
              To make Python say something, we use <code style={{ backgroundColor: '#f0f0f0', padding: '2px 5px', borderRadius: '3px' }}>print()</code>:
            </p>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '16px',
              marginBottom: '10px'
            }}>
              print("Hello, Python adventurer!")
            </div>
            <p><strong>Output:</strong> <span style={{ fontFamily: 'monospace' }}>Hello, Python adventurer!</span></p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#5a9fd4' }}>Variables - Storing Information</h3>
            <p>
              <strong>What is a variable?</strong> Think of a variable like a labeled box where you can store something. 
              You give the box a name (like "player_name") and put something inside it (like "Alex").
            </p>
            <p>
              Variables are like magic boxes that hold information for later:
            </p>
            <div style={{ 
              backgroundColor: '#fff9e6', 
              padding: '15px', 
              borderRadius: '10px',
              border: '1px solid #ffd43b',
              marginBottom: '10px'
            }}>
              <p><strong>Real Life Example:</strong></p>
              <p>Imagine you have a box labeled "My Favorite Color". You put "Blue" inside it. Later, whenever you want to know your favorite color, you just look in that box!</p>
              <p>In Python, it works the same way:</p>
            </div>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '16px',
              marginBottom: '10px'
            }}>
              player_name = "Alex"<br/>
              player_level = 5<br/>
              print("Welcome", player_name + "! You are at level", player_level)
            </div>
            <p><strong>Output:</strong> <span style={{ fontFamily: 'monospace' }}>Welcome Alex! You are at level 5</span></p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#5a9fd4' }}>Math in Python</h3>
            <p>
              Python is great at math! You can add, subtract, multiply and divide:
            </p>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '16px',
              marginBottom: '10px'
            }}>
              # Adding<br/>
              print(5 + 3)  # 8<br/>
              <br/>
              # Subtracting<br/>
              print(10 - 4)  # 6<br/>
              <br/>
              # Multiplying<br/>
              print(3 * 4)  # 12<br/>
              <br/>
              # Dividing<br/>
              print(20 / 5)  # 4.0
            </div>
            <p><strong>Note:</strong> <span style={{ fontFamily: 'monospace' }}>#</span> is used for comments - notes that Python ignores!</p>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#4b8bbe' }}>Making Decisions with If-Else 🤔</h2>
          <p>
            Python can make decisions based on conditions:
          </p>
          <div style={{ 
            backgroundColor: '#2b2b2b', 
            color: '#ffffff',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '16px',
            marginBottom: '10px'
          }}>
            player_health = 50<br/>
            <br/>
            if player_health &gt; 80:<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;print("You're doing great!")<br/>
            elif player_health &gt; 30:<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;print("Be careful, health getting low!")<br/>
            else:<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;print("Warning! Find health potion quickly!")
          </div>
          <p><strong>Output:</strong> <span style={{ fontFamily: 'monospace' }}>Be careful, health getting low!</span></p>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#4b8bbe' }}>Loops - Doing Things Over and Over 🔄</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#5a9fd4' }}>For Loops</h3>
            <p>
              When you want to do something multiple times:
            </p>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '16px',
              marginBottom: '10px'
            }}>
              # Count from 1 to 5<br/>
              for number in range(1, 6):<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;print("Count:", number)
            </div>
            <p><strong>Output:</strong></p>
            <pre style={{ fontFamily: 'monospace', margin: '0' }}>
              Count: 1<br/>
              Count: 2<br/>
              Count: 3<br/>
              Count: 4<br/>
              Count: 5
            </pre>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#5a9fd4' }}>While Loops</h3>
            <p>
              Keep doing something while a condition is true:
            </p>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '16px',
              marginBottom: '10px'
            }}>
              health = 100<br/>
              while health &gt; 0:<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;print("Still playing! Health:", health)<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;health = health - 20<br/>
              <br/>
              print("Game over!")
            </div>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#4b8bbe' }}>Lists - Storing Multiple Things 📋</h2>
          <p>
            Lists are like treasure chests that can hold many items:
          </p>
          <div style={{ 
            backgroundColor: '#2b2b2b', 
            color: '#ffffff',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '16px',
            marginBottom: '10px'
          }}>
            # Creating a list<br/>
            inventory = ["sword", "shield", "potion", "map"]<br/>
            <br/>
            # Getting items from the list<br/>
            print("First item:", inventory[0])  # sword<br/>
            print("Last item:", inventory[3])  # map<br/>
            <br/>
            # Adding to the list<br/>
            inventory.append("key")<br/>
            print("Updated inventory:", inventory)
          </div>
          <p><strong>Output:</strong></p>
          <pre style={{ fontFamily: 'monospace', margin: '0' }}>
            First item: sword<br/>
            Last item: map<br/>
            Updated inventory: ['sword', 'shield', 'potion', 'map', 'key']
          </pre>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#4b8bbe' }}>Functions - Creating Your Own Commands 🧙‍♂️</h2>
          <p>
            Functions are like your own magic spells that you can use over and over:
          </p>
          <div style={{ 
            backgroundColor: '#2b2b2b', 
            color: '#ffffff',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '16px',
            marginBottom: '10px'
          }}>
            # Creating a function<br/>
            def greet_player(name):<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;return "Welcome to the adventure, " + name + "!"<br/>
            <br/>
            # Using the function<br/>
            message = greet_player("Alex")<br/>
            print(message)<br/>
            <br/>
            # Another function<br/>
            def calculate_damage(power, multiplier):<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;return power * multiplier<br/>
            <br/>
            attack_power = calculate_damage(10, 1.5)<br/>
            print("You deal", attack_power, "damage!")
          </div>
          <p><strong>Output:</strong></p>
          <pre style={{ fontFamily: 'monospace', margin: '0' }}>
            Welcome to the adventure, Alex!<br/>
            You deal 15.0 damage!
          </pre>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#4b8bbe' }}>Fun Python Projects for Kids 🎮</h2>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>Number Guessing Game:</strong> Make a game where the computer picks a random number and you have to guess it!</li>
            <li><strong>Adventure Text Game:</strong> Create a story where the player makes choices that change the ending</li>
            <li><strong>Drawing with Turtle:</strong> Python has a module called Turtle that lets you draw cool pictures</li>
            <li><strong>Simple Calculator:</strong> Build a program that can add, subtract, multiply and divide</li>
            <li><strong>Hangman Game:</strong> Create the classic word-guessing game</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#4b8bbe' }}>Common Beginner Mistakes (And How to Avoid Them!) ⚠️</h2>
          <div style={{ 
            backgroundColor: '#fff5f5', 
            padding: '20px', 
            borderRadius: '10px',
            border: '2px solid #ff6b6b'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: '#c0392b' }}>❌ Mistake 1: Forgetting Quotes</h3>
              <p><strong>Wrong:</strong> <code style={{ backgroundColor: '#fee', padding: '2px 5px' }}>print(Hello)</code></p>
              <p><strong>Right:</strong> <code style={{ backgroundColor: '#efe', padding: '2px 5px' }}>print("Hello")</code></p>
              <p><em>Text needs to be in quotes, like putting it in a speech bubble!</em></p>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: '#c0392b' }}>❌ Mistake 2: Wrong Indentation (Spacing)</h3>
              <p><strong>Wrong:</strong></p>
              <div style={{ backgroundColor: '#fee', padding: '10px', borderRadius: '5px', fontFamily: 'monospace', fontSize: '14px' }}>
                if health &gt; 50:<br/>
                print("You're healthy!")  {/* Missing spaces! */}
              </div>
              <p><strong>Right:</strong></p>
              <div style={{ backgroundColor: '#efe', padding: '10px', borderRadius: '5px', fontFamily: 'monospace', fontSize: '14px' }}>
                if health &gt; 50:<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;print("You're healthy!")  {/* Has 4 spaces! */}
              </div>
              <p><em>Python cares about spaces! Lines inside if/else need to be indented (moved to the right).</em></p>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: '#c0392b' }}>❌ Mistake 3: Forgetting Parentheses</h3>
              <p><strong>Wrong:</strong> <code style={{ backgroundColor: '#fee', padding: '2px 5px' }}>print "Hello"</code></p>
              <p><strong>Right:</strong> <code style={{ backgroundColor: '#efe', padding: '2px 5px' }}>print("Hello")</code></p>
              <p><em>Commands need parentheses () - think of them as the command's "action bubble"!</em></p>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: '#c0392b' }}>❌ Mistake 4: Using Wrong Capital Letters</h3>
              <p><strong>Wrong:</strong> <code style={{ backgroundColor: '#fee', padding: '2px 5px' }}>Print("Hello")</code></p>
              <p><strong>Right:</strong> <code style={{ backgroundColor: '#efe', padding: '2px 5px' }}>print("Hello")</code></p>
              <p><em>Python is picky about capital letters! "print" is different from "Print".</em></p>
            </div>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#4b8bbe' }}>How to Think Like a Programmer 🧠</h2>
          <p>
            Programming isn't just about typing code - it's about solving problems step by step!
          </p>
          <div style={{ 
            backgroundColor: '#f0f8ff', 
            padding: '20px', 
            borderRadius: '10px',
            border: '1px solid #4b8bbe'
          }}>
            <h3 style={{ color: '#5a9fd4' }}>The Problem-Solving Process:</h3>
            <ol style={{ lineHeight: '2' }}>
              <li><strong>Understand the Problem:</strong> What do you want the computer to do?</li>
              <li><strong>Break It Down:</strong> Split big problems into small steps (like a recipe!)</li>
              <li><strong>Write the Code:</strong> Turn each step into Python code</li>
              <li><strong>Test It:</strong> Run your code and see if it works</li>
              <li><strong>Fix Mistakes:</strong> If something's wrong, figure out why and fix it</li>
              <li><strong>Try Again:</strong> Keep practicing and improving!</li>
            </ol>
            <p style={{ marginTop: '15px', fontStyle: 'italic' }}>
              💡 <strong>Remember:</strong> Even professional programmers make mistakes! The key is to keep trying and learning.
            </p>
          </div>
        </section>
        
        <div style={{ 
          backgroundColor: '#e6f7ff', 
          padding: '20px', 
          borderRadius: '10px',
          marginTop: '40px',
          border: '2px dashed #4b8bbe'
        }}>
          <h2 style={{ color: '#4b8bbe', marginTop: '0' }}>Remember! 🌟</h2>
          <ul style={{ lineHeight: '1.8' }}>
            <li>✅ <strong>Indentation matters!</strong> Spaces at the beginning of lines are important in Python - they're like paragraph indents in writing!</li>
            <li>✅ <strong>Python is case-sensitive:</strong> <code>name</code> and <code>Name</code> are different variables (like "cat" vs "Cat")</li>
            <li>✅ <strong>Mistakes are okay!</strong> Every programmer makes errors - that's how you learn!</li>
            <li>✅ <strong>Start simple:</strong> Begin with easy programs, then make them more complex</li>
            <li>✅ <strong>Practice makes perfect:</strong> The more you code, the better you'll get!</li>
            <li>✅ <strong>Have fun!</strong> Programming is creative - experiment and see what you can create!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
