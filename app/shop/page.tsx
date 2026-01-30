'use client';

import React, { useState } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/ShopPage.css';

// Image paths for Next.js public folder
const axolotylPet = '/images/items/Pet_Axolotyl.png';
const axolotylGold = '/images/items/Pet_Axolotyl_Gold.png';
const axolotylBlack = '/images/items/Pet_Axolotyl_Black.png';
const puppyPet = '/images/items/Pet_Puppy.png';
const dragonPet = '/images/items/Pet_Dragon.png';
const bettaFishPet = '/images/items/Pet_BettaFish.png';
const catPet = '/images/items/Pet_Cat.png';
const goldenRetrieverPet = '/images/items/Pet_GoldenRetriever.png';
const unicornPet = '/images/items/Pet_Unicorn.png';
const frogPet = '/images/items/Pet_Frog.png';
const lipBalm = '/images/items/LipBalm.png';
const pinkSkateboard = '/images/items/PinkSkateboard.png';
const sharkSkateboard = '/images/items/SharkSkateboard.png';
const sharkHockeyStick = '/images/items/SharkHockeyStick.png';
const stanleyBlue = '/images/items/Accessory_Stanley_Blue.png';
const owallaPink = '/images/items/Accessory_Owalla_Pink.png';

interface ShopItem {
  id: string;
  name: string;
  type: 'pet' | 'hat' | 'glasses' | 'tool' | 'badge' | 'background';
  image: string;
  description: string;
  price: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'pets' | 'accessories' | 'backgrounds';
  // For backgrounds
  backgroundType?: 'color' | 'gradient' | 'image';
  backgroundValue?: string; // CSS value
  thumbnail?: string;
}

// Shop items data
const shopItems: ShopItem[] = [
  {
    id: 'axolotyl-pet',
    name: 'Pink Axolotyl Pet',
    type: 'pet',
    image: axolotylPet,
    description: 'A cute pink axolotyl companion to join you on your coding adventures!',
    price: 100,
    rarity: 'rare',
    category: 'pets'
  },
  {
    id: 'axolotyl-gold-pet',
    name: 'Gold Axolotyl Pet',
    type: 'pet',
    image: axolotylGold,
    description: 'A rare golden axolotyl companion - a truly special find!',
    price: 1000,
    rarity: 'legendary',
    category: 'pets'
  },
  {
    id: 'axolotyl-black-pet',
    name: 'Black Axolotyl Pet',
    type: 'pet',
    image: axolotylBlack,
    description: 'A sleek black axolotyl companion with a mysterious charm!',
    price: 500,
    rarity: 'epic',
    category: 'pets'
  },
  {
    id: 'frog-pet',
    name: 'Frog Pet',
    type: 'pet',
    image: frogPet,
    description: 'A friendly frog companion to hop along with you on your coding journey!',
    price: 120,
    rarity: 'rare',
    category: 'pets'
  },
  {
    id: 'puppy-pet',
    name: 'Puppy Pet',
    type: 'pet',
    image: puppyPet,
    description: 'An adorable puppy friend to keep you company while you code!',
    price: 150,
    rarity: 'rare',
    category: 'pets'
  },
  {
    id: 'dragon-pet',
    name: 'Dragon Pet',
    type: 'pet',
    image: dragonPet,
    description: 'A powerful dragon companion to guard your code and help you conquer challenges!',
    price: 500,
    rarity: 'legendary',
    category: 'pets'
  },
  {
    id: 'bettafish-pet',
    name: 'Betta Fish Pet',
    type: 'pet',
    image: bettaFishPet,
    description: 'A beautiful betta fish to swim alongside you on your coding journey!',
    price: 200,
    rarity: 'rare',
    category: 'pets'
  },
  {
    id: 'cat-pet',
    name: 'Cat Pet',
    type: 'pet',
    image: catPet,
    description: 'A playful cat companion to keep you company while you code!',
    price: 300,
    rarity: 'rare',
    category: 'pets'
  },
  {
    id: 'unicorn-pet',
    name: 'Unicorn Pet',
    type: 'pet',
    image: unicornPet,
    description: 'A magical unicorn companion to bring wonder to your coding adventures!',
    price: 1000,
    rarity: 'epic',
    category: 'pets'
  },
  {
    id: 'goldenretriever-pet',
    name: 'Golden Retriever Pet',
    type: 'pet',
    image: goldenRetrieverPet,
    description: 'A loyal golden retriever friend to be your coding companion!',
    price: 5000,
    rarity: 'legendary',
    category: 'pets'
  },
  // Accessories
  {
    id: 'lipbalm',
    name: 'Lip Balm',
    type: 'tool',
    image: lipBalm,
    description: 'A cute lip balm accessory to keep your character looking fresh!',
    price: 50,
    rarity: 'common',
    category: 'accessories'
  },
  {
    id: 'pink-skateboard',
    name: 'Pink Skateboard',
    type: 'tool',
    image: pinkSkateboard,
    description: 'A cool pink skateboard to ride around in style!',
    price: 75,
    rarity: 'uncommon',
    category: 'accessories'
  },
  {
    id: 'shark-skateboard',
    name: 'Shark Skateboard',
    type: 'tool',
    image: sharkSkateboard,
    description: 'An awesome shark-themed skateboard for the ultimate cool coder!',
    price: 100,
    rarity: 'rare',
    category: 'accessories'
  },
  {
    id: 'shark-hockey-stick',
    name: 'Shark Hockey Stick',
    type: 'tool',
    image: sharkHockeyStick,
    description: 'A powerful shark-themed hockey stick for scoring goals in style!',
    price: 125,
    rarity: 'rare',
    category: 'accessories'
  },
  {
    id: 'stanley-blue',
    name: 'Stanley Blue Water Bottle',
    type: 'tool',
    image: stanleyBlue,
    description: 'Stay hydrated in style with this trendy blue Stanley water bottle!',
    price: 150,
    rarity: 'rare',
    category: 'accessories'
  },
  {
    id: 'owalla-pink',
    name: 'Owalla Pink Water Bottle',
    type: 'tool',
    image: owallaPink,
    description: 'A super cute pink Owalla bottle—perfect for powering through levels!',
    price: 150,
    rarity: 'rare',
    category: 'accessories'
  },
  // Background items
  {
    id: 'bg-sky-blue',
    name: 'Sky Blue Background',
    type: 'background',
    image: '🎨',
    description: 'A beautiful sky blue background for your games!',
    price: 50,
    rarity: 'common',
    category: 'backgrounds',
    backgroundType: 'color',
    backgroundValue: '#87CEEB'
  },
  {
    id: 'bg-sunset',
    name: 'Sunset Gradient',
    type: 'background',
    image: '🌅',
    description: 'A gorgeous sunset gradient background!',
    price: 100,
    rarity: 'uncommon',
    category: 'backgrounds',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 50%, #FF6B9D 100%)'
  },
  {
    id: 'bg-ocean',
    name: 'Ocean Waves',
    type: 'background',
    image: '🌊',
    description: 'Calming ocean blue gradient background!',
    price: 150,
    rarity: 'rare',
    category: 'backgrounds',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'bg-forest',
    name: 'Forest Green',
    type: 'background',
    image: '🌲',
    description: 'A peaceful forest green background!',
    price: 75,
    rarity: 'common',
    category: 'backgrounds',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #2d5016 0%, #1a3009 100%)'
  },
  {
    id: 'bg-galaxy',
    name: 'Galaxy Stars',
    type: 'background',
    image: '🌌',
    description: 'A stunning galaxy with stars background!',
    price: 300,
    rarity: 'epic',
    category: 'backgrounds',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
  },
  {
    id: 'bg-gold',
    name: 'Golden Shine',
    type: 'background',
    image: '✨',
    description: 'A luxurious gold and shiny gradient background!',
    price: 500,
    rarity: 'legendary',
    category: 'backgrounds',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #FFA500 75%, #FFD700 100%)'
  }
];

export default function ShopPage() {
  const { character, addAccessory, addCoins, setCharacter, setBackground } = useCharacter();
  const [selectedCategory, setSelectedCategory] = useState<'pets' | 'accessories' | 'backgrounds'>('pets');
  const [purchaseMessage, setPurchaseMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Filter items by category
  const filteredItems = shopItems.filter(item => item.category === selectedCategory);

  // Check if user already owns an item
  const ownsItem = (itemId: string): boolean => {
    if (itemId.startsWith('bg-')) {
      // For backgrounds, check if it's already equipped
      return character.background?.id === itemId || false;
    }
    return character.accessories?.some(acc => acc.id === itemId) || false;
  };

  // Handle purchase
  const handlePurchase = (item: ShopItem) => {
    // Check if already owned
    if (ownsItem(item.id)) {
      setPurchaseMessage({ type: 'error', text: 'You already own this item!' });
      setTimeout(() => setPurchaseMessage(null), 3000);
      return;
    }

    // Check if user has enough coins
    if (character.coins < item.price) {
      setPurchaseMessage({ type: 'error', text: `Not enough coins! You need ${item.price} coins.` });
      setTimeout(() => setPurchaseMessage(null), 3000);
      return;
    }

    // Handle background purchase
    if (item.type === 'background' && item.backgroundType && item.backgroundValue) {
      const newBackground = {
        id: item.id,
        name: item.name,
        type: item.backgroundType,
        value: item.backgroundValue,
        thumbnail: item.thumbnail,
        description: item.description,
        rarity: item.rarity
      };
      
      // Store background as an accessory so it appears in collection
      const backgroundAccessory = {
        id: item.id,
        name: item.name,
        type: 'badge' as const, // Use 'badge' type for backgrounds in accessories
        image: item.image, // Emoji or icon
        description: item.description,
        rarity: item.rarity,
        isEquipped: false, // Will be set when background is equipped
        source: 'store' as const,
        // Store background data in a custom field
        backgroundData: newBackground
      };
      
      // Add to accessories
      addAccessory(backgroundAccessory);
      
      // Equip the background and update character in one call
      setBackground(newBackground);
      setCharacter(prev => ({
        ...prev,
        accessories: prev.accessories.map(acc => 
          acc.id === item.id ? { ...acc, isEquipped: true } : acc
        ),
        coins: Math.max(0, prev.coins - item.price)
      }));
      
      setPurchaseMessage({ type: 'success', text: `Purchased and equipped ${item.name}!` });
      setTimeout(() => setPurchaseMessage(null), 3000);
      return;
    }

    // Purchase accessory/pet item
    const newAccessory = {
      id: item.id,
      name: item.name,
      type: item.type,
      image: item.image,
      description: item.description,
      rarity: item.rarity,
      isEquipped: false,
      source: 'store' as const
    };

    addAccessory(newAccessory);
    // Deduct coins (using setCharacter to ensure it works with negative values)
    setCharacter(prev => ({
      ...prev,
      coins: Math.max(0, prev.coins - item.price) // Ensure coins don't go negative
    }));

    setPurchaseMessage({ type: 'success', text: `Purchased ${item.name}! Check your collection.` });
    setTimeout(() => setPurchaseMessage(null), 3000);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#bdc3c7';
      case 'uncommon': return '#2ecc71';
      case 'rare': return '#3498db';
      case 'epic': return '#9b59b6';
      case 'legendary': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <Navigation />
        <div className="shop-page">
          <div className="shop-header">
            <h1>🛒 CodeKingdom Shop</h1>
            <div className="coins-display">
              <span className="coins-icon">🪙</span>
              <span className="coins-amount">{character.coins} Coins</span>
            </div>
          </div>

          {/* Purchase Message */}
          {purchaseMessage && (
            <div className={`purchase-message ${purchaseMessage.type}`}>
              {purchaseMessage.type === 'success' ? '✅' : '❌'} {purchaseMessage.text}
            </div>
          )}

          {/* Category Tabs */}
          <div className="category-tabs">
            <button
              className={`category-tab ${selectedCategory === 'pets' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('pets')}
            >
              🐾 Pets
            </button>
            <button
              className={`category-tab ${selectedCategory === 'accessories' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('accessories')}
            >
              👒 Accessories
            </button>
            <button
              className={`category-tab ${selectedCategory === 'backgrounds' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('backgrounds')}
            >
              🎨 Backgrounds
            </button>
          </div>

          {/* Shop Items Grid */}
          <div className="shop-items-container">
            {filteredItems.length === 0 ? (
              <div className="empty-shop">
                <p>No items available in this category yet. Check back soon!</p>
              </div>
            ) : (
              <div className="shop-items-grid">
                {filteredItems.map((item) => {
                  const owned = ownsItem(item.id);
                  const canAfford = character.coins >= item.price;

                  return (
                    <div key={item.id} className={`shop-item-card ${owned ? 'owned' : ''} ${!canAfford && !owned ? 'cannot-afford' : ''}`}>
                      <div className="item-image-container">
                        {item.type === 'background' && item.backgroundValue ? (
                          <div 
                            className="background-preview"
                            style={{ 
                              background: item.backgroundValue,
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '48px',
                              borderRadius: '8px'
                            }}
                          >
                            {item.image}
                          </div>
                        ) : item.image && (item.image.includes('.png') || item.image.includes('.jpg') || item.image.startsWith('/') || item.image.startsWith('http')) ? (
                          <img src={item.image} alt={item.name} className="item-image" />
                        ) : (
                          <div className="item-emoji">{item.image}</div>
                        )}
                        {owned && (
                          <div className="owned-badge">OWNED</div>
                        )}
                        <div className="rarity-badge" style={{ backgroundColor: getRarityColor(item.rarity) }}>
                          {item.rarity.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="item-info">
                        <h3 className="item-name">{item.name}</h3>
                        <p className="item-description">{item.description}</p>
                        
                        <div className="item-footer">
                          <div className="item-price">
                            <span className="price-icon">🪙</span>
                            <span className="price-amount">{item.price}</span>
                          </div>
                          
                          {owned ? (
                            <button className="purchase-btn owned-btn" disabled>
                              Already Owned
                            </button>
                          ) : !canAfford ? (
                            <button className="purchase-btn cannot-afford-btn" disabled>
                              Not Enough Coins
                            </button>
                          ) : (
                            <button
                              className="purchase-btn"
                              onClick={() => handlePurchase(item)}
                            >
                              Buy Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
