'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ITEMS = ['🥤', '🟢', '🥧', '🍚']

// Simulated database using localStorage
const db = {
  getUser: (username) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}')
    return users[username]
  },
  saveUser: (username, userData) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}')
    users[username] = userData
    localStorage.setItem('users', JSON.stringify(users))
  },
}

export default function Component() {
  const [user, setUser] = useState(null)
  const [showItemChoice, setShowItemChoice] = useState(false)

  const handleLogin = (username, password) => {
    const userData = db.getUser(username)
    if (userData && userData.password === password) {
      setUser(userData)
    } else if (!userData) {
      const newUser = { name: username, password, points: 0, inventory: [], cookingStartTime: null }
      db.saveUser(username, newUser)
      setUser(newUser)
      setShowItemChoice(true)
    } else {
      toast.error('Invalid password')
    }
  }

  const handleLogout = () => {
    setUser(null)
  }

  const handleItemChoice = (item) => {
    const updatedUser = { ...user, inventory: [...user.inventory, item] }
    setUser(updatedUser)
    db.saveUser(user.name, updatedUser)
    setShowItemChoice(false)
  }

  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData }
    setUser(updatedUser)
    db.saveUser(user.name, updatedUser)
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <GameScreen user={user} onLogout={handleLogout} updateUser={updateUser} />
      )}
      {showItemChoice && <ItemChoiceDialog onChoice={handleItemChoice} />}
      <ToastContainer />
    </div>
  )
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username && password) {
      onLogin(username, password)
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Welcome to Culinary Quest</CardTitle>
        <CardDescription>Enter your details to start your journey</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">Start Quest</Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="w-full h-20 relative overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            >
              🟢
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}

function GameScreen({ user, onLogout, updateUser }) {
  const [cookingProgress, setCookingProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (user.cookingStartTime) {
        const elapsedTime = Date.now() - user.cookingStartTime
        const progress = Math.min((elapsedTime / (24 * 60 * 60 * 1000)) * 100, 100)
        setCookingProgress(progress)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [user.cookingStartTime])

  const handleStartCooking = () => {
    updateUser({ cookingStartTime: Date.now() })
  }

  const handleClaimReward = () => {
    if (cookingProgress === 100) {
      updateUser({ points: user.points + 100, cookingStartTime: null })
      toast.success('You earned 100 points!')
      setCookingProgress(0)
    }
  }

  return (
    <Card className="w-[800px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Culinary Quest</CardTitle>
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium">
            {user.name} - Points: {user.points}
          </div>
          <Button onClick={onLogout} variant="outline" size="sm">Logout</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="shopping">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="shopping">Shopping</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="cooking">Cooking</TabsTrigger>
          </TabsList>
          <TabsContent value="shopping">
            <h2 className="text-lg font-semibold mb-2">Shopping</h2>
            <p>Here you can buy ingredients for your recipes.</p>
          </TabsContent>
          <TabsContent value="inventory">
            <h2 className="text-lg font-semibold mb-2">Inventory</h2>
            <div className="flex space-x-2">
              {user.inventory.map((item, index) => (
                <div key={index} className="text-2xl">{item}</div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="cooking">
            <h2 className="text-lg font-semibold mb-2">Cooking</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button onClick={handleStartCooking} disabled={user.cookingStartTime !== null}>
                  {user.cookingStartTime ? '🍲 Cooking...' : '🥘 Start Cooking'}
                </Button>
                <Button onClick={handleClaimReward} disabled={cookingProgress < 100}>
                  Claim Reward
                </Button>
              </div>
              <Progress value={cookingProgress} className="w-full" />
              <p>Cooking progress: {cookingProgress.toFixed(2)}%</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function ItemChoiceDialog({ onChoice }) {
  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Your Starting Item</DialogTitle>
          <DialogDescription>
            Select one item to add to your inventory:
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-around py-4">
          {ITEMS.map((item, index) => (
            <Button key={index} onClick={() => onChoice(item)} size="lg">
              {item}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
