import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-display font-bold text-foreground mb-4">
          Event Navigator
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Indoor navigation system for events and exhibitions
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/map')}
            className="h-14 px-8 text-lg bg-gradient-primary"
          >
            Open Map
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/admin')}
            className="h-14 px-8 text-lg"
          >
            Admin Panel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;