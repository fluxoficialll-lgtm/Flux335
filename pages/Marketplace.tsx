import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '../services/marketplaceService';
import { authService } from '../services/authService';
import { db } from '@/database';
import { MarketplaceItem } from '../types';

// Importação dos Componentes Isolados
import { MarketplaceHeader } from '../components/marketplace/MarketplaceHeader';
import { MarketplaceSearchBar } from '../components/marketplace/MarketplaceSearchBar';
import { CategoryBar } from '../components/marketplace/CategoryBar';
import { ProductsGrid } from '../components/marketplace/ProductsGrid';
import { MarketplaceFAB } from '../components/marketplace/MarketplaceFAB';
import { Footer } from '../components/layout/Footer';

export const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [allItems, setAllItems] = useState<MarketplaceItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = useCallback(() => {
      const email = authService.getCurrentUserEmail() || undefined;
      const items = marketplaceService.getRecommendedItems(email);
      setAllItems(items || []);
      setIsLoading(false);
  }, []);

  useEffect(() => {
      const email = authService.getCurrentUserEmail() || undefined;
      setCurrentUserEmail(email);
      loadItems();
      marketplaceService.fetchItems().catch(err => console.warn("Marketplace sync failed", err));
      const unsubscribe = db.subscribe('marketplace', () => { loadItems(); });
      return () => unsubscribe();
  }, [loadItems]);

  const filteredProducts = useMemo(() => {
      const products = Array.isArray(allItems) ? allItems : [];
      let result = [...products];
      
      if (activeCategory !== 'Todos') {
          if (activeCategory === 'Destaque') result = result.filter(p => p && p.isAd);
          else result = result.filter(p => p && p.category === activeCategory);
      }
      
      if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          result = result.filter(p => p && (
              (p.title && p.title.toLowerCase().includes(term)) || 
              (p.location && p.location.toLowerCase().includes(term))
          ));
      }
      return result;
  }, [allItems, activeCategory, searchTerm]);

  const handleProductClick = (item: MarketplaceItem) => {
      if (!item) return;
      if (currentUserEmail) marketplaceService.trackView(item, currentUserEmail);
      
      if (item.isAd && item.ctaLink) {
          if (item.ctaLink.startsWith('http')) window.open(item.ctaLink, '_blank');
          else navigate(item.ctaLink);
      } else { 
          navigate(`/marketplace/product/${item.id}`); 
      }
  };

  return (
    <div className="h-screen flex flex-col font-['Inter'] overflow-hidden bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white">
      <MarketplaceHeader />

      <main className="flex-grow pt-[100px] pb-[100px] px-5 flex flex-col overflow-y-auto no-scrollbar">
        <MarketplaceSearchBar 
            value={searchTerm} 
            onChange={setSearchTerm} 
        />
        
        <CategoryBar 
            activeCategory={activeCategory} 
            onSelect={setActiveCategory} 
        />
        
        <ProductsGrid 
            items={filteredProducts}
            isLoading={isLoading}
            onItemClick={handleProductClick}
        />
      </main>

      <MarketplaceFAB isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
      <Footer />
    </div>
  );
};