'use client';

import React from 'react';
import Navigation from '@/components/Navigation';

export default function HtmlCssBasicsPage() {
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <Navigation />
      <div style={{ 
        padding: 'clamp(12px, 4vw, 20px)',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important',
        fontSize: 'clamp(14px, 2.5vw, 16px)',
        lineHeight: '1.6'
      }}>
        <h1 style={{ 
          color: '#e34c26', 
          borderBottom: '3px solid #264de4',
          paddingBottom: '10px',
          fontSize: 'clamp(24px, 5vw, 36px)',
          marginBottom: 'clamp(20px, 4vw, 30px)',
          fontWeight: 700
        }}>
          HTML & CSS Basics for Cool Kids! 🌐
        </h1>
        
        <section style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
          <h2 style={{ 
            color: '#e34c26',
            fontSize: 'clamp(18px, 4vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            fontWeight: 600
          }}>What is a Website? (Super Simple!) 🌍</h2>
          <p>
            A website is like a digital book or poster that you can see on your computer, tablet, or phone. 
            But instead of paper, it's made with special code that your web browser (like Chrome or Safari) reads and shows you!
          </p>
          <div style={{ 
            backgroundColor: '#f0f4ff', 
            padding: 'clamp(12px, 3vw, 20px)', 
            borderRadius: '10px',
            border: '2px solid #264de4',
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}>
            <h3 style={{ 
              color: '#1e3a8a', 
              marginTop: '0',
              fontSize: 'clamp(16px, 3.5vw, 20px)',
              fontWeight: 600
            }}>Think of it like building a house:</h3>
            <ul style={{ lineHeight: '1.8' }}>
              <li>🏗️ <strong>HTML</strong> = The frame, walls, and structure (where things go)</li>
              <li>🎨 <strong>CSS</strong> = The paint, decorations, and furniture (how things look)</li>
              <li>🌐 <strong>Browser</strong> = The person who looks at your house (shows it to you)</li>
              <li>💻 <strong>Your Computer</strong> = The land where the house is built</li>
            </ul>
            <p style={{ marginTop: '15px', fontStyle: 'italic' }}>
              When you visit a website, your browser reads the HTML and CSS code and shows you a beautiful page!
            </p>
          </div>
        </section>
        
        <section style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
          <h2 style={{ 
            color: '#e34c26',
            fontSize: 'clamp(18px, 4vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            fontWeight: 600
          }}>How Do Websites Work? 🔧</h2>
          <p>
            Here's the magic behind every website you visit:
          </p>
          <div style={{ 
            backgroundColor: '#fff9e6', 
            padding: '20px', 
            borderRadius: '10px',
            border: '2px solid #ffd43b'
          }}>
            <ol style={{ lineHeight: '2' }}>
              <li><strong>You type a website address</strong> (like codekingdom.com) in your browser</li>
              <li><strong>Your browser finds the website</strong> on the internet (like looking up a book in a library)</li>
              <li><strong>The website sends HTML and CSS code</strong> to your computer</li>
              <li><strong>Your browser reads the code</strong> and builds the page you see</li>
              <li><strong>You see the beautiful website!</strong> All made from code!</li>
            </ol>
            <p style={{ marginTop: '15px' }}>
              <strong>Cool fact:</strong> Every single website you've ever visited - YouTube, games, social media - 
              they're all made with HTML and CSS (plus some other languages)!
            </p>
          </div>
        </section>
        
        <section style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
          <h2 style={{ 
            color: '#e34c26',
            fontSize: 'clamp(18px, 4vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            fontWeight: 600
          }}>How Do I Create My Own Website? 🚀</h2>
          <p>
            <strong>Great news!</strong> You can practice making websites right here in CodeKingdom! 
            No need to download anything or set up complicated tools.
          </p>
          <div style={{ 
            backgroundColor: '#e6f7ff', 
            padding: 'clamp(12px, 3vw, 20px)', 
            borderRadius: '10px',
            border: '2px solid #4b8bbe',
            marginTop: '15px',
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}>
            <p><strong>💡 Where to Practice:</strong></p>
            <ul style={{ lineHeight: '1.8' }}>
              <li>🎮 <strong>Web Dev Game:</strong> Write HTML and CSS code to build websites!</li>
              <li>📝 <strong>Code Editor:</strong> Type your HTML and CSS in the editor</li>
              <li>👁️ <strong>Live Preview:</strong> See your website appear instantly as you type!</li>
              <li>✅ <strong>Complete Challenges:</strong> Build websites that match the requirements and earn rewards!</li>
            </ul>
            <p style={{ marginTop: '15px', fontStyle: 'italic' }}>
              It's like having a magic canvas where you can paint with code and see your creation come to life immediately!
            </p>
          </div>
        </section>
        
        <section style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
          <h2 style={{ 
            color: '#e34c26',
            fontSize: 'clamp(18px, 4vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            fontWeight: 600
          }}>What is HTML? 🏗️</h2>
          <p>
            HTML stands for <strong>HyperText Markup Language</strong>. Think of HTML as the skeleton of a website!
            It's like the frame of a house - it tells the browser where everything goes and what it is.
          </p>
          <div style={{ 
            backgroundColor: '#fff5f5', 
            padding: 'clamp(12px, 3vw, 15px)', 
            borderRadius: '10px',
            border: '1px solid #fcc',
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}>
            <p><strong>Fun Fact:</strong> HTML was created by Tim Berners-Lee in 1991. That's when the World Wide Web was just starting!</p>
          </div>
        </section>

        <section style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
          <h2 style={{ 
            color: '#264de4',
            fontSize: 'clamp(18px, 4vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            fontWeight: 600
          }}>What is CSS? 🎨</h2>
          <p>
            CSS stands for <strong>Cascading Style Sheets</strong>. CSS is like the paint, decorations, and furniture for your website!
            It makes everything look pretty - colors, sizes, fonts, and where things are placed.
          </p>
          <div style={{ 
            backgroundColor: '#f0f4ff', 
            padding: 'clamp(12px, 3vw, 15px)', 
            borderRadius: '10px',
            border: '1px solid #ccd',
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}>
            <p><strong>Fun Fact:</strong> Without CSS, all websites would look like plain black text on white backgrounds - super boring!</p>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#e34c26' }}>Why Learn HTML & CSS? 🚀</h2>
          <ul style={{ lineHeight: '1.6' }}>
            <li>You can build your own websites and show them to friends!</li>
            <li>It's the foundation of every website you visit (YouTube, games, social media!)</li>
            <li>It's like learning to read and write for the internet</li>
            <li>You can create cool projects like online portfolios, game pages, or blogs</li>
            <li>It's easier than you think - you'll see results right away!</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#e34c26' }}>Your Very First Web Page! 🎉</h2>
          <p>
            Let's create your first website! This is like building your first LEGO creation - simple but exciting!
          </p>
          <div style={{ 
            backgroundColor: '#2b2b2b', 
            color: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '14px',
            marginBottom: '15px',
            overflowX: 'auto'
          }}>
            &lt;!DOCTYPE html&gt;<br/>
            &lt;html&gt;<br/>
            &lt;head&gt;<br/>
            &nbsp;&nbsp;&lt;title&gt;My First Page&lt;/title&gt;<br/>
            &lt;/head&gt;<br/>
            &lt;body&gt;<br/>
            &nbsp;&nbsp;&lt;h1&gt;Hello, World!&lt;/h1&gt;<br/>
            &nbsp;&nbsp;&lt;p&gt;This is my first website!&lt;/p&gt;<br/>
            &lt;/body&gt;<br/>
            &lt;/html&gt;
          </div>
          <p><strong>What this does:</strong> Creates a simple webpage with a big heading and a paragraph!</p>
          <p><strong>Try it:</strong> Copy this code into the Web Dev Game's editor and click "Submit" to see your website!</p>
          <div style={{ 
            backgroundColor: '#fff9e6', 
            padding: '15px', 
            borderRadius: '10px',
            border: '2px dashed #ffd43b',
            marginTop: '15px'
          }}>
            <p><strong>🎯 Your Mission:</strong> Try changing "Hello, World!" to your own message, like "Welcome to My Awesome Page!"</p>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#e34c26' }}>Understanding HTML Tags (The Building Blocks) 🧱</h2>
          <p>
            HTML uses <strong>tags</strong> to tell the browser what each part of your page is. Think of tags like labels on boxes:
          </p>
          <div style={{ 
            backgroundColor: '#f0f4ff', 
            padding: '20px', 
            borderRadius: '10px',
            border: '1px solid #264de4'
          }}>
            <h3 style={{ color: '#1e3a8a', marginTop: '0' }}>How Tags Work:</h3>
            <ul style={{ lineHeight: '1.8' }}>
              <li><strong>Opening Tag:</strong> <code>&lt;h1&gt;</code> - Says "start a heading here"</li>
              <li><strong>Content:</strong> Your text goes here</li>
              <li><strong>Closing Tag:</strong> <code>&lt;/h1&gt;</code> - Says "end the heading here"</li>
            </ul>
            <p style={{ marginTop: '15px' }}>
              <strong>Example:</strong> <code>&lt;h1&gt;My Title&lt;/h1&gt;</code>
            </p>
            <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
              💡 The <code>/</code> in the closing tag is like saying "stop" or "end"!
            </p>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#e34c26' }}>HTML Basics - Building Blocks 🧱</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#c0392b' }}>HTML Structure</h3>
            <p>
              Every HTML page starts with a basic structure. Think of it like a sandwich - you need bread (html tags) and filling (content):
            </p>
            <div style={{ 
              backgroundColor: '#fff9e6', 
              padding: '15px', 
              borderRadius: '10px',
              border: '1px solid #ffd43b',
              marginBottom: '10px'
            }}>
              <p><strong>📖 Breaking It Down:</strong></p>
              <ul style={{ lineHeight: '1.8' }}>
                <li><code>&lt;!DOCTYPE html&gt;</code> - Tells the browser "This is an HTML page!"</li>
                <li><code>&lt;html&gt;</code> - The wrapper that holds everything</li>
                <li><code>&lt;head&gt;</code> - Information about the page (like the title that shows in the browser tab)</li>
                <li><code>&lt;body&gt;</code> - The actual content people see on the page</li>
              </ul>
            </div>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginBottom: '10px',
              overflowX: 'auto'
            }}>
              &lt;!DOCTYPE html&gt;<br/>
              &lt;html&gt;<br/>
              &nbsp;&nbsp;&lt;head&gt;<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&lt;title&gt;My Awesome Page&lt;/title&gt;<br/>
              &nbsp;&nbsp;&lt;/head&gt;<br/>
              &nbsp;&nbsp;&lt;body&gt;<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&lt;!-- Your content goes here --&gt;<br/>
              &nbsp;&nbsp;&lt;/body&gt;<br/>
              &lt;/html&gt;
            </div>
            <p><strong>Note:</strong> HTML tags come in pairs - opening <code>&lt;tag&gt;</code> and closing <code>&lt;/tag&gt;</code>!</p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#c0392b' }}>Headings - Making Titles</h3>
            <p>
              Headings are like chapter titles in a book. The bigger the number, the smaller the heading:
            </p>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginBottom: '10px'
            }}>
              &lt;h1&gt;This is the Biggest Heading&lt;/h1&gt;<br/>
              &lt;h2&gt;This is Smaller&lt;/h2&gt;<br/>
              &lt;h3&gt;This is Even Smaller&lt;/h3&gt;<br/>
              &lt;h4&gt;And so on...&lt;/h4&gt;
            </div>
            <p><strong>Result:</strong></p>
            <div style={{ 
              backgroundColor: '#f8f8f8', 
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd'
            }}>
              <h1 style={{ margin: '5px 0', fontSize: '24px' }}>This is the Biggest Heading</h1>
              <h2 style={{ margin: '5px 0', fontSize: '20px' }}>This is Smaller</h2>
              <h3 style={{ margin: '5px 0', fontSize: '18px' }}>This is Even Smaller</h3>
              <h4 style={{ margin: '5px 0', fontSize: '16px' }}>And so on...</h4>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#c0392b' }}>Paragraphs - Writing Text</h3>
            <p>
              Use <code>&lt;p&gt;</code> tags to write paragraphs of text:
            </p>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginBottom: '10px'
            }}>
              &lt;p&gt;This is my first paragraph!&lt;/p&gt;<br/>
              &lt;p&gt;This is another paragraph. HTML is fun!&lt;/p&gt;
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#c0392b' }}>Links - Connecting Pages</h3>
            <p>
              Links let you jump to other pages or websites:
            </p>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginBottom: '10px'
            }}>
              &lt;a href="https://www.example.com"&gt;Click here to visit Example&lt;/a&gt;
            </div>
            <p><strong>Result:</strong> <a href="https://www.example.com" style={{ color: '#264de4' }}>Click here to visit Example</a></p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#c0392b' }}>Lists - Making Lists</h3>
            <p>
              You can make ordered (numbered) or unordered (bullet) lists:
            </p>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginBottom: '10px'
            }}>
              &lt;!-- Unordered list (bullets) --&gt;<br/>
              &lt;ul&gt;<br/>
              &nbsp;&nbsp;&lt;li&gt;First item&lt;/li&gt;<br/>
              &nbsp;&nbsp;&lt;li&gt;Second item&lt;/li&gt;<br/>
              &nbsp;&nbsp;&lt;li&gt;Third item&lt;/li&gt;<br/>
              &lt;/ul&gt;<br/>
              <br/>
              &lt;!-- Ordered list (numbers) --&gt;<br/>
              &lt;ol&gt;<br/>
              &nbsp;&nbsp;&lt;li&gt;Step one&lt;/li&gt;<br/>
              &nbsp;&nbsp;&lt;li&gt;Step two&lt;/li&gt;<br/>
              &nbsp;&nbsp;&lt;li&gt;Step three&lt;/li&gt;<br/>
              &lt;/ol&gt;
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#c0392b' }}>Images - Adding Pictures</h3>
            <p>
              Show pictures on your page with the image tag:
            </p>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginBottom: '10px'
            }}>
              &lt;img src="picture.jpg" alt="A cool picture" /&gt;
            </div>
            <p><strong>Note:</strong> The <code>alt</code> text describes the image for people who can't see it!</p>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#264de4' }}>CSS Basics - Making It Pretty! 🎨</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#1e3a8a' }}>How CSS Works</h3>
            <p>
              CSS uses <strong>selectors</strong> to find HTML elements and <strong>properties</strong> to style them.
              Think of it like: "Find all h1 tags and make them blue and big!"
            </p>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginBottom: '10px'
            }}>
              &lt;style&gt;<br/>
              &nbsp;&nbsp;h1 {'{'}<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;color: blue;<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;font-size: 32px;<br/>
              &nbsp;&nbsp;{'}'}<br/>
              &lt;/style&gt;
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#1e3a8a' }}>Colors - Making Things Colorful</h3>
            <p>
              You can use color names or special codes:
            </p>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginBottom: '10px'
            }}>
              h1 {'{'}<br/>
              &nbsp;&nbsp;color: red;        /* Using color name */<br/>
              &nbsp;&nbsp;color: #ff0000;    /* Using hex code (red) */<br/>
              &nbsp;&nbsp;color: rgb(255, 0, 0); /* Using RGB (red) */<br/>
              {'}'}
            </div>
            <p><strong>Popular Colors:</strong> red, blue, green, yellow, orange, purple, pink, black, white</p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#1e3a8a' }}>Text Alignment - Where Text Goes</h3>
            <p>
              Control where your text appears:
            </p>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginBottom: '10px'
            }}>
              h1 {'{'}<br/>
              &nbsp;&nbsp;text-align: center;   /* Center the text */<br/>
              &nbsp;&nbsp;text-align: left;     /* Left side (default) */<br/>
              &nbsp;&nbsp;text-align: right;    /* Right side */<br/>
              {'}'}
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#1e3a8a' }}>Background Colors - Coloring Backgrounds</h3>
            <p>
              Change the background color of elements:
            </p>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginBottom: '10px'
            }}>
              body {'{'}<br/>
              &nbsp;&nbsp;background-color: lightblue;<br/>
              {'}'}<br/>
              <br/>
              h1 {'{'}<br/>
              &nbsp;&nbsp;background-color: yellow;<br/>
              {'}'}
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#1e3a8a' }}>Font Size - Making Text Bigger or Smaller</h3>
            <p>
              Control how big your text is:
            </p>
            <div style={{ 
              backgroundColor: '#2b2b2b', 
              color: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginBottom: '10px'
            }}>
              p {'{'}<br/>
              &nbsp;&nbsp;font-size: 18px;  /* 18 pixels tall */<br/>
              {'}'}<br/>
              <br/>
              h1 {'{'}<br/>
              &nbsp;&nbsp;font-size: 48px;  /* Much bigger! */<br/>
              {'}'}
            </div>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#e34c26' }}>Putting It All Together! 🎯</h2>
          <p>
            Here's a complete example showing HTML and CSS working together:
          </p>
          <div style={{ 
            backgroundColor: '#2b2b2b', 
            color: '#ffffff',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '13px',
            marginBottom: '10px',
            overflowX: 'auto'
          }}>
            &lt;!DOCTYPE html&gt;<br/>
            &lt;html&gt;<br/>
            &lt;head&gt;<br/>
            &nbsp;&nbsp;&lt;title&gt;My Awesome Page&lt;/title&gt;<br/>
            &nbsp;&nbsp;&lt;style&gt;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;body {'{'}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;background-color: lightblue;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;font-family: Arial, sans-serif;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;{'}'}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;h1 {'{'}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;color: blue;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;text-align: center;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;font-size: 36px;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;{'}'}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;p {'{'}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;color: darkgreen;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;font-size: 18px;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;{'}'}<br/>
            &nbsp;&nbsp;&lt;/style&gt;<br/>
            &lt;/head&gt;<br/>
            &lt;body&gt;<br/>
            &nbsp;&nbsp;&lt;h1&gt;Welcome to My Page!&lt;/h1&gt;<br/>
            &nbsp;&nbsp;&lt;p&gt;This is my first website. HTML and CSS are awesome!&lt;/p&gt;<br/>
            &nbsp;&nbsp;&lt;p&gt;I can make it look however I want!&lt;/p&gt;<br/>
            &lt;/body&gt;<br/>
            &lt;/html&gt;
          </div>
          <p><strong>What this does:</strong></p>
          <ul style={{ lineHeight: '1.6' }}>
            <li>Sets the background to light blue</li>
            <li>Makes the h1 heading blue, centered, and big</li>
            <li>Makes paragraphs dark green and 18px tall</li>
            <li>Uses Arial font for everything</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#264de4' }}>Common HTML Tags Cheat Sheet 📝</h2>
          <div style={{ 
            backgroundColor: '#f8f8f8', 
            padding: '15px', 
            borderRadius: '10px',
            border: '1px solid #ddd'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#e34c26', color: 'white' }}>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}>Tag</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}>What It Does</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Headings (h1 is biggest, h6 is smallest)</td>
                </tr>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>&lt;p&gt;</code></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Paragraph of text</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>&lt;a&gt;</code></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Link to another page</td>
                </tr>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>&lt;img&gt;</code></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Image/picture</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>&lt;ul&gt;</code> and <code>&lt;ol&gt;</code></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Lists (ul = bullets, ol = numbers)</td>
                </tr>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>&lt;li&gt;</code></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>List item (goes inside ul or ol)</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>&lt;div&gt;</code></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Container/box for grouping things</td>
                </tr>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>&lt;span&gt;</code></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Small container for inline styling</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#264de4' }}>Common CSS Properties Cheat Sheet 🎨</h2>
          <div style={{ 
            backgroundColor: '#f8f8f8', 
            padding: '15px', 
            borderRadius: '10px',
            border: '1px solid #ddd'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#264de4', color: 'white' }}>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}>Property</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}>What It Does</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>color</code></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Text color</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>color: blue;</code></td>
                </tr>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>background-color</code></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Background color</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>background-color: yellow;</code></td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>font-size</code></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Text size</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>font-size: 24px;</code></td>
                </tr>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>text-align</code></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Text position</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>text-align: center;</code></td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>font-family</code></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Font style</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>font-family: Arial;</code></td>
                </tr>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>margin</code></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Space outside element</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>margin: 10px;</code></td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>padding</code></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Space inside element</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>padding: 15px;</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#e34c26' }}>Fun Web Projects for Kids 🎮</h2>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>Personal Portfolio:</strong> Create a page about yourself with your hobbies, favorite games, and photos!</li>
            <li><strong>Game Review Site:</strong> Make a website reviewing your favorite video games</li>
            <li><strong>Pet Page:</strong> Create a page all about your pet (or dream pet!) with pictures and stories</li>
            <li><strong>Recipe Collection:</strong> Build a page with your favorite recipes and cooking tips</li>
            <li><strong>Adventure Story:</strong> Create an interactive story page where readers click links to choose what happens next</li>
            <li><strong>Hobby Showcase:</strong> Show off your drawings, LEGO creations, or other cool projects</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#e34c26' }}>Common Beginner Mistakes (And How to Fix Them!) ⚠️</h2>
          <div style={{ 
            backgroundColor: '#fff5f5', 
            padding: '20px', 
            borderRadius: '10px',
            border: '2px solid #ff6b6b'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: '#c0392b' }}>❌ Mistake 1: Forgetting to Close Tags</h3>
              <p><strong>Wrong:</strong> <code style={{ backgroundColor: '#fee', padding: '2px 5px' }}>&lt;h1&gt;My Title</code></p>
              <p><strong>Right:</strong> <code style={{ backgroundColor: '#efe', padding: '2px 5px' }}>&lt;h1&gt;My Title&lt;/h1&gt;</code></p>
              <p><em>Every opening tag needs a closing tag! Think of it like opening and closing a door.</em></p>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: '#c0392b' }}>❌ Mistake 2: Wrong Tag Order</h3>
              <p><strong>Wrong:</strong> <code style={{ backgroundColor: '#fee', padding: '2px 5px' }}>&lt;h1&gt;&lt;p&gt;Text&lt;/h1&gt;&lt;/p&gt;</code></p>
              <p><strong>Right:</strong> <code style={{ backgroundColor: '#efe', padding: '2px 5px' }}>&lt;h1&gt;&lt;p&gt;Text&lt;/p&gt;&lt;/h1&gt;</code></p>
              <p><em>Close tags in the reverse order you opened them - like stacking boxes!</em></p>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: '#c0392b' }}>❌ Mistake 3: Missing Semicolons in CSS</h3>
              <p><strong>Wrong:</strong> <code style={{ backgroundColor: '#fee', padding: '2px 5px' }}>color: blue</code></p>
              <p><strong>Right:</strong> <code style={{ backgroundColor: '#efe', padding: '2px 5px' }}>color: blue;</code></p>
              <p><em>CSS properties need semicolons at the end - like periods at the end of sentences!</em></p>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: '#c0392b' }}>❌ Mistake 4: Forgetting Quotes in HTML Attributes</h3>
              <p><strong>Wrong:</strong> <code style={{ backgroundColor: '#fee', padding: '2px 5px' }}>&lt;a href=https://example.com&gt;Link&lt;/a&gt;</code></p>
              <p><strong>Right:</strong> <code style={{ backgroundColor: '#efe', padding: '2px 5px' }}>&lt;a href="https://example.com"&gt;Link&lt;/a&gt;</code></p>
              <p><em>Attribute values need quotes around them - like putting a name in quotation marks!</em></p>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: '#c0392b' }}>❌ Mistake 5: Typing Mistakes (Typos)</h3>
              <p><strong>Wrong:</strong> <code style={{ backgroundColor: '#fee', padding: '2px 5px' }}>&lt;h1&gt; or &lt;heding&gt;</code></p>
              <p><strong>Right:</strong> <code style={{ backgroundColor: '#efe', padding: '2px 5px' }}>&lt;h1&gt; or &lt;heading&gt;</code></p>
              <p><em>Computers are very picky! One wrong letter and it won't work. Always double-check your spelling!</em></p>
            </div>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#264de4' }}>How to Think Like a Web Developer 🧠</h2>
          <p>
            Building websites is like being an architect and an artist at the same time!
          </p>
          <div style={{ 
            backgroundColor: '#f0f4ff', 
            padding: '20px', 
            borderRadius: '10px',
            border: '1px solid #264de4'
          }}>
            <h3 style={{ color: '#1e3a8a' }}>The Web Development Process:</h3>
            <ol style={{ lineHeight: '2' }}>
              <li><strong>Plan Your Page:</strong> What do you want on your website? (Like drawing a blueprint!)</li>
              <li><strong>Write the HTML:</strong> Build the structure - headings, paragraphs, images (Like building the frame of a house)</li>
              <li><strong>Add CSS:</strong> Make it look pretty - colors, fonts, sizes (Like painting and decorating)</li>
              <li><strong>Test It:</strong> Look at your page and see if it looks right</li>
              <li><strong>Fix Problems:</strong> If something looks wrong, check your code and fix it</li>
              <li><strong>Keep Improving:</strong> Add more features, make it better!</li>
            </ol>
            <p style={{ marginTop: '15px', fontStyle: 'italic' }}>
              💡 <strong>Pro Tip:</strong> Start simple! Build a basic page first, then add more features one at a time.
            </p>
          </div>
        </section>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#e34c26' }}>HTML vs CSS - What's the Difference? 🤔</h2>
          <div style={{ 
            backgroundColor: '#fff9e6', 
            padding: '20px', 
            borderRadius: '10px',
            border: '2px solid #ffd43b'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
              <div style={{ backgroundColor: '#fff5f5', padding: '15px', borderRadius: '8px', border: '2px solid #e34c26' }}>
                <h3 style={{ color: '#c0392b', marginTop: '0' }}>HTML (Structure) 🏗️</h3>
                <p><strong>What it does:</strong> Tells the browser WHAT is on the page</p>
                <ul style={{ lineHeight: '1.6' }}>
                  <li>Creates headings</li>
                  <li>Adds paragraphs</li>
                  <li>Puts in images</li>
                  <li>Makes links</li>
                  <li>Organizes content</li>
                </ul>
                <p style={{ fontStyle: 'italic', marginTop: '10px' }}>Like: "This is a heading, this is a paragraph"</p>
              </div>
              
              <div style={{ backgroundColor: '#f0f4ff', padding: '15px', borderRadius: '8px', border: '2px solid #264de4' }}>
                <h3 style={{ color: '#1e3a8a', marginTop: '0' }}>CSS (Style) 🎨</h3>
                <p><strong>What it does:</strong> Tells the browser HOW things should look</p>
                <ul style={{ lineHeight: '1.6' }}>
                  <li>Changes colors</li>
                  <li>Sets font sizes</li>
                  <li>Moves things around</li>
                  <li>Adds backgrounds</li>
                  <li>Makes it pretty!</li>
                </ul>
                <p style={{ fontStyle: 'italic', marginTop: '10px' }}>Like: "Make the heading blue and big"</p>
              </div>
            </div>
            <p style={{ marginTop: '20px', textAlign: 'center', fontWeight: 'bold' }}>
              💡 <strong>Remember:</strong> HTML = What you have. CSS = How it looks!
            </p>
          </div>
        </section>
        
        <div style={{ 
          backgroundColor: '#fff5f5', 
          padding: '20px', 
          borderRadius: '10px',
          marginTop: '40px',
          border: '2px dashed #e34c26'
        }}>
          <h2 style={{ color: '#e34c26', marginTop: '0' }}>Remember! 🌟</h2>
          <ul style={{ lineHeight: '1.8' }}>
            <li>✅ <strong>Always close your HTML tags!</strong> <code>&lt;tag&gt;</code> needs <code>&lt;/tag&gt;</code> (like opening and closing a box)</li>
            <li>✅ <strong>CSS properties end with semicolons:</strong> <code>color: blue;</code> (like periods in sentences)</li>
            <li>✅ <strong>HTML is for structure</strong> (what things are), <strong>CSS is for style</strong> (how things look)</li>
            <li>✅ <strong>Start simple:</strong> Build a basic page first, then add more features</li>
            <li>✅ <strong>Don't be afraid to experiment!</strong> Try different colors, sizes, and layouts</li>
            <li>✅ <strong>Use the Web Dev Game</strong> to practice and see your code come to life instantly!</li>
            <li>✅ <strong>Mistakes are normal!</strong> Every web developer makes them - just fix and try again!</li>
            <li>✅ <strong>Have fun and be creative!</strong> That's what web development is all about!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
