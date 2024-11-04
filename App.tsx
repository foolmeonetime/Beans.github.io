import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Coffee, Milk, ShoppingBasket, Flame, Lock, LogOut } from 'lucide-react'

type User = {
  address: string;
  plates: number;
  inventory: string[];
  hasSecretIngredient: boolean;
  hasCookedBefore: boolean;
  cookingEndTime: number | null;
  hasUsedShoppingList: boolean;
}

const ITEM_MULTIPLIERS: { [key: string]: number } = {
  '🟢': 2.3, '🟣': 1.2, '🔴': 1.3, '🟡': 1.4,
  '🥤': 1.5, '🎃': 1.6, '🍓': 1.7, '🥛': 1.8,
  '❤️': 2, '✨': 2.1, '🍯': 2.2, '🪄': 2.3
}

export default function CulinaryQuest() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('shopping')
  const [cookingProgress, setCookingProgress] = useState(0)
  const [isCooking, setIsCooking] = useState(false)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [showSecretIngredients, setShowSecretIngredients] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [cookingResult, setCookingResult] = useState<number | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      if (user && user.cookingEndTime) {
        const now = Date.now()
        if (now >= user.cookingEndTime) {
          finishCooking()
        } else {
          const progress = ((now - (user.cookingEndTime - 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000)) * 100
          setCookingProgress(progress)
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [user])

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        
        // Create a new user profile or load existing one
        // For this example, we'll create a new profile each time
        const newUser: User = {
          address,
          plates: 0,
          inventory: ['🟢'], // Start with one ingredient
          hasSecretIngredient: false,
          hasCookedBefore: false,
          cookingEndTime: null,
          hasUsedShoppingList: false
        }
        setUser(newUser)
        setShowGuide(true)
      } catch (error) {
        console.error('Failed to connect to MetaMask', error)
      }
    } else {
      alert('Please install MetaMask to use this app')
    }
  }

  const handleLogout = () => {
    setUser(null)
    setActiveTab('shopping')
    setCookingProgress(0)
    setIsCooking(false)
    setShowShoppingList(false)
    setShowSecretIngredients(false)
    setShowGuide(false)
    setCookingResult(null)
    setSelectedItems([])
  }

  const handleAddToInventory = (item: string) => {
    if (user) {
      const updatedUser = { 
        ...user, 
        inventory: [...user.inventory, item],
        hasSecretIngredient: showSecretIngredients ? true : user.hasSecretIngredient,
        hasUsedShoppingList: true
      }
      setUser(updatedUser)
    }
    setShowShoppingList(false)
    setShowSecretIngredients(false)
    setShowGuide(false)
  }

  const startCooking = () => {
    if (user) {
      if (!user.hasSecretIngredient && !user.hasCookedBefore) {
        alert("You forgot your secret ingredient! Head back to the shopping page to get it.")
        setActiveTab('shopping')
        setShowSecretIngredients(true)
      } else if (selectedItems.length > 0) {
        const cookingEndTime = Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
        const updatedUser = { ...user, cookingEndTime }
        setUser(updatedUser)
        setIsCooking(true)
        setActiveTab('cooking')
      } else {
        alert("Please select at least one item from your inventory to start cooking.")
      }
    }
  }

  const finishCooking = () => {
    if (user) {
      const cookingMultiplier = selectedItems.reduce((acc, item) => acc * (ITEM_MULTIPLIERS[item] || 1), 1)
      const platesEarned = Math.floor(100 * cookingMultiplier)
      const updatedUser = { 
        ...user, 
        plates: user.plates + platesEarned,
        hasCookedBefore: true,
        cookingEndTime: null,
        inventory: user.inventory.filter(item => !selectedItems.includes(item)),
        hasUsedShoppingList: false
      }
      setUser(updatedUser)
      setCookingResult(platesEarned)
      setIsCooking(false)
      setCookingProgress(0)
      setSelectedItems([])
    }
  }

  const toggleItemSelection = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  if (!user) {
    return (
      <Card className="w-[350px] mx-auto mt-20">
        <CardHeader>
          <CardTitle>Welcome to Culinary Quest</CardTitle>
          <CardDescription>Connect your MetaMask wallet to start your culinary journey</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectMetaMask} className="w-full">
            Connect MetaMask
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Culinary Quest</h1>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarFallback>{user.address.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <span>{user.address.slice(0, 6)}...{user.address.slice(-4)}</span>
          <span>Plates: {user.plates}</span>
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </header>

      {showGuide && (
        <Alert className="mb-4">
          <AlertTitle>Welcome to Culinary Quest!</AlertTitle>
          <AlertDescription>
            Let's start by adding an item to your inventory. Click on the "Open Shopping List" button below to choose your first ingredient!
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="shopping" disabled={isCooking}>Shopping</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="cooking">Cooking</TabsTrigger>
        </TabsList>

        <TabsContent value="shopping">
          <Card>
            <CardHeader>
              <CardTitle>Shopping</CardTitle>
              <CardDescription>Buy ingredients for your recipes</CardDescription>
            </CardHeader>
            <CardContent>
              {user.hasUsedShoppingList ? (
                <div className="flex items-center space-x-2 text-gray-500">
                  <Lock size={16} />
                  <span>Shopping list is locked. Cook to unlock!</span>
                </div>
              ) : (
                <Button onClick={() => setShowShoppingList(true)}>Open Shopping List</Button>
              )}
              {showSecretIngredients && (
                <Alert className="mt-4">
                  <AlertTitle>Secret Ingredients</AlertTitle>
                  <AlertDescription>
                    Don't forget to choose your secret ingredient!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>Your current ingredients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.inventory.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`item-${index}`}
                      checked={selectedItems.includes(item)}
                      onCheckedChange={() => toggleItemSelection(item)}
                    />
                    <label htmlFor={`item-${index}`} className="text-2xl">{item}</label>
                  </div>
                ))}
              </div>
              {!isCooking && (
                <Button onClick={startCooking} className="mt-4">
                  Start Cooking with Selected Items
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cooking">
          <Card>
            <CardHeader>
              <CardTitle>Cooking</CardTitle>
              <CardDescription>Create delicious recipes</CardDescription>
            </CardHeader>
            <CardContent>
              {isCooking ? (
                <div className="space-y-4">
                  <div className="relative w-40 h-40 mx-auto">
                    <div className="absolute inset-0 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-1000 ease-linear"
                        style={{ height: `${cookingProgress}%` }}
                      ></div>
                    </div>
                    <Flame className="absolute inset-0 m-auto text-red-500 animate-pulse" size={64} />
                  </div>
                  <Progress value={cookingProgress} className="w-full" />
                  <p>Cooking in progress... {Math.floor(cookingProgress)}% complete</p>
                </div>
              ) : (
                <div>
                  <p>Select ingredients from your inventory to start cooking.</p>
                  {cookingResult !== null && (
                    <Alert className="mt-4">
                      <AlertTitle>Cooking Complete!</AlertTitle>
                      <AlertDescription>
                        You earned {cookingResult} plates from your culinary creation!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showShoppingList} onOpenChange={setShowShoppingList}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shopping List</DialogTitle>
            <DialogDescription>Choose an item to add to your inventory</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => handleAddToInventory('🥤')} className="flex items-center justify-start space-x-2">
              <span className="text-2xl">🥤</span>
              <span>Kool-aid</span>
            </Button>
            <Button onClick={() => handleAddToInventory('🎃')} className="flex items-center justify-start space-x-2">
              <span className="text-2xl">🎃</span>
              <span>Pumpkin Spice</span>
            </Button>
            <Button onClick={() => handleAddToInventory('🍓')} className="flex items-center justify-start space-x-2">
              <Coffee className="h-5 w-5" />
              <span>Poptarts</span>
            </Button>
            <Button onClick={() => handleAddToInventory('🥛')} className="flex items-center justify-start space-x-2">
              <Milk className="h-5 w-5" />
              <span>Almond Milk</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSecretIngredients} onOpenChange={setShowSecretIngredients}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Secret Ingredients</DialogTitle>
            <DialogDescription>Choose your secret ingredient to enhance your cooking!</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => handleAddToInventory('❤️')} className="flex items-center justify-start space-x-2">
              <span className="text-2xl">❤️</span>
              <span>Love</span>
            </Button>
            <Button onClick={() => handleAddToInventory('✨')} className="flex items-center justify-start space-x-2">
              <span className="text-2xl">✨</span>
              <span>Magic Dust</span>
            </Button>
            <Button onClick={() => handleAddToInventory('🍯')} className="flex items-center justify-start space-x-2">
              <span className="text-2xl">🍯</span>
              
              <span>Honey</span>
            </Button>
            <Button onClick={() => handleAddToInventory('🪄')} className="flex items-center justify-start space-x-2">
              <span className="text-2xl">🪄</span>
              <span>Magic Wand</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
