'use client';

import React from 'react';
import Navigation from '@/components/Navigation';

export default function ThreeDBasicsPage() {
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
          color: '#9b59b6', 
          borderBottom: '3px solid #3498db',
          paddingBottom: '10px',
          fontSize: 'clamp(24px, 5vw, 36px)',
          marginBottom: 'clamp(20px, 4vw, 30px)',
          fontWeight: 700
        }}>
          3D Basics for Cool Kids! 🧱
        </h1>
        
        <section style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
          <h2 style={{ 
            color: '#8e44ad',
            fontSize: 'clamp(18px, 4vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            fontWeight: 600
          }}>What is 3D? (The Super Simple Explanation) 📦</h2>
          <p>
            You know how a drawing on paper is flat (2D)? Well, 3D means something has depth - it's not just flat, 
            it has height, width, AND depth! Think of the difference between a drawing of a cube and a real cube you can hold.
          </p>
          <div style={{ 
            backgroundColor: '#f0f0ff', 
            padding: 'clamp(12px, 3vw, 20px)', 
            borderRadius: '10px',
            border: '2px solid #9b59b6',
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}>
            <h3 style={{ 
              color: '#6a1b9a', 
              marginTop: '0',
              fontSize: 'clamp(16px, 3.5vw, 20px)',
              fontWeight: 600
            }}>Think of it like this:</h3>
            <ul style={{ lineHeight: '1.8' }}>
              <li>📐 <strong>2D (Two Dimensions)</strong> = Flat like a piece of paper (width and height)</li>
              <li>📦 <strong>3D (Three Dimensions)</strong> = Has depth too, like a real box (width, height, and depth)</li>
              <li>🎮 <strong>3D Games</strong> = Games where you can move around in a 3D world (like Minecraft!)</li>
              <li>🏗️ <strong>3D Building</strong> = Creating 3D objects and structures with code</li>
            </ul>
            <p style={{ marginTop: '15px', fontStyle: 'italic' }}>
              In the 3D Block Builder game, you're creating real 3D structures that you can view from any angle!
            </p>
          </div>
        </section>
        
        <section style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
          <h2 style={{ 
            color: '#8e44ad',
            fontSize: 'clamp(18px, 4vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            fontWeight: 600
          }}>Understanding Coordinates (X, Y, Z) 📍</h2>
          <p>
            In 3D space, we use three numbers to describe where something is located. These are called coordinates!
          </p>
          <div style={{ 
            backgroundColor: '#fff9e6', 
            padding: 'clamp(12px, 3vw, 20px)', 
            borderRadius: '10px',
            border: '2px solid #f39c12',
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}>
            <h3 style={{ 
              color: '#d68910', 
              marginTop: '0',
              fontSize: 'clamp(16px, 3.5vw, 20px)',
              fontWeight: 600
            }}>The Three Axes:</h3>
            <ul style={{ lineHeight: '1.8' }}>
              <li>➡️ <strong>X-axis</strong> = Left and Right (like moving sideways)</li>
              <li>⬆️ <strong>Y-axis</strong> = Up and Down (like jumping or falling)</li>
              <li>↗️ <strong>Z-axis</strong> = Forward and Backward (like moving toward or away from you)</li>
            </ul>
            <p style={{ marginTop: '15px' }}>
              <strong>Example:</strong> The position (0, 0, 0) is the center point where all three axes meet!
            </p>
            <div style={{ 
              backgroundColor: '#fff',
              padding: 'clamp(10px, 2vw, 15px)',
              borderRadius: '8px',
              marginTop: '15px',
              border: '1px solid #ddd'
            }}>
              <code style={{ 
                fontSize: 'clamp(13px, 2.5vw, 15px)',
                fontFamily: 'monospace',
                color: '#8e44ad',
                fontWeight: 'bold'
              }}>
                place_block(0, 0, 0)  // Places a block at the center
              </code>
              <p style={{ marginTop: '10px', fontSize: 'clamp(13px, 2.5vw, 15px)' }}>
                This command places a block at coordinates (0, 0, 0) - the very center of the 3D world!
              </p>
            </div>
          </div>
        </section>
        
        <section style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
          <h2 style={{ 
            color: '#8e44ad',
            fontSize: 'clamp(18px, 4vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            fontWeight: 600
          }}>Basic 3D Building Commands 🛠️</h2>
          <p>
            In the 3D Block Builder, you use special commands to create structures. Here are the basics:
          </p>
          
          <div style={{ 
            backgroundColor: '#e8f5e9', 
            padding: 'clamp(12px, 3vw, 20px)', 
            borderRadius: '10px',
            border: '2px solid #27ae60',
            marginBottom: 'clamp(15px, 3vw, 20px)',
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}>
            <h3 style={{ 
              color: '#1e7e34', 
              marginTop: '0',
              fontSize: 'clamp(16px, 3.5vw, 20px)',
              fontWeight: 600
            }}>1. Placing a Single Block</h3>
            <div style={{ 
              backgroundColor: '#fff',
              padding: 'clamp(10px, 2vw, 15px)',
              borderRadius: '8px',
              marginTop: '10px',
              overflowX: 'auto'
            }}>
              <code style={{ 
                fontSize: 'clamp(13px, 2.5vw, 15px)',
                fontFamily: 'monospace',
                color: '#27ae60',
                fontWeight: 'bold',
                whiteSpace: 'pre'
              }}>
{`place_block(0, 0, 0)
# Places a block at the center point`}
              </code>
            </div>
            <p style={{ marginTop: '10px', fontSize: 'clamp(13px, 2.5vw, 15px)' }}>
              This is the simplest command! It places one block at the coordinates you specify.
            </p>
          </div>

          <div style={{ 
            backgroundColor: '#e3f2fd', 
            padding: 'clamp(12px, 3vw, 20px)', 
            borderRadius: '10px',
            border: '2px solid #2196f3',
            marginBottom: 'clamp(15px, 3vw, 20px)',
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}>
            <h3 style={{ 
              color: '#1565c0', 
              marginTop: '0',
              fontSize: 'clamp(16px, 3.5vw, 20px)',
              fontWeight: 600
            }}>2. Building a Tower</h3>
            <div style={{ 
              backgroundColor: '#fff',
              padding: 'clamp(10px, 2vw, 15px)',
              borderRadius: '8px',
              marginTop: '10px',
              overflowX: 'auto'
            }}>
              <code style={{ 
                fontSize: 'clamp(13px, 2.5vw, 15px)',
                fontFamily: 'monospace',
                color: '#2196f3',
                fontWeight: 'bold',
                whiteSpace: 'pre'
              }}>
{`build_tower(height=5)
# Builds a tower 5 blocks tall`}
              </code>
            </div>
            <p style={{ marginTop: '10px', fontSize: 'clamp(13px, 2.5vw, 15px)' }}>
              This builds a tower straight up! The height tells it how many blocks tall to make it.
            </p>
          </div>

          <div style={{ 
            backgroundColor: '#fff3e0', 
            padding: 'clamp(12px, 3vw, 20px)', 
            borderRadius: '10px',
            border: '2px solid #ff9800',
            marginBottom: 'clamp(15px, 3vw, 20px)',
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}>
            <h3 style={{ 
              color: '#e65100', 
              marginTop: '0',
              fontSize: 'clamp(16px, 3.5vw, 20px)',
              fontWeight: 600
            }}>3. Creating a Wall</h3>
            <div style={{ 
              backgroundColor: '#fff',
              padding: 'clamp(10px, 2vw, 15px)',
              borderRadius: '8px',
              marginTop: '10px',
              overflowX: 'auto'
            }}>
              <code style={{ 
                fontSize: 'clamp(13px, 2.5vw, 15px)',
                fontFamily: 'monospace',
                color: '#ff9800',
                fontWeight: 'bold',
                whiteSpace: 'pre'
              }}>
{`create_wall(length=10)
# Creates a wall 10 blocks long`}
              </code>
            </div>
            <p style={{ marginTop: '10px', fontSize: 'clamp(13px, 2.5vw, 15px)' }}>
              This creates a horizontal wall. The length tells it how many blocks long to make it.
            </p>
          </div>
        </section>
        
        <section style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
          <h2 style={{ 
            color: '#8e44ad',
            fontSize: 'clamp(18px, 4vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            fontWeight: 600
          }}>Using Loops to Build Bigger Things 🔄</h2>
          <p>
            Loops let you repeat commands over and over. This is super useful for building large structures!
          </p>
          <div style={{ 
            backgroundColor: '#fce4ec', 
            padding: 'clamp(12px, 3vw, 20px)', 
            borderRadius: '10px',
            border: '2px solid #e91e63',
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}>
            <h3 style={{ 
              color: '#880e4f', 
              marginTop: '0',
              fontSize: 'clamp(16px, 3.5vw, 20px)',
              fontWeight: 600
            }}>Example: Building a Staircase</h3>
            <div style={{ 
              backgroundColor: '#fff',
              padding: 'clamp(10px, 2vw, 15px)',
              borderRadius: '8px',
              marginTop: '10px',
              overflowX: 'auto'
            }}>
              <code style={{ 
                fontSize: 'clamp(13px, 2.5vw, 15px)',
                fontFamily: 'monospace',
                color: '#e91e63',
                fontWeight: 'bold',
                whiteSpace: 'pre'
              }}>
{`for i in range(5):
    place_block(i, i, 0)
    # Places blocks going up and forward
    # Creates a staircase!`}
              </code>
            </div>
            <p style={{ marginTop: '10px', fontSize: 'clamp(13px, 2.5vw, 15px)' }}>
              This loop runs 5 times, placing a block each time. The block moves up (Y) and forward (X) each step, creating stairs!
            </p>
          </div>
        </section>
        
        <section style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
          <h2 style={{ 
            color: '#8e44ad',
            fontSize: 'clamp(18px, 4vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            fontWeight: 600
          }}>Tips for 3D Building 🎯</h2>
          <ul style={{ 
            lineHeight: '1.8', 
            backgroundColor: '#f0f0ff', 
            padding: 'clamp(12px, 3vw, 20px)', 
            borderRadius: '10px',
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}>
            <li>📍 <strong>Start at (0, 0, 0)</strong> - This is the center point and a great starting place!</li>
            <li>📐 <strong>Remember the axes</strong> - X is left/right, Y is up/down, Z is forward/backward</li>
            <li>🔄 <strong>Use loops</strong> - They save you from typing the same command many times</li>
            <li>🏗️ <strong>Build in layers</strong> - Start with the base, then build up</li>
            <li>👀 <strong>Rotate your view</strong> - Click and drag to see your creation from all angles!</li>
            <li>🎨 <strong>Experiment!</strong> - Try different coordinates and see what happens</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
          <h2 style={{ 
            color: '#8e44ad',
            fontSize: 'clamp(18px, 4vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            fontWeight: 600
          }}>Why Learn 3D? 🚀</h2>
          <ul style={{ lineHeight: '1.8' }}>
            <li>🎮 <strong>Game Development</strong> - Most video games use 3D graphics!</li>
            <li>🎬 <strong>Animation & Movies</strong> - 3D is used in movies like Toy Story and Frozen</li>
            <li>🏗️ <strong>Architecture</strong> - Architects use 3D to design buildings</li>
            <li>🤖 <strong>3D Printing</strong> - You can turn 3D designs into real objects!</li>
            <li>🧠 <strong>Problem Solving</strong> - Thinking in 3D helps your brain think creatively</li>
          </ul>
        </section>
        
        <section style={{ 
          marginBottom: 'clamp(20px, 4vw, 30px)',
          backgroundColor: '#e8f5e9',
          padding: 'clamp(15px, 3vw, 25px)',
          borderRadius: '12px',
          border: '3px solid #27ae60'
        }}>
          <h2 style={{ 
            color: '#1e7e34',
            fontSize: 'clamp(18px, 4vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            marginTop: '0',
            fontWeight: 600
          }}>Ready to Build? 🎉</h2>
          <p style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', marginBottom: '15px' }}>
            Now that you understand the basics of 3D, you're ready to start building amazing structures!
          </p>
          <p style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', fontWeight: 'bold', color: '#1e7e34' }}>
            Head over to the <strong>3D Block Builder</strong> game and start creating! 🧱✨
          </p>
        </section>
      </div>
    </div>
  );
}
